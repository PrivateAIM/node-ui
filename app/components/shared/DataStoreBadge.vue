<script lang="ts" setup>
import Badge from "primevue/badge";
import { computed } from "vue";

const props = defineProps<{
  hasDataStore: boolean;
  required: boolean;
  projectId?: string | null;
}>();

const emit = defineEmits<{
  createDataStore: [projectId?: string | null];
}>();

const missingTooltip = computed(() =>
  props.required
    ? "Data store missing, click here to create a data store for this project"
    : "Data store missing, but not required",
);
</script>

<template>
  <div class="datastore-badge">
    <Badge v-if="hasDataStore" class="w-8 h-8 rounded-full" severity="success">
      <i v-tooltip.top="'Data store found'" class="pi pi-check"></i>
    </Badge>
    <Badge
      v-else
      :severity="required ? 'danger' : 'secondary'"
      class="w-8 h-8 rounded-full"
    >
      <button
        v-tooltip.top="missingTooltip"
        :aria-label="missingTooltip"
        :class="['datastore-icon-btn', { 'datastore-create-link': required }]"
        :disabled="!required"
        type="button"
        @click="emit('createDataStore', projectId)"
      >
        <i class="pi pi-times"></i>
      </button>
    </Badge>
  </div>
</template>

<style scoped>
.datastore-badge {
  display: flex;
  justify-content: center;
}

.datastore-icon-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  background: none;
  border: none;
  color: inherit;
  font: inherit;
}

.datastore-icon-btn:disabled {
  cursor: default;
}

.datastore-create-link {
  cursor: pointer;
}
</style>
