<script lang="ts" setup>
import {deleteDataStore} from "~/composables/useAPIFetch";
import {useConfirm} from "primevue/useconfirm";
import {useToast} from "primevue/usetoast";
import type {Route} from "~/services/Api";
import {FilterMatchMode} from "@primevue/core/api";
import SearchBar from "~/components/table/SearchBar.vue";
import {extractUuid} from "~/utils/extract-uuid-from-kong-username";
import {parseUnixTimestamp} from "~/utils/format-data-row";
import {getDataStoreTypeSeverity} from "~/utils/status-tag-severity";
import type {ModifiedDetailedService} from "~/services/modifiedApiInterfaces";
import {useNuxtApp} from "nuxt/app";

interface DetailedDataStoreTableRow {
  name?: string | undefined;
  type?: string | undefined;
  project?: string | undefined;
  path?: string | undefined;
  host?: string | undefined;
  port?: number | undefined;
  protocol?: string | undefined;
  created_at?: string | undefined;
  updated_at?: string | undefined;
}

const props = defineProps({
  stores: Array<ModifiedDetailedService>,
  projectNameMap: Map<string, string | undefined>,
  loading: Boolean,
});

const confirm = useConfirm();
const toast = useToast();
const deleteLoading = ref(false);
const checkingConnection = ref(false);

const emit = defineEmits(["deleteDataStore"]);

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
          const projectUuid = projectParts[1] as string;
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
  const {status} = await deleteDataStore(dsName);
  if (status.value === "success") {
    toast.add({
      severity: "info",
      summary: "Delete success",
      detail: "The data store was successfully deleted",
      life: 3000,
    });
    emit("deleteDataStore", dsName);
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
    position: "top",
    acceptLabel: "Confirm",
    rejectIcon: "pi pi-times",
    rejectLabel: "Cancel",
    accept: () => {
      onConfirmDeleteDataStore(dsName);
    },
    reject: () => {
    },
  });
};

async function onCheckConnection(dsName: string) {
  checkingConnection.value = true;
  const [dsType, projectId] = extractUuid(dsName);

  const connStatus = await useNuxtApp()
      .$hubApi(`/kong/project/${projectId}/${dsType}/health`, {
        method: "GET",
      })
      .catch(() => {
        toast.add({
          severity: "error",
          summary: "Connection test failed",
          detail: "Unable to contact the downstream data store",
          life: 5000,
        });
      });
  if (connStatus) {
    toast.add({
      severity: "success",
      summary: "Connection test success",
      detail: "The downstream data store responded successfully.",
      life: 3000,
    });
  }
  checkingConnection.value = false;
}

// Table filters
const defaultFilters = {
  global: {value: undefined, matchMode: FilterMatchMode.CONTAINS},
  type: {value: undefined, matchMode: FilterMatchMode.EQUALS},
  "created_at.short": {value: undefined, matchMode: FilterMatchMode.DATE_IS},
  "updated_at.short": {value: undefined, matchMode: FilterMatchMode.DATE_IS},
};

const filters = ref(defaultFilters);

function resetFilters() {
  const clearedFilters = {};
  for (const filterKey in defaultFilters) {
    clearedFilters[filterKey] = {
      ...defaultFilters[filterKey],
    };
    clearedFilters[filterKey].value = undefined;
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
        class="rounded-table structured-table"
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
      <Column :exportable="false" field="name">
        <template #header>
          <span
              v-tooltip.top="'Test the connection to the data store'"
              class="help-text"
          >
            <b>Test</b>
          </span>
        </template>
        <template #body="slotProps">
          <div>
            <Button
                :loading="checkingConnection"
                aria-label="test-connection"
                icon="pi pi-wifi"
                severity="contrast"
                @click="onCheckConnection(slotProps.data.name)"
            />
          </div>
        </template>
      </Column>
      <Column :exportable="false" field="name">
        <template #header>
          <span v-tooltip.top="'Delete the data store'" class="help-text">
            <b>Delete?</b>
          </span>
        </template>
        <template #body="slotProps">
          <ConfirmPopup class="ds-confirm-popup" group="dataStoreDelete">
            <template #message="slotProps">
              <div class="ds-confirm-message">
                <i
                    :class="slotProps.message.icon"
                    class="text-6xl text-primary-500"
                ></i>
                <p class="ds-confirm-text">
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
:deep(.ds-confirm-popup) {
  width: 20rem;
}

.ds-confirm-message {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  gap: 1rem;
  border-bottom: 1px solid var(--p-surface-200);
  padding: 1rem 1rem 0;
  margin-bottom: 1rem;
}

.ds-confirm-text {
  padding: 0 0.625rem;
  margin: 0;
  text-align: center;
}
</style>
