import { defineStore } from "pinia";
import type { AnalysisNode, Project } from "~/services/Api";

export const useHubStore = defineStore("hub", {
  state: () => ({
    analysisCache: null as AnalysisNode[] | null,
    projectCache: null as Project[] | null,
  }),
  actions: {
    setAnalysisCache(data: AnalysisNode[] | null) {
      this.analysisCache = data;
    },
    setProjectCache(data: Project[] | null) {
      this.projectCache = data;
    },
  },
});
