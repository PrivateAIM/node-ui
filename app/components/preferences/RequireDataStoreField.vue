<script setup lang="ts">
import { useDatastoreRequirement } from "~/composables/useDatastoreRequirement";
import ToggleSwitch from "primevue/toggleswitch";

const { datastoreState, setDatastoreRequired } =
  await useDatastoreRequirement();
const datastoreRequired = computed(
  () => datastoreState.value.datastoreRequired,
);
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
      <ToggleSwitch
        v-model="datastoreRequired"
        label="Require Data Store"
        @click="setDatastoreRequired(!datastoreRequired)"
      />
    </div>
  </div>
</template>
