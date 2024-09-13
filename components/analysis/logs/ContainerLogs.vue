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
const analysisLogs = ref("");
const nginxLogs = ref("");
const prevLogs = ref();

const {
  data: response,
  refresh,
  status,
  error,
} = await getAnalysisLogs(analysisId);

function parseData() {
  if (status.value === "success") {
    const logData = response.value as logResponse;
    analysisLogs.value =
      logData.analysis["e6c508dc-8351-40ff-8b06-1def683c992a"];
    nginxLogs.value = logData.nginx["e6c508dc-8351-40ff-8b06-1def683c992a"];
  } else if (error.value?.statusCode === 500) {
    showHubAdapterConnectionErrorToast();
  }
}

parseData();

const { pause, resume, isActive } = useIntervalFn(
  () => {
    refreshLogs();
  },
  5000,
  { immediate: false },
);

async function refreshLogs() {
  await refresh();
  parseData();
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
  const prevAnalyses = prevLogResp.analysis as Map<string, string>;
  if (prevAnalyses) {
    const prevAnalysisIds = Object.keys(prevAnalyses);
    let compiledPrevLogs = {};
    prevAnalysisIds.forEach((prevAnalysisId: string) => {
      compiledPrevLogs[prevAnalysisId] = {
        analysis: prevLogResp.analysis[prevAnalysisId],
        nginx: prevLogResp.nginx[prevAnalysisId],
      };
    });
    prevLogs.value = compiledPrevLogs;
  }
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
          <AnalysisLogCardContent
            :analysisLogs="analysisLogs"
            :nginxLogs="nginxLogs"
          />
        </Fieldset>
      </div>
      <div class="previous-logs-collection-card">
        <Fieldset legend="Previous Runs" :toggleable="true">
          <div
            class="previous-logs-card"
            v-if="prevLogs && Object.keys(prevLogs).length > 0"
          >
            <Fieldset
              v-for="(log, key) in prevLogs"
              :key="key"
              :toggleable="true"
              :legend="key"
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
