import { defineStore } from "pinia";
import type { AnalysisNode, Project } from "~/services/Api";

export const useHubStore = defineStore("hub", {
  state: () => ({
    analysisCache: undefined as AnalysisNode[] | undefined,
    projectCache: undefined as Project[] | undefined,
  }),
  actions: {
    setAnalysisCache(data: AnalysisNode[] | undefined) {
      this.analysisCache = data;
    },
    setProjectCache(data: Project[] | undefined) {
      this.projectCache = data;
    },
  },
});
