<script setup lang="ts">
import { getAnalyses } from "~/composables/useAPIFetch";
import { formatDataRow } from "~/utils/format-data-row";
import TableRowMetadata from "~/components/TableRowMetadata.vue";
import type { Analysis } from "~/services/Api";

const analyses = ref();
const expandedRows = ref({});
const loading = ref(true);

// For testing file download
// const oid = "b53200bc-bd92-4dcf-8f2f-353d04a79fab";

const expandRowEntries = [
  "id",
  "project_id",
  "registry_id",
  "user_id",
  "created_at",
  "updated_at",
];

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
    (accordion: boolean, analysis: Analysis) =>
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
  <!--  <ObjectDownloadButtons :objectId="oid" />-->
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
        <div class="flex flex-wrap justify-end gap-2 expandButtons">
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
      <Column field="name" header="Name" :sortable="true"></Column>
      <Column
        field="approval_status"
        header="Approval Status"
        :sortable="true"
      ></Column>
      <Column
        field="build_status"
        header="Build Status"
        :sortable="true"
      ></Column>
      <Column field="run_status" header="Run Status" :sortable="true"></Column>
      <Column field="project.name" header="Project" :sortable="true"></Column>
      <Column field="nodes" header="Number Nodes" :sortable="true"></Column>
      <Column field="expand.id" header="Toggle Analysis" :exportable="false">
        <template #body="slotProps">
          <AnalysisControlButtons
            :analysisStatus="slotProps.data.run_status"
            :analysisId="slotProps.data.expand.id"
            :projectId="slotProps.data.expand.project_id"
          />
        </template>
      </Column>
      <template #expansion="slotProps">
        <div class="p-3">
          <TableRowMetadata :rowMetadata="slotProps.data.expand" />
        </div>
      </template>
    </DataTable>
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
