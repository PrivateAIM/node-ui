<script lang="ts" setup>
import AnalysisUpdateButton from "./AnalysisUpdateButton.vue";
import { useToast } from "primevue/usetoast";
import { useNuxtApp } from "nuxt/app";
import { ProcessStatus } from "~/types/analysis";
import {
  type PodProgressResponse,
  PodStatus,
  type StatusOnlyResponse,
} from "~/services/Api";
import { ApprovalStatus } from "~/types/node";

type ToastSeverity = "success" | "info" | "warn" | "error" | undefined;

interface ButtonStates {
  playActive: boolean;
  rerunActive: boolean;
  stopActive: boolean;
  deleteActive: boolean;
  logsActive: boolean;
}

const props = defineProps({
  analysisBuildStatus: [String, null],
  approvalStatus: {
    type: [String, null],
    default: null,
  },
  analysisExecutionStatus: {
    type: [String, null],
    required: true,
  },
  analysisDistributionStatus: {
    type: [String, null],
    required: true,
  },
  analysisNodeId: {
    type: String,
    required: true,
  },
  analysisId: {
    type: String,
    required: true,
  },
  projectId: {
    type: String,
    required: true,
  },
  nodeId: {
    type: String,
    required: true,
  },
  datastore: {
    type: Boolean,
    required: true,
  },
  requireDatastore: {
    type: Boolean,
    required: true,
  },
});

const emit = defineEmits(["updateAnalysisRow", "missingDataStore"]);
const toast = useToast();
const loading = ref(false);
// Needed in order to distinguish in-flight request from stored
const loadingRestoredFromStorage = ref(false);

const loadingStorageKey = computed(
  () => `analysis-start-loading-${props.analysisId}`,
);
const LOADING_RESTORE_TTL_MS = 2 * 60_000;

onMounted(() => {
  const startedAt = Number(localStorage.getItem(loadingStorageKey.value));
  if (
    Number.isFinite(startedAt) &&
    Date.now() - startedAt < LOADING_RESTORE_TTL_MS &&
    playButtonActiveStates.includes(props.analysisExecutionStatus)
  ) {
    loading.value = true;
    loadingRestoredFromStorage.value = true;
  } else {
    localStorage.removeItem(loadingStorageKey.value);
  }
});

watch(
  () => props.analysisExecutionStatus,
  (newStatus) => {
    if (
      loadingRestoredFromStorage.value &&
      !playButtonActiveStates.includes(newStatus)
    ) {
      localStorage.removeItem(loadingStorageKey.value);
      loading.value = false;
      loadingRestoredFromStorage.value = false;
    }
  },
);

// API Constants
const NOT_FOUND_STATUS = 404;
const CONFLICT_STATUS = 409;
const OPERATION_TIMEOUT_MS = 60_000;

class OperationTimeoutError extends Error {}

function raceWithTimeout<T>(promise: Promise<T>): Promise<T> {
  return Promise.race([
    promise,
    new Promise<never>((_, reject) =>
      setTimeout(
        () => reject(new OperationTimeoutError()),
        OPERATION_TIMEOUT_MS,
      ),
    ),
  ]);
}

const playButtonActiveStates = [null, "", undefined];
const rerunButtonActiveStates: Array<string | null | undefined> = [
  PodStatus.Failed,
  PodStatus.Executed,
  PodStatus.Stopped,
];
const stopButtonActiveStates: Array<string | null | undefined> = [
  PodStatus.Executing,
  PodStatus.Starting,
  PodStatus.Started,
  PodStatus.Stopping,
];
const deleteButtonActiveStates: Array<string | null | undefined> = [
  PodStatus.Stopped,
  PodStatus.Stopping,
  PodStatus.Executing,
  PodStatus.Starting,
  PodStatus.Started,
];
const logsButtonActiveStates: Array<string | null | undefined> = [
  PodStatus.Failed,
  PodStatus.Stopped,
  PodStatus.Stopping,
  PodStatus.Executing,
  PodStatus.Executed,
];

function getButtonStatuses(podStatus: string | null | undefined) {
  return {
    playActive: playButtonActiveStates.includes(podStatus),
    rerunActive: rerunButtonActiveStates.includes(podStatus),
    stopActive: stopButtonActiveStates.includes(podStatus),
    deleteActive: deleteButtonActiveStates.includes(podStatus),
    logsActive: logsButtonActiveStates.includes(podStatus),
  };
}

const buttonStatuses = computed<ButtonStates>(
  () => getButtonStatuses(props.analysisExecutionStatus), // Changes buttons when new status update comes in
);

const notApproved = computed(
  () =>
    !props.approvalStatus || props.approvalStatus === ApprovalStatus.Rejected,
);

const disabledReason = computed<string | null>(() => {
  if (props.analysisBuildStatus !== ProcessStatus.Executed)
    return "Image not built";
  if (props.analysisDistributionStatus !== ProcessStatus.Executed)
    return "Image not yet distributed to this node";
  if (props.requireDatastore && !props.datastore) return "Missing datastore";
  return null;
});

const playDisabledReason = computed<string | null>(() => {
  if (notApproved.value) return "Analysis not approved";
  return disabledReason.value;
});

// Status update button: hidden once the run has finished, disabled when there is no run status to update
const updateButtonHidden = computed(
  () =>
    props.analysisExecutionStatus === PodStatus.Failed ||
    props.analysisExecutionStatus === PodStatus.Executed ||
    props.analysisExecutionStatus == null,
);
const updateButtonDisabled = computed(
  () => props.analysisExecutionStatus == null,
);

function updatePodStatus(
  podStatus: string | null | undefined,
  progressUpdate?: number | null | undefined,
) {
  const analysisUpdate = {
    status: podStatus,
    progress: progressUpdate,
  };
  emit("updateAnalysisRow", props.analysisId, analysisUpdate);
}

const showToast = (severity: ToastSeverity, summary: string, msg: string) => {
  toast.add({
    severity: severity,
    summary: summary,
    detail: msg,
    life: 5000,
  });
};

const showStatusUnknownToast = () => {
  showToast(
    "warn",
    "Status unknown",
    "Pod was not found, but the command was still issued",
  );
};

async function checkPodStatus(): Promise<boolean> {
  const podStatus: PodProgressResponse = (await useNuxtApp()
    .$hubApi(`/po/status/${props.analysisId}`, {
      method: "GET",
    })
    .catch(() => null)) as PodProgressResponse; // Set the response to undefined if an error occurs

  // If response is not undefined AND "status" in response AND "status" is not empty
  if (podStatus && props.analysisId in podStatus) {
    const currentPodStatus = podStatus[props.analysisId]!.status;
    const currentPodProgress = podStatus[props.analysisId]!.progress;
    // If the status is not empty and not FINISHED
    if (currentPodStatus != PodStatus.Executed) {
      showToast(
        "warn",
        "Analysis already running",
        "The analysis is already running on this node, the controls have been updated",
      );
      updatePodStatus(currentPodStatus, currentPodProgress); // Grab the first status update
      return true;
    }
  }
  return false;
}

async function onRerunAnalysis() {
  await onDeleteAnalysis(true);
  await onStartAnalysis();
}

async function onStartAnalysis() {
  loading.value = true;
  loadingRestoredFromStorage.value = false;
  localStorage.setItem(loadingStorageKey.value, String(Date.now()));
  const originalExecutionStatus = props.analysisExecutionStatus;
  updatePodStatus(PodStatus.Starting);
  const analysisProps = new FormData();

  analysisProps.append("analysis_id", props.analysisId!);
  analysisProps.append("project_id", props.projectId!);

  try {
    const startPodResp: StatusOnlyResponse = (await raceWithTimeout(
      useNuxtApp().$hubApi("/analysis/initialize", {
        method: "POST",
        body: analysisProps,
        timeout: 0,
      }),
    ).catch((e) => {
      updatePodStatus(null);
      if (e instanceof OperationTimeoutError) {
        showToast("error", "Start failure", "The request timed out");
      } else if (e.status == 408) {
        // Timed out waiting for image to pull
        updatePodStatus(PodStatus.Started);
        showToast(
          "info",
          "Analysis submitted",
          "The PodOrc did not respond in time, but the request was sent to start the analysis. " +
            "The timeout was likely due to a large image being pulled.",
        );
      } else if (e.status === NOT_FOUND_STATUS) {
        emit("missingDataStore");
      } else if (e.status === CONFLICT_STATUS) {
        checkPodStatus(); // Check to see if the analysis pod already exists, if so, buttons are updated by method
      } else if (
        "data" in e &&
        "detail" in e.data &&
        "message" in e.data.detail
      ) {
        showToast("error", "Start failure", e.data.detail.message);
      } else {
        showToast("error", "Start failure", "Failed to start the analysis");
      }
    })) as StatusOnlyResponse;

    if (startPodResp && props.analysisId in startPodResp) {
      const currentExecutionStatus = startPodResp[props.analysisId];
      updatePodStatus(currentExecutionStatus);
      showToast(
        "success",
        "Start success",
        "Successfully started the container",
      );
    } else {
      updatePodStatus(originalExecutionStatus);
    }
  } finally {
    localStorage.removeItem(loadingStorageKey.value);
    loading.value = false;
  }
}

async function onStopAnalysis() {
  loading.value = true;
  const originalExecutionStatus = props.analysisExecutionStatus;
  updatePodStatus(PodStatus.Stopping);

  try {
    const stopResp: StatusOnlyResponse = (await raceWithTimeout(
      useNuxtApp().$hubApi(`/po/stop/${props.analysisId}`, {
        method: "PUT",
        timeout: 0,
      }),
    ).catch((e) => {
      if (e instanceof OperationTimeoutError) {
        showToast("error", "Stop failure", "The request timed out");
      } else {
        showToast(
          "error",
          "Stop failure",
          "Failed to stop the analysis container",
        );
      }
    })) as StatusOnlyResponse;

    // stopResp is undefined if error occurred
    if (stopResp) {
      if (props.analysisId in stopResp) {
        showToast(
          "success",
          "Stop success",
          "Successfully stopped the container",
        );
      } else {
        // No pod statuses returned from PO for analysis
        showStatusUnknownToast();
      }
      updatePodStatus(PodStatus.Stopped);
    } else {
      updatePodStatus(originalExecutionStatus);
    }
  } finally {
    loading.value = false;
  }
}

async function onDeleteAnalysis(silent: boolean = false) {
  loading.value = true;
  const originalExecutionStatus = props.analysisExecutionStatus;
  updatePodStatus(PodStatus.Stopping);

  try {
    const deleteResp: StatusOnlyResponse = (await raceWithTimeout(
      useNuxtApp().$hubApi(`/analysis/terminate/${props.analysisId}`, {
        method: "DELETE",
        timeout: 0,
      }),
    ).catch((e) => {
      if (e instanceof OperationTimeoutError) {
        showToast(
          "error",
          "Terminate request failure",
          "The request timed out",
        );
      } else {
        showToast(
          "error",
          "Terminate request failure",
          "Failed to terminate the analysis",
        );
      }
    })) as StatusOnlyResponse;

    // deleteResp is undefined if error occurred
    if (deleteResp) {
      if (props.analysisId in deleteResp) {
        showToast(
          "success",
          "Delete success",
          "Successfully removed the container",
        );
      } else if (!silent) {
        showStatusUnknownToast();
      }
      updatePodStatus(null);
    } else {
      updatePodStatus(originalExecutionStatus);
    }
  } finally {
    loading.value = false;
  }
}
</script>

<template>
  <div class="analysis-buttons">
    <Button
      v-show="buttonStatuses.playActive"
      v-tooltip.top="playDisabledReason ?? 'Start the analysis'"
      :disabled="!!playDisabledReason"
      :loading="loading"
      aria-label="Start"
      class="analysis-btn start-analysis-btn"
      icon="pi pi-play"
      severity="success"
      @click="onStartAnalysis()"
    />
    <Button
      v-show="buttonStatuses.rerunActive"
      v-tooltip.top="playDisabledReason ?? 'Rerun the analysis'"
      :disabled="!!playDisabledReason"
      :loading="loading"
      aria-label="Rerun"
      class="analysis-btn rerun-analysis-btn"
      icon="pi pi-replay"
      severity="success"
      @click="onRerunAnalysis()"
    />
    <Button
      v-show="buttonStatuses.stopActive"
      v-tooltip.top="disabledReason ?? 'Stop the analysis'"
      :disabled="!!disabledReason"
      :loading="loading"
      aria-label="Stop"
      class="analysis-btn stop-analysis-btn"
      icon="pi pi-stop"
      severity="warn"
      @click="onStopAnalysis()"
    />
    <Button
      v-show="buttonStatuses.deleteActive"
      v-tooltip.top="disabledReason ?? 'Delete the analysis container'"
      :disabled="!!disabledReason"
      :loading="loading"
      aria-label="Delete"
      class="analysis-btn delete-analysis-btn"
      icon="pi pi-trash"
      severity="danger"
      @click="onDeleteAnalysis()"
    />
    <NuxtLink
      v-show="buttonStatuses.logsActive"
      :to="{
        name: 'analyses-id',
        params: { id: props.analysisId },
        query: { nodeId: props.analysisNodeId },
      }"
      target="_blank"
    >
      <Button
        v-tooltip.top="'View the logs'"
        aria-label="Logs"
        class="analysis-btn logs-analysis-btn"
        icon="pi pi-bars"
        severity="contrast"
      />
    </NuxtLink>
    <AnalysisUpdateButton
      v-show="!updateButtonHidden"
      :analysisId="props.analysisId"
      :disabled="updateButtonDisabled"
      @updateAnalysisRunStatus="updatePodStatus"
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
