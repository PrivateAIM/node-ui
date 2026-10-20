<script lang="ts" setup>
import { useDark, useToggle } from "@vueuse/core";
import Button from "primevue/button";

const isDark = useDark({
  selector: "html",
  attribute: "class",
  valueDark: "flame-dark",
  valueLight: "flame-light",
  initOnMounted: true,
});

const toggleDark = useToggle(isDark);
const themeIcon = computed(() => isDark.value ? "pi pi-moon" : "pi pi-sun");
</script>

<template>
  <div class="theme-toggle-btn">
    <Button :icon="themeIcon" severity="contrast" size="small" variant="outlined" @click="toggleDark()" />
  </div>
</template>

<style lang="scss" scoped>
</style>
