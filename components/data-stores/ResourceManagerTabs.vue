<script setup lang="ts">
import DataStoreCreator from "~/components/data-stores/managers/DataStoreCreator.vue";
import ProjectBinder from "~/components/data-stores/managers/ProjectBinder.vue";
import AnalysisBinder from "~/components/data-stores/managers/AnalysisBinder.vue";
import {
  getAnalyses,
  getDataStores,
  getProjects,
} from "~/composables/useAPIFetch";
import type { DetailedAnalysis, Project, Route, Service } from "~/services/Api";

const availableDataStores = ref();
const availableProjects = ref();
const availableAnalyses = ref();

const { data: dataResp } = await getDataStores(false, { lazy: true });
const { data: projects, status: projStatus } = await getProjects({
  lazy: true,
});
const { data: analyses, status: anStatus } = await getAnalyses({
  lazy: true,
});

watch(dataResp, (parsedStores) => {
  const dataStoreData = parsedStores!.data as unknown as Array<Route>;
  availableDataStores.value = dataStoreData.map((ds: Route) => {
    return { name: ds.name, id: ds.id };
  });
});

watch(projects, (parsedProjects) => {
  const projectData = parsedProjects!.data as unknown as Array<Project>;
  availableProjects.value = projectData.map((proj: Project) => {
    return { name: proj.name, id: proj.id };
  });
});

watch(analyses, (parsedAnalyses) => {
  const analysisData = parsedAnalyses!
    .data as unknown as Array<DetailedAnalysis>;
  availableAnalyses.value = analysisData.map((analysis: DetailedAnalysis) => {
    return { name: analysis.name, id: analysis.id };
  });
});

function updateDataStores(newDataStoreCreation: Service) {
  const newDataStoreEntry = {
    name: newDataStoreCreation.name,
    id: newDataStoreCreation.id,
  };
  availableDataStores.value = availableDataStores.value.push(newDataStoreEntry);
  console.log(availableDataStores.value);
  return;
}
</script>

<template>
  <div class="card tabCard">
    <TabView>
      <TabPanel header="Create a Data Store">
        <DataStoreCreator @updatedRow="updateDataStores" />
      </TabPanel>
      <TabPanel
        header="Bind a Project to a Data Store"
        :disabled="projStatus === 'pending'"
      >
        <ProjectBinder
          v-if="availableProjects"
          :dataStores="availableDataStores"
          :projects="availableProjects"
        />
      </TabPanel>
      <TabPanel
        header="Link an Analysis to a Project"
        :disabled="anStatus === 'pending'"
      >
        <AnalysisBinder
          v-if="availableAnalyses"
          :analyses="availableAnalyses"
          :projects="availableProjects"
        />
      </TabPanel>
    </TabView>
  </div>
</template>

<style scoped lang="scss"></style>
