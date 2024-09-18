<script setup lang="ts">
const props = defineProps({
  nginxLogs: String || null,
  analysisLogs: String || null,
});
</script>

<template>
  <div class="card analysis-logs">
    <Card class="log-card nginx-log-card">
      <template #title>
        <div class="table-header-row log-header-row">Nginx Logs</div>
      </template>
      <template #content>
        <ScrollPanel class="log-scroll-panel">
          <span v-if="props.nginxLogs">
            {{ props.nginxLogs }}
          </span>
          <span v-else>No logs found...</span>
        </ScrollPanel>
      </template>
    </Card>
    <Card class="log-card analysis-log-card">
      <template #title>
        <div class="table-header-row log-header-row">Container Logs</div>
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

<style scoped lang="scss"></style>
