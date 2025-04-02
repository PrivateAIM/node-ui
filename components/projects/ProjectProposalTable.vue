<script lang="ts" setup>
import { getProjectNodes } from "~/composables/useAPIFetch";
import ApproveRejectButtons from "~/components/table/ApproveRejectButtons.vue";
import { formatDataRow } from "~/utils/format-data-row";
import TableRowMetadata from "~/components/TableRowMetadata.vue";
import { ApprovalStatus, type ProjectNode } from "~/services/Api";
import { showHubAdapterConnectionErrorToast } from "~/composables/connectionErrorToast";
import { FilterMatchMode } from "@primevue/core/api";
import SearchBar from "~/components/table/SearchBar.vue";
import { getApprovalStatusSeverity } from "~/utils/status-tag-severity";

const proposals = ref();
const expandedRows = ref({});

const dataRowUnixCols = ["created_at", "updated_at"];
const expandRowEntries = [];

const approvalStatuses = Object.values(ApprovalStatus);
const filters = ref();

const { data: response, status, error, refresh } = await getProjectNodes();

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

filters.value = defaultFilters;

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
    <Card class="content-card">
      <template #title>Project Proposals</template>
      <template #content>
        <div class="table-header-row">
          <SearchBar
            :searchTerm="defaultFilters.global.value"
            @clearFilters="resetFilters"
            @updateSearch="updateFilters"
          />
          <div class="card flex justify-content-center refresh-switch">
            <Button
              v-tooltip.top="'Refresh table'"
              :loading="status === 'pending'"
              aria-label="Filter"
              icon="pi pi-refresh"
              severity="contrast"
              @click="onTableRefresh"
            />
          </div>
        </div>
        <DataTable
          v-model:expandedRows="expandedRows"
          v-model:filters="filters"
          :globalFilterFields="['id', 'project.name', 'node.name']"
          :rows="10"
          :rowsPerPageOptions="[10, 20, 50]"
          :value="proposals"
          dataKey="id"
          filterDisplay="menu"
          paginator
          tableStyle="min-width: 50rem"
        >
          <template #empty> No projects found.</template>
          <Column v-if="expandRowEntries.length" expander style="width: 5rem" />
          <Column :sortable="true" field="project.name" header="Name"></Column>
          <Column :sortable="true" field="node.name" header="Node"></Column>
          <Column
            :showAddButton="false"
            :showApplyButton="false"
            :showClearButton="false"
            :showFilterMatchModes="false"
            :showFilterOperator="false"
            field="approval_status"
            header="Approval Status"
          >
            <template #body="{ data }">
              <Tag
                v-if="data.approval_status"
                :severity="getApprovalStatusSeverity(data.approval_status)"
                :value="data.approval_status"
              />
            </template>
            <template #filter="{ filterModel, filterCallback }">
              <Select
                v-model="filterModel.value"
                :options="approvalStatuses"
                :showClear="true"
                class="p-column-filter"
                placeholder="Select One"
                @change="filterCallback()"
              >
                <template #option="slotProps">
                  <Tag
                    :severity="getApprovalStatusSeverity(slotProps.option)"
                    :value="slotProps.option"
                  />
                </template>
              </Select>
            </template>
          </Column>
          <Column
            :sortable="true"
            dataType="date"
            field="created_at.timestamp"
            header="Created On"
          >
            <template #body="{ data }">
              <p v-tooltip.top="data.created_at.long">
                {{ data.created_at.short }}
              </p>
            </template>
          </Column>
          <Column
            :sortable="true"
            dataType="date"
            field="updated_at.timestamp"
            header="Last Updated"
          >
            <template #body="{ data }">
              <p v-tooltip.top="data.updated_at.long">
                {{ data.updated_at.short }}
              </p>
            </template>
          </Column>
          <Column
            :exportable="false"
            field="id"
            header="Set Approval"
            style="min-width: 10em"
          >
            <template #body="slotProps">
              <ApproveRejectButtons
                :objectClass="'project'"
                :objectId="slotProps.data.id"
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
