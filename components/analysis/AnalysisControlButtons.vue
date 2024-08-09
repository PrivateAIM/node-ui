<script setup lang="ts">
import type { BodyCreateAnalysisPoPost } from "~/services/Api";
import {
  deleteAnalysis,
  startAnalysis,
  stopAnalysis,
} from "~/composables/useAPIFetch";

const props = defineProps({
  analysisStatus: String,
  analysisId: String,
  projectId: String,
  nodeId: String,
});
const toast = useToast();

const playButtonActiveStates = [null, "stopped", "stopping"];
const rerunButtonActiveStates = ["failed", "finished"];
const stopButtonActiveStates = ["running", "starting", "started"];
const deleteButtonActiveStates = [
  "failed",
  "finished",
  "stopping",
  "stopped",
  "running",
  "starting",
  "started",
];

const buttonStatuses = ref(setButtonStatuses(props.analysisStatus!));

function setButtonStatuses(podStatus: string) {
  return {
    playActive: playButtonActiveStates.includes(podStatus),
    rerunActive: rerunButtonActiveStates.includes(podStatus),
    stopActive: stopButtonActiveStates.includes(podStatus),
    deleteActive: deleteButtonActiveStates.includes(podStatus),
  };
}

const showFailure = (summary: string, msg: string) => {
  toast.add({
    severity: "error",
    summary: summary,
    detail: msg,
    life: 3000,
  });
};

const showSuccess = (summary: string, msg: string) => {
  toast.add({
    severity: "info",
    summary: summary,
    detail: msg,
    life: 3000,
  });
};

async function onStartAnalysis() {
  const analysisProps = {} as BodyCreateAnalysisPoPost;
  analysisProps.analysis_id = props.analysisId!;
  analysisProps.project_id = props.projectId!;
  analysisProps.node_id = props.nodeId!;
  const { data: response, status } = await startAnalysis(analysisProps);
  if (status.value === "success") {
    const currentRunStatus = response.value!.status;
    buttonStatuses.value = setButtonStatuses(currentRunStatus);
    showSuccess("Start success", "Successfully started the container");
  } else {
    showFailure("Start failure", "Failed to start the analysis");
  }
}

async function onStopAnalysis() {
  const { data: response, status } = await stopAnalysis(props.analysisId!);
  const podStatuses = response.value!.status;
  if (status.value === "success") {
    for (const podName in podStatuses) {
      buttonStatuses.value = setButtonStatuses(podStatuses[podName]);
      showSuccess("Stop success", "Successfully stopped the container");
    }
  } else {
    showFailure("Stop failure", "Failed to stop the analysis container");
  }
}

async function onDeleteAnalysis() {
  const { data: response, status } = await deleteAnalysis(props.analysisId!);
  const podStatuses = response.value!.status;
  if (status.value === "success") {
    for (const podName in podStatuses) {
      const pp = podStatuses[podName];
      buttonStatuses.value = setButtonStatuses(pp);
      showSuccess("Delete success", "Successfully removed the container");
    }
  } else {
    showFailure("Delete failure", "Failed to delete the analysis container");
  }
}
</script>

<template>
  <div class="analysisButtons">
    <Button
      icon="pi pi-play"
      aria-label="Start"
      v-if="buttonStatuses.rerunActive"
      v-tooltip="'Start the analysis'"
      severity="success"
      style="margin-right: 10px"
      :disabled="!buttonStatuses.playActive"
      @click="onStartAnalysis()"
    />
    <Button
      icon="pi pi-play"
      aria-label="Start"
      v-else
      v-tooltip="'Start the analysis'"
      severity="success"
      style="margin-right: 10px"
      :disabled="!buttonStatuses.playActive"
      @click="onStartAnalysis()"
    />
    <Button
      icon="pi pi-stop"
      aria-label="Stop"
      v-tooltip="'Stop the analysis'"
      severity="warn"
      style="margin-right: 10px"
      :disabled="!buttonStatuses.stopActive"
      @click="onStopAnalysis()"
    />
    <Button
      icon="pi pi-trash"
      aria-label="Delete"
      v-tooltip="'Delete the analysis container'"
      severity="danger"
      :disabled="!buttonStatuses.deleteActive"
      @click="onDeleteAnalysis()"
    />
  </div>
</template>

<style scoped lang="scss"></style>
