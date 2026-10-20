import { ref } from "vue";
import { getProjectNodes } from "~/composables/useAPIFetch";
import type { ProjectNode } from "~/services/Api";
import type { AvailableProject } from "~/types/dataStore";
import { toAvailableProjects } from "~/utils/data-store-form";

/** Loads the projects this node belongs to as picker options; must be awaited in setup. */
export async function useAvailableProjects() {
  const availableProjects = ref<AvailableProject[]>([]);

  const { data: projects, status: projStatus } = await getProjectNodes();

  if (projStatus.value === "success") {
    const projectData = projects.value as unknown as Array<ProjectNode>;
    if (projectData.length > 0) {
      availableProjects.value = toAvailableProjects(projectData);
    }
  }

  return { availableProjects };
}
