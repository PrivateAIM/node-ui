<script setup>
import { ref } from "vue";

const items = ref([
  {
    label: "Nav Menu",
    items: [
      {
        label: "Containers",
        icon: "pi pi-warehouse",
      },
      {
        label: "Images",
        icon: "pi pi-database",
      },
    ],
  },
]);

const menu = ref();
const toggle = (event) => {
  menu.value.toggle(event);
};
</script>

<template>
  <div>
    <Button
      type="button"
      icon="pi pi-bars"
      @click="toggle"
      aria-haspopup="true"
      aria-controls=""
      class="sideMenuButton"
    />
    <Menu ref="menu" :model="items" :popup="true">
      <template #item="{ item, props }">
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
        </a>
      </template>
    </Menu>
  </div>
</template>

<style scoped>
.sideMenuButton {
  background-color: yellow;
}

.ml-2 {
  margin-left: 5px;
}
</style>
