<script setup lang="ts">
import RequireDataStoreField from "~/components/preferences/RequireDataStoreField.vue";
import AutostartField from "~/components/preferences/AutostartField.vue";
import Button from "primevue/button";
import Divider from "primevue/divider";
import { useNodeSettingsStore } from "~/stores/nodeSettingsStore";
import { useToast } from "primevue/usetoast";
import type { AutostartSettings } from "~/services/Api";

const preferencesVisible = defineModel<boolean>("preferencesVisible");
const loading = ref(false);
const toast = useToast();
const store = useNodeSettingsStore();

const draftRequireDataStore = ref(store.requireDataStore);
const draftAutostart = ref<AutostartSettings>({
  enabled: store.autostartEnabled,
  interval: store.autostartInterval,
});

watch(preferencesVisible, (visible) => {
  if (visible) {
    draftRequireDataStore.value = store.requireDataStore;
    draftAutostart.value.enabled = store.autostartEnabled;
    draftAutostart.value.interval = store.autostartInterval;
  }
});

async function onSubmitPreferences() {
  loading.value = true;

  const updated = await store.updateSettings({
    require_data_store: draftRequireDataStore.value,
    autostart: {
      enabled: draftAutostart.value.enabled,
      interval: draftAutostart.value.interval,
    },
  });

  if (updated) {
    toast.add({
      severity: "success",
      summary: "Update Success",
      detail: "Settings were successfully updated",
      life: 5000,
    });
  } else {
    toast.add({
      severity: "error",
      summary: "Update Failed",
      detail: "Settings could not be updated",
      life: 5000,
    });
  }

  loading.value = false;
}
</script>

<template>
  <div class="preferences-dialog-container">
    <Dialog
      v-model:visible="preferencesVisible"
      modal
      header="Node Settings"
      class="preferences-dialog-header"
      :style="{ width: '40rem' }"
    >
      <Divider />
      <div class="data-store-requirement-section">
        <RequireDataStoreField v-model="draftRequireDataStore" />
      </div>
      <Divider />
      <div class="autostart-section">
        <AutostartField v-model="draftAutostart" />
      </div>
      <div class="preferences-update-btn">
        <Button
          label="Update"
          severity="contrast"
          size="small"
          icon="pi pi-save"
          :loading="loading"
          @click="onSubmitPreferences()"
        ></Button>
      </div>
    </Dialog>
  </div>
</template>
