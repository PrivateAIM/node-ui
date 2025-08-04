<script lang="ts" setup>
import { deleteAnalysisFromKong } from "~/composables/useAPIFetch";
import type {
  ModifiedConsumer,
  modifiedTimestamp,
} from "~/services/modifiedApiInterfaces";
import { useConfirm } from "primevue/useconfirm";
import { useToast } from "primevue/usetoast";
import { formatDataRow } from "~/utils/format-data-row";
import { extractUuid } from "~/utils/extract-uuid-from-kong-username";
import { FilterMatchMode } from "@primevue/core/api";
import SearchBar from "~/components/table/SearchBar.vue";

const props = defineProps({
  detailedAnalysisList: {
    type: Array<ModifiedConsumer>,
    required: true,
  },
  analysisNameMap: {
    type: Map<string, string | null>,
    required: true,
  },
  projectNameMap: {
    type: Map<string, string | null>,
    required: true,
  },
});

interface analysisRow {
  hubAnalysisName: string;
  hubAnalysisUuid: string;
  kongAnalysisUserName: string;
  hubProjectName: string;
  kongAnalysisCreatedAt: modifiedTimestamp;
}

const loading = ref(false);
const toast = useToast();
const confirm = useConfirm();

const analysisTable = computed(() => {
  let elongatedTableRows = new Array<analysisRow>();
  const analysisNameMap = props.analysisNameMap;
  const projectNameMap = props.projectNameMap;
  let consumers = props.detailedAnalysisList;
  consumers = formatDataRow(consumers, ["created_at"], []);

  if (consumers && consumers.length > 0) {
    consumers.forEach((consumer: ModifiedConsumer) => {
      const analysisParts = extractUuid(consumer.username!);
      const analysisUuid = analysisParts[1];
      const analysisName = analysisNameMap.has(analysisUuid)
        ? analysisNameMap.get(analysisUuid)
        : "N/A";
      const projects = consumer.tags;
      if (projects && projects.length > 0) {
        projects.forEach((projUuid: string) => {
          const projectName = projectNameMap.has(projUuid)
            ? projectNameMap.get(projUuid)
            : "N/A";
          const newRow = {
            hubAnalysisName: analysisName!,
            hubAnalysisUuid: analysisUuid!,
            kongAnalysisUserName: consumer.username!,
            hubProjectName: projectName!,
            kongAnalysisCreatedAt: consumer.created_at!,
          };
          elongatedTableRows.push(newRow);
        });
      }
    });
  }
  return elongatedTableRows;
});

const confirmDeleteAnalysis = (
  event,
  analysisUuid: string,
  analysisUsername: string,
) => {
  confirm.require({
    target: event.currentTarget,
    group: "disconnectAnalysis",
    message: "Are you sure you want to delete this analysis?",
    icon: "pi pi-exclamation-circle",
    acceptIcon: "pi pi-check",
    acceptLabel: "Confirm",
    rejectIcon: "pi pi-times",
    rejectLabel: "Cancel",
    accept: () => {
      onConfirmDeleteAnalysis(analysisUuid, analysisUsername);
    },
    reject: () => {},
  });
};

async function onConfirmDeleteAnalysis(
  analysisUuid: string,
  analysisUsername: string,
) {
  loading.value = true;
  const { status } = await deleteAnalysisFromKong(analysisUuid);
  if (status.value === "success") {
    toast.add({
      severity: "info",
      summary: "Delete success",
      detail: "The analysis link to the data was successfully deleted",
      life: 3000,
    });
    analysisTable.value = analysisTable.value.filter(
      (analysis: analysisRow) =>
        analysis.kongAnalysisUserName !== analysisUsername,
    );
  } else {
    toast.add({
      severity: "error",
      summary: "Delete failure",
      detail: "An error occurred while trying to remove this connection",
      life: 3000,
    });
  }
  loading.value = false;
}

// Table filters
const defaultFilters = {
  global: { value: null, matchMode: FilterMatchMode.CONTAINS },
  "created_at.short": { value: null, matchMode: FilterMatchMode.DATE_IS },
  "updated_at.short": { value: null, matchMode: FilterMatchMode.DATE_IS },
};

const filters = ref(defaultFilters);

function resetFilters() {
  const clearedFilters = {};
  for (const filterKey in defaultFilters) {
    clearedFilters[filterKey] = {
      ...defaultFilters[filterKey],
    };
    clearedFilters[filterKey].value = null;
  }
  filters.value = clearedFilters;
}

const updateFilters = (filterText: string) => {
  filters.value.global.value = filterText;
};
</script>

<template>
  <div class="table-header-row">
    <SearchBar
      :searchTerm="defaultFilters.global.value"
      @clearFilters="resetFilters"
      @updateSearch="updateFilters"
    />
  </div>
  <div class="detailed-consumers-table">
    <DataTable
      v-model:filters="filters"
      :globalFilterFields="[
        'hubAnalysisName',
        'hubAnalysisUuid',
        'kongAnalysisUserName',
        'hubProjectName',
      ]"
      :rows="10"
      :rowsPerPageOptions="[10, 20, 50]"
      :value="analysisTable"
      filterDisplay="menu"
      paginator
      tableStyle="min-width: 50rem"
    >
      <template #empty> No associated linked analyses found.</template>
      <Column
        :sortable="true"
        field="hubAnalysisName"
        header="Analysis"
      ></Column>
      <Column
        :sortable="true"
        field="hubAnalysisUuid"
        header="Analysis UUID"
      ></Column>
      <Column
        :sortable="true"
        field="kongAnalysisUserName"
        header="Kong Analysis Name"
      ></Column>
      <Column
        :sortable="true"
        field="hubProjectName"
        header="Linked Project Name"
      ></Column>
      <Column
        :sortable="true"
        dataType="date"
        field="kongProjCreatedAt.timestamp"
        header="Created On"
      >
        <template #body="{ data }">
          <p v-tooltip.top="data.kongAnalysisCreatedAt.long">
            {{ data.kongAnalysisCreatedAt.short }}
          </p>
        </template>
      </Column>
      <Column :exportable="false" field="hubAnalysisUuid" header="Delete?">
        <template #body="slotProps">
          <ConfirmPopup class="delete-confirm-box" group="disconnectAnalysis">
            <template #message="slotProps">
              <div
                class="flex flex-col items-center w-full gap-4 border-b border-surface-200 dark:border-surface-700 p-4 mb-4 pb-0"
              >
                <i
                  :class="slotProps.message.icon"
                  class="text-6xl text-primary-500"
                ></i>
                <p>{{ slotProps.message.message }}</p>
              </div>
            </template>
          </ConfirmPopup>
          <Button
            :loading="loading"
            aria-label="Delete"
            class="disconnect-consumer-btn"
            icon="pi pi-trash"
            severity="warning"
            @click="
              confirmDeleteAnalysis(
                $event,
                slotProps.data.hubAnalysisUuid,
                slotProps.data.kongAnalysisUserName,
              )
            "
          />
        </template>
      </Column>
    </DataTable>
  </div>
</template>

<style lang="scss" scoped></style>
