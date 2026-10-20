<script lang="ts" setup>
const props = defineProps({
  disabled: Boolean,
  startEnabled: Boolean,
});

defineEmits(["change"]);

const periodicRefresh = ref(props.startEnabled);

const tooltip = props.disabled
  ? "Refresh disabled since there is no current active run"
  : "Refresh logs every 5 seconds";
</script>

<template>
  <ToggleButton
    id="refreshBtn"
    v-model="periodicRefresh"
    v-tooltip.top="tooltip"
    :disabled="props.disabled"
    onLabel="Refresh Logs On"
    offLabel="Refresh Logs Off"
    onIcon="pi pi-spin pi-refresh"
    offIcon="pi pi-refresh"
    class="log-timestamp-toggle"
    @change="$emit('change')"
  />
</template>
