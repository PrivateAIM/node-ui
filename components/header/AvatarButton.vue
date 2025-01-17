<script setup lang="ts">
import { ref } from "vue";
const { loggedIn, logout, login, user } = useOidcAuth();

const menu = ref();

const config = useRuntimeConfig();
const keycloakUrl = new URL(config.public.keycloak).origin;

const userActionLabel = loggedIn ? "Login" : "Logout";
const userActionIcon = loggedIn ? "pi pi-sign-in" : "pi pi-sign-out";

const menuItems = ref([
  {
    label: "Options",
    items: [
      {
        label: userActionLabel,
        icon: userActionIcon,
        command: () => {
          loggedIn ? logout() : login();
        },
      },
      {
        label: "Keycloak Admin",
        icon: "pi pi-lock",
        url: keycloakUrl,
      },
    ],
  },
]);
const toggle = (event) => {
  menu.value.toggle(event);
};
</script>

<template>
  <div class="auth-avatar">
    <div v-if="loggedIn" class="username-menu-bar">
      <p>
        {{ user.userName || "Swell Person" }}
      </p>
      <Button
        type="button"
        icon="pi pi-user"
        @click="toggle"
        aria-haspopup="true"
        aria-controls="overlay_menu"
        rounded
        severity="contrast"
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
        severity="contrast"
      />
    </div>
    <Menu ref="menu" id="overlay_menu" :model="menuItems" :popup="true">
      <template #item="{ item, props }">
        <a
          v-ripple
          :href="item.url"
          :target="item.target"
          v-bind="props.action"
        >
          <i :class="item.icon" />
          <span class="ml-2 menu-item-label">{{ item.label }}</span>
        </a>
      </template>
    </Menu>
  </div>
</template>

<style scoped lang="scss">
.auth-avatar {
  display: flex;
}

.menu-item-label {
  margin-left: 10px;
}

.username-menu-bar {
  vertical-align: center;
  margin-right: 15px;
  height: auto;
  font-weight: bold;
}
</style>
