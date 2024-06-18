<script setup lang="ts">
import { approveRejectProjectProposal } from "~/composables/useAPIFetch";

const props = defineProps({
  projectId: String,
});

function onSubmitProjectApproval(isApproved: boolean) {
  approveRejectProjectProposal(isApproved, props.projectId);
}

console.log(props.projectId);
</script>

<template>
  <div class="approval-buttons">
    <Button
      icon="pi pi-check"
      aria-label="Approve"
      severity="success"
      style="margin-right: 10px"
      @click="onSubmitProjectApproval(true)"
    />
    <Button
      icon="pi pi-times"
      aria-label="Reject"
      severity="danger"
      @click="onSubmitProjectApproval(false)"
    />
  </div>
</template>

<style scoped lang="scss"></style>
