<script lang="ts" setup>
import Badge from "primevue/badge";
import { countAnalysisContainers } from "~/utils/count-analyses";
import type { ModifiedAnalysisNode } from "~/services/modifiedApiInterfaces";
import { PodStatus } from "~/services/Api";

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

const currentFilters = ref(props.activeFilters.execution_status);
const counts = computed(() =>
  countAnalysisContainers(props.analyses as ModifiedAnalysisNode[]),
);

const emit = defineEmits(["applyExecutionStatusFilter"]);

function onApplyExecutionStatusFilter(executionStatus: PodStatus) {
  emit("applyExecutionStatusFilter", executionStatus);
}
</script>

<template>
  <div class="counter-div">
    <Card class="counter-card">
      <template #title>
        <span class="counter-card-title">Analysis Overview</span>
      </template>
      <template #content>
        <div class="counter-badge-all">
          <div
            :class="{
              'opaque-badge':
                currentFilters.value &&
                !currentFilters.value.includes(
                  PodStatus.Started || PodStatus.Starting,
                ),
            }"
            class="container-counter container-counter-started"
          >
            <Badge
              :value="counts.started || 0"
              class="counter-badge counter-badge-started"
              severity="info"
              size="xlarge"
              @click="onApplyExecutionStatusFilter(PodStatus.Started)"
            />
            <span class="counter-id-txt">Started</span>
          </div>
          <div
            :class="{
              'opaque-badge':
                currentFilters.value &&
                !currentFilters.value.includes(PodStatus.Executing),
            }"
            class="container-counter container-counter-executing"
          >
            <Badge
              :value="counts.executing || 0"
              class="counter-badge counter-badge-executing"
              severity="contrast"
              size="xlarge"
              @click="onApplyExecutionStatusFilter(PodStatus.Executing)"
            />
            <span class="counter-id-txt">Executing</span>
          </div>
          <div
            :class="{
              'opaque-badge':
                currentFilters.value &&
                !currentFilters.value.includes(
                  PodStatus.Stopped || PodStatus.Stopping,
                ),
            }"
            class="container-counter container-counter-stopped"
          >
            <Badge
              :value="counts.stopped || 0"
              class="counter-badge counter-badge-stopped"
              severity="warning"
              size="xlarge"
              @click="onApplyExecutionStatusFilter(PodStatus.Stopped)"
            />
            <span class="counter-id-txt">Stopped</span>
          </div>
          <div
            :class="{
              'opaque-badge':
                currentFilters.value &&
                !currentFilters.value.includes(PodStatus.Failed),
            }"
            class="container-counter container-counter-failed"
          >
            <Badge
              :value="counts.failed || 0"
              class="counter-badge counter-badge-failed"
              severity="danger"
              size="xlarge"
              @click="onApplyExecutionStatusFilter(PodStatus.Failed)"
            />
            <span class="counter-id-txt">Failed</span>
          </div>
          <div
            :class="{
              'opaque-badge':
                currentFilters.value &&
                !currentFilters.value.includes(PodStatus.Executed),
            }"
            class="container-counter container-counter-executed"
          >
            <Badge
              :value="counts.executed || 0"
              class="counter-badge counter-badge-executed"
              severity="success"
              size="xlarge"
              @click="onApplyExecutionStatusFilter(PodStatus.Executed)"
            />
            <span class="counter-id-txt">Executed</span>
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
  background: var(--p-menubar-background);
  min-width: 24rem;
}

.counter-card-title {
  font-size: 1.125rem;
  font-weight: 600;
  letter-spacing: -0.01em;
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
  font-size: 0.8125rem;
  padding-top: 0.375rem;
}
</style>
