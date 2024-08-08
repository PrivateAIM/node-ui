<script setup lang="ts">
import AvatarButton from "~/components/login/AvatarButton.vue";
import { useAuth } from "~/stores/auth";

const authStore = useAuth();

const user = authStore.user;

const items = ref([
  {
    label: "Home",
    icon: "pi pi-home",
    route: "/",
  },
  {
    label: "Test",
    icon: "pi pi-at",
    route: "/test",
  },
  {
    label: "Projects",
    icon: "pi pi-objects-column",
    items: [
      {
        label: "Project List",
        icon: "pi pi-clipboard",
        route: "/projects",
      },
      {
        label: "Proposals",
        icon: "pi pi-list-check",
        route: "/proposals",
      },
    ],
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
        label: "List Resources",
        icon: "pi pi-list",
        route: "/data-stores",
      },
      {
        label: "Manage Links",
        icon: "pi pi-plus",
        route: "/data-stores/create",
      },
    ],
  },
]);
</script>

<template>
  <div class="menuBar">
    <Menubar :model="items">
      <template #start> </template>
      <template #item="{ item, props, hasSubmenu }">
        <router-link
          v-if="item.route"
          v-slot="{ href, navigate }"
          :to="item.route"
          custom
        >
          <a
            v-ripple
            :href="href"
            v-bind="props.action"
            @click="navigate"
            :class="
              !authStore.isLoggedIn && item.label != 'Home' ? 'p-disabled' : ''
            "
          >
            <span :class="item.icon" />
            <span class="ml-2">{{ item.label }}</span>
          </a>
        </router-link>
        <a
          v-else
          v-ripple
          :href="item.url"
          :target="item.target"
          v-bind="props.action"
          :class="!user && item.label != 'Home' ? 'p-disabled' : ''"
        >
          <span :class="item.icon" />
          <span class="ml-2">{{ item.label }}</span>
          <span v-if="hasSubmenu" class="pi pi-fw pi-angle-down ml-2" />
        </a>
      </template>
      <template #end>
        <div class="flex align-items-center gap-2">
          <AvatarButton />
        </div>
      </template>
    </Menubar>
  </div>
</template>

<style scoped lang="scss">
.ml-2 {
  margin-left: 5px;
}
</style>
