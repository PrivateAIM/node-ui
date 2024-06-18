<script setup lang="ts">
import { getProposals } from "~/composables/useAPIFetch";
import ApproveRejectButtons from "~/components/projects/ApproveRejectButtons.vue";

const { data: response } = await getProposals();

const proposals = (response.value!.data as unknown as []) || [];
</script>

<template>
  <div class="proposalTable">
    <h2 style="color: blue">Proposals</h2>
    <DataTable
      :value="proposals"
      paginator
      :rows="10"
      :rowsPerPageOptions="[10, 20, 50]"
      tableStyle="min-width: 50rem"
    >
      <Column field="id" header="ID"></Column>
      <Column field="created_at" header="Created"></Column>
      <Column field="updated_at" header="Last Updated"></Column>
      <Column field="project_id" header="Project ID"></Column>
      <Column field="node_id" header="Node ID"></Column>
      <Column field="approval_status" header="Approval Status"></Column>
      <Column field="id" header="Set Approval" :exportable="false">
        <template #body="slotProps">
          <ApproveRejectButtons :projectId="slotProps.data.id" />
        </template>
      </Column>
    </DataTable>
  </div>
</template>

<style scoped lang="scss"></style>
