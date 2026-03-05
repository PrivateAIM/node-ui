<script setup lang="ts">
import RequireDataStoreField from "~/components/preferences/RequireDataStoreField.vue";
import Button from "primevue/button";
import Divider from "primevue/divider";
import AutostartField from "~/components/preferences/AutostartField.vue";
import { type UserSettings } from "~/services/Api";
import { useNuxtApp } from "nuxt/app";
import { useToast } from "primevue/usetoast";

const preferencesVisible = defineModel<boolean>("preferencesVisible");
const loading = ref(false);
const toast = useToast();

async function onSubmitPreferences() {
  loading.value = true;
  let analysisProps: UserSettings = {};

  let settingsUpdateResponse: UserSettings = (await useNuxtApp()
    .$hubApi("/analysis/initialize", {
      method: "POST",
      body: analysisProps,
    })
    .catch(() => null)) as UserSettings;

  if (settingsUpdateResponse) {
    toast.add({
      severity: "success",
      summary: "Update Success",
      detail: "Settings were successfully updated",
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
        <RequireDataStoreField />
      </div>
      <Divider />
      <div class="autostart-section">
        <AutostartField />
      </div>
      <div class="preferences-update-btn">
        <Button
          label="Update"
          severity="contrast"
          size="small"
          icon="pi pi-save"
          @click="onSubmitPreferences()"
        ></Button>
      </div>
    </Dialog>
  </div>
</template>
