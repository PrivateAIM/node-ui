<script setup lang="ts">
import { getProposals } from "~/composables/useAPIFetch";
import type { ProjectNode } from "~/services/Api";

const availableProjects = ref();

const { data: projects, status: projStatus } = await getProposals();

if (projStatus.value === "success") {
  const projectData = projects.value.data as unknown as Array<ProjectNode>;
  if (projectData.length > 0) {
    availableProjects.value = projectData.map((proj: ProjectNode) => {
      return {
        name: proj.project.name,
        id: proj.project_id,
        dropdown: `${proj.project.name} (${proj.project_id})`,
      };
    });
  }
}
</script>

<template>
  <div class="card">
    <DataStoresManagersDataStoreProjectInitializer
      v-if="availableProjects"
      :projects="availableProjects"
    />
  </div>
</template>

<style scoped lang="scss"></style>
