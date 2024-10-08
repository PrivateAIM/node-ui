<script setup lang="ts">
import InputText from "primevue/inputtext";
import Dropdown from "primevue/dropdown";
import InputNumber from "primevue/inputnumber";

const props = defineProps({
  projects: Array,
});

const loading = ref(false);
const toast = useToast();

// Project settings
const availableMethods = ref(["GET", "POST", "PUT", "DELETE"]);
const dataStoreTypes = ref(["fhir", "s3"]);

const selectedProject = ref();
const selectedAllowedMethods = ref(["GET"]);
const selectedDataStoreType = ref("fhir");

// Datastore settings
const dataStoreName = ref();
const host = ref("");
const path = ref("");
const port = ref(80);
const protocol = ref("http");

const acceptedProtocols = ref([
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
]);

async function onSubmitCreateDataStoreAndProject() {
  const datastoreSettings = {
    name: dataStoreName.value,
    host: host.value,
    path: path.value,
    port: port.value,
    protocol: protocol.value,
  };

  for (const key in datastoreSettings) {
    if (!dataStoreProps[key]) {
      alert(`${key} is not defined!`);
      break;
    }
  }

  const configSettings = {
    datastore: datastoreSettings,
    project_id: selectedProject.value.id,
    data_store_id: selectedDataStore.value.id,
    methods: selectedAllowedMethods.value,
    ds_type: selectedDataStoreType.value,
  };

  loading.value = true;
  const creationResp = await useNuxtApp()
    .$hubApi("/kong/initialize", {
      method: "POST",
      body: configSettings,
    })
    .catch(() => null); // Set the response to null if an error occurs

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
      summary: "Creation failure",
      detail:
        "An error occurred while trying to register the data store or project",
      life: 3000,
    });
  }

  loading.value = false;
}
</script>

<template>
  <div>
    <Card style="margin-top: 10px">
      <template #title>Create a Project and Data Store</template>
      <template #content>
        <InputGroup>
          <InputGroupAddon class="fieldName">
            <i class="pi pi-cog"></i>
            <p class="dsFieldName">Project</p>
          </InputGroupAddon>
          <Dropdown
            v-model="selectedProject"
            :options="props.projects"
            optionLabel="dropdown"
            placeholder="Select a Project"
          />
        </InputGroup>
        <InputGroup>
          <InputGroupAddon class="fieldName">
            <i class="pi pi-barcode"></i>
            <p class="dsFieldName">Data Store</p>
          </InputGroupAddon>
          <InputText v-model="selectedProject.id" disabled />
        </InputGroup>
        <InputGroup>
          <InputGroupAddon class="fieldName">
            <i class="pi pi-server"></i>
            <p class="dsFieldName">Server</p>
          </InputGroupAddon>
          <InputText
            placeholder="Server or hostname"
            v-model="host"
            :invalid="host === ''"
          />
        </InputGroup>
        <InputGroup>
          <InputGroupAddon class="fieldName">
            <i class="pi pi-folder"></i>
            <p class="dsFieldName">Data Path</p>
          </InputGroupAddon>
          <InputText
            placeholder="Data path (must start with '/')"
            v-model="path"
            :invalid="path === '' || !path.startsWith('/')"
          />
        </InputGroup>
        <InputGroup>
          <InputGroupAddon class="fieldName">
            <i class="pi pi-warehouse"></i>
            <p class="dsFieldName">Data Store Type</p>
          </InputGroupAddon>
          <Dropdown v-model="selectedDataStoreType" :options="dataStoreTypes" />
        </InputGroup>
        <InputGroup>
          <InputGroupAddon class="fieldName">
            <i class="pi pi-key"></i>
            <p class="dsFieldName">Port</p>
          </InputGroupAddon>
          <InputNumber
            placeholder="Port e.g. 443"
            v-model="port"
            :invalid="port < 0 || port > 65535"
          />
        </InputGroup>
        <InputGroup>
          <InputGroupAddon class="fieldName">
            <i class="pi pi-cog"></i>
            <p class="dsFieldName">Protocol</p>
          </InputGroupAddon>
          <Dropdown
            v-model="protocol"
            :options="acceptedProtocols"
            class="w-full md:w-56"
          />
        </InputGroup>
        <InputGroup>
          <InputGroupAddon class="fieldName">
            <i class="pi pi-warehouse"></i>
            <p class="dsFieldName">Allowed Methods</p>
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
      </template>
    </Card>
  </div>
</template>

<style scoped lang="scss">
.dsFieldName {
  margin-left: 10px;
}

.fieldName {
  width: 200px;
  height: 50px;
}
</style>
