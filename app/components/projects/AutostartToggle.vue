<script lang="ts" setup>
import { useToast } from "primevue/usetoast";
import Tag from "primevue/tag";
import { useConfirm } from "primevue/useconfirm";
import { useNodeSettingsStore } from "~/stores/nodeSettingsStore.ts";

const props = defineProps<{
  projectId: string;
  projectName?: string | null;
}>();

const toast = useToast();
const confirm = useConfirm();
const loading = ref(false);

const store = useNodeSettingsStore();

const checked = ref(
  store.projectAutostartSettings[props.projectId] ??
    store.autostartDefaultPolicy,
);

const toggleAutostart = () => {
  if (loading.value) {
    checked.value = !checked.value;
    return;
  }
  if (checked.value) {
    confirmRejection();
  } else {
    confirmApproval();
  }
};

const confirmApproval = () => {
  confirm.require({
    message: `Are you sure you want to enable autostart for project ${props.projectName}?\n\nAll future analyses for this project will be automatically started as soon as this node receives the image.`,
    header: "Enable Autostart Confirmation",
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
      onSubmitAutostartPreference(true);
    },
    reject: () => {
      // Reset the toggle
      checked.value = !checked.value;
    },
    onHide: () => {
      checked.value = !checked.value;
    },
  });
};

const confirmRejection = () => {
  confirm.require({
    message: `Are you sure you want to disable autostart for project ${props.projectName}?\n\nAll future analyses will need to be manually started.`,
    header: "Disable Autostart Confirmation",
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
      onSubmitAutostartPreference(false);
    },
    reject: () => {
      // Reset the toggle
      checked.value = !checked.value;
    },
    onHide: () => {
      checked.value = !checked.value;
    },
  });
};

async function onSubmitAutostartPreference(isEnabled: boolean) {
  loading.value = true;

  const updated = await store.updateSettings({
    autostart: {
      projects: { [props.projectId]: isEnabled },
    },
  });

  if (updated) {
    toast.add({
      severity: "success",
      summary: "Update Success",
      detail: "Autostart settings were successfully updated",
      life: 5000,
    });
  } else {
    toast.add({
      severity: "error",
      summary: "Update Failed",
      detail: "Autostart settings could not be updated",
      life: 5000,
    });
  }

  loading.value = false;
}
</script>

<template>
  <div class="autostart-toggle">
    <div
      class="autostart-status-tag autostart-tag-disabled"
      :class="{ dimmed: checked }"
    >
      <Tag severity="danger" value="disabled" />
    </div>
    <ToggleSwitch
      v-model="checked"
      class="autostart-toggle-switch"
      label="Autostart Toggle"
      @click="toggleAutostart()"
    />
    <div
      class="autostart-status-tag autostart-tag-enabled"
      :class="{ dimmed: !checked }"
    >
      <Tag severity="success" value="enabled" />
    </div>
  </div>
</template>

<style lang="scss" scoped>
.autostart-toggle {
  display: flex;
  align-items: center;
}

.autostart-status-tag {
  padding: 0.3em;

  &.dimmed {
    opacity: 0.5;
  }
}

.p-dialog-content {
  white-space: pre-line;
}
</style>
