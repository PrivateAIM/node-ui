<script setup lang="ts">
import Tabs from "primevue/tabs";
import TabList from "primevue/tablist";
import Tab from "primevue/tab";
import TabPanels from "primevue/tabpanels";
import TabPanel from "primevue/tabpanel";
import {
  getAnalyses,
  getAnalysesFromKong,
  getDataStores,
  getProjects,
} from "~/composables/useAPIFetch";
import { formatDataRow } from "~/utils/format-data-row";
import type {
  ModifiedConsumer,
  ModifiedDetailedService,
} from "~/services/modifiedApiInterfaces";
import type {
  DetailedAnalysis,
  ListServices,
  Project,
  Route,
} from "~/services/Api";
import DetailedDataStoreTable from "~/components/data-stores/tables/DetailedDataStoreTable.vue";
import DetailedAnalysisTable from "~/components/data-stores/tables/DetailedAnalysisTable.vue";
import DataStoreTreeTable from "~/components/data-stores/tables/DataStoreTreeTable.vue";

const dataStores = ref<ModifiedDetailedService[]>([]);
const consumersAnalyses = ref<ModifiedConsumer[]>([]);
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
  const dataStoreData = parsedStores!.data as ListServices;
  loadDetailedDataStoreTable(dataStoreData, dsStatus.value, dsError);
});

watch(projectResp, (projectArray) => {
  const projects = (projectArray!.data as unknown as Project[]) || [];
  projectNameMap.value = mapDataFromHub(projects);
});

watch(analysisResp, (analysisArray) => {
  const analyses = (analysisArray!.data as unknown as DetailedAnalysis[]) || [];
  analysisNameMap.value = mapDataFromHub(analyses);
});

watch(consumerResp, (consumerData) => {
  consumersAnalyses.value = consumerData!.data as unknown as ModifiedConsumer[];
});

async function loadDetailedDataStoreTable(
  responseData: ListServices,
  status: string,
  error,
) {
  if (status === "success") {
    let formattedDataStores = formatDataRow(
      responseData,
      dataRowUnixCols,
      expandRowEntries,
    ) as ModifiedDetailedService[];

    formattedDataStores = formattedDataStores.filter(
      (store: ModifiedDetailedService) => store.name !== "kong-admin-service",
    );

    formattedDataStores.forEach((store: ModifiedDetailedService) => {
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
    dataStores.value = [];
  }
  loading.value = false;
}

function mapDataFromHub(hubData: Project[] | DetailedAnalysis[]) {
  let mappedNames = new Map<string, string | null>();
  if (hubData && hubData.length > 0) {
    hubData.forEach((entry: Project | DetailedAnalysis) => {
      if (entry.id) {
        mappedNames.set(entry.id, entry.name ? entry.name : "N/A");
      }
    });
  }
  return mappedNames;
}

function extractProjectIdFromPath(paths: string[]): string {
  return paths[0].split("/")[1];
}
</script>

<template>
  <div class="card tab-card">
    <Tabs value="0">
      <TabList>
        <Tab value="0" class="detailed-data-store-tab"
          >Detailed Data Store View
        </Tab>
        <Tab
          value="1"
          class="detailed-analysis-tab"
          :disabled="dataStores.length === 0"
          >Detailed Analyses View
        </Tab>
        <Tab
          value="2"
          class="data-store-tree-table-tab"
          :disabled="dataStores.length === 0"
          >Data Store Tree Table
        </Tab>
      </TabList>
      <TabPanels>
        <TabPanel value="0">
          <DetailedDataStoreTable
            v-if="dataStores && projectNameMap"
            :stores="dataStores"
            :projectNameMap="projectNameMap"
            :loading="loading"
          />
        </TabPanel>
        <TabPanel value="1">
          <DetailedAnalysisTable
            v-if="analysisNameMap && projectNameMap"
            :detailedAnalysisList="consumersAnalyses"
            :analysisNameMap="analysisNameMap"
            :projectNameMap="projectNameMap"
          />
        </TabPanel>
        <TabPanel value="2">
          <DataStoreTreeTable
            v-if="analysisNameMap && projectNameMap"
            :dataStoreList="dataStores"
            :analyses="consumersAnalyses"
            :analysisNameMap="analysisNameMap"
            :projectNameMap="projectNameMap"
          />
        </TabPanel>
      </TabPanels>
    </Tabs>
  </div>
</template>

<style lang="scss">
.tab-card {
  margin-top: 1rem;
}

.p-tablist-tab-list {
  background: var(--p-tabs-tab-background);
}
</style>
