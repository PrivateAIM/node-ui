<script setup lang="ts">
import { deleteDataStore } from "~/composables/useAPIFetch";
import { useConfirm } from "primevue/useconfirm";
import type { DetailedService } from "~/services/Api";

const confirm = useConfirm();
const toast = useToast();
const deleteLoading = ref(false);

const props = defineProps({
  stores: Array<DetailedService>,
  loading: Boolean,
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
</script>

<template>
  <div class="dataStoreTable">
    <DataTable
      :value="props.stores"
      paginator
      :loading="props.loading"
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
