<script setup lang="ts">
import type { BodyCreateAnalysisPoPost } from "~/services/Api";
import {
  deleteAnalysis,
  startAnalysis,
  stopAnalysis,
} from "~/composables/useAPIFetch";

const props = defineProps({
  // Have to use null since [String, null] gives an error: "No overload matches this call"
  analysisStatus: { type: null },
  analysisId: String,
  projectId: String,
});
const toast = useToast();

const analysisRunning = ref(isRunning());

function isRunning(): boolean {
  const analysisIsRunning = ["running", "starting", "started"];
  return analysisIsRunning.includes(props.analysisStatus);
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
  const { data: response, status } = await startAnalysis(analysisProps);
  if (status.value === "success") {
    console.log(response.value!.run_status);
  } else {
    showFailStart();
  }
  analysisRunning.value = !analysisRunning.value;
}

function onStopAnalysis() {
  stopAnalysis(props.analysisId!);
  analysisRunning.value = !analysisRunning;
}

function onDeleteAnalysis() {
  deleteAnalysis(props.analysisId!);
  analysisRunning.value = !analysisRunning;
}
</script>

<template>
  <div class="analysisButtons">
    <Toast position="top-right" />
    <Button
      icon="pi pi-play"
      aria-label="Start"
      v-tooltip="'Start the analysis'"
      severity="success"
      style="margin-right: 10px"
      :disabled="analysisRunning"
      @click="onStartAnalysis()"
    />
    <Button
      icon="pi pi-stop"
      aria-label="Stop"
      v-tooltip="'Stop the analysis'"
      severity="warn"
      style="margin-right: 10px"
      :disabled="!analysisRunning"
      @click="onStopAnalysis()"
    />
    <Button
      icon="pi pi-trash"
      aria-label="Delete"
      v-tooltip="'Delete the analysis container'"
      severity="danger"
      :disabled="!analysisRunning"
      @click="onDeleteAnalysis()"
    />
  </div>
</template>

<style scoped lang="scss"></style>
