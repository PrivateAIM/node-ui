<script setup lang="ts">
import { useToastService } from "~/composables/connectionErrorToast";

const props = defineProps({
  projectId: String,
});

const toast = useToastService();
const loading = ref(false);

const emit = defineEmits(["updatedRow"]);

async function onSubmitProjectApproval(isApproved: boolean) {
  loading.value = true;

  const formData = new FormData();
  formData.append("approval_status", isApproved ? "approved" : "rejected");
  const approvalResp = await useNuxtApp()
    .$hubApi(`/project-nodes/${props.projectId}`, {
      method: "POST",
      body: formData,
    })
    .catch(() => null);

  if (approvalResp) {
    showSuccessfulSubmission(isApproved);
    // Send data to parent component
    emit("updatedRow", approvalResp);
  } else {
    showFailedSubmission();
  }
  loading.value = false;
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
    <Button
      icon="pi pi-check"
      aria-label="Approve"
      v-tooltip.top="'Send approval'"
      severity="success"
      :loading="loading"
      style="margin-right: 10px"
      @click="onSubmitProjectApproval(true)"
    />
    <Button
      icon="pi pi-times"
      aria-label="Reject"
      v-tooltip.top="'Send rejection'"
      severity="danger"
      :loading="loading"
      @click="onSubmitProjectApproval(false)"
    />
  </div>
</template>

<style scoped lang="scss"></style>
