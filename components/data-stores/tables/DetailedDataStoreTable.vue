<script setup lang="ts">
import { deleteDataStore } from "~/composables/useAPIFetch";
import { useConfirm } from "primevue/useconfirm";
import type { DetailedService } from "~/services/Api";
import { FilterMatchMode } from "primevue/api";
import SearchBar from "~/components/table/SearchBar.vue";

const props = defineProps({
  stores: Array<DetailedService>,
  loading: Boolean,
});

const dataStores = ref(props.stores);
const confirm = useConfirm();
const toast = useToast();
const deleteLoading = ref(false);

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
    dataStores.value = dataStores.value?.filter(
      (store: DetailedService) => store.name !== dsName,
    );
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
    group: "templating",
    message: "Are you sure you want to delete this data store?",
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
  <div class="dataStoreTable">
    <DataTable
      :value="dataStores"
      paginator
      :loading="props.loading"
      :rows="10"
      :rowsPerPageOptions="[10, 20, 50]"
      tableStyle="min-width: 50rem"
      v-model:filters="filters"
      filterDisplay="menu"
      :globalFilterFields="['name', 'path', 'host']"
    >
      <template #empty> No data stores found. </template>
      <template #header>
        <div class="table-header-row">
          <SearchBar
            :searchTerm="defaultFilters.global.value"
            @clearFilters="resetFilters"
            @updateSearch="updateFilters"
          />
        </div>
      </template>
      <Column field="name" header="Name" :sortable="true"></Column>
      <Column field="path" header="Path"></Column>
      <Column field="host" header="Host" :sortable="true"></Column>
      <Column field="port" header="Port"></Column>
      <Column field="protocol" header="Protocol" :sortable="true"></Column>
      <Column header="Created On" filterField="created_at.long" dataType="date">
        <template #body="{ data }">
          <p v-tooltip.top="data.created_at.long">
            {{ data.created_at.short }}
          </p>
        </template>
      </Column>
      <Column header="Last Updated" filterField="date" dataType="date">
        <template #body="{ data }">
          <p v-tooltip.top="data.updated_at.long">
            {{ data.updated_at.short }}
          </p>
        </template>
      </Column>
      <Column field="name" header="Delete?" :exportable="false">
        <template #body="slotProps">
          <ConfirmPopup group="templating">
            <template #message="slotProps">
              <div
                class="flex flex-col items-center w-full gap-4 border-b border-surface-200 dark:border-surface-700 p-4 mb-4 pb-0"
              >
                <i
                  :class="slotProps.message.icon"
                  class="text-6xl text-primary-500"
                ></i>
                <p>{{ slotProps.message.message }}</p>
              </div>
            </template>
          </ConfirmPopup>
          <Button
            icon="pi pi-trash"
            aria-label="Delete"
            severity="danger"
            :loading="deleteLoading"
            @click="confirmDelete($event, slotProps.data.name)"
          />
        </template>
      </Column>
    </DataTable>
  </div>
</template>

<style scoped lang="scss">
.expandButtons {
  display: flex;
  justify-content: flex-end;
  margin-left: auto;
  margin-right: 0;
}
</style>
