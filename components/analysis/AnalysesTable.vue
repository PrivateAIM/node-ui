<script setup lang="ts">
import { getAnalyses } from "~/composables/useAPIFetch";

const analyses = ref();

onMounted(() => {
  nextTick(async () => {
    const { data: response } = await getAnalyses();
    analyses.value = response.value!.data;
  });
});
</script>

<template>
  <div class="analysisTable">
    <h2 style="color: Yellow">Analysis Table Example</h2>
    <DataTable
      :value="analyses"
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
    </DataTable>
  </div>
</template>

<style scoped lang="scss"></style>
