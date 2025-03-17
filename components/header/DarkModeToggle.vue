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
  } else {
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

document.documentElement.classList.toggle(
  darkTheme,
  theme === darkTheme ||
    (!("theme" in localStorage) &&
      window.matchMedia("(prefers-color-scheme: dark)").matches),
);

const checked = ref(theme === lightTheme);
</script>

<template>
  <div class="dark-mode-toggle">
    <div class="dark-mode-toggle-icon">
      <i class="pi pi-moon" />
    </div>
    <ToggleSwitch
      v-model="checked"
      label="Toggle Dark Mode"
      @click="toggleDarkMode()"
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
