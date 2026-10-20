<script setup lang="ts">
const props = defineProps<{
  searchTerm?: string;
}>();

const emit = defineEmits(["clearFilters", "updateSearch"]);

const updatedGlobalSearchText = computed({
  get() {
    return props.searchTerm;
  },
  set(updatedSearchTerm: string) {
    emit("updateSearch", updatedSearchTerm);
  },
});

const clearFilters = () => {
  emit("updateSearch", undefined);
  emit("clearFilters");
};
</script>

<template>
  <div class="flex justify-content-end search-bar">
    <div class="search-text-bar">
      <IconField iconPosition="left">
        <InputIcon>
          <i class="pi pi-search" />
        </InputIcon>
        <InputText
          v-model="updatedGlobalSearchText"
          placeholder="Keyword Search"
        />
      </IconField>
    </div>
    <div class="search-clear-btn">
      <Button
        v-tooltip.top="'Clear all filters'"
        type="button"
        class="filter-clear-btn"
        icon="pi pi-filter-slash"
        label="Clear"
        outlined
        @click="clearFilters()"
      />
    </div>
  </div>
</template>

<style scoped>
.search-text-bar {
  margin-right: 0.625rem;
}
</style>
