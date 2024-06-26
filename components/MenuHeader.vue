<script setup lang="ts">
import { ref } from "vue";
import { NavMenu } from "#components";
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
    label: "Settings",
    icon: "pi pi-spin pi-cog",
  },
]);
</script>

<template>
  <div class="menuBar">
    <Menubar :model="items">
      <template #start>
        <NavMenu />
      </template>
      <template #item="{ item, props, hasSubmenu }">
        <router-link
          v-if="item.route"
          v-slot="{ href, navigate }"
          :to="item.route"
          custom
        >
          <a v-ripple :href="href" v-bind="props.action" @click="navigate">
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
