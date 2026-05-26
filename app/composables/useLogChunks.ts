import { ref } from "vue";
import { useNuxtApp } from "nuxt/app";
import type { AnalysisLogsResponse } from "~/services/Api";
import { flattenLogs, type FlatLogLine } from "~/types/logs";

const CHUNK_SIZE = 300;

export function useLogChunks(analysisId: string) {
  const nginxLines = ref<FlatLogLine[]>([]);
  const analysisLines = ref<FlatLogLine[]>([]);
  const offset = ref(0);
  const hasMore = ref(false);
  const isLoading = ref(false);
  const initialized = ref(false);
  const httpError = ref<number | null>(null);
  const runNumber = ref<number | null>(null);

  async function fetchChunk(
    chunkOffset: number,
  ): Promise<AnalysisLogsResponse | undefined> {
    return useNuxtApp()
      .$hubApi<AnalysisLogsResponse>(`/logs/${analysisId}`, {
        method: "GET",
        query: { limit: CHUNK_SIZE, offset: chunkOffset },
      })
      .catch((err: any) => {
        httpError.value = err?.statusCode ?? err?.status ?? null;
        return undefined;
      });
  }

  async function initialize(): Promise<void> {
    isLoading.value = true;
    try {
      const result = await fetchChunk(0);
      if (result) {
        nginxLines.value = flattenLogs(result.nginx_logs);
        analysisLines.value = flattenLogs(result.analysis_logs);
        offset.value = CHUNK_SIZE;
        hasMore.value =
          result.nginx_logs.length === CHUNK_SIZE ||
          result.analysis_logs.length === CHUNK_SIZE;
        initialized.value = true;
        runNumber.value = result.run_number;
      }
    } finally {
      isLoading.value = false;
    }
  }

  async function loadNextChunk(): Promise<void> {
    if (isLoading.value || !hasMore.value) return;
    isLoading.value = true;
    try {
      const result = await fetchChunk(offset.value);
      if (result) {
        nginxLines.value = [...nginxLines.value, ...flattenLogs(result.nginx_logs)];
        analysisLines.value = [
          ...analysisLines.value,
          ...flattenLogs(result.analysis_logs),
        ];
        offset.value += CHUNK_SIZE;
        hasMore.value =
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
    offset.value = 0;
    hasMore.value = false;
    isLoading.value = false;
    initialized.value = false;
    httpError.value = null;
    runNumber.value = null;
  }

  return {
    nginxLines,
    analysisLines,
    offset,
    hasMore,
    isLoading,
    initialized,
    httpError,
    runNumber,
    initialize,
    loadNextChunk,
    appendPolled,
    reset,
  };
}
