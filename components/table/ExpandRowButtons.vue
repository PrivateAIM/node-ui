<script setup lang="ts">
const props = defineProps({
  rows: [Object],
});

const emit = defineEmits(["expandedRowList"]);

const expandAll = () => {
  const rowIds = props.rows!.reduce(
    (accordion: boolean, row) =>
      // eslint-disable-next-line no-constant-binary-expression
      (accordion[row.id] = true) && accordion,
    {},
  );
  emit("expandedRowList", rowIds);
};

const collapseAll = () => {
  emit("expandedRowList", {});
};
</script>

<template>
  <div class="flex flex-wrap justify-end gap-2 expandButtons">
    <Button
      text
      icon="pi pi-plus"
      label="Expand All"
      @click.prevent="expandAll"
    />
    <Button
      text
      icon="pi pi-minus"
      label="Collapse All"
      @click.prevent="collapseAll"
    />
  </div>
</template>

<style scoped lang="scss">
.expandButtons {
  display: flex;
  justify-content: flex-end;
  margin-left: auto;
  margin-right: 0;
}
</style>
