<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    loading: boolean;
    initialStartDate?: Date;
    initialEndDate?: Date;
  }>(),
  {
    initialStartDate: () => new Date(Date.now() - 5 * 60 * 1000),
    initialEndDate: () => new Date(),
  },
);

const emit = defineEmits<{
  applyDateFilter: [
    startDate: Date | undefined,
    endDate: Date | undefined,
    limit: number,
  ];
}>();

const startDate = ref<Date>(props.initialStartDate);
const endDate = ref<Date>(props.initialEndDate);
const queryLimit = ref<number>(50);

onMounted(() => {
  emit(
    "applyDateFilter",
    startDate.value,
    endDate.value,
    queryLimit.value ?? 50,
  );
});

const isInvalidRange = computed(
  () => startDate.value && endDate.value && endDate.value < startDate.value,
);

function applyFilter() {
  emit(
    "applyDateFilter",
    startDate.value,
    endDate.value,
    queryLimit.value ?? 50,
  );
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
                  v-model="startDate"
                  inputId="startdate_label"
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
                  v-model="endDate"
                  inputId="enddate_label"
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
          <FloatLabel variant="on">
            <InputNumber
              v-model="queryLimit"
              inputId="query_limit_label"
              :min="1"
              :max="10000"
              :step="50"
              :allowEmpty="false"
              showButtons
            />
            <label for="query_limit_label">Limit</label>
          </FloatLabel>
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
