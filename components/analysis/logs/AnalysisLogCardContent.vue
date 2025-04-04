<script setup lang="ts">
import { Card, ScrollPanel } from "primevue";
const props = defineProps({
  nginxLogs: String || null,
  analysisLogs: String || null,
});
</script>

<template>
  <div class="card analysis-logs">
    <Card class="log-card nginx-log-card">
      <template #title>
        <div class="log-header-row">Nginx Logs</div>
      </template>
      <template #content>
        <div class="card foo-card">
          <ScrollPanel class="log-scroll-panel">
            <span v-if="props.nginxLogs">
              {{ props.nginxLogs }}
            </span>
            <span v-else>No logs found...</span>
          </ScrollPanel>
        </div>
      </template>
    </Card>
    <Card class="log-card analysis-log-card">
      <template #title>
        <div class="log-header-row">Container Logs</div>
      </template>
      <template #content>
        <ScrollPanel class="log-scroll-panel">
          <span v-if="props.analysisLogs">
            {{ props.analysisLogs }}
          </span>
          <span v-else>No logs found...</span>
        </ScrollPanel>
      </template>
    </Card>
  </div>
</template>

<style lang="scss">
.analysis-logs {
  display: flex;
  justify-content: space-between;
}

.log-card {
  border: 1px solid grey;
  height: 50%;
  background: var(--p-slate-800);
}

.nginx-log-card {
  margin-right: 1em;
  width: 50%;
}

.analysis-log-card {
  width: 50%;
}

.log-scroll-panel {
  background: #000;
  font-family:
    Roboto Mono Regular,
    monospace;
  font-size: 0.8em;
  height: 30em;
  padding: 1em;
  white-space: pre-wrap;
}

.log-header-row {
  //background: #2a3749;
  background: var(--p-highlight-background);
  padding: 0.5em;
  border-radius: 6px;
}

.analysis-logs .p-card-body {
  padding: 0;
}
</style>
