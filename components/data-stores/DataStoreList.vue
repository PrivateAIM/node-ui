<script lang="ts" setup>
import { watchEffect } from "vue";
import { getDataStores, getProjects } from "~/composables/useAPIFetch";
import { formatDataRow } from "~/utils/format-data-row";
import type { ModifiedDetailedService } from "~/services/modifiedApiInterfaces";
import type {
  DetailedAnalysis,
  ListServices,
  Project,
  Route,
} from "~/services/Api";
import DetailedDataStoreTable from "~/components/data-stores/DetailedDataStoreTable.vue";

const dataStores = ref<ModifiedDetailedService[]>([]);
const projectNameMap = ref<Map<string, string | null>>(
  new Map<string, string | null>(),
);

const loading = ref(true);

const dataRowUnixCols = ["created_at", "updated_at"];
const expandRowEntries = [];

const {
  data: dsResp,
  status: dsStatus,
  error: dsError,
  refresh: dsRefresh,
} = await getDataStores(true, { lazy: true });

const { data: projectResp } = await getProjects({ lazy: true });

watchEffect(() => {
  if (dsResp.value?.data) {
    const dataStoreData = dsResp.value.data as ListServices;
    loadDetailedDataStoreTable(dataStoreData, dsStatus.value, dsError);
  }
});

watchEffect(() => {
  if (projectResp.value) {
    const projects = projectResp.value || [];
    projectNameMap.value = mapDataFromHub(projects);
  }
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
      if (store.routes) {
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

function onDeleteDataStore(dsName: string) {
  dataStores.value = dataStores.value.filter(
    (store: ModifiedDetailedService) => store.name !== dsName,
  );
  dsRefresh();
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
