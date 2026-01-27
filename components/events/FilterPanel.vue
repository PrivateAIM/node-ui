<script setup lang="ts">
import {
  EventLogLevelTag,
  EventServiceTag,
  type EventTag,
} from "~/types/eventTag";
import Panel from "primevue/panel";
import PanelMenu from "primevue/panelmenu";

const modelValue = defineModel<EventTag[]>({ default: [] });
const emit = defineEmits(["clearTagFilter"]);

const serviceTags = Object.values(EventServiceTag);
const logLevelTags = Object.values(EventLogLevelTag);
const tagFilterMenuItems = ref([
  {
    label: "Services",
    icon: "pi pi-file",
    items: serviceTags.map((tag: EventServiceTag) => ({ label: tag })),
  },
  {
    label: "Log Level",
    icon: "pi pi-cloud",
    items: logLevelTags.map((tag: EventLogLevelTag) => ({ label: tag })),
  },
]);

function returnChevron(isActive: boolean) {
  return isActive ? "pi pi-chevron-down" : "pi pi-chevron-right";
}

function clearFilters() {
  emit("clearTagFilter");
}
</script>

<template>
  <div class="event-viewer-filter-container">
    <Panel toggleable>
      <template #header>
        <div class="event-viewer-filter-panel-header">
          <div
            class="event-viewer-filter-panel-header-title event-viewer-filter-panel-header-component"
          >
            <span>
              <b>Tag Filters</b>
            </span>
          </div>
          <div
            class="event-viewer-filter-panel-header-clear-btn event-viewer-filter-panel-header-component"
          >
            <Button
              icon="pi pi-filter-slash"
              @click="clearFilters()"
              size="small"
              variant="text"
              severity="contrast"
              v-tooltip.top="'Clear the applied filters'"
              rounded
            />
          </div>
        </div>
      </template>
      <div class="flex justify-center">
        <PanelMenu :model="tagFilterMenuItems" multiple class="w-full md:w-80">
          <template #item="{ item, active, hasSubmenu }">
            <div
              v-if="!hasSubmenu"
              class="event-viewer-filter-container-filter-item"
            >
              <Checkbox
                v-model="modelValue"
                size="small"
                :inputId="`loglevel-${item.label}`"
                :value="item.label"
              />
              <label
                for="item.label"
                class="event-viewer-filter-container-filter-item-label"
                >{{ item.label }}</label
              >
            </div>
            <div v-else class="event-viewer-filter-container-filter-category">
              <i
                :class="returnChevron(active)"
                class="p-panelmenu-submenu-icon"
              />
              <span class="p-panelmenu-header-label">{{ item.label }}</span>
            </div>
          </template>
        </PanelMenu>
      </div>
    </Panel>
  </div>
</template>

<style scoped lang="scss">
.event-viewer-filter-panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.event-viewer-filter-panel-header-component {
  margin-right: 0.8rem;
}

.event-viewer-filter-container-filter-item {
  margin-bottom: 0.5rem;
  display: flex;
  padding: 0.2rem;
  align-items: center;
}

.event-viewer-filter-container-filter-item-label {
  margin-left: 0.5em;
}

.event-viewer-filter-container-filter-category {
  display: flex;
  gap: var(--p-panelmenu-item-padding);
  padding: var(--p-panelmenu-item-padding);
  align-items: center;
}
</style>
