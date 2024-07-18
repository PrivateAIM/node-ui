<script setup lang="ts">
const rows = ref();
const expandedRows = ref({});

const expandAll = () => {
  expandedRows.value = rows.value.reduce(
    (accordion: boolean, row) =>
      // eslint-disable-next-line no-constant-binary-expression
      (accordion[row.id] = true) && accordion,
    {},
  );
};

const collapseAll = () => {
  expandedRows.value = {};
};
</script>

<template>
  <div class="flex flex-wrap justify-end gap-2 expandButtons">
    <Button text icon="pi pi-plus" label="Expand All" @click="expandAll" />
    <Button text icon="pi pi-minus" label="Collapse All" @click="collapseAll" />
  </div>
</template>

<style scoped lang="scss"></style>
