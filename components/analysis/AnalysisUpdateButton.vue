<script setup lang="ts">
import { useNuxtApp } from "#app";
import { useToast } from "primevue/usetoast";

const props = defineProps({
  analysisId: String
});

type PoStatusResp = { status: object } | null;

const emit = defineEmits(["updatedRunStatus"]);
const loading = ref(false);
const toast = useToast();

async function onClickUpdate() {
  loading.value = true;
  const poUpdate: PoStatusResp = (await useNuxtApp()
    .$hubApi(`/po/${props.analysisId}/status`, {
      method: "GET"
    })
    .catch(() => {
      toast.add({
        severity: "error",
        summary: "Unable to get a status update",
        detail:
          "An error occurred while trying to contact the PO for a status update. Try again later.",
        life: 5000
      });
    })) as PoStatusResp;
  if (poUpdate) {
    const poStatuses = poUpdate.status;
    if (Object.keys(poStatuses).length) {
      // Resp either returns { status: {} } or status is filled
      toast.add({
        severity: "info",
        summary: "Analysis status successfully update",
        detail:
          "The current status of the analysis container was successfully updated.",
        life: 5000
      });
      emit(
        "updatedRunStatus",
        Object.values(poStatuses)[0]
      ); // Return first status
    } else {
      toast.add({
        severity: "info",
        summary: "No analysis pod found",
        detail: "There are no running pods for this analysis on this node.",
        life: 5000
      });
      emit("updatedRunStatus", null);
    }
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
