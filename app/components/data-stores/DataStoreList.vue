<script lang="ts" setup>
import { useDataStoreList } from "~/composables/useDataStoreList";
import DetailedDataStoreTable from "~/components/data-stores/DetailedDataStoreTable.vue";

const { dataStores, projectNameMap, loading, refresh } = await useDataStoreList();

function onDeleteDataStore(dsName: string) {
  dataStores.value = dataStores.value.filter((store) => store.name !== dsName);
  refresh();
}
</script>

<template>
  <div class="data-store-card">
    <Card class="content-card">
      <template #title>Data Stores</template>
      <template #content>
        <div class="data-store-description-box">
          <div class="data-store-description">
            <p>
              Data stores serve as gateways to the data that the analyses will
              access.
            </p>
            <p>
              Here, administrators can delete assigned data stores which will
              disconnect the project and all of its associated analyses from
              accessing the data.
            </p>
          </div>
        </div>
        <div class="data-store-table-card">
          <DetailedDataStoreTable
            :loading="loading"
            :projectNameMap="projectNameMap"
            :stores="dataStores"
            @deleteDataStore="onDeleteDataStore"
          />
        </div>
      </template>
    </Card>
  </div>
</template>

<style lang="scss"></style>
