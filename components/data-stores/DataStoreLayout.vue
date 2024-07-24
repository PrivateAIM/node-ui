<script setup lang="ts">
import DetailedProjectTable from "~/components/data-stores/DetailedProjectTable.vue";
import { getDataStores, getProjects } from "~/composables/useAPIFetch";
import { formatDataRow } from "~/utils/format-data-row";
import type { DetailedService, Project, Route } from "~/services/Api";
import DetailedDataStoreTable from "~/components/data-stores/DetailedDataStoreTable.vue";
import DetailedAnalysisTable from "~/components/data-stores/DetailedAnalysisTable.vue";

const dataStores = ref();
const projectNameMap = ref();
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
    projectNameMap.value = await getProjectsFromHub();
  });
});

async function getProjectsFromHub() {
  const { data: response } = await getProjects();
  const projects = response.value!.data as unknown as Project[];
  let projectNameMap = new Map<string, string | null>();
  if (projects && projects.length > 0) {
    projects.forEach((proj: Project) => {
      projectNameMap.set(proj.id, proj.name);
    });
  }
  return projectNameMap;
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
