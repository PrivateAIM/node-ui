<script lang="ts" setup>
import {
  type BodyCreateAnalysisPoPost,
  type LinkProjectAnalysis,
} from "~/services/Api";
import AnalysisUpdateButton from "./AnalysisUpdateButton.vue";
import { useToast } from "primevue/usetoast";
import { showMissingRegistryRobotCredentialsToast } from "~/composables/connectionErrorToast";
import { useNuxtApp } from "#app";
import { AnalysisBuildStatus, AnalysisNodeRunStatus } from "~/types/analysis";

type ToastSeverity = "success" | "info" | "warn" | "error" | undefined;
type POResp = { status?: string | string[] | object; detail?: string } | null;

interface ButtonStates {
  playActive: boolean;
  rerunActive: boolean;
  stopActive: boolean;
  deleteActive: boolean;
}

interface ApiError extends Error {
  status?: number;
}

const props = defineProps({
  analysisBuildStatus: [String, null],
  analysisRunStatus: {
    type: [String, null],
    required: true,
  },
  analysisNodeId: String,
  analysisId: String,
  projectId: String,
  nodeId: String,
});

const emit = defineEmits(["newRunStatus", "missingDataStore"]);
const toast = useToast();
const loading = ref(false);

// API Constants
const MAX_RETRY_ATTEMPTS = 10;
const CONFLICT_STATUS = 409;
const NOT_FOUND_STATUS = 404;

const playButtonActiveStates = [null, ""];
const rerunButtonActiveStates: Array<string | null> = [
  AnalysisNodeRunStatus.Failed,
  AnalysisNodeRunStatus.Finished,
  AnalysisNodeRunStatus.Stopped,
  AnalysisNodeRunStatus.Stopping,
];
const stopButtonActiveStates: Array<string | null> = [
  AnalysisNodeRunStatus.Running,
  AnalysisNodeRunStatus.Starting,
  AnalysisNodeRunStatus.Started,
  AnalysisNodeRunStatus.Stopping,
];
const deleteButtonActiveStates: Array<string | null> = [
  AnalysisNodeRunStatus.Failed,
  AnalysisNodeRunStatus.Stopped,
  AnalysisNodeRunStatus.Stopping,
  AnalysisNodeRunStatus.Running,
  AnalysisNodeRunStatus.Starting,
  AnalysisNodeRunStatus.Started,
];

const buttonStatuses = ref<ButtonStates>(
  getButtonStatuses(props.analysisRunStatus, false),
);

function getButtonStatuses(
  podStatus: string | null,
  updateTable: boolean = true,
) {
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

function setButtonStates(
  podStatus: string | null,
  updateTable: boolean = true,
) {
  buttonStatuses.value = getButtonStatuses(podStatus, updateTable);
}

const showToast = (severity: ToastSeverity, summary: string, msg: string) => {
  toast.add({
    severity: severity,
    summary: summary,
    detail: msg,
    life: 5000,
  });
};

async function registerAnalysis(
  attempt: number = 0,
  maxAttempts: number = MAX_RETRY_ATTEMPTS,
): Promise<LinkProjectAnalysis | null> {
  try {
    // @ts-expect-error Nuxt error
    return (await useNuxtApp().$hubApi("/kong/analysis", {
      method: "POST",
      body: {
        project_id: props.projectId!,
        analysis_id: props.analysisId!,
      },
    })) as LinkProjectAnalysis;
  } catch (error) {
    return await handleRegistrationError(
      error as ApiError,
      attempt,
      maxAttempts,
    );
  }
}

async function handleRegistrationError(
  error: ApiError,
  attempt: number,
  maxAttempts: number,
): Promise<LinkProjectAnalysis | null> {
  if (error.status === CONFLICT_STATUS) {
    // Catch 409 and let proceed
    return await handleConflictError(attempt, maxAttempts);
  } else {
    // If not 409, show error and quit the process
    if (error.status === NOT_FOUND_STATUS) {
      emit("missingDataStore");
    } else {
      showToast(
        "error",
        "Data mapping failed",
        "Unable to map a data store to this analysis due to a technical error.",
      );
    }
    loading.value = false;
    setButtonStates(null);
  }
  return null;
}

async function handleConflictError(
  attempt: number,
  maxAttempts: number,
): Promise<LinkProjectAnalysis | null> {
  console.warn(
    "A data store is already mapped to this analysis and will be removed",
  );
  const podRunning = await checkPodStatus(); // Check to see if the analysis pod already exists
  if (!podRunning) {
    await useNuxtApp()
      .$hubApi(`/kong/analysis/${props.analysisId}`, {
        method: "DELETE",
      })
      .catch(() => {
        showToast(
          "error",
          "Disconnect failure",
          "Unable to delete the consumer",
        );
      });
    attempt++;
    if (attempt < maxAttempts) {
      return await registerAnalysis(attempt);
    }
  }
  return null;
}

async function checkPodStatus(): Promise<boolean> {
  const podStatus: POResp = (await useNuxtApp()
    .$hubApi(`/po/${props.analysisId}/status`, {
      method: "GET",
    })
    .catch(() => null)) as POResp; // Set the response to null if an error occurs

  // If response is not null AND "status" in response AND "status" is not empty
  if (podStatus && podStatus.status && Object.values(podStatus.status).length) {
    const currentPodStatus = Object.values(podStatus.status)[0];
    // If the status is not empty and not FINISHED
    if (currentPodStatus.status != AnalysisNodeRunStatus.Finished) {
      showToast(
        "warn",
        "Analysis already running",
        "The analysis is already running on this node, the controls have been updated",
      );
      setButtonStates(currentPodStatus); // Grab the first status update
      return true;
    }
  }
  return false;
}

async function onStartAnalysis() {
  loading.value = true;
  setButtonStates(AnalysisNodeRunStatus.Starting);
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
    let startPodResp: POResp = (await useNuxtApp()
      .$hubApi("/po", {
        method: "POST",
        body: analysisProps,
      })
      .catch((e) => {
        if (e.status_code == 408) {
          // Timed out waiting for image to pull
          setButtonStates(AnalysisNodeRunStatus.Started);
          showToast(
            "info",
            "Analysis submitted",
            "The PodOrc did not respond in time, but the request was sent to start the analysis. " +
              "The timeout was likely due to a large image being pulled.",
          );
        } else {
          setButtonStates(null);
          e.status_code == 404
            ? showMissingRegistryRobotCredentialsToast(toast)
            : showToast(
                "error",
                "Start failure",
                "Failed to start the analysis",
              );
        }
      })) as POResp;

    if (startPodResp && "status" in startPodResp) {
      const currentRunStatus = startPodResp.status as string;
      setButtonStates(currentRunStatus);
      showToast("info", "Start success", "Successfully started the container");
    }
  }

  loading.value = false;
}

async function onStopAnalysis() {
  loading.value = true;
  const originalRunStatus = props.analysisRunStatus;
  setButtonStates(AnalysisNodeRunStatus.Stopping);

  const stopResp: POResp = (await useNuxtApp()
    .$hubApi(`/po/${props.analysisId}/stop`, {
      method: "PUT",
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
        "Pod was not found, but the stop command was still issued",
      );
    }
    setButtonStates(AnalysisNodeRunStatus.Stopped);
  } else {
    // Communication error with PO
    setButtonStates(originalRunStatus);
    showToast("error", "Stop failure", "Failed to stop the analysis container");
  }
  loading.value = false;
}

async function onDeleteAnalysis() {
  loading.value = true;
  const originalRunStatus = props.analysisRunStatus;
  setButtonStates(AnalysisNodeRunStatus.Stopping);

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

  const deleteResp: POResp = (await useNuxtApp()
    .$hubApi(`/po/${props.analysisId}/delete`, {
      method: "DELETE",
    })
    .catch(() => null)) as POResp;

  if (deleteResp && "status" in deleteResp) {
    const deletedPods = deleteResp.status as object;
    setButtonStates("");
    if (Object.keys(deletedPods).length) {
      showToast("info", "Delete success", "Successfully removed the container");
    } else {
      showToast(
        "warn",
        "Status unknown",
        "Pod was not found, but the delete command was still issued",
      );
    }
  } else {
    setButtonStates(originalRunStatus);
    showToast(
      "error",
      "Delete failure",
      "Failed to delete the analysis container",
    );
  }
  loading.value = false;
}

function onUpdateAnalysis(updatedPodStatus: string | null) {
  setButtonStates(updatedPodStatus);
}
</script>

<template>
  <div class="analysis-buttons">
    <Button
      v-if="buttonStatuses.playActive"
      v-tooltip.top="'Start the analysis'"
      :disabled="
        !buttonStatuses.playActive ||
        !(props.analysisBuildStatus === AnalysisBuildStatus.Finished)
      "
      :loading="loading"
      aria-label="Start"
      class="start-analysis-btn"
      icon="pi pi-play"
      severity="success"
      @click="onStartAnalysis()"
    />
    <Button
      v-else
      v-tooltip.top="'Rerun the analysis'"
      :disabled="
        !buttonStatuses.rerunActive ||
        !(props.analysisBuildStatus === AnalysisBuildStatus.Finished)
      "
      :loading="loading"
      aria-label="Rerun"
      class="rerun-analysis-btn"
      icon="pi pi-replay"
      severity="success"
      @click="onStartAnalysis()"
    />
    <Button
      v-tooltip.top="'Stop the analysis'"
      :disabled="
        !buttonStatuses.stopActive ||
        !(props.analysisBuildStatus === AnalysisBuildStatus.Finished)
      "
      :loading="loading"
      aria-label="Stop"
      class="stop-analysis-btn"
      icon="pi pi-stop"
      severity="warn"
      @click="onStopAnalysis()"
    />
    <Button
      v-tooltip.top="'Delete the analysis container'"
      :disabled="
        !buttonStatuses.deleteActive ||
        !(props.analysisBuildStatus === AnalysisBuildStatus.Finished)
      "
      :loading="loading"
      aria-label="Delete"
      class="delete-analysis-btn"
      icon="pi pi-trash"
      severity="danger"
      @click="onDeleteAnalysis()"
    />
    <NuxtLink
      :to="{
        name: 'analyses-id',
        params: { id: props.analysisId },
      }"
      target="_blank"
    >
      <Button
        v-tooltip.top="'View the logs'"
        :disabled="!buttonStatuses.deleteActive"
        :loading="loading"
        aria-label="Logs"
        class="logs-analysis-btn"
        icon="pi pi-bars"
        severity="contrast"
      />
    </NuxtLink>
    <AnalysisUpdateButton
      :analysisId="props.analysisId"
      @updatedRunStatus="onUpdateAnalysis"
    />
  </div>
</template>

<style lang="scss" scoped>
.analysis-buttons {
  column-gap: 0.3em;
  display: flex;
  justify-content: flex-start;
}
</style>
