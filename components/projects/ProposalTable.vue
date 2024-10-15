<script setup lang="ts">
import { getProposals } from "~/composables/useAPIFetch";
import ApproveRejectButtons from "~/components/projects/ApproveRejectButtons.vue";
import { formatDataRow } from "~/utils/format-data-row";
import TableRowMetadata from "~/components/TableRowMetadata.vue";
import { ApprovalStatus, type ProjectNode } from "~/services/Api";
import ExpandRowButtons from "~/components/table/ExpandRowButtons.vue";
import { showHubAdapterConnectionErrorToast } from "~/composables/connectionErrorToast";
import { FilterMatchMode } from "primevue/api";
import SearchBar from "~/components/table/SearchBar.vue";
import { getApprovalStatusSeverity } from "~/utils/status-tag-severity";

const proposals = ref();
const expandedRows = ref({});

const dataRowUnixCols = ["created_at", "updated_at"];
const expandRowEntries = [];

const approvalStatuses = Object.values(ApprovalStatus);

const { data: response, status, error, refresh } = await getProposals();

function parseData() {
  if (status.value === "success") {
    proposals.value = formatDataRow(
      response.value!.data as unknown as Map<string, string | number | null>[],
      dataRowUnixCols,
      expandRowEntries,
    );
  } else if (error.value?.statusCode === 500) {
    showHubAdapterConnectionErrorToast();
  }
}
parseData();

function onToggleRowExpansion(rowIds) {
  expandedRows.value = rowIds;
}

function updateTable(newData: ProjectNode) {
  for (let row of proposals.value) {
    if (row.id === newData.id) {
      row.approval_status = newData.approval_status;
      return;
    }
  }
}

async function onTableRefresh() {
  await refresh();
  parseData();
}

// Table filters
const defaultFilters = {
  global: { value: null, matchMode: FilterMatchMode.CONTAINS },
  approval_status: { value: null, matchMode: FilterMatchMode.EQUALS },
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
  <div class="proposalTable">
    <Card class="contentCard">
      <template #title>Project Proposals</template>
      <template #content>
        <DataTable
          :value="proposals"
          v-model:expandedRows="expandedRows"
          dataKey="id"
          paginator
          :rows="10"
          :rowsPerPageOptions="[10, 20, 50]"
          tableStyle="min-width: 50rem"
          v-model:filters="filters"
          filterDisplay="menu"
          :globalFilterFields="['id', 'project.name', 'node.name']"
        >
          <template #empty> No proposals found. </template>
          <template #header>
            <div class="table-header-row">
              <SearchBar
                :searchTerm="defaultFilters.global.value"
                @clearFilters="resetFilters"
                @updateSearch="updateFilters"
              />
              <div class="expand-buttons" v-if="expandRowEntries.length">
                <ExpandRowButtons
                  :rows="proposals"
                  :uniqueId="'id'"
                  @expandedRowList="onToggleRowExpansion"
                />
              </div>
              <div class="card flex justify-content-center refresh-switch">
                <Button
                  icon="pi pi-refresh"
                  aria-label="Filter"
                  :loading="status === 'pending'"
                  v-tooltip.top="'Refresh table'"
                  @click="onTableRefresh"
                  severity="contrast"
                />
              </div>
            </div>
          </template>
          <Column expander style="width: 5rem" v-if="expandRowEntries.length" />
          <Column field="project.name" header="Name" :sortable="true"></Column>
          <Column field="node.name" header="Node" :sortable="true"></Column>
          <Column
            field="approval_status"
            header="Approval Status"
            :showFilterMatchModes="false"
            :showClearButton="false"
            :showApplyButton="false"
            :showFilterOperator="false"
            :showAddButton="false"
          >
            <template #body="{ data }">
              <Tag
                v-if="data.approval_status"
                :value="data.approval_status"
                :severity="getApprovalStatusSeverity(data.approval_status)"
              />
            </template>
            <template #filter="{ filterModel, filterCallback }">
              <Dropdown
                v-model="filterModel.value"
                @change="filterCallback()"
                :options="approvalStatuses"
                placeholder="Select One"
                class="p-column-filter"
                :showClear="true"
              >
                <template #option="slotProps">
                  <Tag
                    :value="slotProps.option"
                    :severity="getApprovalStatusSeverity(slotProps.option)"
                  />
                </template>
              </Dropdown>
            </template>
          </Column>
          <Column
            header="Created On"
            field="created_at.timestamp"
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
            field="updated_at.timestamp"
            dataType="date"
            :sortable="true"
          >
            <template #body="{ data }">
              <p v-tooltip.top="data.updated_at.long">
                {{ data.updated_at.short }}
              </p>
            </template>
          </Column>
          <Column
            field="id"
            header="Set Approval"
            style="min-width: 10em"
            :exportable="false"
          >
            <template #body="slotProps">
              <ApproveRejectButtons
                :projectId="slotProps.data.id"
                @updatedRow="updateTable"
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

<style lang="scss"></style>
