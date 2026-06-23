<script lang="ts" setup>
import { computed, ref, watch } from "vue";
import { navigateTo, useNuxtApp } from "nuxt/app";
import { useRoute } from "vue-router";
import InputText from "primevue/inputtext";
import RadioButton from "primevue/radiobutton";
import Select from "primevue/select";
import InputNumber from "primevue/inputnumber";
import InputGroupAddon from "primevue/inputgroupaddon";
import InputGroup from "primevue/inputgroup";
import DataStoreHelpBox from "~/components/data-stores/create/DataStoreHelpBox.vue";
import {
  type AvailableProject,
  HelpTextField,
} from "~/components/data-stores/create/index";
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
const availableProjects = ref<AvailableProject[]>([]);

const { data: projects, status: projStatus } = await getProjectNodes();

if (projStatus.value === "success") {
  const projectData = projects.value as unknown as Array<ProjectNode>;
  if (projectData.length > 0) {
    availableProjects.value = projectData.map((proj: ProjectNode) => ({
      name: proj.project?.display_name ?? proj.project?.name ?? proj.project_id,
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

const selectedProject = ref<AvailableProject | undefined>();

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

// Preselect the project when navigated here with a projectId query parameter
const route = useRoute();
const preselectedProjectId = route.query.projectId;
if (typeof preselectedProjectId === "string") {
  selectedProject.value = availableProjects.value.find(
    (proj) => proj.id === preselectedProjectId,
  );
}

watch(selectedDataStoreType, (newDataStoreType) => {
  if (newDataStoreType === DataStoreType.S3) {
    port.value = 9000;
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

<template>
  <div>
    <Card style="margin-top: 10px">
      <template #title>Create a Data Store for a Project</template>
      <template #content>
        <div class="intro-text">
          <p>
            In order for users to be able to access the data in your
            institution, a data store needs to be created for each approved
            project. A data store is essentially a fileshare, or a specified set
            of permissions granted to the users of a project allowing access to
            a folder on your system.
          </p>
          <p>
            To create a data store, fill out the fields below, starting with the
            project which will be granted access to the data followed by the
            technical information defining the data's location.
          </p>
          <p>
            Helpful tooltips can be shown when hovering over each field, an
            additional detailed information about what is required for each
            field can be displayed by clicking on the field name in the left
            column.
          </p>
        </div>
        <div class="data-store-panel">
          <div class="data-store-input-fields">
            <InputGroup
              class="data-store-project-input"
              style="margin-bottom: 20px"
            >
              <InputGroupAddon class="data-store-field-name">
                <i class="pi pi-pen-to-square"></i>
                <p class="data-store-field-name-box">Project</p>
              </InputGroupAddon>
              <Select
                v-model="selectedProject"
                :options="availableProjects"
                class="project-picker"
                optionLabel="name"
                placeholder="Select a Project"
              />
            </InputGroup>
            <InputGroup>
              <InputGroupAddon class="data-store-field-name">
                <i class="pi pi-barcode"></i>
                <p
                  v-tooltip.top="'Generated name of the data store'"
                  class="data-store-field-name-box"
                >
                  Data Store
                </p>
              </InputGroupAddon>
              <InputText v-model="dataStoreName" disabled />
            </InputGroup>
            <InputGroup class="data-store-type-input">
              <InputGroupAddon class="data-store-field-name">
                <i class="pi pi-warehouse"></i>
                <div class="data-store-field-name-box">
                  <button
                    class="help-button"
                    @click="activateHelp(HelpTextField.Type)"
                  >
                    <p
                      v-tooltip.top="'Type of server the data is stored on'"
                      class="help-text"
                    >
                      Server Type
                    </p>
                  </button>
                </div>
              </InputGroupAddon>
              <Select
                v-model="selectedDataStoreType"
                :options="dataStoreTypeOptions"
                optionLabel="label"
                optionValue="value"
                class="data-store-type-picker"
              />
            </InputGroup>
            <div
              v-if="selectedDataStoreType == DataStoreType.S3"
              class="s3-name-fields"
            >
              <InputGroup class="data-store-path-input-s3">
                <InputGroupAddon class="data-store-field-name">
                  <i class="pi pi-inbox"></i>
                  <div class="data-store-field-name-box">
                    <button
                      class="help-button"
                      @click="activateHelp(HelpTextField.S3)"
                    >
                      <p
                        v-tooltip.top="'Name of the S3 bucket'"
                        class="help-text"
                      >
                        Bucket Name
                      </p>
                    </button>
                  </div>
                </InputGroupAddon>
                <InputText
                  v-model="path"
                  :invalid="path === ''"
                  placeholder="Name of the S3 bucket"
                />
              </InputGroup>
              <InputGroup class="data-store-path-input-s3-bucket">
                <InputGroupAddon class="data-store-field-name">
                  <i class="pi pi-lock"></i>
                  <div class="data-store-field-name-box">
                    <p
                      v-tooltip.top="
                        'Whether the bucket is set to Public or Private'
                      "
                    >
                      Bucket Access
                    </p>
                  </div>
                </InputGroupAddon>
                <InputGroupAddon class="data-store-field-value">
                  <div class="flex flex-wrap gap-4 bucket-access-policy-radio">
                    <div class="flex items-center gap-2">
                      <RadioButton
                        v-model="selectedBucketAccessPolicy"
                        inputId="private"
                        name="accessPolicy"
                        value="Private"
                        size="small"
                        class="bucket-access-policy-radio-btn-private"
                      />
                      <label for="private">Private</label>
                    </div>
                    <div class="flex items-center gap-2">
                      <RadioButton
                        v-model="selectedBucketAccessPolicy"
                        inputId="public"
                        name="accessPolicy"
                        value="Public"
                        size="small"
                        class="bucket-access-policy-radio-btn-public"
                      />
                      <label for="public">Public</label>
                    </div>
                  </div>
                </InputGroupAddon>
              </InputGroup>
              <InputGroup
                v-if="selectedBucketAccessPolicy == 'Private'"
                class="data-store-path-input-s3-private"
              >
                <InputGroupAddon class="data-store-field-name">
                  <i class="pi pi-verified"></i>
                  <div class="data-store-field-name-box">
                    <p v-tooltip.top="'Access key for the S3 bucket'">
                      Access Key
                    </p>
                  </div>
                </InputGroupAddon>
                <InputText
                  v-model="bucketAccessKey"
                  :invalid="bucketAccessKey === ''"
                  placeholder="Access key"
                />
              </InputGroup>
              <InputGroup
                v-if="selectedBucketAccessPolicy == 'Private'"
                class="data-store-path-input-s3-private"
              >
                <InputGroupAddon class="data-store-field-name">
                  <i class="pi pi-key"></i>
                  <div class="data-store-field-name-box">
                    <p v-tooltip.top="'Secret key for the S3 instance'">
                      Secret Key
                    </p>
                  </div>
                </InputGroupAddon>
                <InputText
                  v-model="bucketSecretKey"
                  :invalid="bucketSecretKey === ''"
                  placeholder="Secret key"
                />
              </InputGroup>
            </div>
            <InputGroup v-else class="data-store-path-input-fhir">
              <InputGroupAddon class="data-store-field-name">
                <i class="pi pi-folder"></i>
                <div class="data-store-field-name-box">
                  <button
                    class="help-button"
                    @click="activateHelp(HelpTextField.FHIR)"
                  >
                    <p
                      v-tooltip.top="'Absolute directory path'"
                      class="help-text"
                    >
                      Data Path
                    </p>
                  </button>
                </div>
              </InputGroupAddon>
              <InputText
                v-model="path"
                :invalid="path === '' || !path.startsWith('/')"
                placeholder="Data path (must start with '/')"
              />
            </InputGroup>
            <InputGroup class="data-store-server-input">
              <InputGroupAddon class="data-store-field-name">
                <i class="pi pi-server"></i>
                <div class="data-store-field-name-box">
                  <button
                    class="help-button"
                    @click="activateHelp(HelpTextField.Server)"
                  >
                    <p
                      v-tooltip.top="
                        'Name of the server on which the data resides'
                      "
                      class="help-text"
                    >
                      Hostname
                    </p>
                  </button>
                </div>
              </InputGroupAddon>
              <InputText
                v-model="host"
                :invalid="host === ''"
                placeholder="Server or hostname"
              />
            </InputGroup>
            <InputGroup class="data-store-port-input">
              <InputGroupAddon class="data-store-field-name">
                <i class="pi pi-bullseye"></i>
                <div class="data-store-field-name-box">
                  <button
                    class="help-button"
                    @click="activateHelp(HelpTextField.Port)"
                  >
                    <p
                      v-tooltip.top="'Port number for accessing the data'"
                      class="help-text"
                    >
                      Port
                    </p>
                  </button>
                </div>
              </InputGroupAddon>
              <InputNumber
                v-model="port"
                :useGrouping="false"
                :invalid="port < 0 || port > 65535"
                placeholder="Port e.g. 443"
              />
            </InputGroup>
            <InputGroup class="data-store-protocol-input">
              <InputGroupAddon class="data-store-field-name">
                <i class="pi pi-cog"></i>
                <div class="data-store-field-name-box">
                  <button
                    class="help-button"
                    @click="activateHelp(HelpTextField.Protocol)"
                  >
                    <p
                      v-tooltip.top="
                        'Access protocol for the data storage server'
                      "
                      class="help-text"
                    >
                      Protocol
                    </p>
                  </button>
                </div>
              </InputGroupAddon>
              <Select
                v-model="protocol"
                :options="acceptedProtocols"
                class="w-full md:w-56 communication-protocol-picker"
              />
            </InputGroup>
            <div class="data-store-submission-container">
              <Button
                :loading="loading"
                class="create-data-store-btn"
                icon="pi pi-check"
                iconPos="right"
                label="Submit"
                severity="info"
                @click="onSubmitCreateDataStoreAndProject"
              />
              <div v-if="connMsg" class="data-store-connection-test-text">
                <p>
                  {{ connMsg }}
                </p>
              </div>
            </div>
          </div>
          <div v-if="helpActive" class="data-store-help-box">
            <DataStoreHelpBox
              :helpField="helpActive"
              @closeHelp="deactivateHelp"
            />
          </div>
        </div>
      </template>
    </Card>
  </div>
</template>

<style lang="scss" scoped>
.intro-text {
  padding-bottom: 3em;
}

.data-store-help-box {
  width: 60%;
}

.data-store-panel {
  display: flex;
  flex-direction: row;
  align-items: flex-start;
  width: 100%;
}

.data-store-input-fields {
  width: 80%;
  margin-right: 24px;
}

.data-store-field-name-box {
  margin-left: 10px;
}

.p-inputgroupaddon {
  color: var(--p-card-color);
}

.data-store-field-name {
  width: 200px;
  height: 50px;
}

.help-button {
  background: inherit;
  border: inherit;
  font: inherit;
  color: inherit;
}

.help-text {
  text-decoration-line: underline;
  text-decoration-style: dotted;
  text-underline-offset: 3px;
  cursor: help;
}

.data-store-submission-container {
  display: flex;
  align-items: center;
  margin-top: 1em;
}

.data-store-connection-test-text {
  font-weight: bold;
  margin-left: 1.2em;
  color: v-bind(connMsgColor);
  margin-block-start: 0;
  margin-block-end: 0;
}

.bucket-access-policy-radio {
  margin-left: 1.2em;
}

.data-store-field-value {
  flex: 1 1 auto;
  justify-content: flex-start;
}
</style>
