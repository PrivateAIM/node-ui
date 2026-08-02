<script lang="ts" setup>
import Menubar from "primevue/menubar";
import Button from "primevue/button";
import AvatarButton from "~/components/header/AvatarButton.vue";
import DarkModeToggle from "~/components/header/DarkModeToggle.vue";
import { RouterLink } from "vue-router";

const { status } = useAuthState();

const isAuthenticated = computed(() => status.value === "authenticated");
const showPreferencesDialog = ref(false);

const allLinks = [
  {
    label: "Home",
    icon: "pi pi-home",
    route: "/",
  },
  {
    label: "Projects",
    icon: "pi pi-objects-column",
    route: "/projects",
  },
  {
    label: "Analyses",
    icon: "pi pi-lightbulb",
    route: "/analyses",
  },
  {
    label: "Data Stores",
    icon: "pi pi-warehouse",
    items: [
      {
        label: "Create",
        icon: "pi pi-plus",
        route: "/data-stores/create",
      },
      {
        label: "Manage",
        icon: "pi pi-wrench",
        route: "/data-stores",
      },
    ],
  },
  {
    label: "Events",
    icon: "pi pi-list",
    route: "/events",
  },
  {
    label: "Uptime",
    icon: "pi pi-wave-pulse",
    route: "/uptime",
  },
];

const links = computed(() =>
  status.value === "unauthenticated"
    ? allLinks.filter((item) => item.label === "Home")
    : allLinks,
);
</script>

<template>
  <div class="menuBar">
    <Menubar :model="links" class="menu-bar-header">
      <template #item="{ item, props, hasSubmenu }">
        <div v-ripple class="p-ripple border-round menu-bar-item">
          <router-link
            v-if="item.route"
            v-slot="{ href, navigate }"
            :to="item.route"
            custom
          >
            <a :href="href" v-bind="props.action" @click="navigate">
              <span :class="item.icon" />
              <span class="ml-2 menu-item-label">{{ item.label }}</span>
            </a>
          </router-link>
          <a
            v-else
            :href="item.url"
            :target="item.target"
            v-bind="props.action"
          >
            <span :class="item.icon" />
            <span class="ml-2 menu-item-label">{{ item.label }}</span>
            <span v-if="hasSubmenu" class="pi pi-fw pi-angle-down ml-2" />
          </a>
        </div>
      </template>
      <template #end>
        <div class="header-end">
          <DarkModeToggle />
          <div v-if="isAuthenticated" class="preferences-btn">
            <Button
              aria-label="Preferences"
              icon="pi pi-cog"
              severity="contrast"
              size="small"
              variant="outlined"
              @click="showPreferencesDialog = true"
            />
          </div>
          <div class="flex align-items-center gap-2 avatar-button">
            <AvatarButton />
          </div>
        </div>
      </template>
    </Menubar>
    <PreferencesDialog v-model:preferencesVisible="showPreferencesDialog" />
  </div>
</template>

<style lang="scss" scoped>
.brand-mark {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  padding-right: 1rem;
  margin-right: 0.25rem;
  border-right: 1px solid var(--p-menubar-border-color);
  text-decoration: none;
}

.brand-icon {
  color: var(--p-primary-color);
  font-size: 1.25rem;
}

.brand-name {
  font-weight: 800;
  font-size: 1rem;
  letter-spacing: 0.08em;
  color: var(--p-primary-color);
}

.menu-item-label {
  margin-left: 0.1rem;
}

.menu-bar-header {
  border-radius: 0;
  box-shadow:
    0 2px 8px rgba(0, 0, 0, 0.08),
    0 1px 2px rgba(0, 0, 0, 0.06);
}

.menu-bar-header .menu-bar-item {
  border-radius: inherit;
  font-weight: 600;
  transition: background-color 0.15s ease;
}

.menu-bar-header .menu-bar-item:hover {
  background-color: color-mix(in srgb, var(--p-primary-color) 18%, transparent);
}

.header-end {
  display: flex;
  align-items: center;
}

.preferences-btn {
  margin-left: 0.5rem;
}

.avatar-button {
  margin-left: 1.5rem;
}
</style>
