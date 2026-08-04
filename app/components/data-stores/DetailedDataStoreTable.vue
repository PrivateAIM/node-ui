<script lang="ts" setup>
import { deleteDataStore } from "~/composables/useAPIFetch";
import ConfirmDialog from "primevue/confirmdialog";
import { useConfirm } from "primevue/useconfirm";
import { useToast } from "primevue/usetoast";
import type { Route } from "~/services/Api";
import { FilterMatchMode } from "@primevue/core/api";
import SearchBar from "~/components/table/SearchBar.vue";
import { parseKongTags } from "~/utils/parse-kong-tags";
import { parseUnixTimestamp } from "~/utils/format-data-row";
import { getDataStoreTypeSeverity } from "~/utils/status-tag-severity";
import type {
  ModifiedDetailedService,
  modifiedTimestamp,
} from "~/services/modifiedApiInterfaces";
import { useNuxtApp } from "nuxt/app";

interface DetailedDataStoreTableRow {
  rowKey: string;
  datastoreId?: string | undefined;
  projectId?: string | undefined;
  name?: string | null | undefined;
  type?: string | undefined;
  project?: string | undefined;
  path?: string | null | undefined;
  host?: string | null | undefined;
  port?: number | null | undefined;
  protocol?: string | null | undefined;
  created_at?: modifiedTimestamp | undefined;
  updated_at?: modifiedTimestamp | undefined;
}

const props = defineProps({
  stores: Array<ModifiedDetailedService>,
  projectNameMap: Map<string, string | undefined>,
  loading: Boolean,
});

const confirm = useConfirm();
const toast = useToast();
const deleteLoadingFor = ref<string | null>(null);
const checkingConnectionFor = ref<string | null>(null);

const emit = defineEmits(["deleteDataStore"]);

const dataStoreTypes = ["s3", "fhir"];

const dataStores = computed(() => {
  let tableRows: DetailedDataStoreTableRow[] = [];

  if (props.stores && props.stores.length > 0) {
    props.stores.forEach((store: ModifiedDetailedService) => {
      const formattedRow = parseUnixTimestamp(store, [
        "created_at",
        "updated_at",
      ]) as ModifiedDetailedService;
      const baseRow: DetailedDataStoreTableRow = {
        rowKey: store.id!,
        datastoreId: store.id ?? undefined,
        name: store.name,
        type: parseKongTags(store.tags).type,
        project: "N/A",
        path: store.path,
        host: store.host,
        port: store.port,
        protocol: store.protocol,
        created_at: formattedRow.created_at,
        updated_at: formattedRow.updated_at,
      };
      const routes = store.routes;
      if (routes && routes.length > 0) {
        routes.forEach((route: Route) => {
          const routeTags = parseKongTags(route.tags);
          const projectUuid = routeTags.project ?? route["projectId"];
          tableRows.push({
            ...baseRow,
            rowKey: `${store.id}:${route.id}`,
            projectId: projectUuid,
            type: routeTags.type ?? baseRow.type,
            project:
              projectUuid && props.projectNameMap?.has(projectUuid)
                ? props.projectNameMap.get(projectUuid)!
                : "N/A",
          });
        });
      } else {
        // Data stores can now exist without any linked project
        tableRows.push(baseRow);
      }
    });
  }

  return tableRows;
});

async function onConfirmDeleteDataStore(row: DetailedDataStoreTableRow) {
  const dsId = row.datastoreId ?? row.name!;
  deleteLoadingFor.value = dsId;

  try {
    // Cascade removes the project links (routes) along with the store
    await deleteDataStore(dsId, true);
    toast.add({
      severity: "success",
      summary: "Delete success",
      detail: "The data store was successfully deleted",
      life: 3000,
    });
    emit("deleteDataStore", dsId);
  } catch {
    toast.add({
      severity: "error",
      summary: "Delete failure",
      detail: "An error occurred while trying to delete the data store",
      life: 3000,
    });
  } finally {
    deleteLoadingFor.value = null;
  }
}

const confirmDelete = (row: DetailedDataStoreTableRow) => {
  confirm.require({
    header: "Confirm Data Store Removal",
    message:
      "Are you sure you want to delete this data store? This will disconnect all projects and analyses from accessing this data.",
    icon: "pi pi-exclamation-circle",
    acceptProps: {
      label: "Delete",
      icon: "pi pi-check",
    },
    rejectProps: {
      label: "Cancel",
      severity: "secondary",
      outlined: true,
      icon: "pi pi-times",
    },
    accept: () => {
      onConfirmDeleteDataStore(row);
    },
    reject: () => {},
  });
};

async function onCheckConnection(row: DetailedDataStoreTableRow) {
  checkingConnectionFor.value = row.rowKey;

  const connStatus = await useNuxtApp()
    .$hubApi(
      `/kong/project/${row.projectId}/datastore/${row.datastoreId}/health`,
      {
        method: "GET",
      },
    )
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
  checkingConnectionFor.value = null;
}

// Table filters
const defaultFilters = {
  global: { value: undefined, matchMode: FilterMatchMode.CONTAINS },
  type: { value: undefined, matchMode: FilterMatchMode.EQUALS },
  "created_at.short": { value: undefined, matchMode: FilterMatchMode.DATE_IS },
  "updated_at.short": { value: undefined, matchMode: FilterMatchMode.DATE_IS },
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
  // @ts-expect-error filters are fine
  filters.value = clearedFilters;
}

const updateFilters = (filterText: string) => {
  // @ts-expect-error filters are fine
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
    <ConfirmDialog></ConfirmDialog>
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
            <b>Test Connection</b>
          </span>
        </template>
        <template #body="slotProps">
          <div>
            <Button
              v-tooltip.top="
                slotProps.data.projectId
                  ? undefined
                  : 'No linked project to test through'
              "
              :disabled="!slotProps.data.projectId"
              :loading="checkingConnectionFor === slotProps.data.rowKey"
              aria-label="test-connection"
              icon="pi pi-wifi"
              severity="contrast"
              @click="onCheckConnection(slotProps.data)"
            />
          </div>
        </template>
      </Column>
      <Column :exportable="false" field="name">
        <template #header>
          <span v-tooltip.top="'Delete the data store'" class="help-text">
            <b>Delete Data Store</b>
          </span>
        </template>
        <template #body="slotProps">
          <div>
            <Button
              :loading="deleteLoadingFor === slotProps.data.datastoreId"
              aria-label="Delete"
              icon="pi pi-trash"
              severity="danger"
              @click="confirmDelete(slotProps.data)"
            />
          </div>
        </template>
      </Column>
    </DataTable>
  </div>
</template>

<style lang="scss" scoped></style>
