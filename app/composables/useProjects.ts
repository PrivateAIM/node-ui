import { ref } from "vue";
import { getProjectNodes } from "~/composables/useAPIFetch";
import { useProjectAnalysisSummary } from "~/composables/useProjectAnalysisSummary";
import type { ProjectNode } from "~/services/Api";
import { formatDataRow } from "~/utils/format-data-row";
import type { ProjectAnalysisSummary } from "~/utils/summarise-project-analyses";

export type ProjectRow = ProjectNode & {
  project_name?: string | null;
  summary?: ProjectAnalysisSummary;
};

const DATA_ROW_UNIX_COLS = ["created_at", "updated_at"];

/** Loads the project nodes joined with their per-project analysis summaries; must be awaited in setup. */
export async function useProjects() {
  const projects = ref<ProjectRow[] | undefined>();

  const {
    loading: summariesLoading,
    truncated,
    refreshSummaries,
    summaryFor,
  } = useProjectAnalysisSummary();

  const { data: response, status, refresh } = await getProjectNodes();

  function parseData() {
    if (status.value === "success") {
      const formatted = formatDataRow(
        response.value,
        DATA_ROW_UNIX_COLS,
        [],
      ) as unknown as ProjectRow[] | undefined;
      formatted?.forEach((row) => {
        row.project_name =
          row.project?.display_name ?? row.project?.name ?? row.project?.id;
        row.summary = summaryFor(row.project?.id);
      });
      projects.value = formatted;
    }
  }

  await refreshSummaries();
  parseData();

  async function refreshTable() {
    await Promise.all([refresh(), refreshSummaries()]);
    parseData();
  }

  return { projects, status, summariesLoading, truncated, refreshTable };
}
