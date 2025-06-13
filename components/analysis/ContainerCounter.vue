<script setup lang="ts">
import { countAnalysisContainers } from "~/utils/count-analyses";
import type { ModifiedAnalysisNode } from "~/components/analysis/AnalysesTable.vue";
import { AnalysisNodeRunStatus } from "~/types/analysis";

const props = defineProps({
  analyses: {
    type: Object,
    required: true,
  },
  activeFilters: {
    type: Object,
    required: true,
  },
});

const currentFilters = ref(props.activeFilters.run_status);
const counts = computed(() =>
  countAnalysisContainers(props.analyses as ModifiedAnalysisNode[]),
);

const emit = defineEmits(["applyRunStatusFilter"]);

function onApplyRunStatusFilter(runStatus: string) {
  emit("applyRunStatusFilter", runStatus);
}
</script>

<template>
  <div class="container-counter">
    <Card class="counter-card">
      <template #title>
        <span style="font-size: 1.2rem"> Analysis Overview </span>
      </template>
      <template #content>
        <div class="counter-badge-all">
          <div
            :class="{
              'opaque-badge':
                currentFilters.value &&
                !currentFilters.value.includes(
                  AnalysisNodeRunStatus.Started ||
                    AnalysisNodeRunStatus.Starting,
                ),
            }"
            class="counter-badge"
          >
            <Badge
              size="xlarge"
              class="counter-badge container-counter-started"
              :value="counts.started || 0"
              severity="info"
              @click="onApplyRunStatusFilter(AnalysisNodeRunStatus.Started)"
            />
            <span class="counter-id-txt">Started</span>
          </div>
          <div
            :class="{
              'opaque-badge':
                currentFilters.value &&
                !currentFilters.value.includes(AnalysisNodeRunStatus.Running),
            }"
            class="counter-badge"
          >
            <Badge
              size="xlarge"
              class="counter-badge container-counter-running"
              :value="counts.running || 0"
              severity="contrast"
              @click="onApplyRunStatusFilter(AnalysisNodeRunStatus.Running)"
            />
            <span class="counter-id-txt">Running</span>
          </div>
          <div
            :class="{
              'opaque-badge':
                currentFilters.value &&
                !currentFilters.value.includes(
                  AnalysisNodeRunStatus.Stopped ||
                    AnalysisNodeRunStatus.Stopping,
                ),
            }"
            class="counter-badge"
          >
            <Badge
              size="xlarge"
              class="counter-badge container-counter-stopped"
              :value="counts.stopped || 0"
              severity="warning"
              @click="onApplyRunStatusFilter(AnalysisNodeRunStatus.Stopped)"
            />
            <span class="counter-id-txt">Stopped</span>
          </div>
          <div
            :class="{
              'opaque-badge':
                currentFilters.value &&
                !currentFilters.value.includes(AnalysisNodeRunStatus.Failed),
            }"
            class="counter-badge"
          >
            <Badge
              size="xlarge"
              class="counter-badge container-counter-failed"
              :value="counts.failed || 0"
              severity="danger"
              @click="onApplyRunStatusFilter(AnalysisNodeRunStatus.Failed)"
            />
            <span class="counter-id-txt">Failed</span>
          </div>
          <div
            :class="{
              'opaque-badge':
                currentFilters.value &&
                !currentFilters.value.includes(AnalysisNodeRunStatus.Finished),
            }"
            class="counter-badge"
          >
            <Badge
              size="xlarge"
              class="counter-badge container-counter-finished"
              :value="counts.finished || 0"
              severity="success"
              @click="onApplyRunStatusFilter(AnalysisNodeRunStatus.Finished)"
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
  background: var(--p-select-filled-hover-background);
}

.counter-badge-all {
  display: flex;
  justify-content: space-between;
}

.counter-badge {
  display: flex;
  flex-direction: column;
  align-items: center;
  cursor: pointer;
}

.opaque-badge {
  opacity: 50%;
}

.counter-id-txt {
  font-size: 0.9em;
}
</style>
