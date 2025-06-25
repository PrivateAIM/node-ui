<script lang="ts" setup>
import { useRoute } from "#vue-router";
import { Card, Fieldset } from "primevue";
import { useIntervalFn } from "@vueuse/core";
import { getAnalysisLogs } from "~/composables/useAPIFetch";
import { showHubAdapterConnectionErrorToast } from "~/composables/connectionErrorToast";
import RefreshSwitch from "~/components/analysis/logs/RefreshSwitch.vue";
import AnalysisLogCardContent from "~/components/analysis/logs/AnalysisLogCardContent.vue";
import { useNuxtApp } from "#app";
import { useToast } from "primevue/usetoast";

interface logResponse {
  analysis: Map<string, string>;
  nginx: Map<string, string>;
}

interface logEntry {
  podId: string;
  analysis: string | null;
  nginx: string | null;
}

const route = useRoute();
const toast = useToast();
const analysisId = route.params.id as string;
const currentLogs = ref([]);
const prevLogs = ref([]);

const {
  data: response,
  refresh,
  status,
  error,
} = await getAnalysisLogs(analysisId);

function parseLogs(logResp: logResponse | null): logEntry[] {
  const analysisPods = logResp?.analysis as Map<string, string>;
  let compiledLogs: logEntry[] = [];
  if (analysisPods) {
    const analysisPodIds = Object.keys(analysisPods);
    analysisPodIds.forEach((analysisPodId: string) => {
      const newLogEntry: logEntry = {
        podId: analysisPodId,
        analysis: logResp?.analysis[analysisPodId][0],
        nginx: logResp?.nginx[`nginx-${analysisPodId}`][0],
      };
      compiledLogs.push(newLogEntry);
    });
  }
  return compiledLogs;
}

function gatherCurrentLogs() {
  if (status.value === "success") {
    currentLogs.value = parseLogs(response.value);
  } else if (error.value?.statusCode === 500) {
    showHubAdapterConnectionErrorToast(toast, "PO");
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
  <Card class="content-card">
    <template #title>Analysis</template>
    <template #subtitle>
      <div class="table-header-row">
        <span>{{ analysisId }}</span>
        <RefreshSwitch
          :disabled="!currentLogs.length"
          @change="onRefreshToggle"
        />
      </div>
    </template>
    <template #content>
      <div class="current-logs-card">
        <Fieldset
          v-if="!currentLogs.length && prevLogs.length > 0"
          :toggleable="true"
          class="log-card-failed-fs"
          legend="Most Recent Run"
        >
          <div class="log-card-failed">
            <AnalysisLogCardContent
              :analysisLogs="prevLogs[0].analysis"
              :nginxLogs="prevLogs[0].nginx"
            />
          </div>
        </Fieldset>
        <Fieldset v-else :toggleable="true" legend="Current Run">
          <div v-if="currentLogs.length > 1">
            <Fieldset
              v-for="currentLog in currentLogs"
              :key="currentLog.podId"
              :collapsed="true"
              :legend="currentLog.podId"
              :toggleable="true"
            >
              <AnalysisLogCardContent
                :analysisLogs="currentLog.analysis"
                :nginxLogs="currentLog.nginx"
              />
            </Fieldset>
          </div>
          <div v-else class="log-card-single">
            <AnalysisLogCardContent
              :analysisLogs="
                currentLogs.length > 0 ? currentLogs[0].analysis : ''
              "
              :nginxLogs="currentLogs.length > 0 ? currentLogs[0].nginx : ''"
            />
          </div>
        </Fieldset>
      </div>
      <div class="previous-logs-collection-card">
        <Fieldset :toggleable="true" legend="All Previous Runs">
          <div v-if="prevLogs.length > 0" class="previous-logs-card">
            <Fieldset
              v-for="log in prevLogs"
              :key="log.podId"
              :collapsed="true"
              :legend="log.podId"
              :toggleable="true"
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

<style lang="scss">
.previous-logs-collection-card {
  margin-top: 2em;
}

//.log-card-failed-fs .p-fieldset-toggle-button {
//  background: red;
//}
</style>
