<script lang="ts" setup>
import { deleteDataStore } from "~/composables/useAPIFetch";
import { useConfirm } from "primevue/useconfirm";
import type { Route } from "~/services/Api";
import { FilterMatchMode } from "@primevue/core/api";
import SearchBar from "~/components/table/SearchBar.vue";
import { extractUuid } from "~/utils/extract-uuid-from-kong-username";
import { parseUnixTimestamp } from "~/utils/format-data-row";
import { getDataStoreTypeSeverity } from "~/utils/status-tag-severity";
import type { ModifiedDetailedService } from "~/services/modifiedApiInterfaces";

interface DetailedDataStoreTableRow {
  name?: string | null;
  type?: string | null;
  project?: string | null;
  path?: string | null;
  host?: string | null;
  port?: number | null;
  protocol?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
}

const props = defineProps({
  stores: Array<ModifiedDetailedService>,
  projectNameMap: Map<string, string | null>,
  loading: Boolean,
});

const confirm = useConfirm();
const toast = useToast();
const deleteLoading = ref(false);

const dataStoreTypes = ["s3", "fhir"];

const dataStores = computed(() => {
  let tableRows: DetailedDataStoreTableRow[] = [];

  if (props.stores && props.stores.length > 0) {
    props.stores.forEach((store: ModifiedDetailedService) => {
      const formattedRow: DetailedDataStoreTableRow = parseUnixTimestamp(
        store,
        ["created_at", "updated_at"],
      );
      const routes = store.routes;
      if (routes && routes.length > 0) {
        routes.forEach((proj: Route) => {
          const projectParts = extractUuid(proj.name!);
          const dataStoreType = projectParts[0];
          const projectUuid = projectParts[1];
          const newRow: DetailedDataStoreTableRow = {
            name: store.name,
            type: dataStoreType,
            project: props.projectNameMap?.has(projectUuid)
              ? props.projectNameMap.get(projectUuid)!
              : "N/A",
            path: store.path,
            host: store.host,
            port: store.port,
            protocol: store.protocol,
            created_at: formattedRow.created_at,
            updated_at: formattedRow.updated_at,
          };
          tableRows.push(newRow);
        });
      }
    });
  }

  return tableRows;
});

async function onConfirmDeleteDataStore(dsName: string) {
  deleteLoading.value = true;
  const { status } = await deleteDataStore(dsName);
  if (status.value === "success") {
    toast.add({
      severity: "info",
      summary: "Delete success",
      detail: "The data store was successfully deleted",
      life: 3000,
    });
    // dataStores.value = dataStores.value?.filter(
    //   (store: DetailedService) => store.name !== dsName,
    // );
  } else {
    toast.add({
      severity: "error",
      summary: "Delete failure",
      detail: "An error occurred while trying to delete the data store",
      life: 3000,
    });
  }
  deleteLoading.value = false;
}

const confirmDelete = (event, dsName: string) => {
  confirm.require({
    target: event.currentTarget,
    group: "dataStoreDelete",
    message:
      "Are you sure you want to delete this data store? This will disconnect all projects and analyses from accessing this data.",
    icon: "pi pi-exclamation-circle",
    acceptIcon: "pi pi-check",
    acceptLabel: "Confirm",
    rejectIcon: "pi pi-times",
    rejectLabel: "Cancel",
    accept: () => {
      onConfirmDeleteDataStore(dsName);
    },
    reject: () => {},
  });
};

// Table filters
const defaultFilters = {
  global: { value: null, matchMode: FilterMatchMode.CONTAINS },
  type: { value: null, matchMode: FilterMatchMode.EQUALS },
  "created_at.short": { value: null, matchMode: FilterMatchMode.DATE_IS },
  "updated_at.short": { value: null, matchMode: FilterMatchMode.DATE_IS },
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
  <div class="table-header-row">
    <SearchBar
      :searchTerm="defaultFilters.global.value"
      @clearFilters="resetFilters"
      @updateSearch="updateFilters"
    />
  </div>
  <div class="detailed-data-store-table">
    <DataTable
      v-model:filters="filters"
      :globalFilterFields="[
        'name',
        'path',
        'host',
        'project',
        'type',
        'protocol',
      ]"
      :loading="props.loading"
      :rows="10"
      :rowsPerPageOptions="[10, 20, 50]"
      :value="dataStores"
      filterDisplay="menu"
      paginator
      tableStyle="min-width: 50rem"
    >
      <template #empty> No data stores found.</template>
      <Column
        :sortable="true"
        field="name"
        header="Name"
        style="width: 30rem"
      ></Column>
      <Column :sortable="true" field="project" header="Project"></Column>
      <Column
        :showAddButton="false"
        :showApplyButton="false"
        :showClearButton="false"
        :showFilterMatchModes="false"
        :showFilterOperator="false"
        field="type"
        header="Type"
      >
        <template #body="{ data }">
          <Tag
            v-if="data.type"
            :severity="getDataStoreTypeSeverity(data.type)"
            :value="data.type"
          />
        </template>
        <template #filter="{ filterModel, filterCallback }">
          <Select
            v-model="filterModel.value"
            :options="dataStoreTypes"
            :showClear="true"
            class="p-column-filter"
            placeholder="Select One"
            @change="filterCallback()"
          >
            <template #option="slotProps">
              <Tag
                :severity="getDataStoreTypeSeverity(slotProps.option)"
                :value="slotProps.option"
              />
            </template>
          </Select>
        </template>
      </Column>
      <Column field="path" header="Path"></Column>
      <Column :sortable="true" field="host" header="Server"></Column>
      <Column field="port" header="Port"></Column>
      <Column :sortable="true" field="protocol" header="Protocol"></Column>
      <Column
        :sortable="true"
        dataType="date"
        field="created_at.timestamp"
        header="Created On"
      >
        <template #body="{ data }">
          <p v-tooltip.top="data.created_at.long">
            {{ data.created_at.short }}
          </p>
        </template>
      </Column>
      <Column
        :sortable="true"
        dataType="date"
        field="updated_at.timestamp"
        header="Last Updated"
      >
        <template #body="{ data }">
          <p v-tooltip.top="data.updated_at.long">
            {{ data.updated_at.short }}
          </p>
        </template>
      </Column>
      <Column :exportable="false" field="name" header="Delete?">
        <template #body="slotProps">
          <Toast />
          <ConfirmPopup group="dataStoreDelete" style="width: 20em">
            <template #message="slotProps">
              <div
                class="flex flex-col items-center w-full gap-4 border-b border-surface-200 dark:border-surface-700 p-4 mb-4 pb-0"
              >
                <i
                  :class="slotProps.message.icon"
                  class="text-6xl text-primary-500"
                ></i>
                <p style="padding: 10px">
                  {{ slotProps.message.message }}
                </p>
              </div>
            </template>
          </ConfirmPopup>
          <div>
            <Button
              :loading="deleteLoading"
              aria-label="Delete"
              icon="pi pi-trash"
              severity="danger"
              @click="confirmDelete($event, slotProps.data.name)"
            />
          </div>
        </template>
      </Column>
    </DataTable>
  </div>
</template>

<style lang="scss" scoped>
.expand-btns {
  display: flex;
  justify-content: flex-end;
  margin-left: auto;
  margin-right: 0;
}
</style>
