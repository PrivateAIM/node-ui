<script setup lang="ts">
import DetailedProjectTable from "~/components/data-stores/DetailedProjectTable.vue";
import { getDataStores } from "~/composables/useAPIFetch";
import { formatDataRow } from "~/utils/format-data-row";
import type { DetailedService, Route } from "~/services/Api";
import DetailedDataStoreTable from "~/components/data-stores/DetailedDataStoreTable.vue";
import DetailedAnalysisTable from "~/components/data-stores/DetailedAnalysisTable.vue";

const dataStores = ref();
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
</script>

<template>
  <div class="card">
    <TabView style="margin-top: 40px">
      <TabPanel header="Detailed Data Store View">
        <DetailedDataStoreTable :stores="dataStores" />
      </TabPanel>
      <TabPanel header="Detailed Projects View" :disabled="!dataStores">
        <DetailedProjectTable
          :detailedStoreList="dataStores"
          v-if="dataStores"
        />
      </TabPanel>
      <TabPanel header="Detailed Analyses View" :disabled="true">
        <DetailedAnalysisTable />
      </TabPanel>
    </TabView>
  </div>
</template>

<style scoped lang="scss"></style>
