<script lang="ts" setup>
import AnalysisUpdateButton from "./AnalysisUpdateButton.vue";
import { useToast } from "primevue/usetoast";
import { useNuxtApp } from "#app";
import { AnalysisBuildStatus, AnalysisNodeRunStatus } from "~/types/analysis";
import type { StatusResponse } from "~/services/Api";

type ToastSeverity = "success" | "info" | "warn" | "error" | undefined;

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
    required: true,
  },
  analysisNodeId: String,
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
});

const emit = defineEmits(["newRunStatus", "missingDataStore"]);
const toast = useToast();
const loading = ref(false);

// API Constants
const NOT_FOUND_STATUS = 404;
const CONFLICT_STATUS = 409;

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
    emit("newRunStatus", props.analysisId, podStatus);
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

const showStatusUnknownToast = () => {
  showToast(
    "warn",
    "Status unknown",
    "Pod was not found, but the stop command was still issued",
  );
};

async function checkPodStatus(): Promise<boolean> {
  const podStatus: StatusResponse = (await useNuxtApp()
    .$hubApi(`/po/status/${props.analysisId}`, {
      method: "GET",
    })
    .catch(() => null)) as StatusResponse; // Set the response to null if an error occurs

  // If response is not null AND "status" in response AND "status" is not empty
  if (podStatus && props.analysisId in podStatus) {
    const currentPodStatus = podStatus[props.analysisId];
    // If the status is not empty and not FINISHED
    if (currentPodStatus != AnalysisNodeRunStatus.Finished) {
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
  let analysisProps = new FormData();

  analysisProps.append("analysis_id", props.analysisId!);
  analysisProps.append("project_id", props.projectId!);

  let startPodResp: StatusResponse = (await useNuxtApp()
    .$hubApi("/analysis/initialize", {
      method: "POST",
      body: analysisProps,
    })
    .catch((e) => {
      setButtonStates(null);
      if (e.status == 408) {
        // Timed out waiting for image to pull
        setButtonStates(AnalysisNodeRunStatus.Started);
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
      } else if ("detail" in e.data && "message" in e.data.detail) {
        showToast("error", "Start failure", e.data.detail.message);
      } else {
        showToast("error", "Start failure", "Failed to start the analysis");
      }
    })) as StatusResponse;

  if (startPodResp && props.analysisId in startPodResp) {
    const currentRunStatus = startPodResp[props.analysisId];
    setButtonStates(currentRunStatus);
    showToast("success", "Start success", "Successfully started the container");
  }

  loading.value = false;
}

async function onStopAnalysis() {
  loading.value = true;
  const originalRunStatus = props.analysisRunStatus;
  setButtonStates(AnalysisNodeRunStatus.Stopping);

  const stopResp: StatusResponse = (await useNuxtApp()
    .$hubApi(`/po/stop/${props.analysisId}`, {
      method: "PUT",
    })
    .catch(() => {
      showToast(
        "warn",
        "Stop failure",
        "Failed to stop the analysis container",
      );
      setButtonStates(originalRunStatus);
    })) as StatusResponse;

  // stopResp is null if error occurred
  if (stopResp) {
    if (props.analysisId in stopResp) {
      showToast("info", "Stop success", "Successfully stopped the container");
    } else {
      // No pod statuses returned from PO for analysis
      showStatusUnknownToast();
    }
    setButtonStates(AnalysisNodeRunStatus.Stopped);
  }
  loading.value = false;
}

async function onDeleteAnalysis() {
  loading.value = true;
  const originalRunStatus = props.analysisRunStatus;
  setButtonStates(AnalysisNodeRunStatus.Stopping);

  const deleteResp: StatusResponse = (await useNuxtApp()
    .$hubApi(`/analysis/terminate/${props.analysisId}`, {
      method: "DELETE",
    })
    .catch(() => {
      showToast(
        "warn",
        "Terminate request failure",
        "Failed to terminate the analysis",
      );
      setButtonStates(originalRunStatus);
    })) as StatusResponse;

  // deleteResp is null if error occurred
  if (deleteResp) {
    if (props.analysisId in deleteResp) {
      showToast("info", "Delete success", "Successfully removed the container");
    } else {
      showStatusUnknownToast();
    }
    setButtonStates("");
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
        :disabled="buttonStatuses.playActive"
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
