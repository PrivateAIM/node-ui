<script setup lang="ts">
import { createDataStore } from "~/composables/useAPIFetch";
import InputText from "primevue/inputtext";
import Dropdown from "primevue/dropdown";
import InputNumber from "primevue/inputnumber";

const name = ref("");
const host = ref("");
const path = ref("");
const port = ref(80);
const protocol = ref("http");

const loading = ref(false);
const toast = useToast();

const emit = defineEmits(["newDataStore"]);

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

async function onSubmitCreateDataStore() {
  const dataStoreProps = {
    name: name.value,
    host: host.value,
    path: path.value,
    port: port.value,
    protocol: protocol.value,
  };

  for (const key in dataStoreProps) {
    if (key === "path" && !dataStoreProps[key].startsWith("/")) {
      alert('The file path must start with a "/"!');
      break;
    }
    if (!dataStoreProps[key]) {
      alert(`${key} is not defined!`);
      break;
    }
  }
  loading.value = true;
  const { data: newDataStore, status } = await createDataStore(dataStoreProps);

  if (status.value === "success") {
    toast.add({
      severity: "info",
      summary: "Creation success",
      detail: "The data store was successfully created",
      life: 3000,
    });
  } else {
    toast.add({
      severity: "error",
      summary: "Creation failure",
      detail: "An error occurred while trying to create the data store",
      life: 3000,
    });
  }

  emit("newDataStore", newDataStore.value);
  loading.value = false;
}
</script>

<template>
  <div>
    <Card style="margin-top: 10px">
      <template #title>Create a Data Store</template>
      <template #content>
        <InputGroup>
          <InputGroupAddon class="dsField">
            <i class="pi pi-barcode"></i>
            <p class="dsFieldName">Name</p>
          </InputGroupAddon>
          <InputText
            placeholder="Name for the data store"
            v-model="name"
            :invalid="name === ''"
          />
        </InputGroup>
        <InputGroup>
          <InputGroupAddon class="dsField">
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
          <InputGroupAddon class="dsField">
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
          <InputGroupAddon class="dsField">
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
          <InputGroupAddon class="dsField">
            <i class="pi pi-cog"></i>
            <p class="dsFieldName">Protocol</p>
          </InputGroupAddon>
          <Dropdown
            v-model="protocol"
            :options="acceptedProtocols"
            class="w-full md:w-56"
          />
        </InputGroup>
        <Button
          label="Submit"
          icon="pi pi-check"
          iconPos="right"
          severity="info"
          style="margin-top: 20px"
          :loading="loading"
          @click="onSubmitCreateDataStore"
        />
      </template>
    </Card>
  </div>
</template>

<style scoped lang="scss">
.dsFieldName {
  margin-left: 10px;
}

.dsField {
  width: 150px;
  height: 50px;
}
</style>
