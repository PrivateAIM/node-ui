<script lang="ts" setup>
import Menubar from "primevue/menubar";
import AvatarButton from "~/components/header/AvatarButton/AvatarButton.vue";
import DarkModeToggle from "~/components/header/DarkModeToggle.vue";
import { RouterLink } from "#vue-router";
import DataRequirementToggle from "~/components/header/AvatarButton/DataRequirementToggle.vue";

const { status } = useAuth();

const items = ref([
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
    label: "Events",
    icon: "pi pi-list",
    route: "/events",
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
]);
</script>

<template>
  <div class="menuBar">
    <Menubar :model="items" class="menu-bar-header">
      <template #start></template>
      <template #item="{ item, props, hasSubmenu }">
        <div v-ripple class="p-ripple border-round menu-bar-item">
          <router-link
            v-if="item.route"
            v-slot="{ href, navigate }"
            :to="item.route"
            custom
          >
            <a
              :class="
                status === 'unauthenticated' && item.label !== 'Home'
                  ? 'p-disabled'
                  : 'enabled'
              "
              :href="href"
              v-bind="props.action"
              @click="navigate"
            >
              <span :class="item.icon" />
              <span class="ml-2 menu-item-label">{{ item.label }}</span>
            </a>
          </router-link>
          <a
            v-else
            :class="
              status === 'unauthenticated' && item.label !== 'Home'
                ? 'p-disabled'
                : 'enabled'
            "
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
          <DataRequirementToggle />
          <DarkModeToggle />
          <div class="flex align-items-center gap-2 avatar-button">
            <AvatarButton />
          </div>
        </div>
      </template>
    </Menubar>
  </div>
</template>

<style lang="scss" scoped>
.menu-item-label {
  margin-left: 0.1rem;
}

.menu-bar-header {
  border-radius: 0;
}

.menu-bar-header .menu-bar-item {
  border-radius: inherit;
  font-weight: 600;
}

.header-end {
  display: flex;
  align-items: center;
}

.avatar-button {
  margin-left: 1.5em;
}
</style>
