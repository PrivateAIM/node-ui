<script lang="ts" setup>
import { useRoute } from "vue-router";
import { Card, Fieldset } from "primevue";
import { useIntervalFn } from "@vueuse/core";
import { getAnalysisLogs } from "~/composables/useAPIFetch";
import RefreshSwitch from "~/components/analysis/logs/RefreshSwitch.vue";
import AnalysisLogCardContent from "~/components/analysis/logs/AnalysisLogCardContent.vue";
import { useNuxtApp } from "nuxt/app";
import type {
  AnalysisLogHistoryResponse,
  AnalysisLogsResponse,
  AnalysisNode,
  RunLogs,
} from "~/services/Api";
import { ProcessStatus } from "~/types/analysis";

const route = useRoute();
const analysisId = route.params.id as string;
const analysisNodeId = route.query.nodeId as string | undefined;
const currentLogs = ref<AnalysisLogsResponse | null>(null);
const prevLogs = ref<RunLogs[]>([]);
const analysis = ref<AnalysisNode | null>(null);

const {
  data: response,
  status,
  error,
} = await getAnalysisLogs(analysisId, { limit: null });

const lastFetchedAt = ref<string | null>(null);

gatherCurrentLogs();
await Promise.all([gatherPreviousLogs(), fetchAnalysis()]);

function gatherCurrentLogs() {
  if (status.value === "success") {
    currentLogs.value = response.value ?? null;
    if (currentLogs.value) {
      lastFetchedAt.value = new Date().toISOString();
    }
  } else if (status.value === "error" && error.value?.statusCode === 403) {
    navigateTo("/error/403");
  }
}

async function fetchAnalysis() {
  const result = (await useNuxtApp()
    .$hubApi(`/analysis-nodes/${analysisNodeId}`, {
      method: "GET",
      query: {
        include: "analysis",
      },
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
      query: {
        limit: null,
      },
    })
    .catch(() => undefined)) as AnalysisLogHistoryResponse | undefined;

  if (historyResp?.runs) {
    const currentRunNumber = currentLogs.value?.run_number;
    prevLogs.value = [...historyResp.runs]
      .filter(
        (r) =>
          currentRunNumber === undefined || r.run_number !== currentRunNumber,
      )
      .sort((a, b) => b.run_number - a.run_number);
  }
}

const { pause, resume, isActive } = useIntervalFn(
  () => {
    refreshLogs();
  },
  5000,
  { immediate: analysis.value?.execution_status === ProcessStatus.Executing },
);

async function refreshLogs() {
  if (!lastFetchedAt.value) {
    const fetchTime = new Date().toISOString();
    const result = await useNuxtApp()
      .$hubApi<AnalysisLogsResponse>(`/logs/${analysisId}`, {
        method: "GET",
        query: { limit: null },
      })
      .catch(() => undefined);
    if (result) {
      currentLogs.value = result;
      lastFetchedAt.value = fetchTime;
    }
    return;
  }

  const fetchTime = new Date().toISOString();
  const result = await useNuxtApp()
    .$hubApi<AnalysisLogsResponse>(`/logs/${analysisId}`, {
      method: "GET",
      query: { start_date: lastFetchedAt.value },
    })
    .catch(() => undefined);
  if (result && currentLogs.value) {
    currentLogs.value = {
      ...currentLogs.value,
      analysis_logs: [
        ...currentLogs.value.analysis_logs,
        ...result.analysis_logs,
      ],
      nginx_logs: [...currentLogs.value.nginx_logs, ...result.nginx_logs],
    };
  }
  lastFetchedAt.value = fetchTime;
}

const previousRunsList = computed(() =>
  !currentLogs.value && prevLogs.value.length > 0
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
        <span>{{ analysisId }}</span>
        <RefreshSwitch
          :disabled="analysis?.execution_status !== ProcessStatus.Executing"
          :startEnabled="analysis?.execution_status === ProcessStatus.Executing"
          @change="onRefreshToggle"
        />
      </div>
    </template>
    <template #content>
      <div class="log-container current-logs-card">
        <Fieldset
          v-if="!currentLogs && prevLogs.length > 0"
          :toggleable="true"
          class="log-card-failed-fs"
          legend="Most Recent Run"
        >
          <div class="log-card-failed">
            <AnalysisLogCardContent
              :analysisLogs="prevLogs[0]!.analysis_logs"
              :nginxLogs="prevLogs[0]!.nginx_logs"
            />
          </div>
        </Fieldset>
        <Fieldset v-else :toggleable="true" legend="Current Run">
          <AnalysisLogCardContent
            :analysisLogs="currentLogs?.analysis_logs ?? []"
            :nginxLogs="currentLogs?.nginx_logs ?? []"
          />
        </Fieldset>
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
                :analysisLogs="run.analysis_logs"
                :nginxLogs="run.nginx_logs"
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
</style>
