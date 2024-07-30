<script setup lang="ts">
import Dropdown from "primevue/dropdown";
import {
  createProject,
  getDataStores,
  getProjects,
} from "~/composables/useAPIFetch";
import type { Project, Route } from "~/services/Api";

const selectedProject = ref();
const selectedDataStore = ref();
const selectedAllowedMethods = ref([]);
const selectedDataStoreType = ref("FHIR");

const availableProjects = ref();
const availableDataStores = ref();
const availableMethods = ref(["GET", "POST", "PUT", "DELETE"]);
const dataStoreTypes = ref(["FHIR", "S3"]);

const loading = ref(false);
const created = ref("");

const { data: projects } = await getProjects();
const projectData = projects.value!.data as unknown as Array<Project>;
availableProjects.value = projectData.map((proj: Project) => {
  return { name: proj.name, id: proj.id };
});

const { data: r2 } = await getDataStores(false);
const dataStoreData = r2.value!.data as unknown as Array<Route>;
availableDataStores.value = dataStoreData.map((ds: Route) => {
  return { name: ds.name, id: ds.id };
});

async function onSubmitBinding() {
  const props = {
    project_id: selectedProject.value.id,
    data_store_id: selectedDataStore.value.id,
    methods: selectedAllowedMethods.value,
    ds_type: selectedDataStoreType.value,
  };
  loading.value = true;
  const { status } = await createProject(props);
  created.value = status.value;
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
            :options="availableProjects"
            optionLabel="name"
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
            :options="availableDataStores"
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
        <p style="color: green" v-if="created === 'success'">
          Link successfully created
        </p>
        <p style="color: yellow" v-if="created === 'duplicate'">
          Link already exists between this project and data store!
        </p>
        <p style="color: red" v-else-if="created && created !== 'success'">
          Failed to create link
        </p>
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
