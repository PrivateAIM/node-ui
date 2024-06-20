<script setup lang="ts">
import { createDataStore } from "~/composables/useAPIFetch";
import InputText from "primevue/inputtext";
import InputNumber from "primevue/inputnumber";

const host = ref("foo");
const name = ref("bar");
const path = ref("/baz");
const port = ref(443);
const protocol = ref("http");

async function onSubmitCreateDataStore() {
  const dataStoreProps = {
    host: host.value,
    name: name.value,
    path: path.value,
    port: port.value,
    protocol: protocol.value,
  };
  for (const key in dataStoreProps) {
    if (!dataStoreProps[key]) {
      alert(`${key} is not defined!`);
      break;
    }
  }
  const { data: response, status } = await createDataStore(dataStoreProps);
  if (status.value === "success") {
    alert("Data store successfully created!");
  } else {
    alert(`Data store creation failed`);
  }
}
</script>

<template>
  <h2 style="color: white">Create a Data Store</h2>
  <div>
    <Card>
      <template #content>
        <InputGroup>
          <InputGroupAddon>
            <i class="pi pi-server"></i>
          </InputGroupAddon>
          <InputText
            placeholder="Server or Host"
            v-model="host"
            :invalid="host === ''"
          />
        </InputGroup>
        <InputGroup>
          <InputGroupAddon>
            <i class="pi pi-barcode"></i>
          </InputGroupAddon>
          <InputText
            placeholder="Name for the data store"
            v-model="name"
            :invalid="name === ''"
          />
        </InputGroup>
        <InputGroup>
          <InputGroupAddon>
            <i class="pi pi-folder"></i>
          </InputGroupAddon>
          <InputText placeholder="Path" v-model="path" :invalid="path === ''" />
        </InputGroup>
        <InputGroup>
          <InputGroupAddon>
            <i class="pi pi-key"></i>
          </InputGroupAddon>
          <InputNumber
            placeholder="Port e.g. 443"
            v-model="port"
            :invalid="port === 0"
          />
        </InputGroup>
        <InputGroup>
          <InputGroupAddon>
            <i class="pi pi-cog"></i>
          </InputGroupAddon>
          <InputText
            placeholder="Protocol: http or ftp"
            v-model="protocol"
            :invalid="protocol === ''"
          />
        </InputGroup>
        <Button
          label="Submit"
          icon="pi pi-check"
          iconPos="right"
          severity="success"
          style="margin-top: 20px"
          @click="onSubmitCreateDataStore"
        />
      </template>
    </Card>
  </div>
</template>

<style scoped lang="scss"></style>
