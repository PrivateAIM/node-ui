<script setup lang="ts">
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
          class="p-panel-header-icon p-link mr-2 help-box-close-btn"
          icon="pi pi-times"
          severity="contrast"
          v-tooltip.top="'Close help box'"
          aria-label="Close help box"
          @click="emit('closeHelp')"
        />
      </template>
    </Panel>
  </div>
</template>

<style scoped lang="scss"></style>
