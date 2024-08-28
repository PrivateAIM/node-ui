<script setup lang="ts">
import { getProjects } from "~/composables/useAPIFetch";
import { formatDataRow } from "~/utils/format-data-row";
import { showHubAdapterConnectionErrorToast } from "~/composables/connectionErrorToast";
import { FilterMatchMode, FilterOperator } from "primevue/api";

const projects = ref();

const dataRowUnixCols = ["created_at", "updated_at"];
const expandRowEntries = [];

const filters = ref({
  global: { value: null, matchMode: FilterMatchMode.CONTAINS },
  "created_at.short": {
    operator: FilterOperator.AND,
    constraints: [{ value: null, matchMode: FilterMatchMode.DATE_IS }],
  },
  "updated_at.short": {
    operator: FilterOperator.AND,
    constraints: [{ value: null, matchMode: FilterMatchMode.DATE_IS }],
  },
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

const clearFilter = () => {
  initFilters();
};
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
          <Column
            header="Created On"
            filterField="created_at.long"
            dataType="date"
          >
            <template #body="{ data }">
              <p v-tooltip.top="data.created_at.long">
                {{ data.created_at.short }}
              </p>
            </template>
            <template #filter="{ filterModel }">
              <Calendar
                v-model="filterModel.value"
                dateFormat="dd.mm.yyyy"
                placeholder="dd.mm.yyyy"
                mask="99/99/9999"
              />
            </template>
          </Column>
          <Column header="Last Updated" filterField="date" dataType="date">
            <template #body="{ data }">
              <p v-tooltip.top="data.updated_at.long">
                {{ data.updated_at.short }}
              </p>
            </template>
          </Column>
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
