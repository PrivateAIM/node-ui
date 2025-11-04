<script lang="ts" setup>
import Badge from "primevue/badge";
import { countAnalysisContainers } from "~/utils/count-analyses";
import type { ModifiedAnalysisNode } from "~/services/modifiedApiInterfaces";
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
  <div class="counter-div">
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
            class="container-counter container-counter-started"
          >
            <Badge
              :value="counts.started || 0"
              class="counter-badge counter-badge-started"
              severity="info"
              size="xlarge"
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
            class="container-counter container-counter-running"
          >
            <Badge
              :value="counts.running || 0"
              class="counter-badge counter-badge-running"
              severity="contrast"
              size="xlarge"
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
            class="container-counter container-counter-stopped"
          >
            <Badge
              :value="counts.stopped || 0"
              class="counter-badge counter-badge-stopped"
              severity="warning"
              size="xlarge"
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
            class="container-counter container-counter-failed"
          >
            <Badge
              :value="counts.failed || 0"
              class="counter-badge counter-badge-failed"
              severity="danger"
              size="xlarge"
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
            class="container-counter container-counter-finished"
          >
            <Badge
              :value="counts.finished || 0"
              class="counter-badge counter-badge-finished"
              severity="success"
              size="xlarge"
              @click="onApplyRunStatusFilter(AnalysisNodeRunStatus.Finished)"
            />
            <span class="counter-id-txt">Finished</span>
          </div>
        </div>
      </template>
    </Card>
  </div>
</template>

<style lang="scss" scoped>
.counter-div {
  display: flex;
  align-content: flex-end;
}

.counter-card {
  width: 30em;
}

.counter-card {
  background: var(--p-content-hover-background);
}

.counter-badge-all {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
}

.container-counter {
  display: inline-flex;
  flex-direction: column;
  align-items: center;
}

.counter-badge {
  cursor: pointer;
  width: 2.6rem;
  height: 2.3rem;
  border-radius: 30%;
}

.opaque-badge {
  opacity: 50%;
}

.counter-id-txt {
  font-size: 0.9em;
  padding-top: 0.3em;
}
</style>
