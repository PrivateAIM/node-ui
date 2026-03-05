<script setup lang="ts">
import ToggleSwitch from "primevue/toggleswitch";

const model = defineModel<boolean>({ required: true });
</script>

<template>
  <div class="settings-field data-store-requirement-field">
    <div class="settings-description data-store-requirement-toggle-icon">
      <h3 class="settings-description-title">Require Data Store</h3>
      <span class="setting-description-text"
        >Toggle to control whether an analysis requires a data store before
        being started.</span
      >
    </div>
    <div class="settings-control data-store-requirement-toggle">
      <ToggleSwitch v-model="model" label="Require Data Store" />
    </div>
  </div>
</template>
