<script setup lang="ts">
import ApproveRejectButtons from "~/components/analysis/ApproveRejectButtons.vue";
import { getAnalyses } from "~/composables/useAPIFetch";

// onMounted(() => {
//   CustomerService.getCustomersMedium().then((data) => (customers.value = data));
// });

const { data: analysisNodes } = await getAnalyses();
</script>

<template>
  <div class="analysisTable">
    <h2 style="color: Yellow">Analysis Table Example</h2>
    <DataTable
      :value="analysisNodes"
      :pt="{
        table: 'table table-striped',
      }"
      paginator
      :rows="10"
      :rowsPerPageOptions="[10, 20, 50]"
      tableStyle="min-width: 50rem"
    >
      <template #empty> No analyses found. </template>
      <Column field="id" header="ID"></Column>
      <Column field="approval_status" header="Approval Status"></Column>
      <Column field="run_status" header="Status"></Column>
      <Column field="project_id" header="Project ID"></Column>
      <Column field="node.name" header="Node"></Column>
      <Column field="id" header="Set Approval" :exportable="false">
        <template #body="slotProps">
          <ApproveRejectButtons :analysisId="slotProps.data.id" />
        </template>
      </Column>
    </DataTable>
  </div>
</template>

<style scoped lang="scss"></style>
