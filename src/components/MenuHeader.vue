<script lang="ts">
import { defineComponent } from "vue";
import Badge from "primevue/badge";
import Avatar from "primevue/avatar";
import InputText from "primevue/inputtext";
import Menubar from "primevue/menubar";

export default defineComponent({
  name: "MenuHeader",
  components: {
    Badge,
    Avatar,
    InputText,
    Menubar,
  },
  data() {
    return {
      items: [{ label: "Home", icon: "pi pi-home" }],
    };
  },
});
</script>

<template>
  <div id="topMenu">
    <Menubar :model="items">
      <template #item="{ item, props, hasSubmenu, root }">
        <a v-bind="props.action">
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
          <Avatar icon="pi pi-user" class="mr-2" size="xlarge" />
        </div>
      </template>
    </Menubar>
  </div>
</template>

<style scoped lang="scss">
@import "primeicons/primeicons.css";

//.p-menubar-root-list {
//  padding: 0.5rem 1rem !important;
//}
</style>
