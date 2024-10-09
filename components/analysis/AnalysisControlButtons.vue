<script setup lang="ts">
import {
  AnalysisBuildStatus,
  AnalysisNodeRunStatus,
  AnalysisRunStatus,
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

const emit = defineEmits(["newRunStatus", "missingDataStore"]);
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

const buttonStatuses = ref(setButtonStatuses(props.analysisRunStatus, false));

// TODO: remove when manual pod status checks are implemented by the PodOrc
const runStatus = ref(props.analysisRunStatus);
if (
  props.analysisBuildStatus === AnalysisBuildStatus.Finished &&
  !runStatus.value
) {
  useNuxtApp()
    .$hubApi(`/po/${props.analysisId}/pods`, {
      lazy: true,
      method: "GET",
    })
    .then((prevLogResp) => {
      if (prevLogResp.pods.length > 0) {
        runStatus.value = AnalysisRunStatus.Running;
        buttonStatuses.value = setButtonStatuses(AnalysisRunStatus.Running);
      }
    })
    .catch((error) => console.warn(error));
}

function setButtonStatuses(podStatus: string, updateTable: boolean = true) {
  if (updateTable) {
    emit("newRunStatus", props.analysisNodeId, podStatus);
  }

  return {
    playActive: playButtonActiveStates.includes(podStatus),
    rerunActive: rerunButtonActiveStates.includes(podStatus),
    stopActive: stopButtonActiveStates.includes(podStatus),
    deleteActive: deleteButtonActiveStates.includes(podStatus),
  };
}

const showToast = (severity: string, summary: string, msg: string) => {
  toast.add({
    severity: severity,
    summary: summary,
    detail: msg,
    life: 5000,
  });
};

async function onStartAnalysis() {
  loading.value = true;
  setButtonStatuses(AnalysisNodeRunStatus.Starting);
  const analysisProps = {} as BodyCreateAnalysisPoPost;
  analysisProps.analysis_id = props.analysisId!;
  analysisProps.project_id = props.projectId!;
  analysisProps.node_id = props.nodeId!;

  // Bind data to Analysis via Kong
  let bindDataStoreResp = null;
  try {
    bindDataStoreResp = await useNuxtApp().$hubApi("/kong/analysis", {
      method: "POST",
      body: {
        project_id: props.projectId!,
        analysis_id: props.analysisId!,
      },
    });
  } catch (error) {
    // Catch 409 and let proceed
    if (error.status === 409) {
      showToast(
        "warn",
        "Duplicate entry error",
        "A data store is already mapped to this analysis and will be reused",
      );
      bindDataStoreResp = "duplicate";
    } else {
      // If not 409, show error and quit process
      if (error.status === 404) {
        emit("missingDataStore");
      } else {
        showToast(
          "error",
          "Data mapping failed",
          "Unable to map a data store to this analysis due to a technical error.",
        );
      }
      loading.value = false;
      setButtonStatuses(null);
      return;
    }
  }

  // Start Pod
  if (bindDataStoreResp) {
    // Only start the pod if a data store is ready for the analysis
    const startPodResp = await useNuxtApp()
      .$hubApi("/po", {
        method: "POST",
        body: analysisProps,
      })
      .catch(() => null); // Set the response to null if an error occurs

    if (startPodResp) {
      const currentRunStatus = startPodResp.status;
      buttonStatuses.value = setButtonStatuses(currentRunStatus);
      showToast("info", "Start success", "Successfully started the container");
    } else {
      setButtonStatuses(AnalysisNodeRunStatus.Failed);
      showToast("error", "Start failure", "Failed to start the analysis");
    }
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
    showToast("info", "Stop success", "Successfully stopped the container");
  } else {
    setButtonStatuses(AnalysisNodeRunStatus.Running);
    showToast("error", "Stop failure", "Failed to stop the analysis container");
  }
  loading.value = false;
}

async function onDeleteAnalysis() {
  loading.value = true;
  setButtonStatuses(AnalysisNodeRunStatus.Stopping);

  await useNuxtApp()
    .$hubApi(`/kong/analysis/${props.analysisId}`, {
      method: "DELETE",
    })
    .catch(() => {
      showToast(
        "warn",
        "Disconnect failure",
        "Unable to disconnect the data store from the analysis",
      );
    });

  const deleteResp = await useNuxtApp()
    .$hubApi(`/po/${props.analysisId}/delete`, {
      method: "DELETE",
    })
    .catch(() => null);

  if (deleteResp) {
    buttonStatuses.value = setButtonStatuses("");
    showToast("info", "Delete success", "Successfully removed the container");
  } else {
    showToast(
      "error",
      "Delete failure",
      "Failed to delete the analysis container",
    );
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
