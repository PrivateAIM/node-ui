<script setup lang="ts">
import {
  AnalysisNodeRunStatus,
  type BodyCreateAnalysisPoPost,
} from "~/services/Api";
import {
  deleteAnalysis,
  startAnalysis,
  stopAnalysis,
} from "~/composables/useAPIFetch";

const props = defineProps({
  analysisRunStatus: String,
  analysisNodeId: String,
  analysisId: String,
  projectId: String,
  nodeId: String,
});

const emit = defineEmits(["newRunStatus"]);
const toast = useToast();
const loading = ref(false);

const playButtonActiveStates = [null, ""];
const rerunButtonActiveStates = [
  AnalysisNodeRunStatus.Failed,
  AnalysisNodeRunStatus.Finished,
  AnalysisNodeRunStatus.Stopped,
  AnalysisNodeRunStatus.Stopping,
];
const stopButtonActiveStates = [
  AnalysisNodeRunStatus.Running,
  AnalysisNodeRunStatus.Starting,
  AnalysisNodeRunStatus.Started,
];
const deleteButtonActiveStates = [
  AnalysisNodeRunStatus.Failed,
  AnalysisNodeRunStatus.Finished,
  AnalysisNodeRunStatus.Stopped,
  AnalysisNodeRunStatus.Stopping,
  AnalysisNodeRunStatus.Running,
  AnalysisNodeRunStatus.Starting,
  AnalysisNodeRunStatus.Started,
];

const buttonStatuses = ref(setButtonStatuses(props.analysisRunStatus!));

function setButtonStatuses(podStatus: string) {
  emit("newRunStatus", props.analysisNodeId, podStatus);
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

// async function updateHubAnalysisRunStatus(update: string) {
//   await updateAnalysis(props.analysisId!, { run_status: update });
// }

async function onStartAnalysis() {
  loading.value = true;
  setButtonStatuses(AnalysisNodeRunStatus.Starting);
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
    setButtonStatuses(AnalysisNodeRunStatus.Failed);
    showFailure("Start failure", "Failed to start the analysis");
  }
  loading.value = false;
}

async function onStopAnalysis() {
  loading.value = true;
  setButtonStatuses(AnalysisNodeRunStatus.Stopping);
  const { data: response, status } = await stopAnalysis(props.analysisId!);
  const podStatuses = response.value!.status;
  if (status.value === "success") {
    for (const podName in podStatuses) {
      buttonStatuses.value = setButtonStatuses(podStatuses[podName]);
      showSuccess("Stop success", "Successfully stopped the container");
    }
  } else {
    setButtonStatuses(AnalysisNodeRunStatus.Running);
    showFailure("Stop failure", "Failed to stop the analysis container");
  }
  loading.value = false;
}

async function onDeleteAnalysis() {
  loading.value = true;
  setButtonStatuses(AnalysisNodeRunStatus.Stopping);
  const { status } = await deleteAnalysis(props.analysisId!);
  if (status.value === "success") {
    buttonStatuses.value = setButtonStatuses("");
    showSuccess("Delete success", "Successfully removed the container");
  } else {
    showFailure("Delete failure", "Failed to delete the analysis container");
  }
  loading.value = false;
}
</script>

<template>
  <div class="analysisButtons">
    <Button
      icon="pi pi-play"
      aria-label="Start"
      v-if="buttonStatuses.playActive"
      v-tooltip.top="'Start the analysis'"
      severity="success"
      style="margin-right: 10px"
      :disabled="!buttonStatuses.playActive"
      :loading="loading"
      @click="onStartAnalysis()"
    />
    <Button
      icon="pi pi-replay"
      aria-label="Rerun"
      v-else
      v-tooltip.top="'Rerun the analysis'"
      severity="success"
      style="margin-right: 10px"
      :disabled="!buttonStatuses.rerunActive"
      :loading="loading"
      @click="onStartAnalysis()"
    />
    <Button
      icon="pi pi-stop"
      aria-label="Stop"
      v-tooltip.top="'Stop the analysis'"
      severity="warn"
      style="margin-right: 10px"
      :disabled="!buttonStatuses.stopActive"
      :loading="loading"
      @click="onStopAnalysis()"
    />
    <Button
      icon="pi pi-trash"
      aria-label="Delete"
      v-tooltip.top="'Delete the analysis container'"
      severity="danger"
      :disabled="!buttonStatuses.deleteActive"
      :loading="loading"
      @click="onDeleteAnalysis()"
    />
  </div>
</template>

<style scoped lang="scss"></style>
