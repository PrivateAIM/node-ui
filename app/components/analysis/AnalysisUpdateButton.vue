<script setup lang="ts">
import { useNuxtApp } from "nuxt/app";
import { useToast } from "primevue/usetoast";

import { type AnalysisStatus, type PodProgressResponse } from "~/services/Api";
import { FetchError } from "ofetch";

const props = defineProps({
  analysisId: {
    type: String,
    required: true,
  },
});

const emit = defineEmits(["updateAnalysisRunStatus"]);
const loading = ref(false);
const toast = useToast();

async function getStatusUpdateFromPodOrc(): Promise<
  AnalysisStatus | undefined
> {
  let analysisStatus: AnalysisStatus | undefined = undefined;

  try {
    const analysisStatusUpdate: PodProgressResponse =
      await useNuxtApp().$hubApi(`/po/status/${props.analysisId}`, {
        method: "GET",
      });

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
  } catch (err) {
    const fetchError = err as FetchError;
    if (fetchError.status === 403) {
      return undefined; // Exit early on 403 to not overdo toasts
    }
    toast.add({
      severity: "error",
      summary: "Unable to get a status update",
      detail:
        "An error occurred while trying to contact the PO for a status update. Try again later.",
      life: 5000,
    });
  }

  return analysisStatus;
}

async function onClickUpdate() {
  loading.value = true;
  const updatedStatus: AnalysisStatus | undefined =
    await getStatusUpdateFromPodOrc();
  if (updatedStatus) {
    emit(
      "updateAnalysisRunStatus",
      updatedStatus.status,
      updatedStatus.progress,
    );
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
