<script setup lang="ts">
import { deleteDataStore, getDataStores } from "~/composables/useAPIFetch";
import type { DetailedService, Route } from "~/services/Api";
import { formatDataRow } from "~/utils/format-data-row";
import { useConfirm } from "primevue/useconfirm";
import AssociatedProjectTable from "~/components/data-stores/AssociatedProjectTable.vue";

const dataStores = ref();
const confirm = useConfirm();
const expandedRows = ref({});
const loading = ref(true);

const dataRowUnixCols = ["created_at", "updated_at"];
const expandRowEntries = [];

onMounted(() => {
  nextTick(async () => {
    const { data: response } = await getDataStores(true);

    let formattedDataStores = formatDataRow(
      response.value!.data,
      dataRowUnixCols,
      expandRowEntries,
    ) as DetailedService[];

    formattedDataStores.forEach((store: DetailedService) => {
      if (store.routes!.length) {
        store.routes = formatDataRow(
          store.routes,
          dataRowUnixCols,
          expandRowEntries,
        );
        store.routes?.forEach((proj: Route) => {
          proj["projectId"] = extractProjectIdFromPath(proj.paths! as string[]);
        });
      }
    });

    dataStores.value = formattedDataStores;
    loading.value = false;
  });
});

function extractProjectIdFromPath(paths: string[]): string {
  return paths[0].split("/")[1];
}

const expandAll = () => {
  expandedRows.value = dataStores.value.reduce(
    (accordion: boolean, dataStore: DetailedService) =>
      // eslint-disable-next-line no-constant-binary-expression
      (accordion[dataStore.id!] = true) && accordion,
    {},
  );
};

const collapseAll = () => {
  expandedRows.value = {};
};

function onConfirmDeleteDataStore(dsName: string) {
  deleteDataStore(dsName);
  window.location.reload();
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
</script>

<template>
  <div class="dataStoreTable">
    <h2 style="color: white">Available Data Stores</h2>
    <DataTable
      :value="dataStores"
      v-model:expandedRows="expandedRows"
      dataKey="id"
      paginator
      :rows="10"
      :rowsPerPageOptions="[10, 20, 50]"
      :loading="loading"
      tableStyle="min-width: 50rem"
    >
      <template #empty> No data stores found. </template>
      <template #header>
        <div class="flex flex-wrap justify-end gap-2 expandButtons">
          <Button
            text
            icon="pi pi-plus"
            label="Expand All"
            @click="expandAll"
          />
          <Button
            text
            icon="pi pi-minus"
            label="Collapse All"
            @click="collapseAll"
          />
        </div>
      </template>
      <Column expander style="width: 5rem" />
      <Column field="name" header="Name" :sortable="true"></Column>
      <Column field="path" header="Path"></Column>
      <Column field="host" header="Host" :sortable="true"></Column>
      <Column field="port" header="Port"></Column>
      <Column field="protocol" header="Protocol" :sortable="true"></Column>
      <Column field="created_at" header="Created" :sortable="true"></Column>
      <Column
        field="updated_at"
        header="Last Updated"
        :sortable="true"
      ></Column>
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
            @click="confirmDelete($event, slotProps.data.name)"
          />
        </template>
      </Column>
      <template #expansion="slotProps">
        <div v-if="slotProps.data.routes.length" class="p-3">
          <AssociatedProjectTable :associatedProjects="slotProps.data.routes" />
        </div>
        <div v-else>
          <p>No associated projects found.</p>
        </div>
      </template>
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
