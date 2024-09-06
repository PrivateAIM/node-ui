<script setup lang="ts">
import DataStoreCreator from "~/components/data-stores/managers/DataStoreCreator.vue";
import ProjectBinder from "~/components/data-stores/managers/ProjectBinder.vue";
import AnalysisBinder from "~/components/data-stores/managers/AnalysisBinder.vue";
import {
  getAnalysisNodes,
  getDataStores,
  getProposals,
} from "~/composables/useAPIFetch";
import type {
  AnalysisNode,
  DetailedService,
  ProjectNode,
  Route,
  Service,
} from "~/services/Api";

const availableDataStores = ref();
const availableProjects = ref();
const availableAnalyses = ref();

const { data: dataResp } = await getDataStores(false, { lazy: true });
const { data: projects, status: projStatus } = await getProposals({
  lazy: true,
});
const { data: analyses, status: anStatus } = await getAnalysisNodes({
  lazy: true,
});

watch(dataResp, (parsedStores) => {
  let dataStoreData = parsedStores!.data as unknown as Array<Route>;
  dataStoreData = dataStoreData.filter(
    (store: DetailedService) => store.name !== "kong-admin-service",
  );
  availableDataStores.value = dataStoreData.map((ds: Route) => {
    return { name: ds.name, id: ds.id };
  });
});

watch(projects, (parsedProjects) => {
  const projectData = parsedProjects!.data as unknown as Array<ProjectNode>;
  availableProjects.value = projectData.map((proj: ProjectNode) => {
    return {
      name: proj.project.name,
      id: proj.project_id,
      dropdown: `${proj.project.name} (${proj.project_id})`,
    };
  });
});

watch(analyses, (parsedAnalyses) => {
  const analysisData = parsedAnalyses!.data as unknown as Array<AnalysisNode>;
  availableAnalyses.value = analysisData.map((analysisNode: AnalysisNode) => {
    return { name: analysisNode.analysis.name, id: analysisNode.analysis_id };
  });
});

function updateDataStores(newDataStoreCreation: Service) {
  const newDataStoreEntry = {
    name: newDataStoreCreation.name,
    id: newDataStoreCreation.id,
  };
  availableDataStores.value.push(newDataStoreEntry);
  return;
}
</script>

<template>
  <div class="card tabCard">
    <TabView>
      <TabPanel header="Create a Data Store">
        <DataStoreCreator @newDataStore="updateDataStores" />
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
