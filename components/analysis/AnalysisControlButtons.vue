<script setup lang="ts">
import {
  AnalysisBuildStatus,
  AnalysisNodeRunStatus,
  type BodyCreateAnalysisPoPost,
  type LinkProjectAnalysis
} from "~/services/Api";
import AnalysisUpdateButton from "./AnalysisUpdateButton.vue";
import { useToast } from "primevue/usetoast";
import { useNuxtApp } from "#app";

type ToastSeverity = "success" | "info" | "warn" | "error" | undefined;
type POResp = { status?: string | string[] | object; detail?: string } | null;

interface ButtonStates {
  playActive: boolean;
  rerunActive: boolean;
  stopActive: boolean;
  deleteActive: boolean;
}

const props = defineProps({
  analysisBuildStatus: [String, null],
  analysisRunStatus: {
    type: [String, null],
    required: true
  },
  analysisNodeId: String,
  analysisId: String,
  projectId: String,
  nodeId: String
});

const emit = defineEmits(["newRunStatus", "missingDataStore"]);
const toast = useToast();
const loading = ref(false);

const playButtonActiveStates = [null, ""];
const rerunButtonActiveStates: Array<string | null> = [
  AnalysisNodeRunStatus.Failed,
  AnalysisNodeRunStatus.Finished,
  AnalysisNodeRunStatus.Stopped,
  AnalysisNodeRunStatus.Stopping
];
const stopButtonActiveStates: Array<string | null> = [
  AnalysisNodeRunStatus.Running,
  AnalysisNodeRunStatus.Starting,
  AnalysisNodeRunStatus.Started,
  AnalysisNodeRunStatus.Stopping
];
const deleteButtonActiveStates: Array<string | null> = [
  AnalysisNodeRunStatus.Failed,
  AnalysisNodeRunStatus.Finished,
  AnalysisNodeRunStatus.Stopped,
  AnalysisNodeRunStatus.Stopping,
  AnalysisNodeRunStatus.Running,
  AnalysisNodeRunStatus.Starting,
  AnalysisNodeRunStatus.Started
];

const buttonStatuses = ref<ButtonStates>(
  setButtonStatuses(props.analysisRunStatus, false)
);

function setButtonStatuses(
  podStatus: string | null,
  updateTable: boolean = true
) {
  if (updateTable) {
    emit("newRunStatus", props.analysisNodeId, podStatus);
  }

  return {
    playActive: playButtonActiveStates.includes(podStatus),
    rerunActive: rerunButtonActiveStates.includes(podStatus),
    stopActive: stopButtonActiveStates.includes(podStatus),
    deleteActive: deleteButtonActiveStates.includes(podStatus)
  };
}

const showToast = (severity: ToastSeverity, summary: string, msg: string) => {
  toast.add({
    severity: severity,
    summary: summary,
    detail: msg,
    life: 5000
  });
};

async function registerAnalysis(
  attempt: number = 0,
  maxAttempts: number = 10
): Promise<LinkProjectAnalysis | null> {
  let bindDataStoreResp: LinkProjectAnalysis | null = null;
  try {
    bindDataStoreResp = await useNuxtApp().$hubApi("/kong/analysis", {
      method: "POST",
      body: {
        project_id: props.projectId!,
        analysis_id: props.analysisId!
      }
    });
  } catch (error) {
    // Catch 409 and let proceed
    if (error.status === 409) {
      showToast(
        "warn",
        "Duplicate entry error",
        "A data store is already mapped to this analysis and will be removed"
      );
      const podRunning = await checkPodStatus(); // Check to see if the analysis pod already exists
      if (!podRunning) {
        await useNuxtApp()
          .$hubApi(`/kong/analysis/${props.analysisId}`, {
            method: "DELETE"
          })
          .catch(() => {
            showToast(
              "error",
              "Disconnect failure",
              "Unable to delete the consumer"
            );
          });
        attempt++;
        if (attempt < maxAttempts) {
          return await registerAnalysis(attempt);
        }
      }
    } else {
      // If not 409, show error and quit the process
      if (error.status === 404) {
        emit("missingDataStore");
      } else {
        showToast(
          "error",
          "Data mapping failed",
          "Unable to map a data store to this analysis due to a technical error."
        );
      }
      loading.value = false;
      setButtonStatuses(null);
    }
  }
  return bindDataStoreResp;
}

async function checkPodStatus(): Promise<boolean> {
  const podStatus: POResp = (await useNuxtApp()
    .$hubApi(`/po/${props.analysisId}/status`, {
      method: "GET"
    })
    .catch(() => null)) as POResp; // Set the response to null if an error occurs

  // If response is not null AND "status" in response AND "status" is not empty
  if (podStatus && podStatus.status && Object.values(podStatus.status).length) {
    // If the status is not empty
    showToast(
      "warn",
      "Analysis already running",
      "The analysis is already running on this node. Controls will be updated"
    );
    setButtonStatuses(Object.values(podStatus.status)[0]); // Grab the first status update
    return true;
  }
  return false;
}

async function onStartAnalysis() {
  loading.value = true;
  setButtonStatuses(AnalysisNodeRunStatus.Starting);
  const analysisProps = {} as BodyCreateAnalysisPoPost;
  analysisProps.analysis_id = props.analysisId!;
  analysisProps.project_id = props.projectId!;
  analysisProps.node_id = props.nodeId!;

  // Bind data to Analysis via Kong
  const bindDataStoreResp = await registerAnalysis(); // either null or has kong response

  // Start Pod via the Pod Orchestrator
  if (bindDataStoreResp) {
    // Only start the pod if a data store is ready for the analysis
    analysisProps.kong_token = bindDataStoreResp.keyauth.key!;
    const startPodResp: POResp = (await useNuxtApp()
      .$hubApi("/po", {
        method: "POST",
        body: analysisProps
      })
      .catch(() => null)) as POResp; // Set the response to null if an error occurs

    if (startPodResp && "status" in startPodResp) {
      const currentRunStatus = startPodResp.status as string;
      buttonStatuses.value = setButtonStatuses(currentRunStatus);
      showToast("info", "Start success", "Successfully started the container");
    } else {
      showToast("error", "Start failure", "Failed to start the analysis");
    }
  }
  loading.value = false;
}

async function onStopAnalysis() {
  loading.value = true;
  const originalRunStatus = props.analysisRunStatus;
  setButtonStatuses(AnalysisNodeRunStatus.Stopping);

  const stopResp: POResp = (await useNuxtApp()
    .$hubApi(`/po/${props.analysisId}/stop`, {
      method: "PUT"
    })
    .catch(() => null)) as POResp;
  if (stopResp && "status" in stopResp) {
    // If req successful, then "status" returned
    const podStatuses = stopResp.status as object;
    if (Object.keys(podStatuses).length) {
      showToast("info", "Stop success", "Successfully stopped the container");
    } else {
      // No pod statuses returned from PO
      showToast(
        "warn",
        "Status unknown",
        "Pod was not found, but the stop command was still issued"
      );
    }
    buttonStatuses.value = setButtonStatuses(AnalysisNodeRunStatus.Stopped);
  } else {
    // Communication error with PO
    setButtonStatuses(originalRunStatus);
    showToast("error", "Stop failure", "Failed to stop the analysis container");
  }
  loading.value = false;
}

async function onDeleteAnalysis() {
  loading.value = true;
  const originalRunStatus = props.analysisRunStatus;
  setButtonStatuses(AnalysisNodeRunStatus.Stopping);

  await useNuxtApp()
    .$hubApi(`/kong/analysis/${props.analysisId}`, {
      method: "DELETE"
    })
    .catch(() => {
      showToast(
        "warn",
        "Disconnect failure",
        "Unable to disconnect the data store from the analysis"
      );
    });

  const deleteResp: POResp = (await useNuxtApp()
    .$hubApi(`/po/${props.analysisId}/delete`, {
      method: "DELETE"
    })
    .catch(() => null)) as POResp;

  if (deleteResp && "status" in deleteResp) {
    const deletedPods = deleteResp.status as object;
    buttonStatuses.value = setButtonStatuses("");
    if (Object.keys(deletedPods).length) {
      showToast("info", "Delete success", "Successfully removed the container");
    } else {
      showToast(
        "warn",
        "Status unknown",
        "Pod was not found, but the delete command was still issued"
      );
    }
  } else {
    setButtonStatuses(originalRunStatus);
    showToast(
      "error",
      "Delete failure",
      "Failed to delete the analysis container"
    );
  }
  loading.value = false;
}

function onUpdateAnalysis(updatedPodStatus: AnalysisNodeRunStatus | null) {
  buttonStatuses.value = setButtonStatuses(updatedPodStatus);
}
</script>

<template>
  <div class="analysis-buttons">
    <Button
      icon="pi pi-play"
      aria-label="Start"
      class="start-analysis-btn"
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
      class="rerun-analysis-btn"
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
      class="stop-analysis-btn"
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
      class="delete-analysis-btn"
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
        class="logs-analysis-btn"
        v-tooltip.top="'View the logs'"
        severity="contrast"
        :loading="loading"
        :disabled="!buttonStatuses.deleteActive"
      />
    </NuxtLink>
    <AnalysisUpdateButton :analysisNodeId="props.analysisId" @updatedRunStatus="onUpdateAnalysis" />
  </div>
</template>

<style scoped lang="scss">
.analysis-buttons {
  column-gap: 0.3em;
  display: flex;
  justify-content: flex-start;
}
</style>
