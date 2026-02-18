<script lang="ts" setup>
import Menu from "primevue/menu";
import Button from "primevue/button";
import { useRuntimeConfig } from "#app";
import CleanupDialog from "~/components/header/CleanupDialog.vue";

const { signIn, signOut, status, data } = useAuth();

const menu = ref();

const { datastoreState, setDatastoreRequired } =
  await useDatastoreRequirement();
const datastoreRequired = computed(
  () => datastoreState.value.datastoreRequired,
);

const config = useRuntimeConfig();
const baseUrl = new URL(config.public.baseUrl).origin;
const idpProvider = config.public.idpProvider;

const isAuthenticated = ref(status.value === "authenticated");
const showCleanupDialog = ref(false);

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
        disabled: !isAuthenticated.value,
      },
      {
        label: "Require Data Store",
        icon: "pi pi-database",
        isToggle: true, // custom flag to identify it in the slot
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
          v-if="item.isToggle"
          v-ripple
          class="flex items-center"
          v-bind="props.action"
          @click.prevent="setDatastoreRequired(!datastoreRequired)"
        >
          <i :class="item.icon" />
          <span class="ml-2 menu-item-label">{{ item.label }}</span>
          <ToggleSwitch
            :modelValue="datastoreRequired ?? false"
            class="ml-auto"
            @click.stop="setDatastoreRequired(!datastoreRequired)"
          />
        </a>
        <a
          v-else
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
