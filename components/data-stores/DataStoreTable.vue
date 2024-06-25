<script setup lang="ts">
import { deleteDataStore, getDataStores } from "~/composables/useAPIFetch";
import type { Route } from "~/services/Api";
import { formatDataRow } from "~/utils/format-data-row";
import { useConfirm } from "primevue/useconfirm";

const dataStores = ref();
const confirm = useConfirm();

const dataRowUnixCols = ["created_at", "updated_at"];
const expandRowEntries = ["created_at", "updated_at"];

onMounted(() => {
  nextTick(async () => {
    const { data: response } = await getDataStores();

    dataStores.value = formatDataRow(
      response.value!.data as Map<string, string | number | null>[],
      dataRowUnixCols,
      expandRowEntries,
    ) as Route[];
  });
});

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
console.log(dataStores);
</script>

<template>
  <div class="dataStoreTable">
    <h2 style="color: white">Available Data Stores</h2>
    <DataTable
      :value="dataStores"
      paginator
      :rows="10"
      :rowsPerPageOptions="[10, 20, 50]"
      tableStyle="min-width: 50rem"
    >
      <template #empty> No data stores found. </template>
      <Column field="name" header="Name" :sortable="true"></Column>
      <Column field="path" header="Path"></Column>
      <Column field="host" header="Host" :sortable="true"></Column>
      <Column field="port" header="Port"></Column>
      <Column field="protocol" header="Protocol" :sortable="true"></Column>
      <Column field="created_at" header="Created"></Column>
      <Column field="updated_at" header="Last Updated"></Column>
      <Column field="name" header="Delete?" :exportable="false">
        <template #body="slotProps">
          <Toast />
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
    </DataTable>
  </div>
</template>

<style scoped lang="scss"></style>
