<script setup lang="ts">
import { getAnalysisNodes } from "~/composables/useAPIFetch";
import { formatDataRow } from "~/utils/format-data-row";
import TableRowMetadata from "~/components/TableRowMetadata.vue";
import ExpandRowButtons from "~/components/table/ExpandRowButtons.vue";
import { showHubAdapterConnectionErrorToast } from "~/composables/connectionErrorToast";
import { FilterMatchMode } from "primevue/api";
import type { AnalysisNode } from "~/services/Api";

const expandedRows = ref();
const analyses = ref();

const expandRowEntries = [
  "id",
  "project_id",
  "node_id",
  "created_at",
  "updated_at",
];

const filters = ref({
  global: { value: null, matchMode: FilterMatchMode.CONTAINS },
  // Below are more examples
  // "analysis.name": { value: null, matchMode: FilterMatchMode.CONTAINS },
  // status: { value: null, matchMode: FilterMatchMode.CONTAINS },
  // verified: { value: null, matchMode: FilterMatchMode.EQUALS },
  // name: { value: null, matchMode: FilterMatchMode.STARTS_WITH },
});

const { data: response, status, error } = await getAnalysisNodes();

if (status.value === "success") {
  const formattedData = formatDataRow(
    response.value!.data,
    ["created_at", "updated_at"],
    expandRowEntries,
  );

  analyses.value = formattedData.map((analysisNode: AnalysisNode) => ({
    ...analysisNode,
    uniqueId: analysisNode.analysis_id + "-" + analysisNode.node.id,
  }));
} else if (error.value?.statusCode === 500) {
  showHubAdapterConnectionErrorToast();
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
          dataKey="uniqueId"
          :pt="{
            table: 'table table-striped',
          }"
          paginator
          :rows="10"
          :rowsPerPageOptions="[10, 20, 50]"
          tableStyle="min-width: 50rem"
          v-model:filters="filters"
          filterDisplay="menu"
          :globalFilterFields="[
            'analysis.name',
            'analysis.project_id',
            'node.name',
          ]"
        >
          <template #empty> No analyses found. </template>
          <template #header>
            <div class="table-header-row">
              <div class="flex justify-content-end search-bar">
                <IconField iconPosition="left">
                  <InputIcon>
                    <i class="pi pi-search" />
                  </InputIcon>
                  <InputText
                    v-model="filters['global'].value"
                    placeholder="Keyword Search"
                  />
                </IconField>
              </div>
              <div class="expand-buttons">
                <ExpandRowButtons
                  :rows="analyses"
                  :uniqueId="'uniqueId'"
                  @expandedRowList="onToggleRowExpansion"
                />
              </div>
            </div>
          </template>
          <Column expander style="width: 5rem" />
          <Column field="analysis.name" header="Name" :sortable="true" />
          <Column
            field="approval_status"
            header="Approval Status"
            :sortable="true"
          />
          <Column
            field="analysis.build_status"
            header="Build Status"
            :sortable="true"
          />
          <Column
            field="analysis.run_status"
            header="Run Status"
            :sortable="true"
          />
          <Column
            field="analysis.project_id"
            header="Project"
            :sortable="true"
          />
          <Column field="node.name" header="Node" :sortable="true" />
          <Column
            field="expand.id"
            header="Toggle Analysis"
            style="min-width: 13em"
            :exportable="false"
          >
            <template #body="slotProps">
              <AnalysisControlButtons
                :analysisRunStatus="slotProps.data.run_status"
                :analysisId="slotProps.data.analysis_id"
                :projectId="slotProps.data.analysis.project_id"
                :nodeId="slotProps.data.expand.node_id"
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
