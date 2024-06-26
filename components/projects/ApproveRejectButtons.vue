<script setup lang="ts">
import { approveRejectProjectProposal } from "~/composables/useAPIFetch";

const props = defineProps({
  projectId: String,
});

const toast = useToast();

// const emit = defineEmits(["updatedRow"]);

async function onSubmitProjectApproval(isApproved: boolean) {
  const { status } = await approveRejectProjectProposal(
    isApproved,
    props.projectId!,
  );
  console.log(status.value);
  if (status.value === "success") {
    showSuccessfulSubmission(isApproved);
  } else {
    showFailedSubmission();
  }
}

const showSuccessfulSubmission = (approval: boolean) => {
  const submissionType = approval ? "Approval" : "Rejection";
  toast.add({
    severity: "info",
    summary: "Submission successful",
    detail: `${submissionType} successfully submitted.`,
    life: 3000,
  });
};

const showFailedSubmission = () => {
  toast.add({
    severity: "error",
    summary: "Submission failed",
    detail: "There was an error sending your submission.",
    life: 3000,
  });
};
</script>

<template>
  <div class="approvalButtons">
    <Toast position="top-right" />
    <Button
      icon="pi pi-check"
      aria-label="Approve"
      v-tooltip="'Send approval'"
      severity="success"
      style="margin-right: 10px"
      @click="onSubmitProjectApproval(true)"
    />
    <Button
      icon="pi pi-times"
      aria-label="Reject"
      v-tooltip="'Send rejection'"
      severity="danger"
      @click="onSubmitProjectApproval(false)"
    />
  </div>
</template>

<style scoped lang="scss"></style>
