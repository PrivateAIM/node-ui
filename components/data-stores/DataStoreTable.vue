<script setup lang="ts">
import { deleteDataStore, getDataStores } from "~/composables/useAPIFetch";
import type { Route } from "~/services/Api";
import { parseUnixTimestamp } from "~/utils/parse-unix-timestamp";

const dataStores = ref();

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

function onSubmitDeleteDataStore(dsName: string) {
  deleteDataStore(dsName);
  window.location.reload();
}
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
      <Column field="name" header="Name"></Column>
      <Column field="paths" header="Paths"></Column>
      <Column field="hosts" header="Hosts"></Column>
      <Column field="port" header="Port"></Column>
      <Column field="protocol" header="Protocol"></Column>
      <Column field="created_at" header="Created"></Column>
      <Column field="updated_at" header="Last Updated"></Column>
      <Column field="name" header="Delete?" :exportable="false">
        <template #body="slotProps">
          <Button
            icon="pi pi-trash"
            aria-label="Delete"
            severity="danger"
            @click="onSubmitDeleteDataStore(slotProps.data.name)"
          />
        </template>
      </Column>
    </DataTable>
  </div>
</template>

<style scoped lang="scss"></style>
