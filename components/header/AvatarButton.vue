<script lang="ts" setup>
import Menu from "primevue/menu";
import Button from "primevue/button";
import { useRuntimeConfig } from "#app";

const { signIn, signOut, status, data } = useAuth();

const menu = ref();

const config = useRuntimeConfig();
let internalKeycloakAdminUrl: string;
const baseUrl = new URL(config.public.baseUrl).origin;
const idpProvider = config.public.idpProvider;
const internalKeycloakUrl = config.public.internalKeycloakUrl
  ? new URL(config.public.internalKeycloakUrl)
  : "";

if (internalKeycloakUrl) {
  internalKeycloakAdminUrl = `${internalKeycloakUrl}/admin`;
} else {
  internalKeycloakAdminUrl = `${baseUrl}/keycloak/admin`;
}

const isAuthenticated = ref(status.value === "authenticated");

const userActionLabel = isAuthenticated.value ? "Logout" : "Login";
const userActionIcon = isAuthenticated.value
  ? "pi pi-sign-in"
  : "pi pi-sign-out";

const menuItems = ref([
  {
    label: "Options",
    items: [
      {
        label: userActionLabel,
        icon: userActionIcon,
        command: () => {
          isAuthenticated.value ? signOut() : signIn(`${idpProvider}`);
        },
      },
      {
        label: "Node Keycloak Admin",
        icon: "pi pi-external-link",
        url: internalKeycloakAdminUrl,
        target: "_blank",
      },
    ],
  },
]);

const toggle = (event) => {
  menu.value.toggle(event);
};
</script>

<template>
  <div class="container">
    <div v-if="isAuthenticated" class="avatar-container">
      <p class="username-menu-bar">
        {{ data?.user?.name || "Swell Person" }}
      </p>
      <Button
        aria-controls="overlay_menu"
        aria-haspopup="true"
        class="avatar-btn"
        icon="pi pi-user"
        rounded
        severity="contrast"
        type="button"
        @click="toggle"
      />
    </div>
    <div v-else>
      <Button
        aria-controls="overlay_menu"
        aria-haspopup="true"
        class="avatar-btn"
        icon="pi pi-question"
        rounded
        severity="contrast"
        type="button"
        @click="toggle"
      />
    </div>
    <Menu
      id="overlay_menu"
      ref="menu"
      :model="menuItems"
      :popup="true"
      class="avatar-menu"
    >
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

<style lang="scss" scoped>
.avatar-container {
  display: flex;
}

.menu-item-label {
  margin-left: 10px;
}

.avatar-container {
  display: flex;
  align-items: center;
}

.username-menu-bar {
  vertical-align: center;
  margin-right: 15px;
  height: auto;
  font-weight: bold;
}
</style>
