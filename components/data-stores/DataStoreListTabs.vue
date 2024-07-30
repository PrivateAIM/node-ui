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
const consumers = ref();
const projectNameMap = ref();
const analysisNameMap = ref();

const dataRowUnixCols = ["created_at", "updated_at"];
const expandRowEntries = [];

const tableLoadSuccessful = await loadDetailedDataStoreTable();

if (tableLoadSuccessful) {
  projectNameMap.value = await fetchDataFromHub(true);
  analysisNameMap.value = await fetchDataFromHub(false);

  const { data: consumerResp } = await getAnalysesFromKong();
  consumers.value = consumerResp.value!.data;
}

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

async function fetchDataFromHub(projects: boolean) {
  let hubData;
  if (projects) {
    const { data: resp } = await getProjects();
    hubData = resp.value!.data;
  } else {
    const { data: resp } = await getAnalyses();
    hubData = resp.value!.data;
  }

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
      <TabPanel header="Data Store Tree Table">
        <DataStoreTreeTable
          :dataStoreList="dataStores"
          :analyses="consumers"
          :analysisNameMap="analysisNameMap"
          :projectNameMap="projectNameMap"
        />
      </TabPanel>
      <TabPanel header="Detailed Data Store View" :disabled="!dataStores">
        <DetailedDataStoreTable :stores="dataStores" />
      </TabPanel>
      <TabPanel header="Detailed Projects View" :disabled="!projectNameMap">
        <DetailedProjectTable
          :detailedStoreList="dataStores"
          :projectNameMap="projectNameMap"
          v-if="projectNameMap"
        />
      </TabPanel>
      <TabPanel header="Detailed Analyses View">
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
