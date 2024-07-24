<script setup lang="ts">
import DetailedProjectTable from "~/components/data-stores/DetailedProjectTable.vue";
import { getDataStores } from "~/composables/useAPIFetch";
import { formatDataRow } from "~/utils/format-data-row";
import type {
  AllAnalyses,
  AllProjects,
  Analysis,
  DetailedService,
  Project,
  Route,
} from "~/services/Api";
import DetailedDataStoreTable from "~/components/data-stores/DetailedDataStoreTable.vue";
import DetailedAnalysisTable from "~/components/data-stores/DetailedAnalysisTable.vue";

const dataStores = ref();
const projectNameMap = ref();
const analysisNameMap = ref();
const loading = ref(true);

const dataRowUnixCols = ["created_at", "updated_at"];
const expandRowEntries = [];

onBeforeMount(() => {
  nextTick(async () => {
    const { user } = useOidcAuth();
    const config = useRuntimeConfig();
    const baseUrl = config.public.baseURL as string;

    await loadDetailedDataStoreTable();
    loading.value = false;

    projectNameMap.value = await fetchDataFromHub("/projects", baseUrl, user);
    analysisNameMap.value = await fetchDataFromHub("/analyses", baseUrl, user);
  });
});

async function loadDetailedDataStoreTable() {
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
}

async function fetchDataFromHub(route: string, hubUrl: string, currentUser) {
  const response = (await $fetch(hubUrl + route, {
    method: "GET",
    headers: { Authorization: `Bearer ${currentUser?.value.accessToken}` },
  })) as AllProjects | AllAnalyses;
  const respData = response.data;
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
  <div class="card">
    <TabView style="margin-top: 40px">
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
      <TabPanel header="Detailed Analyses View" :disabled="true">
        <DetailedAnalysisTable />
      </TabPanel>
    </TabView>
  </div>
</template>

<style scoped lang="scss"></style>
