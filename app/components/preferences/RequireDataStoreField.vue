<script setup lang="ts">
import ToggleSwitch from "primevue/toggleswitch";

const model = defineModel<boolean>({ required: true });

withDefaults(defineProps<{ disabled?: boolean }>(), { disabled: false });
</script>

<template>
  <div class="settings-field data-store-requirement-field">
    <div class="settings-description data-store-requirement-toggle-icon">
      <h3 class="settings-description-title">Require Data Store</h3>
      <span class="setting-description-text"
        >Toggle to control whether an analysis requires a data store before
        being started.</span
      >
      <span v-if="disabled" class="setting-not-applicable-text"
        >Aggregator nodes never require a data store, so this setting has no
        effect here.</span
      >
    </div>
    <div class="settings-control data-store-requirement-toggle">
      <ToggleSwitch
        v-model="model"
        :disabled="disabled"
        label="Require Data Store"
      />
    </div>
  </div>
</template>
