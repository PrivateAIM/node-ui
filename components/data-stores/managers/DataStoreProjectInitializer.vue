<script setup lang="ts">
import InputText from "primevue/inputtext";
import Dropdown from "primevue/dropdown";
import InputNumber from "primevue/inputnumber";
import DataStoreHelpBox from "~/components/data-stores/managers/DataStoreHelpBox.vue";

const props = defineProps({
  projects: Array,
});

const loading = ref(false);
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
  "udp",
  "ws",
  "wss",
];

watch(selectedProject, (newSelectedProject) => {
  dataStoreName.value = newSelectedProject.id;
});

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

  const configSettings = {
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
      life: 3000,
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
        <div class="data-store-panel">
          <div class="data-store-input-fields">
            <InputGroup style="margin-bottom: 20px">
              <InputGroupAddon class="data-store-field-name">
                <i class="pi pi-cog"></i>
                <p class="data-store-field-name-box">Project</p>
              </InputGroupAddon>
              <Dropdown
                v-model="selectedProject"
                :options="props.projects"
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
            <InputGroup>
              <InputGroupAddon class="data-store-field-name">
                <i class="pi pi-server"></i>
                <p class="data-store-field-name-box">Server</p>
              </InputGroupAddon>
              <InputText
                placeholder="Server or hostname"
                v-model="host"
                :invalid="host === ''"
              />
            </InputGroup>
            <InputGroup>
              <InputGroupAddon class="data-store-field-name">
                <i class="pi pi-folder"></i>
                <p class="data-store-field-name-box">Data Path</p>
              </InputGroupAddon>
              <InputText
                placeholder="Data path (must start with '/')"
                v-model="path"
                :invalid="path === '' || !path.startsWith('/')"
              />
            </InputGroup>
            <InputGroup>
              <InputGroupAddon class="data-store-field-name">
                <i class="pi pi-warehouse"></i>
                <p class="data-store-field-name-box">Data Store Type</p>
              </InputGroupAddon>
              <Dropdown
                v-model="selectedDataStoreType"
                :options="dataStoreTypes"
              />
            </InputGroup>
            <InputGroup>
              <InputGroupAddon class="data-store-field-name">
                <i class="pi pi-key"></i>
                <p class="data-store-field-name-box">Port</p>
              </InputGroupAddon>
              <InputNumber
                placeholder="Port e.g. 443"
                v-model="port"
                :invalid="port < 0 || port > 65535"
              />
            </InputGroup>
            <InputGroup>
              <InputGroupAddon class="data-store-field-name">
                <i class="pi pi-cog"></i>
                <p class="data-store-field-name-box">Protocol</p>
              </InputGroupAddon>
              <Dropdown
                v-model="protocol"
                :options="acceptedProtocols"
                class="w-full md:w-56"
              />
            </InputGroup>
            <InputGroup>
              <InputGroupAddon class="data-store-field-name">
                <i class="pi pi-warehouse"></i>
                <p class="data-store-field-name-box">Allowed Methods</p>
              </InputGroupAddon>
              <MultiSelect
                v-model="selectedAllowedMethods"
                display="chip"
                :options="availableMethods"
                placeholder="Select methods"
              />
            </InputGroup>
            <Button
              label="Submit"
              icon="pi pi-check"
              iconPos="right"
              severity="info"
              style="margin-top: 20px"
              :loading="loading"
              @click="onSubmitCreateDataStoreAndProject"
            />
          </div>
          <div class="data-store-help-box">
            <DataStoreHelpBox />
          </div>
        </div>
      </template>
    </Card>
  </div>
</template>

<style scoped lang="scss">
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

.data-store-field-name {
  width: 200px;
  height: 50px;
}
</style>
