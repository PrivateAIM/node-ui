<script lang="ts" setup>
import { useRuntimeConfig } from "nuxt/app";
import { useToast } from "primevue/usetoast";
import { buildHubAccountUrl } from "~/utils/hub-console-url";

const { signIn, signOut } = useAuth();
const { status: authStatus, data: authData } = useAuthState();
const toast = useToast();

const menu = ref();
const showCleanupDialog = ref(false);

const config = useRuntimeConfig();
const baseUrl = new URL(config.public.baseUrl as string).origin;
const idpProvider = config.public.idpProvider;
const victoriaLogsUrl = config.public.victoriaLogsUrl as string;
const hubAccountUrl =
  idpProvider === "hub"
    ? buildHubAccountUrl(
        config.public.idpIssuer as string | undefined,
        window.location.origin,
      )
    : undefined;

const isAuthenticated = computed(() => authStatus.value === "authenticated");

const toggle = (event) => {
  menu.value.toggle(event);
};

const attemptSignIn = async () => {
  if (await checkIdpReachable(toast)) await signIn(`${idpProvider}`);
};

const menuItems = computed(() => [
  {
    label: "Options",
    items: [
      {
        label: "Account",
        icon: "pi pi-user-edit",
        url: hubAccountUrl,
        target: "_blank",
        visible: !!hubAccountUrl,
      },
      {
        label: "Node Service Admin",
        icon: "pi pi-sitemap",
        url: `${baseUrl}/keycloak/admin`,
        target: "_blank",
      },
      {
        label: "VictoriaLogs",
        icon: "pi pi-book",
        url: victoriaLogsUrl,
        target: "_blank",
        visible: !!victoriaLogsUrl,
        disabled: !isAuthenticated.value,
      },
      {
        label: "Clean Up Resources",
        icon: "pi pi-eject",
        command: () => {
          showCleanupDialog.value = true;
        },
        disabled: !isAuthenticated.value,
      },
      {
        label: "Logout",
        icon: "pi pi-sign-out",
        command: () => {
          signOut({ callbackUrl: "/" });
        },
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
    <div v-else-if="authStatus === 'loading'" class="avatar-container" />
    <div v-else>
      <Button
        variant="text"
        severity="contrast"
        type="button"
        label="Login"
        size="small"
        icon="pi pi-sign-in"
        @click="attemptSignIn()"
      />
    </div>
  </div>
  <CleanupDialog v-model:cleanUpVisible="showCleanupDialog" />
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
