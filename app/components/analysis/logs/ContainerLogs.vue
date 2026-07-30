<script lang="ts" setup>
import { useRoute } from "vue-router";
import { Card, Fieldset } from "primevue";
import { useIntervalFn } from "@vueuse/core";
import { useLogChunks } from "~/composables/useLogChunks";
import type { FlatLogLine } from "~/types/logs";
import { flattenLogs } from "~/types/logs";
import RefreshSwitch from "~/components/analysis/logs/RefreshSwitch.vue";
import AnalysisLogCardContent from "~/components/analysis/logs/AnalysisLogCardContent.vue";
import { useNuxtApp } from "nuxt/app";
import type {
  AnalysisLogHistoryResponse,
  AnalysisLogsResponse,
} from "~/services/Api";
import { type AnalysisNode, ProcessStatus } from "~/services/hub";

type FlatRunLogs = {
  run_number: number;
  nginxLines: FlatLogLine[];
  analysisLines: FlatLogLine[];
};

const route = useRoute();
const analysisId = route.params.id as string;
const analysisNodeId = route.query.nodeId as string | undefined;
const prevLogs = ref<FlatRunLogs[]>([]);
const analysis = ref<AnalysisNode | null>(null);

const logChunks = useLogChunks(analysisId);
const lastFetchedAt = ref<string | null>(null);
const showTimestamps = ref(false);
const showDebug = ref(false);

await logChunks.initialize();
if (logChunks.httpError.value === 403) {
  await navigateTo("/error/403");
} else {
  if (logChunks.initialized.value) {
    const allLines = [
      ...logChunks.nginxLines.value,
      ...logChunks.analysisLines.value,
    ];
    lastFetchedAt.value =
      allLines.length > 0
        ? allLines.reduce(
            (max, l) => (l.timestamp > max ? l.timestamp : max),
            allLines[0]!.timestamp,
          )
        : new Date().toISOString();
  }

  await Promise.all([gatherPreviousLogs(), fetchAnalysis()]);
}

async function fetchAnalysis() {
  if (!analysisNodeId) return;
  const result = (await useNuxtApp()
    .$hubApi(`/analysis-nodes/${analysisNodeId}`, {
      method: "GET",
      query: { include: "analysis" },
    })
    .catch(() => undefined)) as AnalysisNode | undefined;
  if (result) {
    analysis.value = result;
  }
}

async function gatherPreviousLogs() {
  const historyResp = (await useNuxtApp()
    .$hubApi(`/history/${analysisId}`, {
      method: "GET",
    })
    .catch(() => undefined)) as AnalysisLogHistoryResponse | undefined;

  if (historyResp?.runs) {
    const currentRunNumber = logChunks.runNumber.value;
    prevLogs.value = [...historyResp.runs]
      .filter(
        (r) => currentRunNumber === null || r.run_number !== currentRunNumber,
      )
      .sort((a, b) => b.run_number - a.run_number)
      .map((r) => ({
        run_number: r.run_number,
        nginxLines: flattenLogs(r.nginx_logs),
        analysisLines: flattenLogs(r.analysis_logs),
      }));
  }
}

const { pause, resume, isActive } = useIntervalFn(
  () => {
    refreshLogs();
  },
  5000,
  { immediate: analysis.value?.executionStatus === ProcessStatus.EXECUTING },
);

async function refreshLogs() {
  if (!lastFetchedAt.value) return;
  const fetchTime = new Date().toISOString();
  const result = await useNuxtApp()
    .$hubApi<AnalysisLogsResponse>(`/logs/${analysisId}`, {
      method: "GET",
      query: { start_date: lastFetchedAt.value },
    })
    .catch(() => undefined);
  if (result) {
    logChunks.appendPolled(result);
    const allLogs = [...result.nginx_logs, ...result.analysis_logs];
    lastFetchedAt.value =
      allLogs.length > 0
        ? allLogs.reduce(
            (max, l) => (l.timestamp > max ? l.timestamp : max),
            allLogs[0]!.timestamp,
          )
        : fetchTime;
  }
}

const previousRunsList = computed(() =>
  !logChunks.initialized.value && prevLogs.value.length > 0
    ? prevLogs.value.slice(1)
    : prevLogs.value,
);

function onRefreshToggle() {
  // eslint-disable-next-line @typescript-eslint/no-unused-expressions
  isActive.value ? pause() : resume();
}
</script>

<template>
  <Card class="content-card">
    <template #title>Analysis</template>
    <template #subtitle>
      <div class="table-header-row">
        <div class="analysis-subtitle">
          <span v-if="analysis?.analysis?.name" class="analysis-name">{{
            analysis.analysis.name
          }}</span>
          <span class="analysis-id">{{ analysisId }}</span>
        </div>
        <div class="log-header-controls">
          <ToggleButton
            v-model="showTimestamps"
            onLabel="Timestamps On"
            offLabel="Timestamps Off"
            onIcon="pi pi-clock"
            offIcon="pi pi-clock"
            class="log-timestamp-toggle"
          />
          <ToggleButton
            v-model="showDebug"
            onLabel="Debug On"
            offLabel="Debug Off"
            onIcon="pi pi-eye"
            offIcon="pi pi-eye-slash"
            class="log-debug-toggle"
          />
          <RefreshSwitch
            :disabled="analysis?.executionStatus !== ProcessStatus.EXECUTING"
            :startEnabled="
              analysis?.executionStatus === ProcessStatus.EXECUTING
            "
            @change="onRefreshToggle"
          />
        </div>
      </div>
    </template>
    <template #content>
      <div class="log-container current-logs-card">
        <div
          v-if="!logChunks.initialized.value && prevLogs.length > 0"
          class="log-card-failed"
        >
          <AnalysisLogCardContent
            :nginxLines="prevLogs[0]!.nginxLines"
            :analysisLines="prevLogs[0]!.analysisLines"
            :showTimestamps="showTimestamps"
            :showDebug="showDebug"
          />
        </div>
        <AnalysisLogCardContent
          v-else
          :nginxLines="logChunks.nginxLines.value"
          :analysisLines="logChunks.analysisLines.value"
          :showTimestamps="showTimestamps"
          :showDebug="showDebug"
          :nginxHasOlder="logChunks.hasOlder.value"
          :analysisHasOlder="logChunks.hasOlder.value"
          :nginxLoading="logChunks.isLoading.value"
          :analysisLoading="logChunks.isLoading.value"
          :onLoadOlderNginx="logChunks.loadOlderChunk"
          :onLoadOlderAnalysis="logChunks.loadOlderChunk"
        />
      </div>
      <div class="log-container previous-logs-collection-card">
        <Fieldset :toggleable="true" legend="All Previous Runs">
          <div v-if="previousRunsList.length > 0" class="previous-logs-card">
            <Fieldset
              v-for="run in previousRunsList"
              :key="run.run_number"
              :collapsed="true"
              :legend="`Run ${run.run_number}`"
              :toggleable="true"
            >
              <AnalysisLogCardContent
                :nginxLines="run.nginxLines"
                :analysisLines="run.analysisLines"
                :showTimestamps="showTimestamps"
                :showDebug="showDebug"
              />
            </Fieldset>
          </div>
          <div v-else class="previous-log-card-empty">
            <span>No previous logs found</span>
          </div>
        </Fieldset>
      </div>
    </template>
  </Card>
</template>

<style lang="scss">
.previous-logs-collection-card {
  margin-top: 2em;
}

.analysis-subtitle {
  display: flex;
  flex-direction: column;
  gap: 0.1em;
}

.analysis-name {
  font-weight: 600;
  font-size: 1em;
}

.analysis-id {
  font-size: 0.85em;
  opacity: 0.7;
}

.log-header-controls {
  display: flex;
  align-items: center;
  gap: 0.75em;
}

.log-timestamp-toggle,
.log-debug-toggle {
  font-size: 0.8em;
}
</style>
