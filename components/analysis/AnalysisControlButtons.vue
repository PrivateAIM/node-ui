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

const showFailStart = () => {
  toast.add({
    severity: "error",
    summary: "Start failure",
    detail: "Failed to start the analysis",
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
  } else {
    showFailStart();
  }
}

async function onStopAnalysis() {
  const { data: response } = await stopAnalysis(props.analysisId!);
  const podStatuses = response.value!.status;
  for (const podName in podStatuses) {
    setButtonStatuses(podStatuses[podName]);
  }
}

async function onDeleteAnalysis() {
  const { data: response } = await deleteAnalysis(props.analysisId!);
  const podStatuses = response.value!.status;
  for (const podName in podStatuses) {
    const pp = podStatuses[podName];
    console.log(pp);
    setButtonStatuses(pp);
  }
  console.log(buttonStatuses);
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
