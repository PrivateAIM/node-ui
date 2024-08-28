<script setup lang="ts">
import { getProposals } from "~/composables/useAPIFetch";
import ApproveRejectButtons from "~/components/projects/ApproveRejectButtons.vue";
import { formatDataRow } from "~/utils/format-data-row";
import TableRowMetadata from "~/components/TableRowMetadata.vue";
import type { ProjectNode } from "~/services/Api";
import ExpandRowButtons from "~/components/table/ExpandRowButtons.vue";
import { showHubAdapterConnectionErrorToast } from "~/composables/connectionErrorToast";
import { FilterMatchMode } from "primevue/api";

const proposals = ref();
const expandedRows = ref({});

const dataRowUnixCols = ["created_at", "updated_at"];
const expandRowEntries = ["project_id", "node_id"];

const filters = ref({
  global: { value: null, matchMode: FilterMatchMode.CONTAINS },
});

const { data: response, status, error } = await getProposals();
if (status.value === "success") {
  proposals.value = formatDataRow(
    response.value!.data as unknown as Map<string, string | number | null>[],
    dataRowUnixCols,
    expandRowEntries,
  );
} else if (error.value?.statusCode === 500) {
  showHubAdapterConnectionErrorToast();
}

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
                  :rows="proposals"
                  :uniqueId="'id'"
                  @expandedRowList="onToggleRowExpansion"
                />
              </div>
            </div>
          </template>
          <Column expander style="width: 5rem" />
          <Column field="id" header="ID" :sortable="true"></Column>
          <Column
            field="project.name"
            header="Project"
            :sortable="true"
          ></Column>
          <Column field="node.name" header="Node" :sortable="true"></Column>
          <Column
            field="approval_status"
            header="Approval Status"
            :sortable="true"
          ></Column>
          <Column field="created_at" header="Created" :sortable="true"></Column>
          <Column
            class="timeCol"
            field="updated_at"
            header="Last Updated"
            :sortable="true"
          ></Column>
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
