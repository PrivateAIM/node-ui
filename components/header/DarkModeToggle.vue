<script lang="ts" setup>
import { useDark, useToggle } from "@vueuse/core";
import ToggleSwitch from "primevue/toggleswitch";

const isDark = useDark({
  selector: "html",
  attribute: "class",
  valueDark: "flame-dark",
  valueLight: "flame-light",
  initOnMounted: true,
});
const checked = ref(!isDark.value);
const toggleDark = useToggle(isDark);
</script>

<template>
  <div class="dark-mode-toggle">
    <div class="dark-mode-toggle-icon">
      <i class="pi pi-moon" />
    </div>
    <ToggleSwitch
      v-model="checked"
      class="dark-mode-toggle-switch"
      label="Toggle Dark Mode"
      @click="toggleDark()"
    />
    <div class="dark-mode-toggle-icon">
      <i class="pi pi-sun" />
    </div>
  </div>
</template>

<style lang="scss" scoped>
.dark-mode-toggle {
  display: flex;
  align-items: center;
}

.dark-mode-toggle-icon {
  padding: 0.3em;
}
</style>
