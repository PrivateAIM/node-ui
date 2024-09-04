<script setup lang="ts">
import { getAnalysisNodes } from "~/composables/useAPIFetch";
import { formatDataRow } from "~/utils/format-data-row";
import TableRowMetadata from "~/components/TableRowMetadata.vue";
import ExpandRowButtons from "~/components/table/ExpandRowButtons.vue";
import { showHubAdapterConnectionErrorToast } from "~/composables/connectionErrorToast";
import { FilterMatchMode } from "primevue/api";
import SearchBar from "~/components/table/SearchBar.vue";
import {
  getApprovalStatusSeverity,
  getRunStatusSeverity,
} from "~/utils/status-tag-severity";
import { AnalysisNodeRunStatus, ApprovalStatus } from "~/services/Api";

const expandedRows = ref();
const analyses = ref();

const expandRowEntries = [];
const runStatuses = Object.values(AnalysisNodeRunStatus);
const approvalStatuses = Object.values(ApprovalStatus);

const { data: response, status, error } = await getAnalysisNodes();

if (status.value === "success") {
  analyses.value = formatDataRow(
    response.value!.data,
    ["created_at", "updated_at"],
    expandRowEntries,
  );
} else if (error.value?.statusCode === 500) {
  showHubAdapterConnectionErrorToast();
}

function onToggleRowExpansion(rowIds) {
  expandedRows.value = rowIds;
}

// Table filters
const defaultFilters = {
  global: { value: null, matchMode: FilterMatchMode.CONTAINS },
  approval_status: { value: null, matchMode: FilterMatchMode.IN },
  // "analysis.build_status": { value: null, matchMode: FilterMatchMode.IN },
  run_status: { value: null, matchMode: FilterMatchMode.IN },
  // Below are more examples
  // "analysis.name": { value: null, matchMode: FilterMatchMode.CONTAINS },
  // status: { value: null, matchMode: FilterMatchMode.CONTAINS },
  // verified: { value: null, matchMode: FilterMatchMode.EQUALS },
  // name: { value: null, matchMode: FilterMatchMode.STARTS_WITH },
};
const filters = ref(defaultFilters);

function resetFilters() {
  const clearedFilters = {};
  for (const filterKey in defaultFilters) {
    clearedFilters[filterKey] = {
      ...defaultFilters[filterKey],
    };
    clearedFilters[filterKey].value = null;
  }
  filters.value = clearedFilters;
}

const updateFilters = (filterText: string) => {
  filters.value.global.value = filterText;
};
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
              <SearchBar
                :searchTerm="defaultFilters.global.value"
                @clearFilters="resetFilters"
                @updateSearch="updateFilters"
              />
              <div class="expand-buttons" v-if="expandRowEntries.length">
                <ExpandRowButtons
                  :rows="analyses"
                  :uniqueId="'id'"
                  @expandedRowList="onToggleRowExpansion"
                />
              </div>
            </div>
          </template>
          <Column expander style="width: 5rem" v-if="expandRowEntries.length" />
          <Column field="analysis.name" header="Name" :sortable="true" />
          <Column
            field="approval_status"
            header="Approval Status"
            filterField="approval_status"
            :showFilterMatchModes="false"
          >
            <template #body="{ data }">
              <Tag
                v-if="data.approval_status"
                :value="data.approval_status"
                :severity="getApprovalStatusSeverity(data.approval_status)"
              />
            </template>
            <template #filter="{ filterModel }">
              <MultiSelect
                v-model="filterModel.value"
                :options="approvalStatuses"
                optionLabel=""
                placeholder="Any"
                class="p-column-filter"
              >
                <template #option="slotProps">
                  <div class="flex align-items-center gap-2">
                    <Tag
                      v-if="slotProps.option"
                      :value="slotProps.option"
                      :severity="getApprovalStatusSeverity(slotProps.option)"
                    />
                  </div>
                </template>
              </MultiSelect>
            </template>
          </Column>
          <Column
            field="run_status"
            header="Run Status"
            filterField="run_status"
            :showFilterMatchModes="false"
          >
            <template #body="{ data }">
              <Tag
                v-if="data.run_status"
                :value="data.run_status"
                :severity="getRunStatusSeverity(data.run_status)"
              />
            </template>
            <template #filter="{ filterModel }">
              <MultiSelect
                v-model="filterModel.value"
                :options="runStatuses"
                optionLabel=""
                placeholder="Any"
                class="p-column-filter"
              >
                <template #option="slotProps">
                  <div class="flex align-items-center gap-2">
                    <Tag
                      v-if="slotProps.option"
                      :value="slotProps.option"
                      :severity="getRunStatusSeverity(slotProps.option)"
                    />
                  </div>
                </template>
              </MultiSelect>
            </template>
          </Column>
          <Column
            field="analysis.project_id"
            header="Project"
            :sortable="true"
          />
          <Column
            header="Created On"
            field="created_at.long"
            filterField="created_at.date"
            dataType="date"
            :sortable="true"
          >
            <template #body="{ data }">
              <p v-tooltip.top="data.created_at.long">
                {{ data.created_at.short }}
              </p>
            </template>
          </Column>
          <Column
            header="Last Updated"
            field="updated_at.long"
            filterField="updated_at.date"
            dataType="date"
            :sortable="true"
          >
            <template #body="{ data }">
              <p v-tooltip.top="data.updated_at.long">
                {{ data.updated_at.short }}
              </p>
            </template>
          </Column>
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
                :nodeId="slotProps.data.node_id"
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
