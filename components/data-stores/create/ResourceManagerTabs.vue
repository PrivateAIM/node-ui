<script lang="ts" setup>
import { getProjectNodes } from "~/composables/useAPIFetch";
import type { ProjectNode } from "~/services/Api";
import DataStoreProjectInitializer from "~/components/data-stores/create/DataStoreProjectInitializer.vue";

export interface availableProject {
  name: string | null | undefined;
  id: string;
  dropdown: string;
}

const availableProjects = ref<availableProject[]>([]);

const { data: projects, status: projStatus } = await getProjectNodes();

if (projStatus.value === "success") {
  const projectData = projects.value as unknown as Array<ProjectNode>;
  if (projectData.length > 0) {
    availableProjects.value = projectData.map((proj: ProjectNode) => {
      return {
        name: proj.project?.name,
        id: proj.project_id,
        dropdown: `${proj.project?.name} (${proj.project_id})`,
      };
    });
  }
}
</script>

<template>
  <div class="card">
    <DataStoreProjectInitializer
      v-if="availableProjects"
      :projects="availableProjects"
    />
  </div>
</template>

<style lang="scss" scoped></style>
