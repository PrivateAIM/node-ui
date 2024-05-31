<script lang="ts">
import Menu from "primevue/menu";

export default defineComponent({
  name: "PageSidebar",
  components: {
    Menu,
  },
  data() {
    return {
      items: [
        { label: "Containers", icon: "pi pi-warehouse" },
        { label: "Images", icon: "pi pi-database" },
      ],
    };
  },
});
</script>

<template>
  <Menu :model="items" class="sideMenu">
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
</template>

<style scoped lang="scss">
//.sideMenu {
//  right: 100%;
//  left: unset;
//}
</style>
