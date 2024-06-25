<script setup lang="ts">
import { getAnalyses } from "~/composables/useAPIFetch";
import { formatDataRow } from "~/utils/format-data-row";
import TableRowMetadata from "~/components/TableRowMetadata.vue";

const analyses = ref();
const expandedRows = ref({});
const loading = ref(true);

const expandRowEntries = ["created_at", "updated_at"];

onMounted(() => {
  nextTick(async () => {
    const { data: response } = await getAnalyses();

    analyses.value = formatDataRow(
      response.value!.data as unknown as Map<string, string | number | null>[],
      ["created_at", "updated_at"],
      expandRowEntries,
    );
    loading.value = false;
  });
});

const expandAll = () => {
  expandedRows.value = analyses.value.reduce(
    (accordion: boolean, analysis) =>
      // eslint-disable-next-line no-constant-binary-expression
      (accordion[analysis.id] = true) && accordion,
    {},
  );
};

const collapseAll = () => {
  expandedRows.value = {};
};
</script>

<template>
  <h2 style="color: Yellow">Analysis Table Example</h2>
  <div class="card analysisTable">
    <DataTable
      :value="analyses"
      v-model:expandedRows="expandedRows"
      dataKey="id"
      :pt="{
        table: 'table table-striped',
      }"
      paginator
      :rows="10"
      :rowsPerPageOptions="[10, 20, 50]"
      :loading="loading"
      tableStyle="min-width: 50rem"
    >
      <template #empty> No analyses found. </template>
      <template #header>
        <div class="flex flex-wrap justify-end gap-2">
          <Button
            text
            icon="pi pi-plus"
            label="Expand All"
            @click="expandAll"
          />
          <Button
            text
            icon="pi pi-minus"
            label="Collapse All"
            @click="collapseAll"
          />
        </div>
      </template>
      <Column expander style="width: 5rem" />
      <Column field="id" header="ID" :sortable="true"></Column>
      <Column
        field="approval_status"
        header="Approval Status"
        :sortable="true"
      ></Column>
      <Column field="run_status" header="Status" :sortable="true"></Column>
      <Column field="project_id" header="Project ID"></Column>
      <Column field="node.name" header="Node" :sortable="true"></Column>
      <template #expansion="slotProps">
        <div class="p-3">
          <TableRowMetadata :rowMetadata="slotProps.data.expand" />
        </div>
      </template>
    </DataTable>
  </div>
</template>

<style scoped lang="scss"></style>
