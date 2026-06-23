<script lang="ts" setup>
import { getProjectNodes } from "~/composables/useAPIFetch";
import ApproveRejectToggle from "~/components/table/ApproveRejectToggle.vue";
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

const filters = ref();

const { data: response, status, refresh } = await getProjectNodes();

function parseData() {
  if (status.value === "success") {
    const formatted = formatDataRow(
      response.value,
      dataRowUnixCols,
      expandRowEntries,
    ) as unknown as
      | Array<ProjectNode & { project_name?: string | null }>
      | undefined;
    formatted?.forEach((row) => {
      row.project_name =
        row.project?.display_name ?? row.project?.name ?? row.project?.id;
    });
    proposals.value = formatted;
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
  <ConfirmDialog />
  <div class="proposal-card">
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
              aria-label="Refresh table"
              icon="pi pi-refresh"
              severity="contrast"
              @click="onTableRefresh"
            />
          </div>
        </div>
        <DataTable
          v-model:expandedRows="expandedRows"
          v-model:filters="filters"
          :globalFilterFields="['id', 'project_name', 'node.name']"
          :rows="10"
          :rowsPerPageOptions="[10, 20, 50]"
          :value="proposals"
          class="rounded-table project-table structured-table"
          dataKey="id"
          filterDisplay="menu"
          paginator
          tableStyle="min-width: 50rem"
        >
          <template #empty> No projects found.</template>
          <Column v-if="expandRowEntries.length" expander style="width: 5rem" />
          <Column :sortable="true" field="project_name" style="width: 30rem">
            <template #header>
              <span v-tooltip.top="'Name of the project'" class="help-text">
                <b>Project Name</b>
              </span>
            </template>
            <template #body="{ data }">
              <span v-tooltip.right="data.project.id" class="help-text">
                {{ data.project_name }}
              </span>
            </template>
          </Column>
          <Column :sortable="true" field="project.analyses">
            <template #header>
              <span
                v-tooltip.top="
                  'Number of analyses associated with this project'
                "
                class="help-text"
              >
                <b>Number of Analyses</b>
              </span>
            </template>
          </Column>
          <Column :sortable="true" field="project.nodes">
            <template #header>
              <span
                v-tooltip.top="'Number of nodes associated with this project'"
                class="help-text"
              >
                <b>Number of Nodes</b>
              </span>
            </template>
          </Column>
          <Column :sortable="true" dataType="date" field="created_at.timestamp">
            <template #header>
              <span
                v-tooltip.top="'Date the project was registered with the Hub'"
                class="help-text"
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
                v-tooltip.top="'Date the project was last modified'"
                class="help-text"
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
          <Column
            :exportable="false"
            :showAddButton="false"
            :showApplyButton="false"
            :showClearButton="false"
            :showFilterMatchModes="false"
            :showFilterOperator="false"
            field="approval_status"
            style="min-width: 10em"
          >
            <template #header>
              <span
                v-tooltip.top="
                  'Set it so that the project is either approved for running on this node or rejected'
                "
                class="help-text"
              >
                <b>Set Approval</b>
              </span>
            </template>
            <template #body="slotProps">
              <ApproveRejectToggle
                :currentStatus="slotProps.data.approval_status"
                :objectClass="'project'"
                :objectId="slotProps.data.id"
                @updatedRow="updateTable"
              />
            </template>
            <template #filter="{ filterModel, filterCallback }">
              <Select
                v-model="filterModel.value"
                :options="Object.values(ApprovalStatus)"
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
        </DataTable>
      </template>
    </Card>
  </div>
</template>

<style lang="scss"></style>
