<script setup lang="ts">
import { ref } from "vue";
import { PageSidebar } from "#components";

const items = ref([
  {
    label: "Home",
    icon: "pi pi-home",
  },
  {
    label: "About",
    icon: "pi pi-at",
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
        <PageSidebar class="h-2rem" />
      </template>
      <template #item="{ item, props, hasSubmenu, root }">
        <a v-ripple class="flex align-items-center" v-bind="props.action">
          <span :class="item.icon" />
          <span class="ml-2">{{ item.label }}</span>
          <Badge
            v-if="item.badge"
            :class="{ 'ml-auto': !root, 'ml-2': root }"
            :value="item.badge"
          />
          <span
            v-if="item.shortcut"
            class="ml-auto border-1 surface-border border-round surface-100 text-xs p-1"
            >{{ item.shortcut }}</span
          >
          <i
            v-if="hasSubmenu"
            :class="[
              'pi pi-angle-down',
              { 'pi-angle-down ml-2': root, 'pi-angle-right ml-auto': !root },
            ]"
          ></i>
        </a>
      </template>
      <template #end>
        <div class="flex align-items-center gap-2">
          <InputText
            placeholder="Search"
            type="text"
            class="w-8rem sm:w-auto"
          />
          <Avatar
            icon="pi pi-user"
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
.userIcon {
  margin-left: 20px;
}
</style>
