<script lang="ts" setup>
import Panel from "primevue/panel";

defineProps<{ header: string }>();
const emit = defineEmits(["closeHelp"]);
</script>

<template>
  <div class="methods-help-text">
    <Panel :header="header">
      <slot />
      <template #icons>
        <Button
          v-tooltip.top="'Close help box'"
          :size="'small'"
          aria-label="Close help box"
          class="p-panel-header-icon p-link mr-2 help-box-close-btn"
          icon="pi pi-times"
          rounded
          severity="contrast"
          variant="text"
          @click="emit('closeHelp')"
        />
      </template>
    </Panel>
  </div>
</template>

<style lang="scss" scoped></style>
