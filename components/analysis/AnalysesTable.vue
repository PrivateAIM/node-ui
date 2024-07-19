<script setup lang="ts">
import { getAnalyses } from "~/composables/useAPIFetch";
import { formatDataRow } from "~/utils/format-data-row";
import TableRowMetadata from "~/components/TableRowMetadata.vue";
import ExpandRowButtons from "~/components/table/ExpandRowButtons.vue";

const analyses = ref();
const expandedRows = ref();
const loading = ref(true);

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

function onToggleRowExpansion(rowIds) {
  expandedRows.value = rowIds;
}
</script>

<template>
  <h2 style="color: Yellow">Analysis Table Example</h2>
  <!--  <ObjectDownloadButtons :objectId="oid" :local=false />-->
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
        <ExpandRowButtons
          :rows="analyses"
          @expandedRowList="onToggleRowExpansion"
        />
      </template>
      <Column expander style="width: 5rem" />
      <Column class="namedCol" field="name" header="Name" :sortable="true" />
      <Column
        field="approval_status"
        header="Approval Status"
        :sortable="true"
      />
      <Column field="build_status" header="Build Status" :sortable="true" />
      <Column field="run_status" header="Run Status" :sortable="true" />
      <Column
        class="namedCol"
        field="project.name"
        header="Project"
        :sortable="true"
      />
      <Column field="nodes" header="Number Nodes" :sortable="true" />
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

<style>
.namedCol {
  max-width: 20rem;
}
</style>
