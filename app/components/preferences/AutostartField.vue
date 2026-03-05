<script setup lang="ts">
import ToggleSwitch from "primevue/toggleswitch";
import type { AutostartSettings } from "~/services/Api";
import Divider from "primevue/divider";

const autostartModel = defineModel<AutostartSettings>({ required: true });
</script>

<template>
  <div class="settings-field autostart-enabled-field">
    <div class="settings-description">
      <h3 class="settings-description-title">Autostart Analyses</h3>
      <span class="setting-description-text"
        >Immediately start an analysis as soon as it is detected in the hub for
        the current node. If a data store is required for the analysis to run
        and is not yet configured, it will not be started.</span
      >
    </div>
    <div class="settings-control autostart-toggle">
      <ToggleSwitch
        v-model="autostartModel.enabled!"
        label="Autostart Analyses"
      />
    </div>
  </div>
  <Divider />
  <div class="settings-field autostart-interval-field">
    <div class="settings-description">
      <h3 class="settings-description-title">Autostart Interval</h3>
      <span class="setting-description-text"
        >How often (in seconds) the Hub should be queried to check for new
        analyses.</span
      >
    </div>
    <div class="settings-control autostart-interval-input">
      <InputNumber
        v-model="autostartModel.interval"
        v-tooltip.top="{
          value: 'Autostart is disabled!',
          disabled: autostartModel.enabled,
        }"
        :disabled="!autostartModel.enabled"
        :min="1"
        :invalid="autostartModel.enabled === null"
        label="Autostart Analyses"
        fluid
      />
    </div>
  </div>
</template>

<style scoped lang="scss"></style>
