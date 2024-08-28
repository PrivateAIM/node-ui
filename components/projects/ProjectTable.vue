<script setup lang="ts">
import { getProjects } from "~/composables/useAPIFetch";
import { formatDataRow } from "~/utils/format-data-row";
import { showHubAdapterConnectionErrorToast } from "~/composables/connectionErrorToast";
import { FilterMatchMode } from "primevue/api";

const projects = ref();

const dataRowUnixCols = ["created_at", "updated_at"];
const expandRowEntries = [];

const filters = ref({
  global: { value: null, matchMode: FilterMatchMode.CONTAINS },
});

const { data: response, status, error } = await getProjects();
if (status.value === "success") {
  projects.value = formatDataRow(
    response.value!.data as unknown as Map<string, string | number | null>[],
    dataRowUnixCols,
    expandRowEntries,
  );
} else if (error.value?.statusCode === 500) {
  showHubAdapterConnectionErrorToast();
}
</script>

<template>
  <div class="projectTable">
    <Card class="contentCard">
      <template #title>Currently Running Projects</template>
      <template #content>
        <DataTable
          :value="projects"
          paginator
          :rows="10"
          :rowsPerPageOptions="[10, 20, 50]"
          tableStyle="min-width: 50rem"
          v-model:filters="filters"
          filterDisplay="menu"
          :globalFilterFields="['name', 'master_image_id']"
        >
          <template #empty> No projects found. </template>
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
            </div>
          </template>
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
      </template>
    </Card>
  </div>
</template>

<style scoped lang="scss"></style>
