<script setup lang="ts">
import DetailedProjectTable from "~/components/data-stores/tables/DetailedProjectTable.vue";
import { getDataStores } from "~/composables/useAPIFetch";
import { formatDataRow } from "~/utils/format-data-row";
const { $hubApi } = useNuxtApp();
import type {
  AllAnalyses,
  AllProjects,
  Analysis,
  DetailedService,
  ListConsumers,
  Project,
  Route,
} from "~/services/Api";
import DetailedDataStoreTable from "~/components/data-stores/tables/DetailedDataStoreTable.vue";
import DetailedAnalysisTable from "~/components/data-stores/tables/DetailedAnalysisTable.vue";
import { showConnectionErrorToast } from "~/composables/connectionErrorToast";

const dataStores = ref();
const consumers = ref();
const projectNameMap = ref();
const analysisNameMap = ref();

const dataRowUnixCols = ["created_at", "updated_at"];
const expandRowEntries = [];

onBeforeMount(() => {
  nextTick(async () => {
    const tableLoadSuccessful = await loadDetailedDataStoreTable();

    if (tableLoadSuccessful) {
      projectNameMap.value = await fetchDataFromHub("/projects");
      analysisNameMap.value = await fetchDataFromHub("/analyses");

      const consumerResp = (await $hubApi("/kong/analysis")) as ListConsumers;
      consumers.value = consumerResp.data;
    }
  });
});

async function loadDetailedDataStoreTable() {
  const { data: response, status, error } = await getDataStores(true);

  if (status.value === "success") {
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
    return true;
  } else if (error.value?.statusCode === 500) {
    showConnectionErrorToast();
    dataStores.value = [];
  }
}

async function fetchDataFromHub(route: string) {
  const resp = (await $hubApi(route)) as AllProjects | AllAnalyses;
  const respData = resp.data;

  let mappedNames = new Map<string, string | null>();
  if (respData && respData.length > 0) {
    respData.forEach((entry: Project | Analysis) => {
      mappedNames.set(entry.id, entry.name ? entry.name : "N/A");
    });
  }
  return mappedNames;
}

function extractProjectIdFromPath(paths: string[]): string {
  return paths[0].split("/")[1];
}
</script>

<template>
  <div class="card tabCard">
    <TabView>
      <TabPanel header="Detailed Data Store View">
        <DetailedDataStoreTable :stores="dataStores" />
      </TabPanel>
      <TabPanel header="Detailed Projects View" :disabled="!projectNameMap">
        <DetailedProjectTable
          :detailedStoreList="dataStores"
          :projectNameMap="projectNameMap"
          v-if="projectNameMap"
        />
      </TabPanel>
      <TabPanel header="Detailed Analyses View" :disabled="!consumers">
        <DetailedAnalysisTable
          :detailedAnalysisList="consumers"
          :analysisNameMap="analysisNameMap"
          :projectNameMap="projectNameMap"
          v-if="consumers"
        />
      </TabPanel>
    </TabView>
  </div>
</template>

<style scoped lang="scss"></style>
