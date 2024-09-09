<script setup lang="ts">
import { getProjects } from "~/composables/useAPIFetch";
import { formatDataRow } from "~/utils/format-data-row";
import { showHubAdapterConnectionErrorToast } from "~/composables/connectionErrorToast";
import { FilterMatchMode } from "primevue/api";
import SearchBar from "~/components/table/SearchBar.vue";

const projects = ref();

const dataRowUnixCols = ["created_at", "updated_at"];
const expandRowEntries = [];

const { data: response, status, error, refresh } = await getProjects();

if (status.value === "success") {
  projects.value = formatDataRow(
    response.value!.data as unknown as Map<string, string | number | null>[],
    dataRowUnixCols,
    expandRowEntries,
  );
} else if (error.value?.statusCode === 500) {
  showHubAdapterConnectionErrorToast();
}

// Table filters
const defaultFilters = {
  global: { value: null, matchMode: FilterMatchMode.CONTAINS },
  "created_at.date": {
    value: null,
    matchMode: FilterMatchMode.DATE_IS | FilterMatchMode.DATE_BEFORE,
  },
  "updated_at.date": { value: null, matchMode: FilterMatchMode.DATE_IS },
};

const filters = ref(defaultFilters);

function resetFilters() {
  const clearedFilters = {};
  for (const filterKey in defaultFilters) {
    clearedFilters[filterKey] = {
      ...defaultFilters[filterKey],
    };
    clearedFilters[filterKey].value = null;
  }
  filters.value = clearedFilters;
}

const updateFilters = (filterText: string) => {
  filters.value.global.value = filterText;
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
              <SearchBar
                :searchTerm="defaultFilters.global.value"
                @clearFilters="resetFilters"
                @updateSearch="updateFilters"
              />
              <div class="card flex justify-content-center refresh-switch">
                <Button
                  icon="pi pi-refresh"
                  aria-label="Filter"
                  v-tooltip.top="'Refresh table'"
                  @click="refresh"
                  severity="contrast"
                />
              </div>
            </div>
          </template>
          <Column
            field="name"
            header="Name"
            :sortable="true"
            style="width: 30rem"
          ></Column>
          <Column
            header="Created On"
            field="created_at.long"
            filterField="created_at.date"
            dataType="date"
            :sortable="true"
          >
            <template #body="{ data }">
              <p v-tooltip.top="data.created_at.long">
                {{ data.created_at.short }}
              </p>
            </template>
            <!--            <template #filter="{ filterModel }">-->
            <!--              <Calendar-->
            <!--                v-model="filterModel.value"-->
            <!--                dateFormat="dd.mm.yyyy"-->
            <!--                placeholder="dd.mm.yyyy"-->
            <!--              />-->
            <!--            </template>-->
          </Column>
          <Column
            header="Last Updated"
            field="updated_at.long"
            filterField="updated_at.date"
            dataType="date"
            :sortable="true"
          >
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
        </DataTable>
      </template>
    </Card>
  </div>
</template>

<style scoped lang="scss"></style>
