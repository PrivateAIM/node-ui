<script setup lang="ts">
import { getProposals } from "~/composables/useAPIFetch";
import ApproveRejectButtons from "~/components/projects/ApproveRejectButtons.vue";
import { formatDataRow } from "~/utils/format-data-row";
import TableRowMetadata from "~/components/TableRowMetadata.vue";
import type { ProjectNode } from "~/services/Api";
import ExpandRowButtons from "~/components/table/ExpandRowButtons.vue";
import { showConnectionErrorToast } from "~/composables/connectionErrorToast";

const proposals = ref();
const expandedRows = ref({});
const loading = ref(true);

const dataRowUnixCols = ["created_at", "updated_at"];
const expandRowEntries = ["project_id", "node_id"];

onMounted(() => {
  nextTick(async () => {
    const { data: response, status, error } = await getProposals();
    if (status.value === "success") {
      proposals.value = formatDataRow(
        response.value!.data as unknown as Map<
          string,
          string | number | null
        >[],
        dataRowUnixCols,
        expandRowEntries,
      );
    } else if (error.value?.statusCode === 500) {
      showConnectionErrorToast();
    }
    loading.value = false;
  });
});

function onToggleRowExpansion(rowIds) {
  expandedRows.value = rowIds;
}

function updateTable(newData: ProjectNode) {
  for (let row of proposals.value) {
    if (row.id === newData.id) {
      row.approval_status = newData.approval_status;
    }
  }
}
</script>

<template>
  <div class="proposalTable">
    <h2 style="color: blue">Proposals</h2>
    <DataTable
      :value="proposals"
      v-model:expandedRows="expandedRows"
      dataKey="id"
      paginator
      :rows="10"
      :rowsPerPageOptions="[10, 20, 50]"
      :loading="loading"
      tableStyle="min-width: 50rem"
    >
      <template #empty> No proposals found. </template>
      <template #header>
        <ExpandRowButtons
          :rows="proposals"
          @expandedRowList="onToggleRowExpansion"
        />
      </template>
      <Column expander style="width: 5rem" />
      <Column field="id" header="ID" :sortable="true"></Column>
      <Column field="project.name" header="Project" :sortable="true"></Column>
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
  </div>
</template>

<style lang="scss"></style>
