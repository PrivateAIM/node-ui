<script setup lang="ts">
const props = defineProps({
  nginxLogs: String,
  analysisLogs: String,
});
</script>

<template>
  <div class="card analysis-logs">
    <Card class="log-card nginx-log-card">
      <template #title>
        <div class="table-header-row log-header-row">Nginx</div>
      </template>
      <template #content>
        <ScrollPanel class="log-scroll-panel">
          {{ props.nginxLogs }}
        </ScrollPanel>
      </template>
    </Card>
    <Card class="log-card analysis-log-card">
      <template #title>
        <div class="table-header-row log-header-row">Logs</div>
      </template>
      <template #content>
        <ScrollPanel class="log-scroll-panel">
          {{ props.analysisLogs }}
        </ScrollPanel>
      </template>
    </Card>
  </div>
</template>

<style scoped lang="scss"></style>
