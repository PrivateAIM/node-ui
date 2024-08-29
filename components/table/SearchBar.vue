<script setup lang="ts">
const props = defineProps({
  searchTerm: [String, null],
});

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
  emit("updateSearch", null);
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
        type="button"
        icon="pi pi-filter-slash"
        label="Clear"
        v-tooltip.top="'Clear all filters'"
        outlined
        @click="clearFilters()"
      />
    </div>
  </div>
</template>

<style></style>
