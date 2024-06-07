<script setup lang="ts">
import { approveRejectAnalysis } from "~/composables/useAPIFetch";

const props = defineProps({
  analysisId: String,
});

function onSubmitAnalysisApproval(isApproved: boolean) {
  approveRejectAnalysis(isApproved, props.analysisId);
}

console.log(props.analysisId);
</script>

<template>
  <div class="approval-buttons">
    <Button
      icon="pi pi-check"
      aria-label="Approve"
      severity="success"
      style="margin-right: 10px"
      @click="onSubmitAnalysisApproval(true)"
    />
    <Button
      icon="pi pi-times"
      aria-label="Reject"
      severity="danger"
      @click="onSubmitAnalysisApproval(false)"
    />
  </div>
</template>

<style scoped lang="scss"></style>
