import { ref } from "vue";
import { useNuxtApp } from "nuxt/app";
import type { AnalysisLogsResponse, PodLog } from "~/services/Api";
import { type FlatLogLine, flattenLogs } from "~/types/logs";

const CHUNK_SIZE = 300;

function oldestTimestampOf(a: PodLog[], b: PodLog[]): string | null {
  const candidates = [a[0]?.timestamp, b[0]?.timestamp].filter(
    Boolean,
  ) as string[];
  if (candidates.length === 0) return null;
  return candidates.reduce((min, t) => (t < min ? t : min));
}

export function useLogChunks(analysisId: string) {
  const nginxLines = ref<FlatLogLine[]>([]);
  const analysisLines = ref<FlatLogLine[]>([]);
  const oldestTimestamp = ref<string | null>(null);
  const hasOlder = ref(false);
  const isLoading = ref(false);
  const initialized = ref(false);
  const httpError = ref<number | null>(null);
  const runNumber = ref<number | null>(null);

  async function fetchChunk(query: {
    end_date?: string;
  }): Promise<AnalysisLogsResponse | undefined> {
    return useNuxtApp()
      .$hubApi<AnalysisLogsResponse>(`/logs/${analysisId}`, {
        method: "GET",
        query: { limit: CHUNK_SIZE, ...query },
      })
      .catch((err) => {
        httpError.value = err?.statusCode ?? err?.status ?? null;
        return undefined;
      });
  }

  async function initialize(): Promise<void> {
    if (isLoading.value) return;
    httpError.value = null;
    isLoading.value = true;
    try {
      const result = await fetchChunk({ end_date: new Date().toISOString() });
      if (result) {
        nginxLines.value = flattenLogs(result.nginx_logs);
        analysisLines.value = flattenLogs(result.analysis_logs);
        oldestTimestamp.value = oldestTimestampOf(
          result.nginx_logs,
          result.analysis_logs,
        );
        hasOlder.value =
          result.nginx_logs.length === CHUNK_SIZE ||
          result.analysis_logs.length === CHUNK_SIZE;
        initialized.value = true;
        runNumber.value = result.run_number;
      }
    } finally {
      isLoading.value = false;
    }
  }

  async function loadOlderChunk(): Promise<void> {
    if (isLoading.value || !hasOlder.value || !oldestTimestamp.value) return;
    isLoading.value = true;
    try {
      const result = await fetchChunk({ end_date: oldestTimestamp.value });
      if (result) {
        const newNginx = flattenLogs(result.nginx_logs);
        const newAnalysis = flattenLogs(result.analysis_logs);
        nginxLines.value = [...newNginx, ...nginxLines.value];
        analysisLines.value = [...newAnalysis, ...analysisLines.value];
        oldestTimestamp.value = oldestTimestampOf(
          result.nginx_logs,
          result.analysis_logs,
        );
        hasOlder.value =
          result.nginx_logs.length === CHUNK_SIZE ||
          result.analysis_logs.length === CHUNK_SIZE;
      }
    } finally {
      isLoading.value = false;
    }
  }

  function appendPolled(result: AnalysisLogsResponse): void {
    nginxLines.value = [...nginxLines.value, ...flattenLogs(result.nginx_logs)];
    analysisLines.value = [
      ...analysisLines.value,
      ...flattenLogs(result.analysis_logs),
    ];
  }

  function reset(): void {
    nginxLines.value = [];
    analysisLines.value = [];
    oldestTimestamp.value = null;
    hasOlder.value = false;
    isLoading.value = false;
    initialized.value = false;
    httpError.value = null;
    runNumber.value = null;
  }

  return {
    nginxLines,
    analysisLines,
    oldestTimestamp,
    hasOlder,
    isLoading,
    initialized,
    httpError,
    runNumber,
    initialize,
    loadOlderChunk,
    appendPolled,
    reset,
  };
}
