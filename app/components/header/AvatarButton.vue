<script lang="ts" setup>
import Menu from "primevue/menu";
import Button from "primevue/button";
import { useRuntimeConfig } from "nuxt/app";
import CleanupDialog from "~/components/header/CleanupDialog.vue";

const { signIn, signOut } = useAuth();
const { status: authStatus, data: authData } = useAuthState();

const menu = ref();
const showCleanupDialog = ref(false);
const showPreferencesDialog = ref(false);

const config = useRuntimeConfig();
const baseUrl = new URL(config.public.baseUrl as string).origin;
const idpProvider = config.public.idpProvider;

const isAuthenticated = computed(() => authStatus.value === "authenticated");

const toggle = (event) => {
  menu.value.toggle(event);
};

const menuItems = computed(() => [
  {
    label: "Options",
    items: [
      {
        label: isAuthenticated.value ? "Logout" : "Login",
        icon: isAuthenticated.value ? "pi pi-sign-in" : "pi pi-sign-out",
        command: () => {
          // eslint-disable-next-line @typescript-eslint/no-unused-expressions
          isAuthenticated.value ? signOut() : signIn(`${idpProvider}`);
        },
      },
      {
        label: "Node Keycloak Admin",
        icon: "pi pi-external-link",
        url: `${baseUrl}/keycloak/admin`,
        target: "_blank",
      },
      {
        label: "Clean Up Resources",
        icon: "pi pi-eject",
        command: () => {
          showCleanupDialog.value = true;
        },
        visible: isAuthenticated.value,
        disabled: !isAuthenticated.value,
      },
      {
        label: "Preferences",
        icon: "pi pi-cog",
        command: () => {
          showPreferencesDialog.value = true;
        },
        visible: isAuthenticated.value,
        disabled: !isAuthenticated.value,
      },
    ],
  },
]);
</script>

<template>
  <div class="container">
    <div v-if="isAuthenticated" class="avatar-container">
      <p class="username-menu-bar">
        {{ authData?.user?.name || "Swell Person" }}
      </p>
      <Button
        aria-controls="overlay_menu"
        aria-haspopup="true"
        class="avatar-btn avatar-btn-logged-in"
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
        class="avatar-btn avatar-btn-logged-out"
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
  <CleanupDialog v-model:cleanUpVisible="showCleanupDialog" />
  <PreferencesDialog v-model:preferencesVisible="showPreferencesDialog" />
</template>

<style lang="scss" scoped>
.avatar-container {
  display: flex;
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
