<script setup lang="ts">
import { disconnectProject } from "~/composables/useAPIFetch";
import { useConfirm } from "primevue/useconfirm";
import type { DetailedService, Route } from "~/services/Api";

const props = defineProps({
  associatedProjects: Array<DetailedService>,
});

interface projectRow {
  dataStore: string;
  projectId: string;
  projectName: string;
  projCreatedAt: string;
  projUpdatedAt: string;
}

const meltedValues = ref();

const confirm = useConfirm();

function onConfirmDisconnectProject(foo: string) {
  disconnectProject(foo);
  // window.location.reload();
}

const confirmDisconnect = (event, projectId: string) => {
  confirm.require({
    target: event.currentTarget,
    group: "templating",
    message: "Are you sure you want to disconnect this project?",
    icon: "pi pi-exclamation-circle",
    acceptIcon: "pi pi-check",
    acceptLabel: "Confirm",
    rejectIcon: "pi pi-times",
    rejectLabel: "Cancel",
    accept: () => {
      onConfirmDisconnectProject(projectId);
    },
    reject: () => {},
  });
};

onUpdated(() => {
  meltDataStoreTable();
});

function meltDataStoreTable() {
  let elongatedTableRows = new Array<projectRow>();
  const projects = props.associatedProjects;
  console.log(projects);
  if (projects && projects.length > 0) {
    props.associatedProjects!.forEach((store: DetailedService) => {
      const routes = store.routes;
      if (routes && routes.length > 0) {
        routes.forEach((proj: Route) => {
          const newRow = {
            dataStore: store.name!,
            projectId: proj.id!,
            projectName: proj.name!,
            projCreatedAt: proj.created_at! as unknown as string,
            projUpdatedAt: proj.updated_at! as unknown as string,
          };
          elongatedTableRows.push(newRow);
        });
      }
    });
  }
  meltedValues.value = elongatedTableRows;
  console.log(elongatedTableRows);
}
</script>

<template>
  <div class="card associatedProjectsTable">
    <Card>
      <template #title>Associated Projects</template>
      <template #content>
        <DataTable :value="meltedValues" tableStyle="min-width: 50rem">
          <Column
            field="dataStore"
            header="Data Store"
            :sortable="true"
          ></Column>
          <Column
            field="projectId"
            header="Project ID"
            :sortable="true"
          ></Column>
          <Column
            field="projectName"
            header="Project Name"
            :sortable="true"
          ></Column>
          <Column
            field="projCreatedAt"
            header="Created"
            :sortable="true"
          ></Column>
          <Column
            field="projUpdatedAt"
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
                @click="confirmDisconnect($event, slotProps.data.projectId)"
              />
            </template>
          </Column>
        </DataTable>
      </template>
    </Card>
  </div>
</template>

<style scoped lang="scss"></style>
