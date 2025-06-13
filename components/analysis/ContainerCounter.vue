<script setup lang="ts">
import { countAnalysisContainers } from "~/utils/count-analyses";
import type { ModifiedAnalysisNode } from "~/components/analysis/AnalysesTable.vue";

const props = defineProps({
  analyses: {
    type: Object,
    required: true,
  },
});

const counts = computed(() =>
  countAnalysisContainers(props.analyses as ModifiedAnalysisNode[]),
);
</script>

<template>
  <div class="container-counter">
    <Card class="counter-card">
      <template #title>
        <span style="font-size: 1.2rem"> Analysis Overview </span>
      </template>
      <template #content>
        <div class="counter-badge-all">
          <div class="counter-badge">
            <Badge
              size="xlarge"
              class="counter-badge container-counter-started"
              :value="counts.started || 0"
              severity="info"
            />
            <span class="counter-id-txt">Started</span>
          </div>
          <div class="counter-badge">
            <Badge
              size="xlarge"
              class="counter-badge container-counter-running"
              :value="counts.running || 0"
              severity="contrast"
            />
            <span class="counter-id-txt">Running</span>
          </div>
          <div class="counter-badge">
            <Badge
              size="xlarge"
              class="counter-badge container-counter-stopped"
              :value="counts.stopped || 0"
              severity="warning"
            />
            <span class="counter-id-txt">Stopped</span>
          </div>
          <div class="counter-badge">
            <Badge
              size="xlarge"
              class="counter-badge container-counter-failed"
              :value="counts.failed || 0"
              severity="danger"
            />
            <span class="counter-id-txt">Failed</span>
          </div>
          <div class="counter-badge">
            <Badge
              size="xlarge"
              class="counter-badge container-counter-finished"
              :value="counts.finished || 0"
              severity="success"
            />
            <span class="counter-id-txt">Finished</span>
          </div>
        </div>
      </template>
    </Card>
  </div>
</template>

<style scoped lang="scss">
.container-counter {
  width: 65%;
}

.counter-card {
  background: #006600;
}

.counter-badge-all {
  display: flex;
  justify-content: space-between;
}

.counter-badge {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.counter-id-txt {
  font-size: 0.9em;
}
</style>
