<script setup lang="ts">
import { ref, watch } from "vue";
import { useNuxtApp } from "#app";
import InputText from "primevue/inputtext";
import Select from "primevue/select";
import InputNumber from "primevue/inputnumber";
import InputGroupAddon from "primevue/inputgroupaddon";
import InputGroup from "primevue/inputgroup";
import DataStoreHelpBox from "~/components/data-stores/managers/DataStoreHelpBox.vue";
import { HelpTextField } from "~/components/data-stores/managers/index";
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
const availableMethods = ["GET", "POST", "PUT", "DELETE"];
const dataStoreTypes = ["FHIR", "S3"];

const selectedProject = ref();

const selectedAllowedMethods = ref(["GET"]);
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
      alert(`${key} is not defined!`);
      return;
    }
  }

  const configSettings: kongBody = {
    datastore: datastoreSettings,
    project_id: selectedProject.value.id,
    methods: selectedAllowedMethods.value,
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
              style="margin-bottom: 20px"
              class="data-store-project-input"
            >
              <InputGroupAddon class="data-store-field-name">
                <i class="pi pi-cog"></i>
                <p class="data-store-field-name-box">Project</p>
              </InputGroupAddon>
              <Select
                v-model="selectedProject"
                :options="props.projects"
                optionLabel="dropdown"
                placeholder="Select a Project"
                class="project-picker"
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
                      class="help-text"
                      v-tooltip.top="
                        'Name of the server on which the data resides'
                      "
                    >
                      Server
                    </p>
                  </button>
                </div>
              </InputGroupAddon>
              <InputText
                placeholder="Server or hostname"
                v-model="host"
                :invalid="host === ''"
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
                      class="help-text"
                      v-tooltip.top="'Absolute directory path'"
                    >
                      Data Path
                    </p>
                  </button>
                </div>
              </InputGroupAddon>
              <InputText
                placeholder="Data path (must start with '/')"
                v-model="path"
                :invalid="path === '' || !path.startsWith('/')"
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
                      class="help-text"
                      v-tooltip.top="'Type of server the data is stored on'"
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
                      class="help-text"
                      v-tooltip.top="'Port number for accessing the data'"
                    >
                      Port
                    </p>
                  </button>
                </div>
              </InputGroupAddon>
              <InputNumber
                placeholder="Port e.g. 443"
                v-model="port"
                :invalid="port < 0 || port > 65535"
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
                      class="help-text"
                      v-tooltip.top="
                        'Access protocol for the data storage server'
                      "
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
            <InputGroup>
              <InputGroupAddon class="data-store-field-name">
                <i class="pi pi-warehouse"></i>
                <div class="data-store-field-name-box">
                  <button
                    class="help-button"
                    @click="activateHelp(HelpTextField.Methods)"
                  >
                    <p class="help-text" v-tooltip.top="'Allowed HTTP methods'">
                      Allowed Methods
                    </p>
                  </button>
                </div>
              </InputGroupAddon>
              <MultiSelect
                v-model="selectedAllowedMethods"
                display="chip"
                :options="availableMethods"
                placeholder="Select methods"
                class="methods-picker"
              />
            </InputGroup>
            <Button
              label="Submit"
              icon="pi pi-check"
              iconPos="right"
              severity="info"
              style="margin-top: 20px"
              :loading="loading"
              class="create-data-store-btn"
              @click="onSubmitCreateDataStoreAndProject"
            />
          </div>
          <div class="data-store-help-box" v-if="helpActive">
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

<style scoped lang="scss">
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
