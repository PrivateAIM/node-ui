<script setup lang="ts">
import {
  EventLogLevelTag,
  EventMiscTag,
  EventServiceTag,
  type EventTag,
} from "~/types/eventTag";
import Checkbox from "primevue/checkbox";
import Panel from "primevue/panel";
import Accordion from "primevue/accordion";
import AccordionPanel from "primevue/accordionpanel";
import AccordionHeader from "primevue/accordionheader";
import AccordionContent from "primevue/accordioncontent";

export interface AppliedEventFilter {
  filterType: EventTag;
  name: string;
}

// const appliedFilters = ref<AppliedEventFilter[] | null>(null);
const selectedFilters = ref([]);
</script>

<template>
  <div class="event-viewer-filter-container">
    <Panel header="Filters" toggleable>
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
                v-model="selectedFilters"
                :inputId="index"
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
                v-model="selectedFilters"
                :inputId="index"
                :value="tagName"
              />
              <label :for="index">{{ tagName }}</label>
            </div>
          </AccordionContent>
        </AccordionPanel>
        <AccordionPanel value="2">
          <AccordionHeader>Miscellaneous</AccordionHeader>
          <AccordionContent>
            <div
              v-for="(tagName, index) in EventMiscTag"
              :key="index"
              class="flex items-center gap-2"
            >
              <Checkbox
                v-model="selectedFilters"
                :inputId="index"
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

<style scoped lang="scss"></style>
