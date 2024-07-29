<script setup lang="ts">
import { getProjects } from "~/composables/useAPIFetch";
import { formatDataRow } from "~/utils/format-data-row";
import { showConnectionErrorToast } from "~/composables/connectionErrorToast";

const projects = ref();
const loading = ref(true);

const dataRowUnixCols = ["created_at", "updated_at"];
const expandRowEntries = [];

onMounted(() => {
  nextTick(async () => {
    const { data: response, status, error } = await getProjects();
    if (status.value === "success") {
      projects.value = formatDataRow(
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
</script>

<template>
  <div class="projectTable">
    <h2 style="color: yellow">Currently Running Projects</h2>
    <DataTable
      :value="projects"
      paginator
      :rows="10"
      :rowsPerPageOptions="[10, 20, 50]"
      :loading="loading"
      tableStyle="min-width: 50rem"
    >
      <template #empty> No projects found. </template>
      <Column field="name" header="Name" :sortable="true"></Column>
      <Column field="created_at" header="Created" :sortable="true"></Column>
      <Column
        field="updated_at"
        header="Last Updated"
        :sortable="true"
      ></Column>
      <Column
        field="analyses"
        header="Number Analyses"
        :sortable="true"
      ></Column>
      <Column field="master_image_id" header="Master Image UUID"></Column>
    </DataTable>
  </div>
</template>

<style scoped lang="scss"></style>
