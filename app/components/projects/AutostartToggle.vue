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
const confirmGroup = `autostart-${props.projectId}`;
const confirmAction = ref<"enable" | "disable">("enable");

const enabledAutostart = computed(
  () =>
    store.projectAutostartSettings[props.projectId] ??
    store.autostartDefaultPolicy,
);

const checked = ref(enabledAutostart.value);

watch(enabledAutostart, (value) => {
  checked.value = value;
});

const toggleAutostart = () => {
  if (checked.value) {
    confirmRejection();
  } else {
    confirmApproval();
  }
};

const confirmApproval = () => {
  confirmAction.value = "enable";
  confirm.require({
    group: confirmGroup,
    message:
      "All future analyses for this project will be automatically started as soon as this node receives the image.",
    header: "Enable Autostart Confirmation",
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
  confirmAction.value = "disable";
  confirm.require({
    group: confirmGroup,
    message: "All future analyses will need to be manually started.",
    header: "Disable Autostart Confirmation",
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
    // If no response/failed, reset the updated toggle
    checked.value = !checked.value;
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
    <ConfirmDialog :group="confirmGroup">
      <template #message="{ message }">
        <div class="autostart-confirm-message">
          <i
            class="pi pi-exclamation-triangle autostart-confirm-message-icon"
          />
          <div>
            <p>
              Are you sure you want to {{ confirmAction }} autostart for project
              <b class="autostart-confirm-project">{{ projectName }}</b
              >?
            </p>
            <p>{{ message.message }}</p>
          </div>
        </div>
      </template>
    </ConfirmDialog>
    <div
      class="autostart-status-tag autostart-tag-disabled"
      :class="{ dimmed: checked }"
    >
      <Tag severity="danger" value="disabled" />
    </div>
    <ToggleSwitch
      v-model="checked"
      :disabled="loading"
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

.autostart-confirm-message {
  display: flex;
  gap: 1rem;
  align-items: center;
}

.autostart-confirm-message-icon {
  font-size: 4rem;
  color: var(--icon-warning);
}

.autostart-confirm-icon {
  font-size: 1.5rem;
}

.autostart-confirm-project {
  color: var(--p-primary-color);
}
</style>
