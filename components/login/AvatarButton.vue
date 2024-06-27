<script setup lang="ts">
import { ref } from "vue";
const { loggedIn, logout, login } = useOidcAuth();

const menu = ref();
const loggedOutUserMenuItems = ref([
  {
    label: "Options",
    items: [
      {
        label: "Login",
        icon: "pi pi-sign-in",
        command: () => {
          login();
        },
      },
    ],
  },
]);
const loggedInUserMenuItems = ref([
  {
    label: "Options",
    items: [
      {
        label: "Logout",
        icon: "pi pi-sign-out",
        command: () => {
          logout();
        },
      },
    ],
  },
]);
const toggle = (event) => {
  menu.value.toggle(event);
};
</script>

<template>
  <div v-if="loggedIn">
    <Button
      type="button"
      icon="pi pi-user"
      @click="toggle"
      aria-haspopup="true"
      aria-controls="overlay_menu"
      rounded
      severity="contrast"
    />
    <Menu
      ref="menu"
      id="overlay_menu"
      :model="loggedInUserMenuItems"
      :popup="true"
    />
  </div>
  <div v-else>
    <Button
      type="button"
      icon="pi pi-question"
      @click="toggle"
      aria-haspopup="true"
      aria-controls="overlay_menu"
      rounded
      severity="secondary"
    />
    <Menu
      ref="menu"
      id="overlay_menu"
      :model="loggedOutUserMenuItems"
      :popup="true"
    />
  </div>
</template>

<style scoped lang="scss"></style>
