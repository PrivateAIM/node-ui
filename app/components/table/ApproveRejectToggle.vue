<script lang="ts" setup>
import { useNuxtApp } from "nuxt/app";
import { useToast } from "primevue/usetoast";
import {
  ProjectNodeApprovalStatus,
  type AnalysisNode,
  type ProjectNode,
} from "@privateaim/core-kit";
import {
  getApprovalStatusSeverity,
  type ApprovalStatusValue,
} from "~/utils/status-tag-severity";
import Tag from "primevue/tag";
import { useConfirm } from "primevue/useconfirm";

const props = defineProps<{
  objectId?: string;
  objectClass?: string;
  currentStatus?: ApprovalStatusValue;
}>();

const checked = ref(props.currentStatus === ProjectNodeApprovalStatus.APPROVED);

const toast = useToast();
const confirm = useConfirm();
const loading = ref(false);

const toggleApproval = () => {
  if (loading.value) {
    // Revert the optimistic v-model flip and ignore while a request is in flight
    checked.value = !checked.value;
    return;
  }
  if (checked.value) {
    confirmRejection();
  } else {
    confirmApproval();
  }
};

const emit = defineEmits(["updatedRow"]);

const confirmApproval = () => {
  confirm.require({
    message: `Are you sure you want to approve this ${props.objectClass}?`,
    header: "Approval Confirmation",
    icon: "pi pi-exclamation-triangle",
    rejectProps: {
      label: "Cancel",
      severity: "secondary",
      outlined: true,
    },
    acceptProps: {
      label: "Submit",
    },
    accept: () => {
      onSubmitApproval(true);
    },
    reject: () => {
      // Reset the toggle
      checked.value = !checked.value;
    },
  });
};

const confirmRejection = () => {
  confirm.require({
    message: `Are you sure you want to reject this ${props.objectClass}?`,
    header: "Rejection Confirmation",
    icon: "pi pi-exclamation-triangle",
    rejectProps: {
      label: "Cancel",
      severity: "secondary",
      outlined: true,
    },
    acceptProps: {
      label: "Submit",
    },
    accept: () => {
      onSubmitApproval(false);
    },
    reject: () => {
      // Reset the toggle
      checked.value = !checked.value;
    },
  });
};

async function onSubmitApproval(isApproved: boolean) {
  loading.value = true;
  const formData = new FormData();
  // Stays snake_case: this is the hub-adapter's own FastAPI `Form(...)`
  // parameter on POST /project-nodes/{id} and /analysis-nodes/{id}, not a Hub
  // wire key. The *response* it returns is a Hub entity, so the guard below
  // reads `approvalStatus`.
  formData.append("approval_status", isApproved ? "approved" : "rejected");
  let approvalResp: AnalysisNode | ProjectNode | undefined;
  let endpoint: string;

  if (props.objectClass == "project") {
    endpoint = `/project-nodes/${props.objectId}`;
  } else if (props.objectClass == "analysis") {
    endpoint = `/analysis-nodes/${props.objectId}`;
  } else {
    console.error("Unknown approval props: ", props);
    toast.add({
      severity: "error",
      summary: "Invalid approval prop",
      detail: `Unable to submit request due to invalid props: ${props}`,
      life: 6000,
    });
    checked.value = !checked.value;
    loading.value = false;
    return;
  }

  approvalResp = (await useNuxtApp()
    .$hubApi(endpoint, {
      method: "POST",
      body: formData,
    })
    .catch((e) => {
      console.error(e);
      return undefined;
    })) as AnalysisNode | ProjectNode | undefined;

  if (approvalResp && "approvalStatus" in approvalResp) {
    showSuccessfulSubmission(isApproved);
    // Send data to parent component
    emit("updatedRow", approvalResp);
  } else {
    // Reset toggle and show failed toast
    checked.value = !checked.value;
    showFailedSubmission();
  }
  loading.value = false;
}

const showSuccessfulSubmission = (approval: boolean) => {
  const submissionType = approval ? "Approval" : "Rejection";
  toast.add({
    severity: "success",
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
  <div class="approval-toggle">
    <div
      class="approval-tag approval-tag-rejected"
      :class="{ dimmed: checked }"
    >
      <Tag
        :severity="getApprovalStatusSeverity(ProjectNodeApprovalStatus.REJECTED)"
        :value="ProjectNodeApprovalStatus.REJECTED"
      />
    </div>
    <ToggleSwitch
      v-model="checked"
      class="approval-toggle-switch"
      label="Approval Toggle"
      @click="toggleApproval()"
    />
    <div
      class="approval-tag approval-tag-approved"
      :class="{ dimmed: !checked }"
    >
      <Tag
        :severity="getApprovalStatusSeverity(ProjectNodeApprovalStatus.APPROVED)"
        :value="ProjectNodeApprovalStatus.APPROVED"
      />
    </div>
  </div>
</template>

<style lang="scss" scoped>
.approval-toggle {
  display: flex;
  align-items: center;
}

.approval-tag {
  padding: 0.3em;

  &.dimmed {
    opacity: 0.5;
  }
}
</style>
