<script setup lang="ts">
import { useIntervalFn } from "@vueuse/core";
import { getAnalysisLogs } from "~/composables/useAPIFetch";
import { showHubAdapterConnectionErrorToast } from "~/composables/connectionErrorToast";
import RefreshSwitch from "~/components/analysis/logs/RefreshSwitch.vue";

interface logResponse {
  analysis: Map<string, string>;
  nginx: Map<string, string>;
}

const route = useRoute();
const analysisId = route.params.id;
const analysisLogs = ref("");
const nginxLogs = ref("");

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
  console.log(isActive.value);
}
</script>

<template>
  <Card class="contentCard">
    <template #title>Analysis</template>
    <template #subtitle>{{ analysisId }}</template>
    <template #content>
      <div class="card analysis-logs">
        <Card class="analysis-data-card">
          <template #title>Metadata</template>
          <template #content>Hi</template>
        </Card>
        <Card class="analysis-log-card">
          <template #title>
            <div class="table-header-row">
              Logs
              <RefreshSwitch @change="onRefreshToggle" />
            </div>
          </template>

          <template #content>
            <ScrollPanel class="log-scroll-panel">
              {{ analysisLogs }}
            </ScrollPanel>
          </template>
        </Card>
      </div>
    </template>
  </Card>
</template>

<style scoped lang="scss"></style>
