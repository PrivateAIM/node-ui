<script setup lang="ts">
import type { AutostartSettings } from "~/services/Api";

const autostartModel = defineModel<AutostartSettings>({ required: true });
</script>

<template>
  <div class="settings-field autostart-enabled-field">
    <div class="settings-description">
      <h3 class="settings-description-title">Autostart Analyses</h3>
      <span class="setting-description-text">
        Toggle the autostart feature. When enabled, individual projects can be
        configured to allow associated analyses to immediately start as soon as
        their image arrives at your node. If a data store is required for the
        analysis to run and is not yet configured for the project, the analysis
        will not start.
      </span>
    </div>
    <div class="settings-control autostart-toggle">
      <ToggleSwitch
        v-model="autostartModel.enabled!"
        label="Autostart Analyses"
      />
    </div>
  </div>
  <div class="settings-subsection">
    <Divider type="dashed" />
    <div
      class="settings-field autostart-default-policy-field"
      :class="{ disabled: !autostartModel.enabled }"
    >
      <div class="settings-description">
        <h4 class="settings-description-title">Default Autostart Policy</h4>
        <span class="setting-description-text">
          The default autostart policy assigned to new projects registered in
          the Hub for this node. When enabled, new projects will have autostart
          enabled for their analyses by default. Autostart settings for
          individual projects can still be configured in the Projects table.
        </span>
      </div>
      <div class="settings-control autostart-toggle">
        <ToggleSwitch
          v-model="autostartModel.default_project_autostart_policy!"
          label="Default Autostart Policy"
        />
      </div>
    </div>
    <Divider type="dashed" />
    <div
      class="settings-field autostart-interval-field"
      :class="{ disabled: !autostartModel.enabled }"
    >
      <div class="settings-description">
        <h4 class="settings-description-title">Autostart Interval</h4>
        <span class="setting-description-text">
          How often (in seconds) the Hub should be queried to check for new
          analyses.
        </span>
      </div>
      <div class="settings-control autostart-interval-input">
        <InputNumber
          v-model="autostartModel.interval"
          :disabled="!autostartModel.enabled"
          :min="1"
          :invalid="autostartModel.enabled === null"
          label="Autostart Analyses"
          fluid
        />
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss"></style>
