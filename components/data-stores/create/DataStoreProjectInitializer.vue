<script lang="ts" setup>
import { ref, watch } from "vue";
import { useNuxtApp } from "#app";
import InputText from "primevue/inputtext";
import Select from "primevue/select";
import InputNumber from "primevue/inputnumber";
import InputGroupAddon from "primevue/inputgroupaddon";
import InputGroup from "primevue/inputgroup";
import DataStoreHelpBox from "~/components/data-stores/create/DataStoreHelpBox.vue";
import { HelpTextField } from "~/components/data-stores/create/index";
import { useToast } from "primevue/usetoast";

const props = defineProps({
  projects: Array,
});

export interface kongBody {
  datastore: object;
  project_id: string;
  methods: string[];
  ds_type: string;
}

const loading = ref(false);
const helpActive = ref();
const toast = useToast();

// Project settings
// const availableMethods = ["GET", "POST", "PUT", "DELETE"];
const dataStoreTypes = ["FHIR", "S3"];

const selectedProject = ref();

// const selectedAllowedMethods = ref(["GET"]);
const selectedDataStoreType = ref("FHIR");

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
  // "udp",
  "ws",
  "wss",
];

watch(selectedProject, (newSelectedProject) => {
  dataStoreName.value = newSelectedProject.id;
});

function activateHelp(helpField: HelpTextField) {
  helpActive.value = helpActive.value === helpField ? null : helpField;
}

function deactivateHelp() {
  helpActive.value = null;
}

async function onSubmitCreateDataStoreAndProject() {
  const datastoreSettings = {
    name: dataStoreName.value,
    host: host.value,
    path: path.value,
    port: port.value,
    protocol: protocol.value,
  };

  for (const key in datastoreSettings) {
    if (!datastoreSettings[key]) {
      toast.add({
        severity: "error",
        summary: "Value missing",
        detail: `${key} is not defined!`,
        life: 5000,
      });
      return;
    }
  }

  const configSettings: kongBody = {
    datastore: datastoreSettings,
    project_id: selectedProject.value.id,
    // methods: selectedAllowedMethods.value,
    methods: ["GET"], // Hardcode to GET only to prevent abuse/security issues
    ds_type: selectedDataStoreType.value.toLowerCase() as string,
  };

  loading.value = true;
  const errMsg = { summary: "", msg: "" };
  const creationResp = await useNuxtApp()
    .$hubApi("/kong/initialize", {
      method: "POST",
      body: configSettings,
    })
    .catch((error) => {
      if (error.status === 409) {
        errMsg.summary = "Duplicate entry error";
        errMsg.msg = "A data store for this project already exists!";
      } else {
        errMsg.summary = "Creation failure";
        errMsg.msg =
          "An error occurred while trying to register the data store or project";
      }
    }); // Set the response to null if an error occurs

  if (creationResp) {
    toast.add({
      severity: "info",
      summary: "Creation success",
      detail: "The data store and project were successfully registered",
      life: 5000,
    });
  } else {
    toast.add({
      severity: "error",
      summary: errMsg.summary,
      detail: errMsg.msg,
      life: 5000,
    });
  }

  loading.value = false;
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
                <i class="pi pi-cog"></i>
                <p class="data-store-field-name-box">Project</p>
              </InputGroupAddon>
              <Select
                v-model="selectedProject"
                :options="props.projects"
                class="project-picker"
                optionLabel="dropdown"
                placeholder="Select a Project"
              />
            </InputGroup>
            <InputGroup>
              <InputGroupAddon class="data-store-field-name">
                <i class="pi pi-barcode"></i>
                <p class="data-store-field-name-box">Data Store</p>
              </InputGroupAddon>
              <InputText v-model="dataStoreName" disabled />
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
                      Server
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
            <InputGroup class="data-store-path-input">
              <InputGroupAddon class="data-store-field-name">
                <i class="pi pi-folder"></i>
                <div class="data-store-field-name-box">
                  <button
                    class="help-button"
                    @click="activateHelp(HelpTextField.Path)"
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
                      Data Server Type
                    </p>
                  </button>
                </div>
              </InputGroupAddon>
              <Select
                v-model="selectedDataStoreType"
                :options="dataStoreTypes"
                class="data-store-type-picker"
              />
            </InputGroup>
            <InputGroup class="data-store-port-input">
              <InputGroupAddon class="data-store-field-name">
                <i class="pi pi-key"></i>
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
            <Button
              :loading="loading"
              class="create-data-store-btn"
              icon="pi pi-check"
              iconPos="right"
              label="Submit"
              severity="info"
              style="margin-top: 20px"
              @click="onSubmitCreateDataStoreAndProject"
            />
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
</style>
