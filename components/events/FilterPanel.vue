<script setup lang="ts">
import {
  EventLogLevelTag,
  EventServiceTag,
  type EventTag,
} from "~/types/eventTag";
import Checkbox from "primevue/checkbox";
import Panel from "primevue/panel";
import Accordion from "primevue/accordion";
import AccordionPanel from "primevue/accordionpanel";
import AccordionHeader from "primevue/accordionheader";
import AccordionContent from "primevue/accordioncontent";

const modelValue = defineModel<EventTag[]>({ default: [] });
const emit = defineEmits(["clearTagFilter"]);

function clearFilters() {
  emit("clearTagFilter");
}
</script>

<template>
  <div class="event-viewer-filter-container">
    <Panel header="Filters" toggleable>
      <template #header>
        <div class="event-viewer-filter-panel-header">
          <div class="event-viewer-filter-panel-header-title">
            <span>
              <b>Filters</b>
            </span>
          </div>
          <div class="event-viewer-filter-panel-header-clear-btn">
            <Button
              icon="pi pi-filter-slash"
              @click="clearFilters()"
              size="small"
              variant="outlined"
              severity="contrast"
              v-tooltip.top="'Clear the applied filters'"
              raised
              rounded
            />
          </div>
        </div>
      </template>
      <Accordion :value="['0']" multiple>
        <AccordionPanel value="0">
          <AccordionHeader>Services</AccordionHeader>
          <AccordionContent>
            <div
              v-for="(tagName, index) in EventServiceTag"
              :key="index"
              class="flex items-center gap-2"
            >
              <Checkbox
                v-model="modelValue"
                :inputId="`service-${index}`"
                :value="tagName"
              />
              <label :for="index">{{ tagName }}</label>
            </div>
          </AccordionContent>
        </AccordionPanel>
        <AccordionPanel value="1">
          <AccordionHeader>Log Level</AccordionHeader>
          <AccordionContent>
            <div
              v-for="(tagName, index) in EventLogLevelTag"
              :key="index"
              class="flex items-center gap-2"
            >
              <Checkbox
                v-model="modelValue"
                :inputId="`loglevel-${index}`"
                :value="tagName"
              />
              <label :for="index">{{ tagName }}</label>
            </div>
          </AccordionContent>
        </AccordionPanel>
      </Accordion>
    </Panel>
  </div>
</template>

<style scoped lang="scss">
.event-viewer-filter-panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.event-viewer-filter-panel-header-title {
  margin-right: 0.8rem;
}
</style>
