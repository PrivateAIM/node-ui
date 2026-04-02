# Data Stores Component Refactor — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Eliminate redundant prop-passing and code duplication in the `data-stores` component tree by extracting a `useDataStoreList` composable, collapsing the dead `ResourceManagerTabs` wrapper, and deduplicating the help box close button.

**Architecture:** Transformation logic moves from `DataStoreList.vue` into a `useDataStoreList` composable. `DataStoreProjectInitializer` fetches its own project list directly, removing the need for `ResourceManagerTabs`. A new `DataStoreHelpPanel` sub-component eliminates 7 copies of an identical close button template in `DataStoreHelpBox`.

**Tech Stack:** Vue 3 (`<script setup>`), Nuxt 3 (`useFetch`, `useNuxtApp`), PrimeVue, TypeScript, Vitest

---

## File Map

| Action | File |
|--------|------|
| **Create** | `app/composables/useDataStoreList.ts` |
| **Create** | `app/components/data-stores/create/DataStoreHelpPanel.vue` |
| **Create** | `test/composables/useDataStoreList.test.ts` |
| **Modify** | `app/composables/useDataStoreList.ts` (pure helpers, exported for testing) |
| **Modify** | `app/components/data-stores/DataStoreList.vue` |
| **Modify** | `app/components/data-stores/create/DataStoreHelpBox.vue` |
| **Modify** | `app/components/data-stores/create/DataStoreProjectInitializer.vue` |
| **Modify** | `app/components/data-stores/create/index.ts` |
| **Modify** | `app/pages/data-stores/create.vue` |
| **Delete** | `app/components/data-stores/create/ResourceManagerTabs.vue` |

---

## Task 1: Create `useDataStoreList` composable with pure helper tests

**Files:**
- Create: `app/composables/useDataStoreList.ts`
- Create: `test/composables/useDataStoreList.test.ts`

- [ ] **Step 1: Write the failing tests**

Create `test/composables/useDataStoreList.test.ts`:

```typescript
import { expect, test, describe } from "vitest";
import {
  buildProjectNameMap,
  extractProjectIdFromPath,
} from "~/composables/useDataStoreList";

describe("buildProjectNameMap", () => {
  test("maps project id to name", () => {
    const projects = [
      { id: "abc-123", name: "My Project" },
      { id: "def-456", name: "Other Project" },
    ];
    const map = buildProjectNameMap(projects as any);
    expect(map.get("abc-123")).toBe("My Project");
    expect(map.get("def-456")).toBe("Other Project");
  });

  test("uses N/A when name is undefined", () => {
    const projects = [{ id: "abc-123", name: undefined }];
    const map = buildProjectNameMap(projects as any);
    expect(map.get("abc-123")).toBe("N/A");
  });

  test("skips entries without id", () => {
    const projects = [{ id: undefined, name: "No ID" }];
    const map = buildProjectNameMap(projects as any);
    expect(map.size).toBe(0);
  });

  test("returns empty map for empty array", () => {
    const map = buildProjectNameMap([]);
    expect(map.size).toBe(0);
  });
});

describe("extractProjectIdFromPath", () => {
  test("extracts the second path segment", () => {
    expect(extractProjectIdFromPath(["/abc-123/data"])).toBe("abc-123");
  });

  test("works with uuid-style ids", () => {
    expect(
      extractProjectIdFromPath(["/97ed7bca-d56c-41b1-9625-61d20d90690c/fhir"]),
    ).toBe("97ed7bca-d56c-41b1-9625-61d20d90690c");
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
pnpm test test/composables/useDataStoreList.test.ts
```

Expected: FAIL with `Cannot find module '~/composables/useDataStoreList'`

- [ ] **Step 3: Create `useDataStoreList.ts` with exported helpers and composable**

Create `app/composables/useDataStoreList.ts`:

```typescript
import { ref, watchEffect } from "vue";
import { getDataStores, getProjects } from "~/composables/useAPIFetch";
import { formatDataRow } from "~/utils/format-data-row";
import type { ModifiedDetailedService } from "~/services/modifiedApiInterfaces";
import type { DetailedAnalysis, ListServices, Project, Route } from "~/services/Api";

export function buildProjectNameMap(
  projects: Project[] | DetailedAnalysis[],
): Map<string, string | undefined> {
  const map = new Map<string, string | undefined>();
  projects.forEach((entry) => {
    if (entry.id) {
      map.set(entry.id, entry.name ?? "N/A");
    }
  });
  return map;
}

export function extractProjectIdFromPath(paths: string[]): string {
  return paths[0].split("/")[1];
}

const DATA_ROW_UNIX_COLS = ["created_at", "updated_at"];

export async function useDataStoreList() {
  const dataStores = ref<ModifiedDetailedService[]>([]);
  const projectNameMap = ref<Map<string, string | undefined>>(new Map());
  const loading = ref(true);

  const {
    data: dsResp,
    status: dsStatus,
    error: dsError,
    refresh,
  } = await getDataStores(true, { lazy: true });

  const { data: projectResp } = await getProjects({ lazy: true });

  watchEffect(() => {
    if (dsResp.value?.data) {
      if (dsStatus.value === "success") {
        let formatted = formatDataRow(
          dsResp.value.data as ListServices,
          DATA_ROW_UNIX_COLS,
          [],
        ) as ModifiedDetailedService[];

        formatted = formatted.filter((s) => s.name !== "kong-admin-service");

        formatted.forEach((store) => {
          if (store.routes) {
            store.routes = formatDataRow(store.routes, DATA_ROW_UNIX_COLS, []);
            store.routes?.forEach((route: Route) => {
              route["projectId"] = extractProjectIdFromPath(
                route.paths as string[],
              );
            });
          }
        });

        dataStores.value = formatted;
      } else if (dsError.value?.statusCode === 500) {
        dataStores.value = [];
      }
      loading.value = false;
    }
  });

  watchEffect(() => {
    if (projectResp.value) {
      projectNameMap.value = buildProjectNameMap(projectResp.value);
    }
  });

  return { dataStores, projectNameMap, loading, refresh };
}
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
pnpm test test/composables/useDataStoreList.test.ts
```

Expected: PASS — 6 tests pass

- [ ] **Step 5: Commit**

```bash
git add app/composables/useDataStoreList.ts test/composables/useDataStoreList.test.ts
git commit -m "feat(data-stores): extract useDataStoreList composable"
```

---

## Task 2: Update `DataStoreList.vue` to use the composable

**Files:**
- Modify: `app/components/data-stores/DataStoreList.vue`

- [ ] **Step 1: Replace `DataStoreList.vue` with composable-backed version**

Replace the entire `<script lang="ts" setup>` block in `app/components/data-stores/DataStoreList.vue`:

```vue
<script lang="ts" setup>
import { useDataStoreList } from "~/composables/useDataStoreList";
import DetailedDataStoreTable from "~/components/data-stores/DetailedDataStoreTable.vue";

const { dataStores, projectNameMap, loading, refresh } = await useDataStoreList();

function onDeleteDataStore(dsName: string) {
  dataStores.value = dataStores.value.filter((store) => store.name !== dsName);
  refresh();
}
</script>
```

The `<template>` and `<style>` blocks are unchanged.

- [ ] **Step 2: Run the full test suite to confirm nothing broke**

```bash
pnpm test
```

Expected: all tests pass

- [ ] **Step 3: Commit**

```bash
git add app/components/data-stores/DataStoreList.vue
git commit -m "refactor(data-stores): DataStoreList delegates to useDataStoreList"
```

---

## Task 3: Create `DataStoreHelpPanel` sub-component

**Files:**
- Create: `app/components/data-stores/create/DataStoreHelpPanel.vue`

- [ ] **Step 1: Create the component**

Create `app/components/data-stores/create/DataStoreHelpPanel.vue`:

```vue
<script setup lang="ts">
import Panel from "primevue/panel";

defineProps<{ header: string }>();
const emit = defineEmits(["closeHelp"]);
</script>

<template>
  <div class="methods-help-text">
    <Panel :header="header">
      <slot />
      <template #icons>
        <Button
          class="p-panel-header-icon p-link mr-2 help-box-close-btn"
          icon="pi pi-times"
          severity="contrast"
          v-tooltip.top="'Close help box'"
          @click="emit('closeHelp')"
        />
      </template>
    </Panel>
  </div>
</template>
```

- [ ] **Step 2: Run the full test suite to confirm nothing broke**

```bash
pnpm test
```

Expected: all tests pass

- [ ] **Step 3: Commit**

```bash
git add app/components/data-stores/create/DataStoreHelpPanel.vue
git commit -m "feat(data-stores): add DataStoreHelpPanel sub-component"
```

---

## Task 4: Refactor `DataStoreHelpBox.vue` to use `DataStoreHelpPanel`

**Files:**
- Modify: `app/components/data-stores/create/DataStoreHelpBox.vue`

- [ ] **Step 1: Replace `DataStoreHelpBox.vue` content**

Replace the entire file content of `app/components/data-stores/create/DataStoreHelpBox.vue`:

```vue
<script setup lang="ts">
import { HelpTextField } from "~/components/data-stores/create/index";
import DataStoreHelpPanel from "~/components/data-stores/create/DataStoreHelpPanel.vue";

const props = defineProps<{ helpField: string | undefined }>();
const emit = defineEmits(["closeHelp"]);
</script>

<template>
  <div class="data-store-help">
    <DataStoreHelpPanel
      v-if="props.helpField === HelpTextField.Methods"
      header="Allowed Methods"
      @closeHelp="emit('closeHelp')"
    >
      <p>
        How the data is accessed can be tightly controlled by defining which
        request methods are allowed for a given project. For a project to be
        able to read the data, the <code>GET</code> method must be enabled
        (and is by default).
      </p>
      <p>
        Additional request methods can be added to this list which would allow
        users of the project to modify (<code>PUT</code>) the data, add
        (<code>POST</code>) new data, or remove (<code>DELETE</code>) data in
        the server. The ability to modify the list of allowed request methods
        is disabled by default, though admins can enable this field, but
        should understand the risks of allowing users to directly modify the
        data on their institution's servers.
      </p>
    </DataStoreHelpPanel>

    <DataStoreHelpPanel
      v-else-if="props.helpField === HelpTextField.FHIR"
      header="Data Path"
      @closeHelp="emit('closeHelp')"
    >
      <p>
        Here, the admin must provide the absolute file path of the directory
        (folder) which contains the relevant data to be shared with the
        project. The path should be the same as defined on the server/host
        provided in the <i>Server</i> field.
      </p>
      <p>
        For Unix based systems, the directory path should start with a forward
        slash "/", while a Windows OS will use a drive letter with a colon and
        2 back slashes (e.g. H:\\).
      </p>
    </DataStoreHelpPanel>

    <DataStoreHelpPanel
      v-else-if="props.helpField === HelpTextField.S3"
      header="Bucket Name"
      @closeHelp="emit('closeHelp')"
    >
      <p>Enter the name of the S3 bucket which contains the data.</p>
    </DataStoreHelpPanel>

    <DataStoreHelpPanel
      v-else-if="props.helpField === HelpTextField.Port"
      header="Server Port"
      @closeHelp="emit('closeHelp')"
    >
      <p>
        In order to maintain security, firewalls are used to prevent
        unauthorized access to professional and personal computers/servers. To
        gain access to services or data on a system with a firewall, a
        <i>port</i> must be opened by the technical administrator. These ports
        have numerical identifiers and your institution should have a specific
        port opened for the server containing the data to be shared.
      </p>
      <p>
        Please provide that port number here so that the FLAME Node Service is
        able to access the data. If you are unsure or do not know which port
        should be used, please contact your IT department or relevant
        administrator.
      </p>
    </DataStoreHelpPanel>

    <DataStoreHelpPanel
      v-else-if="props.helpField === HelpTextField.Protocol"
      header="Communication Protocol"
      @closeHelp="emit('closeHelp')"
    >
      <p>
        Multiple protocols exist for transferring files between computers and
        for communication, the most common being HTTP. To improve the security
        of the transferred data, <b>Transport Layer Security</b> (TLS) was
        developed for protocols as an encryption method and is now very
        commonly used (HTTPS is simply HTTP over TLS). The FLAME Node software
        needs to know the protocol used, and whether or not it is secured
        using TLS.
      </p>
      <ul>
        <li>
          <b>HTTP/HTTPS</b> - Hypertext Transfer Protocol. Data is generally
          sent using port 80 (HTTP) or port 443 (HTTPS)
        </li>
        <li><b>WS/WSS</b> - Websocket on HTTP (WS) or on HTTPS (WSS)</li>
        <li><b>gRPC/gRPCS</b> - Google remote procedural calls</li>
        <li><b>TCP/TLS</b> - Transmission Control Protocol</li>
        <li>
          <b>TCP Passthrough</b> - a TLS proxy request that doesn't terminate
          (a SNI proxy)
        </li>
      </ul>
      <p>
        For additional information, please visit
        <a
          href="https://docs.konghq.com/gateway/latest/how-kong-works/routing-traffic/"
          target="_blank"
          rel="noopener noreferrer"
        >
          the Kong documentation.
        </a>
      </p>
      <p>
        Should your institution use a different protocol other than those
        listed below, please contact the Node Dev Team for help resolving
        this.
      </p>
    </DataStoreHelpPanel>

    <DataStoreHelpPanel
      v-else-if="props.helpField === HelpTextField.Server"
      header="Server Host"
      @closeHelp="emit('closeHelp')"
    >
      <p>
        This field is for providing the <b>hostname</b> or
        <b>IP address</b> of the data's server. Please take care that this is
        reachable from outside of the network.
      </p>
    </DataStoreHelpPanel>

    <DataStoreHelpPanel
      v-else-if="props.helpField === HelpTextField.Type"
      header="Data Store Type"
      @closeHelp="emit('closeHelp')"
    >
      <p>
        Depending on how the data is made available, the FLAME Node software
        will have to setup specific plugins and features. It is important to
        indicate here in what type of instance the data is stored.
      </p>
      <p>
        Should your institution use a different method of storage other than
        those listed, please contact the Node Dev Team for help resolving
        this.
      </p>
    </DataStoreHelpPanel>
  </div>
</template>

<style scoped lang="scss"></style>
```

- [ ] **Step 2: Run the full test suite**

```bash
pnpm test
```

Expected: all tests pass

- [ ] **Step 3: Commit**

```bash
git add app/components/data-stores/create/DataStoreHelpBox.vue
git commit -m "refactor(data-stores): deduplicate DataStoreHelpBox using DataStoreHelpPanel"
```

---

## Task 5: Move `availableProject` to `index.ts` and collapse `ResourceManagerTabs` into `DataStoreProjectInitializer`

**Files:**
- Modify: `app/components/data-stores/create/index.ts`
- Modify: `app/components/data-stores/create/DataStoreProjectInitializer.vue`

- [ ] **Step 1: Add `availableProject` to `index.ts`**

Replace the entire content of `app/components/data-stores/create/index.ts`:

```typescript
export enum HelpTextField {
  Methods = "methods",
  FHIR = "FHIR",
  S3 = "S3",
  Port = "port",
  Protocol = "protocol",
  Server = "server",
  Type = "type",
}

export interface availableProject {
  name: string | undefined | null;
  id: string;
}
```

- [ ] **Step 2: Update `DataStoreProjectInitializer.vue` — remove prop, add internal fetch**

Replace the `<script lang="ts" setup>` block in `app/components/data-stores/create/DataStoreProjectInitializer.vue` with the following (everything else in the file — template and styles — is unchanged):

```vue
<script lang="ts" setup>
import { ref, watch } from "vue";
import { navigateTo, useNuxtApp } from "nuxt/app";
import InputText from "primevue/inputtext";
import RadioButton from "primevue/radiobutton";
import Select from "primevue/select";
import InputNumber from "primevue/inputnumber";
import InputGroupAddon from "primevue/inputgroupaddon";
import InputGroup from "primevue/inputgroup";
import DataStoreHelpBox from "~/components/data-stores/create/DataStoreHelpBox.vue";
import { type availableProject, HelpTextField } from "~/components/data-stores/create/index";
import { useToast } from "primevue/usetoast";
import {
  type BodyKongInitializeKongInitializePost,
  DataStoreType,
  type ProjectNode,
} from "~/services/Api";
import { getProjectNodes } from "~/composables/useAPIFetch";

const loading = ref(false);
const helpActive = ref<HelpTextField | undefined>();

const connMsg = ref("");
const connMsgColor = computed(() =>
  connMsg.value === "Invalid connection!" ? "#ff2e2e" : "#008800",
);

const toast = useToast();

// Project list
const availableProjects = ref<availableProject[]>([]);

const { data: projects, status: projStatus } = await getProjectNodes();

if (projStatus.value === "success") {
  const projectData = projects.value as unknown as Array<ProjectNode>;
  if (projectData.length > 0) {
    availableProjects.value = projectData.map((proj: ProjectNode) => ({
      name: proj.project?.name,
      id: proj.project_id,
    }));
  }
}

// Project settings
const dataStoreTypeOptions = computed(() =>
  Object.values(DataStoreType).map((type) => ({
    label: type.toUpperCase(),
    value: type,
  })),
);
const selectedDataStoreType = ref<DataStoreType>(DataStoreType.Fhir);

// S3 settings
type allowedBucketAccessPolicies = "Public" | "Private";
const selectedBucketAccessPolicy = ref<allowedBucketAccessPolicies>("Private");

const bucketAccessKey = ref<string>("");
const bucketSecretKey = ref<string>("");

const selectedProject = ref<availableProject | undefined>();

const dataStoreSettingsMap: Map<string, string> = new Map([
  ["name", "Project"],
  ["host", "Server hostname"],
  ["path", "Data path or bucket name"],
  ["port", "Port"],
  ["protocol", "Connection protocol"],
  ["minio_access_key", "MinIO access key"],
  ["minio_secret_key", "MinIO secret key"],
]);

// Datastore settings
const dataStoreName = ref("");
const host = ref("");
const path = ref("");
const port = ref(80);
const protocol = ref("http");

const acceptedProtocols = [
  "grpc",
  "grpcs",
  "http",
  "https",
  "tcp",
  "tls",
  "tls_passthrough",
  "ws",
  "wss",
];

watch(selectedProject, (newSelectedProject) => {
  if (newSelectedProject) {
    dataStoreName.value = `${newSelectedProject.id}`;
  }
});

function activateHelp(helpField: HelpTextField) {
  helpActive.value = helpActive.value === helpField ? undefined : helpField;
}

function deactivateHelp() {
  helpActive.value = undefined;
}

function validatePath(path: string) {
  return path.startsWith("/") ? path : `/${path}`;
}

function verifyValuesFilled(settings: object): boolean {
  for (const key in settings) {
    if (!settings[key]) {
      const missingValue = dataStoreSettingsMap.has(key)
        ? dataStoreSettingsMap.get(key)
        : key;
      toast.add({
        severity: "error",
        summary: "Value missing",
        detail: `${missingValue} is not defined!`,
        life: 5000,
      });
      return false;
    }
  }
  return true;
}

async function onSubmitCreateDataStoreAndProject() {
  const validatedPath = validatePath(path.value);
  const datastoreSettings = {
    name: dataStoreName.value,
    host: host.value,
    path: validatedPath,
    port: port.value,
    protocol: protocol.value,
  };

  const configSettings: BodyKongInitializeKongInitializePost = {
    datastore: datastoreSettings,
    project_id: selectedProject.value!.id,
    ds_type: selectedDataStoreType.value,
  };

  const minioSettings = {
    minio_access_key: bucketAccessKey.value || "",
    minio_secret_key: bucketSecretKey.value || "",
  };

  let settingsValidated = verifyValuesFilled(datastoreSettings);

  if (
    selectedDataStoreType.value === DataStoreType.S3 &&
    selectedBucketAccessPolicy.value === "Private"
  ) {
    configSettings.minio_config = minioSettings;
    settingsValidated = settingsValidated && verifyValuesFilled(minioSettings);
  }

  if (settingsValidated) {
    loading.value = true;
    const creationResp = await useNuxtApp()
      .$hubApi("/kong/initialize", {
        method: "POST",
        body: configSettings,
      })
      .catch(() => {
        toast.add({
          severity: "error",
          summary: "Registration failure",
          detail: "An error occurred while trying to register the data store",
          life: 5000,
        });
        connMsg.value = "Invalid connection!";
      });

    loading.value = false;

    if (creationResp) {
      toast.add({
        severity: "success",
        summary: "Registration success",
        detail:
          "The data store and project were successfully registered, returning to the analyses page...",
        life: 5000,
      });
      connMsg.value = "Connection validated!";
      await new Promise((resolve) => setTimeout(resolve, 5000));
      navigateTo("/analyses");
    }
  }
}
</script>
```

Also update the template's `Select` for project picker — change `:options="props.projects"` to `:options="availableProjects"`:

In the `<template>` block, find this line:
```html
<Select
  v-model="selectedProject"
  :options="props.projects"
  class="project-picker"
  optionLabel="name"
  placeholder="Select a Project"
/>
```

Replace with:
```html
<Select
  v-model="selectedProject"
  :options="availableProjects"
  class="project-picker"
  optionLabel="name"
  placeholder="Select a Project"
/>
```

- [ ] **Step 3: Run the full test suite**

```bash
pnpm test
```

Expected: all tests pass

- [ ] **Step 4: Commit**

```bash
git add app/components/data-stores/create/index.ts app/components/data-stores/create/DataStoreProjectInitializer.vue
git commit -m "refactor(data-stores): move availableProject to index.ts, self-fetch projects in DataStoreProjectInitializer"
```

---

## Task 6: Update create page and delete `ResourceManagerTabs`

**Files:**
- Modify: `app/pages/data-stores/create.vue`
- Delete: `app/components/data-stores/create/ResourceManagerTabs.vue`

- [ ] **Step 1: Update `create.vue` to use `DataStoreProjectInitializer` directly**

Read `app/pages/data-stores/create.vue`. It currently imports `ResourceManagerTabs` and renders `<ResourceManagerTabs />`. Replace its entire content with:

```vue
<script lang="ts" setup>
import DataStoreProjectInitializer from "~/components/data-stores/create/DataStoreProjectInitializer.vue";
</script>

<template>
  <DataStoreProjectInitializer />
</template>
```

- [ ] **Step 2: Delete `ResourceManagerTabs.vue`**

```bash
git rm app/components/data-stores/create/ResourceManagerTabs.vue
```

- [ ] **Step 3: Run the full test suite**

```bash
pnpm test
```

Expected: all tests pass

- [ ] **Step 4: Commit**

```bash
git add app/pages/data-stores/create.vue
git commit -m "refactor(data-stores): delete ResourceManagerTabs, page uses DataStoreProjectInitializer directly"
```

---

## Self-Review

**Spec coverage:**
- ✅ `useDataStoreList` composable with exposed `dataStores`, `projectNameMap`, `loading`, `refresh` — Task 1
- ✅ `DataStoreList.vue` thinned to composable call + `onDeleteDataStore` — Task 2
- ✅ `DataStoreHelpPanel` sub-component with single close button — Task 3
- ✅ `DataStoreHelpBox` refactored to use `DataStoreHelpPanel` — Task 4
- ✅ `availableProject` moved to `index.ts` — Task 5
- ✅ `getProjectNodes` fetch moved into `DataStoreProjectInitializer` — Task 5
- ✅ `projects` prop removed and typed properly — Task 5
- ✅ `ResourceManagerTabs` deleted, page updated — Task 6

**Placeholder scan:** No TBDs or incomplete sections.

**Type consistency:**
- `availableProject` defined in Task 5 Step 1 (`index.ts`), imported in Task 5 Step 2 (`DataStoreProjectInitializer`)
- `buildProjectNameMap` / `extractProjectIdFromPath` defined in Task 1 Step 3, tested in Task 1 Step 1
- `useDataStoreList` returns `{ dataStores, projectNameMap, loading, refresh }` — consumed identically in Task 2
