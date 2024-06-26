<script setup lang="ts">
import { getProposals } from "~/composables/useAPIFetch";
import ApproveRejectButtons from "~/components/projects/ApproveRejectButtons.vue";
import { formatDataRow } from "~/utils/format-data-row";
import TableRowMetadata from "~/components/TableRowMetadata.vue";
import type { ProjectNode } from "~/services/Api";

const proposals = ref();
const expandedRows = ref({});
const loading = ref(true);

const dataRowUnixCols = ["created_at", "updated_at"];
const expandRowEntries = ["project_id", "node_id"];

onMounted(() => {
  nextTick(async () => {
    const { data: response } = await getProposals();
    proposals.value = formatDataRow(
      response.value!.data as unknown as Map<string, string | number | null>[],
      dataRowUnixCols,
      expandRowEntries,
    );
    loading.value = false;
  });
});

const expandAll = () => {
  expandedRows.value = proposals.value.reduce(
    (accordion: boolean, proposal) =>
      // eslint-disable-next-line no-constant-binary-expression
      (accordion[proposal.id] = true) && accordion,
    {},
  );
};

const collapseAll = () => {
  expandedRows.value = {};
};

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
        <div class="flex flex-wrap justify-end gap-2">
          <Button
            text
            icon="pi pi-plus"
            label="Expand All"
            @click="expandAll"
          />
          <Button
            text
            icon="pi pi-minus"
            label="Collapse All"
            @click="collapseAll"
          />
        </div>
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
      <Column field="created_at" header="Created"></Column>
      <Column field="updated_at" header="Last Updated"></Column>
      <Column field="id" header="Set Approval" :exportable="false">
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

<style scoped lang="scss"></style>
