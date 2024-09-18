<script setup lang="ts">
import { useIntervalFn } from "@vueuse/core";
import { getAnalysisLogs } from "~/composables/useAPIFetch";
import { showHubAdapterConnectionErrorToast } from "~/composables/connectionErrorToast";
import RefreshSwitch from "~/components/analysis/logs/RefreshSwitch.vue";
import AnalysisLogCardContent from "~/components/analysis/logs/AnalysisLogCardContent.vue";

interface logResponse {
  analysis: Map<string, string>;
  nginx: Map<string, string>;
}

const route = useRoute();
const analysisId = route.params.id;
const currentLogs = ref([]);
const prevLogs = ref([]);

const {
  data: response,
  refresh,
  status,
  error,
} = await getAnalysisLogs(analysisId);

function parseLogs(logResp: logResponse) {
  const analysisPods = logResp.analysis as Map<string, string>;
  if (analysisPods) {
    const analysisPodIds = Object.keys(analysisPods);
    let compiledLogs = [];
    analysisPodIds.forEach((analysisPodId: string) => {
      const newLogEntry = {
        podId: analysisPodId,
        analysis: logResp.analysis[analysisPodId][0],
        nginx: logResp.nginx[`nginx-${analysisPodId}`][0],
      };
      compiledLogs.push(newLogEntry);
    });
    return compiledLogs;
  }
}

function gatherCurrentLogs() {
  if (status.value === "success") {
    currentLogs.value = parseLogs(response.value);
  } else if (error.value?.statusCode === 500) {
    showHubAdapterConnectionErrorToast();
  }
}

gatherCurrentLogs();

const { pause, resume, isActive } = useIntervalFn(
  () => {
    refreshLogs();
  },
  5000,
  { immediate: false },
);

async function refreshLogs() {
  await refresh();
  gatherCurrentLogs();
}

function onRefreshToggle() {
  isActive.value ? pause() : resume();
}

// Previous logs
const prevLogResp = await useNuxtApp()
  .$hubApi(`/po/${analysisId}/history`, {
    method: "GET",
  })
  .catch(() => null);

if (prevLogResp) {
  prevLogs.value = parseLogs(prevLogResp);
}
</script>

<template>
  <Card class="contentCard">
    <template #title>Analysis</template>
    <template #subtitle>
      <div class="table-header-row">
        <span>{{ analysisId }}</span>
        <RefreshSwitch @change="onRefreshToggle" />
      </div>
    </template>
    <template #content>
      <div class="current-logs-card">
        <Fieldset legend="Current Run" :toggleable="true">
          <div v-if="currentLogs.length > 1">
            <Fieldset
              v-for="currentLog in currentLogs"
              :key="currentLog.podId"
              :toggleable="true"
              :legend="currentLog.podId"
              :collapsed="true"
            >
              <AnalysisLogCardContent
                :analysisLogs="currentLog.analysis"
                :nginxLogs="currentLog.nginx"
              />
            </Fieldset>
          </div>
          <div v-else class="log-card-single">
            <AnalysisLogCardContent
              :analysisLogs="currentLogs.length ? currentLogs[0].analysis : ''"
              :nginxLogs="currentLogs.length ? currentLogs[0].nginx : ''"
            />
          </div>
        </Fieldset>
      </div>
      <div class="previous-logs-collection-card">
        <Fieldset legend="Previous Runs" :toggleable="true">
          <div class="previous-logs-card" v-if="prevLogs.length">
            <Fieldset
              v-for="log in prevLogs"
              :key="log.podId"
              :toggleable="true"
              :legend="log.podId"
              :collapsed="true"
            >
              <AnalysisLogCardContent
                :analysisLogs="log.analysis"
                :nginxLogs="log.nginx"
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

<style scoped lang="scss"></style>
