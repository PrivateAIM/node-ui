<script setup lang="ts">
import { deleteAnalysisFromKong } from "~/composables/useAPIFetch";
import { useConfirm } from "primevue/useconfirm";
import type { Consumer } from "~/services/Api";
import { formatDataRow } from "~/utils/format-data-row";
import { extractUuid } from "~/utils/extract-uuid-from-kong-username";

const props = defineProps({
  detailedAnalysisList: {
    type: Array<Consumer>,
    required: true,
  },
  analysisNameMap: {
    type: Map<string, string>,
    required: true,
  },
  projectNameMap: {
    type: Map<string, string>,
    required: true,
  },
});

interface analysisRow {
  hubAnalysisName: string;
  hubAnalysisUuid: string;
  kongAnalysisUserName: string;
  hubProjectName: string;
  kongAnalysisCreatedAt: number;
}

const analysisTable = ref();
const loading = ref(false);
const toast = useToast();
const confirm = useConfirm();

onMounted(() => {
  compileAnalysisTable();
});

const confirmDeleteAnalysis = (
  event,
  analysisUuid: string,
  analysisUsername: string,
) => {
  confirm.require({
    target: event.currentTarget,
    group: "templating",
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
      (analysis: Consumer) => analysis.custom_id !== analysisUsername,
    );
  } else {
    toast.add({
      severity: "error",
      summary: "Delete failure",
      detail: "An error occurred while trying to remove this connection",
      life: 3000,
    });
    loading.value = false;
  }
}

function compileAnalysisTable() {
  let elongatedTableRows = new Array<analysisRow>();
  const analysisNameMap = props.analysisNameMap;
  const projectNameMap = props.projectNameMap;
  let consumers = props.detailedAnalysisList;
  consumers = formatDataRow(consumers, ["created_at"], []);

  if (consumers && consumers.length > 0) {
    consumers.forEach((consumer: Consumer) => {
      const analysisUuid = extractUuid(consumer.username!);
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
  analysisTable.value = elongatedTableRows;
}
</script>

<template>
  <div class="associatedProjectsTable">
    <DataTable
      :value="analysisTable"
      tableStyle="min-width: 50rem"
      paginator
      :rows="10"
      :rowsPerPageOptions="[10, 20, 50]"
    >
      <template #empty> No associated linked analyses found.</template>
      <Column
        field="hubAnalysisName"
        header="Analysis"
        :sortable="true"
      ></Column>
      <Column
        field="hubAnalysisUuid"
        header="Analysis UUID"
        :sortable="true"
      ></Column>
      <Column
        field="kongAnalysisUserName"
        header="Kong Analysis Name"
        :sortable="true"
      ></Column>
      <Column
        field="hubProjectName"
        header="Linked Project Name"
        :sortable="true"
      ></Column>
      <Column
        field="kongProjCreatedAt"
        header="Created"
        :sortable="true"
      ></Column>
      <Column field="hubAnalysisUuid" header="Delete?" :exportable="false">
        <template #body="slotProps">
          <ConfirmPopup group="templating">
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
            icon="pi pi-trash"
            aria-label="Delete"
            severity="warning"
            :loading="loading"
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

<style scoped lang="scss"></style>
