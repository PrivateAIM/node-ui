<script setup lang="ts">
import Dropdown from "primevue/dropdown";
import { createProject } from "~/composables/useAPIFetch";

const props = defineProps({
  projects: Array,
  dataStores: Array,
});

const selectedProject = ref();
const selectedDataStore = ref();
const selectedAllowedMethods = ref([]);
const selectedDataStoreType = ref("fhir");

const availableMethods = ref(["GET", "POST", "PUT", "DELETE"]);
const dataStoreTypes = ref(["fhir", "s3"]);

const loading = ref(false);
const toast = useToast();

async function onSubmitBinding() {
  const linkProps = {
    project_id: selectedProject.value.id,
    data_store_id: selectedDataStore.value.id,
    methods: selectedAllowedMethods.value,
    ds_type: selectedDataStoreType.value,
  };
  loading.value = true;
  const { status, error } = await createProject(linkProps);

  if (status.value === "success") {
    toast.add({
      severity: "info",
      summary: "Link success",
      detail: "The project was successfully bound to the data store",
      life: 3000,
    });
    // Conflict
  } else if (error.value?.statusCode === 409) {
    toast.add({
      severity: "warn",
      summary: "Duplicate entry",
      detail: "Link already exists between this project and data store!",
      life: 4000,
    });
  } else {
    toast.add({
      severity: "error",
      summary: "Link failure",
      detail:
        "An error occurred while trying to link the project to the data store",
      life: 3000,
    });
  }

  loading.value = false;
}
</script>

<template>
  <div>
    <Card style="margin-top: 10px">
      <template #title>Project Binder</template>
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
            <i class="pi pi-warehouse"></i>
            <p class="dsFieldName">Data Store</p>
          </InputGroupAddon>
          <Dropdown
            v-model="selectedDataStore"
            :options="props.dataStores"
            optionLabel="name"
            placeholder="Select a Data Store"
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
          @click="onSubmitBinding"
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
