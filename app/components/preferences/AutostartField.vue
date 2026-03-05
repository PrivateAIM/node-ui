<script setup lang="ts">
import ToggleSwitch from "primevue/toggleswitch";

const enableAutostart = ref(false);
</script>

<template>
  <div class="settings-field data-store-requirement-field">
    <div class="settings-description data-store-requirement-toggle-icon">
      <h3 class="settings-description-title">Autostart Analyses</h3>
      <span class="setting-description-text"
        >Immediately start an analysis as soon as it is detected in the hub for
        the current node. If a data store is required for the analysis to run
        and is not yet configured, it will not be started.</span
      >
    </div>
    <div class="settings-control autostart-toggle">
      <ToggleSwitch v-model="enableAutostart" label="Autostart Analyses" />
    </div>
  </div>
</template>

<style scoped lang="scss"></style>
