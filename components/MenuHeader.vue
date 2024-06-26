<script setup lang="ts">
import { ref } from "vue";
const { loggedIn } = useOidcAuth();

const items = ref([
  {
    label: "Home",
    icon: "pi pi-home",
    route: "/",
  },
  {
    label: "About",
    icon: "pi pi-at",
    route: "/about",
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
        label: "List Data Stores",
        icon: "pi pi-database",
        route: "/data-stores",
      },
      {
        label: "Create Data Store",
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
            :class="!loggedIn && item.label != 'Home' ? 'p-disabled' : ''"
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
          :class="!loggedIn && item.label != 'Home' ? 'p-disabled' : ''"
        >
          <span :class="item.icon" />
          <span class="ml-2">{{ item.label }}</span>
          <span v-if="hasSubmenu" class="pi pi-fw pi-angle-down ml-2" />
        </a>
      </template>
      <template #end>
        <div class="flex align-items-center gap-2">
          <Avatar
            v-if="loggedIn"
            icon="pi pi-verified"
            class="userIcon"
            size="large"
            shape="circle"
          />
          <Avatar
            v-else
            icon="pi pi-question"
            class="userIcon"
            size="large"
            shape="circle"
          />
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
