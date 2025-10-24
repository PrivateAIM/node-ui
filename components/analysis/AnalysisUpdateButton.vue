<script setup lang="ts">
import { useNuxtApp } from "#app";
import { useToast } from "primevue/usetoast";

import { PodStatus, type StatusResponse } from "~/services/Api";
import type { ModifiedAnalysisNode } from "~/services/modifiedApiInterfaces";

const props = defineProps({
  analysisNodeId: {
    type: String,
    required: true,
  },
  analysisId: {
    type: String,
    required: true,
  },
});

const emit = defineEmits(["updateAnalysisRun"]);
const loading = ref(false);
const toast = useToast();

async function getProgressUpdateFromHub(): Promise<number | null> {
  const analysisNode = (await useNuxtApp()
    .$hubApi(`/analysis-nodes/${props.analysisNodeId}`, {
      method: "GET",
    })
    .catch(() => {
      toast.add({
        severity: "warn",
        summary: "Unable to get a progress update from the Hub",
        detail:
          "An error occurred while trying to contact the Hub for a status update. Try again later.",
        life: 5000,
      });
    })) as ModifiedAnalysisNode;
  return analysisNode.progress ? analysisNode.progress : null;
}

async function getStatusUpdateFromPodOrc(): Promise<PodStatus | null> {
  let analysisStatus: PodStatus | null = null;
  const analysisStatusUpdate: StatusResponse = (await useNuxtApp()
    .$hubApi(`/po/status/${props.analysisId}`, {
      method: "GET",
    })
    .catch(() => {
      toast.add({
        severity: "error",
        summary: "Unable to get a status update",
        detail:
          "An error occurred while trying to contact the PO for a status update. Try again later.",
        life: 5000,
      });
    })) as StatusResponse;
  if (analysisStatusUpdate && props.analysisId in analysisStatusUpdate) {
    analysisStatus = analysisStatusUpdate[props.analysisId];
    toast.add({
      severity: "info",
      summary: "Analysis status successfully update",
      detail:
        "The current status of the analysis container was successfully updated.",
      life: 5000,
    });
  } else {
    toast.add({
      severity: "warn",
      summary: "No analysis pod found",
      detail:
        "There are no running pods for this analysis on this node, " +
        "the run status shown is the last reported update to the hub.",
      life: 8000,
    });
  }
  return analysisStatus;
}

async function onClickUpdate() {
  loading.value = true;
  const updatedStatus = await getStatusUpdateFromPodOrc();
  if (updatedStatus) {
    const progressUpdate = await getProgressUpdateFromHub();
    emit("updateAnalysisRun", updatedStatus, progressUpdate);
  }

  loading.value = false;
}
</script>

<template>
  <div class="update-analysis-btn-container">
    <Button
      icon="pi pi-sync"
      aria-label="Update"
      class="update-analysis-btn"
      v-tooltip.top="'Update the status of the analysis'"
      severity="info"
      :loading="loading"
      @click="onClickUpdate()"
    />
  </div>
</template>

<style scoped lang="scss"></style>
