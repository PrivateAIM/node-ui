<script setup lang="ts">
import { approveRejectProjectProposal } from "~/composables/useAPIFetch";

const props = defineProps({
  projectId: String,
});

// const emit = defineEmits(["updatedRow"]);

async function onSubmitProjectApproval(isApproved: boolean) {
  const { data: response, status } = await approveRejectProjectProposal(
    isApproved,
    props.projectId!,
  );
  console.log(status.value);
  if (status.value === "success") {
    console.log(response.value!);
  } else {
    console.log("error");
  }
}
</script>

<template>
  <div class="approvalButtons">
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
