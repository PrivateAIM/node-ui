<script setup lang="ts">
import { useNuxtApp } from "#app";
import { useToast } from "primevue/usetoast";

const props = defineProps({
  objectId: String,
  objectClass: String,
});

const toast = useToast();
const loading = ref(false);

const emit = defineEmits(["updatedRow"]);

async function onSubmitApproval(isApproved: boolean) {
  loading.value = true;
  const formData = new FormData();
  formData.append("approval_status", isApproved ? "approved" : "rejected");
  let approvalResp;

  if (props.objectClass == "project") {
    approvalResp = await useNuxtApp()
      .$hubApi(`/project-nodes/${props.objectId}`, {
        method: "POST",
        body: formData,
      })
      .catch((e) => console.error(e));
  } else if (props.objectClass == "analysis") {
    approvalResp = await useNuxtApp()
      .$hubApi(`/analysis-nodes/${props.objectId}`, {
        method: "POST",
        body: formData,
      })
      .catch((e) => console.error(e));
  }
  console.log(JSON.stringify(approvalResp));
  if ("approval_status" in approvalResp) {
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
      class="project-approve-btn"
      aria-label="Approve"
      v-tooltip.top="'Send approval'"
      severity="success"
      :loading="loading"
      style="margin-right: 10px"
      @click="onSubmitApproval(true)"
    />
    <Button
      icon="pi pi-times"
      class="project-reject-btn"
      aria-label="Reject"
      v-tooltip.top="'Send rejection'"
      severity="danger"
      :loading="loading"
      @click="onSubmitApproval(false)"
    />
  </div>
</template>

<style scoped lang="scss"></style>
