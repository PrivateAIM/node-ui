<script setup lang="ts">
import { getAnalyses } from "~/composables/useAPIFetch";
import { formatDataRow } from "~/utils/format-data-row";
import TableRowMetadata from "~/components/TableRowMetadata.vue";
import ExpandRowButtons from "~/components/table/ExpandRowButtons.vue";
import { showConnectionErrorToast } from "~/composables/connectionErrorToast";

const expandedRows = ref();
const analyses = ref();

const expandRowEntries = [
  "id",
  "project_id",
  "registry_id",
  "user_id",
  "created_at",
  "updated_at",
];

const { data: response, status, error } = await getAnalyses();

if (status.value === "success") {
  analyses.value = formatDataRow(
    response.value!.data,
    ["created_at", "updated_at"],
    expandRowEntries,
  );
} else if (error.value?.statusCode === 500) {
  showConnectionErrorToast();
}

function onToggleRowExpansion(rowIds) {
  expandedRows.value = rowIds;
}
</script>

<template>
  <!--  <ObjectDownloadButtons :objectId="oid" :local=false />-->
  <div class="card analysisTable">
    <Card class="contentCard">
      <template #title>Analyses</template>
      <template #content>
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
          <Column
            class="namedCol"
            field="name"
            header="Name"
            :sortable="true"
          />
          <Column
            field="approval_status"
            header="Approval Status"
            :sortable="true"
          />
          <Column field="build_status" header="Build Status" :sortable="true" />
          <Column field="run_status" header="Run Status" :sortable="true" />
          <Column field="project.name" header="Project" :sortable="true" />
          <Column field="nodes" header="Number Nodes" :sortable="true" />
          <Column
            field="expand.id"
            header="Toggle Analysis"
            style="min-width: 13em"
            :exportable="false"
          >
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
      </template>
    </Card>
  </div>
</template>

<style></style>
