<script setup lang="ts">
import { ref } from "vue";
const { signIn, signOut, status, data } = useAuth();

const menu = ref();

const config = useRuntimeConfig();
const keycloakUrl = new URL(config.public.keycloak).origin;

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
          isAuthenticated.value ? signOut() : signIn("keycloak");
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
  <div class="container">
    <div v-if="isAuthenticated" class="avatar-container">
      <p class="username-menu-bar">
        {{ data?.user?.name || "Swell Person" }}
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
  </div>
</template>

<style scoped lang="scss">
.menu-item-label {
  margin-left: 10px;
}

.avatar-container {
  display: flex;
}

.username-menu-bar {
  vertical-align: center;
  margin-right: 15px;
  height: auto;
  font-weight: bold;
}
</style>
