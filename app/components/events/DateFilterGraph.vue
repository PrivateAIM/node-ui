<script setup lang="ts">
import DatePicker from "primevue/datepicker";
import Toolbar from "primevue/toolbar";
import FloatLabel from "primevue/floatlabel";

const props = defineProps<{
  eventCount: number;
  loading: boolean;
}>();

const emit = defineEmits<{
  applyDateFilter: [startDate: Date | undefined, endDate: Date | undefined];
}>();

const startDate = ref<Date>();
const endDate = ref<Date>();

const isInvalidRange = computed(
  () => !!(startDate.value && endDate.value && endDate.value < startDate.value),
);

function applyFilter() {
  emit("applyDateFilter", startDate.value, endDate.value);
}
</script>

<template>
  <div class="custom-filter-header">
    <Toolbar>
      <template #start>
        <div class="custom-filter-header-start">
          <h2 class="font-bold">Event Viewer</h2>
        </div>
      </template>
      <template #center>
        <div class="custom-filter-header-center">
          <div class="custom-filter-date-container">
            <div class="custom-filter-startdate-form">
              <FloatLabel class="w-full" variant="on">
                <DatePicker
                  inputId="startdate_label"
                  v-model="startDate"
                  :invalid="isInvalidRange"
                  showIcon
                  showTime
                  hourFormat="24"
                  showClear
                  iconDisplay="input"
                />
                <label for="startdate_label">Start Date</label>
              </FloatLabel>
            </div>
            <div class="custom-filter-date-separator">
              <span>-</span>
            </div>
            <div class="custom-filter-enddate-form">
              <FloatLabel class="w-full" variant="on">
                <DatePicker
                  inputId="enddate_label"
                  v-model="endDate"
                  :invalid="isInvalidRange"
                  showIcon
                  showTime
                  hourFormat="24"
                  showClear
                  iconDisplay="input"
                />
                <label for="enddate_label">End Date</label>
              </FloatLabel>
            </div>
            <div class="custom-date-filter-submit-btn">
              <Button
                label="Apply"
                :loading="props.loading"
                :disabled="isInvalidRange"
                @click="applyFilter()"
              />
            </div>
          </div>
        </div>
      </template>
      <template #end>
        <div class="custom-filter-header-end">
          <span
            v-if="props.eventCount !== 1"
            v-tooltip.left="'Total number of events currently shown'"
          >
            <b> {{ props.eventCount }} events </b>
          </span>
          <span v-else v-tooltip.left="'Total number of events currently shown'">
            <b> {{ props.eventCount }} event </b>
          </span>
        </div>
      </template>
    </Toolbar>
  </div>
</template>

<style scoped lang="scss">
.custom-filter-header-start h2 {
  margin-block-start: 0.5em;
  margin-block-end: 0.5em;
}

.custom-filter-date-container {
  display: flex;
  align-items: center;
}

.custom-filter-date-separator {
  margin: 0 1rem 0 1rem;
  font-weight: bold;
  font-size: 1.25rem;
}

.custom-date-filter-submit-btn {
  margin-left: 1rem;
}
</style>