<script setup lang="ts">
import DetailedProjectTable from "~/components/data-stores/tables/DetailedProjectTable.vue";
import {
  getAnalyses,
  getAnalysesFromKong,
  getDataStores,
  getProjects,
} from "~/composables/useAPIFetch";
import { formatDataRow } from "~/utils/format-data-row";
import type { Analysis, DetailedService, Project, Route } from "~/services/Api";
import DetailedDataStoreTable from "~/components/data-stores/tables/DetailedDataStoreTable.vue";
import DetailedAnalysisTable from "~/components/data-stores/tables/DetailedAnalysisTable.vue";
import { showConnectionErrorToast } from "~/composables/connectionErrorToast";
import DataStoreTreeTable from "~/components/data-stores/tables/DataStoreTreeTable.vue";

const dataStores = ref();
const consumersAnalyses = ref();
const projectNameMap = ref();
const analysisNameMap = ref();

const loading = ref(true);

const dataRowUnixCols = ["created_at", "updated_at"];
const expandRowEntries = [];

const {
  data: dsResp,
  status: dsStatus,
  error: dsError,
} = await getDataStores(true, { lazy: true });

const { data: projectResp } = await getProjects({ lazy: true });
const { data: analysisResp } = await getAnalyses({ lazy: true });
const { data: consumerResp } = await getAnalysesFromKong({
  lazy: true,
});

watch(dsResp, (parsedStores) => {
  const dataStoreData = parsedStores!.data as unknown as Array<Route>;
  loadDetailedDataStoreTable(dataStoreData, dsStatus, dsError);
});

watch(projectResp, (projectArray) => {
  const projects = projectArray!.data as unknown as Project[];
  projectNameMap.value = mapDataFromHub(projects);
});

watch(analysisResp, (analysisArray) => {
  const analyses = analysisArray!.data as unknown as Analysis[];
  analysisNameMap.value = mapDataFromHub(analyses);
});

watch(consumerResp, (consumerData) => {
  consumersAnalyses.value = consumerData!.data;
});

async function loadDetailedDataStoreTable(responseData, status, error) {
  if (status.value === "success") {
    let formattedDataStores = formatDataRow(
      responseData,
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
  } else if (error.value?.statusCode === 500) {
    showConnectionErrorToast();
    dataStores.value = [];
  }
  loading.value = false;
}

function mapDataFromHub(hubData: Project[] | Analysis[]) {
  let mappedNames = new Map<string, string | null>();
  if (hubData && hubData.length > 0) {
    hubData.forEach((entry: Project | Analysis) => {
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
        <DetailedDataStoreTable :stores="dataStores" :loading="loading" />
      </TabPanel>
      <TabPanel header="Detailed Projects View" :disabled="!projectNameMap">
        <DetailedProjectTable
          v-if="projectNameMap"
          :detailedStoreList="dataStores"
          :projectNameMap="projectNameMap"
        />
      </TabPanel>
      <TabPanel header="Detailed Analyses View" :disabled="!analysisNameMap">
        <DetailedAnalysisTable
          v-if="analysisNameMap && projectNameMap"
          :detailedAnalysisList="consumersAnalyses"
          :analysisNameMap="analysisNameMap"
          :projectNameMap="projectNameMap"
        />
      </TabPanel>
      <TabPanel
        header="Data Store Tree Table"
        :disabled="!analysisNameMap && !projectNameMap"
      >
        <DataStoreTreeTable
          v-if="analysisNameMap && projectNameMap"
          :dataStoreList="dataStores"
          :analyses="consumersAnalyses"
          :analysisNameMap="analysisNameMap"
          :projectNameMap="projectNameMap"
        />
      </TabPanel>
    </TabView>
  </div>
</template>

<style scoped lang="scss"></style>
