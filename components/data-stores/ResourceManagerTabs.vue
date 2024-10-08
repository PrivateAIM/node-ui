<script setup lang="ts">
import AnalysisBinder from "~/components/data-stores/managers/AnalysisBinder.vue";
import { getAnalysisNodes, getProposals } from "~/composables/useAPIFetch";
import type { AnalysisNode, ProjectNode } from "~/services/Api";

const availableProjects = ref();
const availableAnalyses = ref();

const { data: projects, status: projStatus } = await getProposals({
  lazy: true,
});
const { data: analyses, status: anStatus } = await getAnalysisNodes({
  lazy: true,
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
</script>

<template>
  <div class="card tabCard">
    <TabView>
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
      <TabPanel
        header="Create a Project and Data Store"
        :disabled="projStatus === 'pending'"
      >
        <DataStoresManagersDataStoreProjectInitializer
          v-if="availableProjects"
          :projects="availableProjects"
        />
      </TabPanel>
    </TabView>
  </div>
</template>

<style scoped lang="scss"></style>
