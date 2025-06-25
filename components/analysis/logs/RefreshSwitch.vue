<script lang="ts" setup>
import ToggleSwitch from "primevue/toggleswitch";

const props = defineProps({
  disabled: Boolean,
});

const periodicRefresh = ref(false);
const tooltip = props.disabled
  ? "Refresh disabled since there is no current active run"
  : "Refresh logs every 5 seconds";
</script>

<template>
  <div class="log-toggle-switch">
    <div>
      <span style="font-size: 12px; padding-right: 0.5em">
        Refresh periodically
      </span>
    </div>
    <div v-tooltip.top="tooltip" class="refresh-toggle">
      <ToggleSwitch
        id="refreshBtn"
        v-model="periodicRefresh"
        :disabled="props.disabled"
      />
    </div>
  </div>
</template>

<style lang="scss" scoped>
.log-toggle-switch {
  display: flex;
}
</style>
