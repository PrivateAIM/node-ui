<script setup lang="ts">
import { getProjects } from "~/composables/useAPIFetch";

const { data: response } = await getProjects();

const projects = (response.value!.data as unknown as []) || [];
</script>

<template>
  <div class="projectTable">
    <h2 style="color: blue">Currently Running Projects</h2>
    <DataTable
      :value="projects"
      paginator
      :rows="10"
      :rowsPerPageOptions="[10, 20, 50]"
      tableStyle="min-width: 50rem"
    >
      <Column field="name" header="Name"></Column>
      <Column field="created_at" header="Created"></Column>
      <Column field="updated_at" header="Last Updated"></Column>
      <Column field="analyses" header="Number Analyses"></Column>
      <Column field="master_image_id" header="Master Image UUID"></Column>
    </DataTable>
  </div>
</template>

<style scoped lang="scss"></style>
