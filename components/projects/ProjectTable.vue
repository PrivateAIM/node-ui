<script setup lang="ts">
import { getProjects } from "~/composables/useAPIFetch";
import { parseUnixTimestamp } from "~/utils/parse-unix-timestamp";

const projects = ref();
const sort = ref(true);

onMounted(() => {
  nextTick(async () => {
    const { data: response } = await getProjects();
    projects.value = parseUnixTimestamp(
      response.value!.data as unknown as Map<string, string | number | null>[],
      ["created_at", "updated_at"],
    );
  });
});
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
      <template #empty> No projects found. </template>
      <Column field="name" header="Name" :sortable="sort"></Column>
      <Column field="created_at" header="Created"></Column>
      <Column field="updated_at" header="Last Updated"></Column>
      <Column
        field="analyses"
        header="Number Analyses"
        :sortable="sort"
      ></Column>
      <Column field="master_image_id" header="Master Image UUID"></Column>
    </DataTable>
  </div>
</template>

<style scoped lang="scss"></style>
