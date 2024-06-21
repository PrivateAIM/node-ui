<script setup lang="ts">
import { deleteDataStore, getDataStores } from "~/composables/useAPIFetch";
import type { Route } from "~/services/Api";
import { parseUnixTimestamp } from "~/utils/parse-unix-timestamp";
import { useConfirm } from "primevue/useconfirm";

const dataStores = ref();

const confirm = useConfirm();

onMounted(() => {
  nextTick(async () => {
    const { data: response } = await getDataStores();
    const dataStroeUnixCols = ["created_at", "updated_at"];
    dataStores.value = parseUnixTimestamp(
      response.value!.data as Map<string, string | number | null>[],
      dataStroeUnixCols,
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
      <Column field="name" header="Name"></Column>
      <Column field="path" header="Path"></Column>
      <Column field="host" header="Host"></Column>
      <Column field="port" header="Port"></Column>
      <Column field="protocol" header="Protocol"></Column>
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
