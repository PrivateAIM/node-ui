<script setup lang="ts">
import ToggleSwitch from "primevue/toggleswitch";
import { ref } from "vue";

const periodicRefresh = ref(false);
</script>

<template>
  <div class="log-toggle-switch">
    <span style="font-size: 12px; padding-right: 0.5em">
      Refresh periodically
    </span>
    <div v-tooltip.top="'Refresh logs every 5 seconds'"></div>
    <ToggleSwitch
      v-model="periodicRefresh"
      id="refreshBtn"
      class="refresh-toggle"
    />
  </div>
</template>

<style scoped lang="scss">
.log-toggle-switch {
  display: flex;
  align-items: center;
}
</style>
