<script setup lang="ts">
import {
  AnalysisBuildStatus,
  AnalysisNodeRunStatus,
  type BodyCreateAnalysisPoPost,
} from "~/services/Api";

const props = defineProps({
  analysisBuildStatus: String,
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
  AnalysisNodeRunStatus.Stopping,
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

const buttonStatuses = ref(setButtonStatuses(props.analysisRunStatus));

// TODO: possibly remove when manual pod status checks are removed
watch(props, () => {
  buttonStatuses.value = setButtonStatuses(props.analysisRunStatus);
});

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

async function onStartAnalysis() {
  loading.value = true;
  setButtonStatuses(AnalysisNodeRunStatus.Starting);
  const analysisProps = {} as BodyCreateAnalysisPoPost;
  analysisProps.analysis_id = props.analysisId!;
  analysisProps.project_id = props.projectId!;
  analysisProps.node_id = props.nodeId!;
  const startResp = await useNuxtApp()
    .$hubApi("/po", {
      method: "POST",
      body: analysisProps,
    })
    .catch(() => null); // Set the response to null if an error occurs

  if (startResp) {
    const currentRunStatus = startResp.status;
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

  const stopResp = await useNuxtApp()
    .$hubApi(`/po/${props.analysisId}/stop`, {
      method: "PUT",
    })
    .catch(() => null);

  if (stopResp) {
    const podStatuses = stopResp.status;
    for (const podName in podStatuses) {
      buttonStatuses.value = setButtonStatuses(podStatuses[podName]);
    }
    showSuccess("Stop success", "Successfully stopped the container");
  } else {
    setButtonStatuses(AnalysisNodeRunStatus.Running);
    showFailure("Stop failure", "Failed to stop the analysis container");
  }
  loading.value = false;
}

async function onDeleteAnalysis() {
  loading.value = true;
  setButtonStatuses(AnalysisNodeRunStatus.Stopping);

  const deleteResp = await useNuxtApp()
    .$hubApi(`/po/${props.analysisId}/delete`, {
      method: "DELETE",
    })
    .catch(() => null);

  if (deleteResp) {
    buttonStatuses.value = setButtonStatuses("");
    showSuccess("Delete success", "Successfully removed the container");
  } else {
    showFailure("Delete failure", "Failed to delete the analysis container");
  }
  loading.value = false;
}
</script>

<template>
  <div class="analysis-buttons">
    <Button
      icon="pi pi-play"
      aria-label="Start"
      v-if="buttonStatuses.playActive"
      v-tooltip.top="'Start the analysis'"
      severity="success"
      :disabled="
        !buttonStatuses.playActive ||
        !(props.analysisBuildStatus === AnalysisBuildStatus.Finished)
      "
      :loading="loading"
      @click="onStartAnalysis()"
    />
    <Button
      icon="pi pi-replay"
      aria-label="Rerun"
      v-else
      v-tooltip.top="'Rerun the analysis'"
      severity="success"
      :disabled="
        !buttonStatuses.rerunActive ||
        !(props.analysisBuildStatus === AnalysisBuildStatus.Finished)
      "
      :loading="loading"
      @click="onStartAnalysis()"
    />
    <Button
      icon="pi pi-stop"
      aria-label="Stop"
      v-tooltip.top="'Stop the analysis'"
      severity="warn"
      :disabled="
        !buttonStatuses.stopActive ||
        !(props.analysisBuildStatus === AnalysisBuildStatus.Finished)
      "
      :loading="loading"
      @click="onStopAnalysis()"
    />
    <Button
      icon="pi pi-trash"
      aria-label="Delete"
      v-tooltip.top="'Delete the analysis container'"
      severity="danger"
      :disabled="
        !buttonStatuses.deleteActive ||
        !(props.analysisBuildStatus === AnalysisBuildStatus.Finished)
      "
      :loading="loading"
      @click="onDeleteAnalysis()"
    />
    <NuxtLink
      :to="{ name: 'analyses-id', params: { id: props.analysisId } }"
      target="_blank"
    >
      <Button
        icon="pi pi-bars"
        aria-label="Logs"
        v-tooltip.top="'View the logs'"
        severity="contrast"
        :loading="loading"
        :disabled="!buttonStatuses.deleteActive"
      />
    </NuxtLink>
  </div>
</template>

<style scoped lang="scss"></style>
