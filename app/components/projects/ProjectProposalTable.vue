<script lang="ts" setup>
import { getProjectNodes } from "~/composables/useAPIFetch";
import ApproveRejectButtons from "~/components/table/ApproveRejectButtons.vue";
import { formatDataRow } from "~/utils/format-data-row";
import { type ProjectNode } from "~/services/Api";
import { FilterMatchMode } from "@primevue/core/api";
import SearchBar from "~/components/table/SearchBar.vue";
import { getApprovalStatusSeverity } from "~/utils/status-tag-severity";
import { ApprovalStatus } from "~/types/node";

const proposals = ref();
const expandedRows = ref({});

const dataRowUnixCols = ["created_at", "updated_at"];
const expandRowEntries = [];

const approvalStatuses = Object.values(ApprovalStatus);
const filters = ref();

const { data: response, status, refresh } = await getProjectNodes();

function parseData() {
  if (status.value === "success") {
    proposals.value = formatDataRow(
      response.value,
      dataRowUnixCols,
      expandRowEntries,
    );
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
  global: { value: undefined, matchMode: FilterMatchMode.CONTAINS },
  approval_status: { value: undefined, matchMode: FilterMatchMode.EQUALS },
};

filters.value = defaultFilters;

function resetFilters() {
  const clearedFilters = {};
  for (const filterKey in defaultFilters) {
    clearedFilters[filterKey] = {
      ...defaultFilters[filterKey],
    };
    clearedFilters[filterKey].value = undefined;
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
          :globalFilterFields="[
            'id',
            'project.display_name',
            'project.name',
            'node.name',
          ]"
          :rows="10"
          :rowsPerPageOptions="[10, 20, 50]"
          :value="proposals"
          dataKey="id"
          filterDisplay="menu"
          paginator
          tableStyle="min-width: 50rem"
          class="rounded-table"
        >
          <template #empty> No projects found.</template>
          <Column v-if="expandRowEntries.length" expander style="width: 5rem" />
          <Column
            field="project.display_name"
            :sortable="true"
            style="width: 30rem"
          >
            <template #header>
              <span v-tooltip.top="'Name of the project'" class="help-text">
                <b>Project Name</b>
              </span>
            </template>
            <template #body="{ data }">
              <span v-tooltip.right="data.project.id" class="help-text">
                {{
                  data.project.display_name ??
                  data.project.name ??
                  data.project.id
                }}
              </span>
            </template>
          </Column>
          <Column :sortable="true" field="node.name">
            <template #header>
              <span
                class="help-text"
                v-tooltip.top="
                  'Which node the analyses for this project will run on (should be current node)'
                "
              >
                <b>Node</b>
              </span>
            </template>
          </Column>
          <Column
            :showAddButton="false"
            :showApplyButton="false"
            :showClearButton="false"
            :showFilterMatchModes="false"
            :showFilterOperator="false"
            field="approval_status"
          >
            <template #header>
              <span
                class="help-text"
                v-tooltip.top="'Whether the project was approved or rejected'"
              >
                <b>Approval Status</b>
              </span>
            </template>
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
          <Column :sortable="true" dataType="date" field="created_at.timestamp">
            <template #header>
              <span
                class="help-text"
                v-tooltip.top="'Date the project was registered with the Hub'"
              >
                <b>Created On</b>
              </span>
            </template>
            <template #body="{ data }">
              <p v-tooltip.top="data.created_at.long">
                {{ data.created_at.short }}
              </p>
            </template>
          </Column>
          <Column :sortable="true" dataType="date" field="updated_at.timestamp">
            <template #header>
              <span
                class="help-text"
                v-tooltip.top="'Date the project was last modified'"
              >
                <b>Last Updated</b>
              </span>
            </template>
            <template #body="{ data }">
              <p v-tooltip.top="data.updated_at.long">
                {{ data.updated_at.short }}
              </p>
            </template>
          </Column>
          <Column :exportable="false" field="id" style="min-width: 10em">
            <template #header>
              <span
                class="help-text"
                v-tooltip.top="
                  'Set it so that the project is either approved for running on this node or rejected'
                "
              >
                <b>Set Approval</b>
              </span>
            </template>
            <template #body="slotProps">
              <ApproveRejectButtons
                :objectClass="'project'"
                :objectId="slotProps.data.id"
                @updatedRow="updateTable"
              />
            </template>
          </Column>
        </DataTable>
      </template>
    </Card>
  </div>
</template>

<style lang="scss"></style>
