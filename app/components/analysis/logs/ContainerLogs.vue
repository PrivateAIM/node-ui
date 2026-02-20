<script lang="ts" setup>
import { useRoute } from "#vue-router";
import { Card, Fieldset } from "primevue";
import { useIntervalFn } from "@vueuse/core";
import { getAnalysisLogs } from "~/composables/useAPIFetch";
import RefreshSwitch from "~/components/analysis/logs/RefreshSwitch.vue";
import AnalysisLogCardContent from "~/components/analysis/logs/AnalysisLogCardContent.vue";
import { useNuxtApp } from "nuxt/app";
import type { LogResponse } from "~/services/Api";

interface logEntry {
  podId: string;
  analysis: string | undefined;
  nginx: string | undefined;
}

const route = useRoute();
const analysisId = route.params.id as string;
const currentLogs = ref([] as logEntry[]);
const prevLogs = ref([] as logEntry[]);

const {
  data: response,
  refresh,
  status,
  error,
} = await getAnalysisLogs(analysisId);

gatherCurrentLogs();
await gatherPreviousLogs();

function parseLogs(logResp: LogResponse | null): logEntry[] {
  const analysisLogs = logResp?.analysis;
  const nginxLogs = logResp?.nginx;
  let compiledLogs: logEntry[] = [];
  if (analysisLogs) {
    const analysisPodIds = Object.keys(analysisLogs);
    analysisPodIds.forEach((analysisPodId: string) => {
      const newLogEntry: logEntry = {
        podId: analysisPodId,
        analysis: analysisLogs[analysisPodId][0] ?? undefined,
        nginx: nginxLogs![analysisPodId][0] ?? undefined,
      };
      compiledLogs.push(newLogEntry);
    });
  }
  return compiledLogs;
}

function gatherCurrentLogs() {
  if (status.value === "success") {
    currentLogs.value = parseLogs(response.value as LogResponse);
  } else if (status.value === "error" && error.value?.statusCode === 403) {
    navigateTo("/error/403");
  }
}

// Previous logs
async function gatherPreviousLogs() {
  const prevLogResp: LogResponse = (await useNuxtApp()
    .$hubApi(`/po/history/${analysisId}`, {
      method: "GET",
    })
    .catch(() => null)) as LogResponse;

  if (prevLogResp) {
    prevLogs.value = parseLogs(prevLogResp);
  }
}

const { pause, resume, isActive } = useIntervalFn(
  () => {
    refreshLogs();
  },
  5000,
  { immediate: currentLogs.value.length > 0 },
);

async function refreshLogs() {
  await refresh();
  gatherCurrentLogs();
}

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
          :disabled="!currentLogs.length"
          :startEnabled="currentLogs.length > 0"
          @change="onRefreshToggle"
        />
      </div>
    </template>
    <template #content>
      <div class="log-container current-logs-card">
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
      <div class="log-container previous-logs-collection-card">
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
