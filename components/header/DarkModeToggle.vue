<script lang="ts" setup>
let theme = localStorage.getItem("theme");
const darkTheme = "flame-dark";
const lightTheme = "flame-light";

function setTheme(themeName: string) {
  document.documentElement.className = themeName;
  localStorage.setItem("theme", themeName);
}

if (theme) {
  if (theme === darkTheme) {
    setTheme(darkTheme);
  }

  if (theme === lightTheme) {
    setTheme(lightTheme);
  }
}

function toggleDarkMode() {
  if (theme === darkTheme) {
    setTheme(lightTheme);
    theme = lightTheme;
  } else {
    setTheme(darkTheme);
    theme = darkTheme;
  }
}

const prefersDarkTheme = window.matchMedia("(prefers-color-scheme: dark)");
if (prefersDarkTheme.matches) {
  setTheme(darkTheme);
}

const prefersLightTheme = window.matchMedia("(prefers-color-scheme: light)");
if (prefersLightTheme.matches) {
  setTheme(lightTheme);
}
</script>

<template>
  <div class="dark-mode-toggle">
    <i class="pi pi-moon" />
    <ToggleSwitch label="Toggle Dark Mode" @click="toggleDarkMode()" />
    <i class="pi pi-sun" />
  </div>
</template>

<style lang="scss" scoped>
.dark-mode-toggle {
  display: flex;
  align-items: center;
}
</style>
