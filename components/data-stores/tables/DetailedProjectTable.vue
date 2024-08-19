<script setup lang="ts">
import { deleteProjectFromKong } from "~/composables/useAPIFetch";
import { useConfirm } from "primevue/useconfirm";
import type { DetailedService, Route } from "~/services/Api";
import { extractUuid } from "~/utils/extract-uuid-from-kong-username";

const props = defineProps({
  detailedStoreList: Array<DetailedService>,
  projectNameMap: Map<string, string>,
});

interface projectRow {
  dataStore: string;
  kongProjectId: string;
  hubProjectUuid: string;
  kongProjectUserName: string;
  hubProjectName: string;
  kongProjCreatedAt: string;
  kongProjUpdatedAt: string;
}

const projectTable = ref();
const toast = useToast();
const confirm = useConfirm();
const loading = ref(false);

onMounted(() => {
  meltDataStoreTable();
});

const confirmDeleteProject = (event, projectUuid: string) => {
  confirm.require({
    target: event.currentTarget,
    group: "templating",
    message: "Are you sure you want to delete this project?",
    icon: "pi pi-exclamation-circle",
    acceptIcon: "pi pi-check",
    acceptLabel: "Confirm",
    rejectIcon: "pi pi-times",
    rejectLabel: "Cancel",
    accept: () => {
      onConfirmDeleteProject(projectUuid);
    },
    reject: () => {},
  });
};

async function onConfirmDeleteProject(projectUuid: string) {
  loading.value = true;
  const { status } = await deleteProjectFromKong(projectUuid);
  if (status.value === "success") {
    toast.add({
      severity: "info",
      summary: "Delete success",
      detail: "The project link to the data was successfully deleted",
      life: 3000,
    });
    projectTable.value = projectTable.value.filter(
      (project: Route) => project.id !== projectUuid,
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

function meltDataStoreTable() {
  let elongatedTableRows = new Array<projectRow>();
  const hubNameMap = props.projectNameMap!;
  const projects = props.detailedStoreList;
  if (projects && projects.length > 0) {
    props.detailedStoreList!.forEach((store: DetailedService) => {
      const routes = store.routes;
      if (routes && routes.length > 0) {
        routes.forEach((proj: Route) => {
          const projectUuid = extractUuid(proj.name!);
          const newRow = {
            dataStore: store.name!,
            kongProjectId: proj.id!,
            kongProjectUserName: proj.name!,
            hubProjectUuid: projectUuid,
            hubProjectName: hubNameMap.has(projectUuid)
              ? hubNameMap.get(projectUuid)!
              : "N/A",
            kongProjCreatedAt: proj.created_at! as unknown as string,
            kongProjUpdatedAt: proj.updated_at! as unknown as string,
          };
          elongatedTableRows.push(newRow);
        });
      }
    });
  }
  projectTable.value = elongatedTableRows;
}
</script>

<template>
  <div class="associatedProjectsTable">
    <DataTable
      :value="projectTable"
      tableStyle="min-width: 50rem"
      paginator
      :rows="10"
      :rowsPerPageOptions="[10, 20, 50]"
    >
      <template #empty> No associated projects found.</template>
      <Column field="dataStore" header="Data Store" :sortable="true"></Column>
      <Column
        field="kongProjectId"
        header="Kong Project ID"
        :sortable="true"
      ></Column>
      <Column
        field="hubProjectName"
        header="Hub Project Name"
        :sortable="true"
      ></Column>
      <Column
        field="kongProjCreatedAt"
        header="Created"
        :sortable="true"
      ></Column>
      <Column
        field="kongProjUpdatedAt"
        header="Last Updated"
        :sortable="true"
      ></Column>
      <Column field="projectId" header="Disconnect?" :exportable="false">
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
            aria-label="Disconnect"
            severity="warning"
            :loading="loading"
            @click="confirmDeleteProject($event, slotProps.data.hubProjectUuid)"
          />
        </template>
      </Column>
    </DataTable>
  </div>
</template>

<style scoped lang="scss"></style>
