<script setup lang="ts">
import { disconnectRoute } from "~/composables/useAPIFetch";
import { useConfirm } from "primevue/useconfirm";
// import { formatDataRow } from "~/utils/format-data-row";
// import type { Route } from "~/services/Api";

const props = defineProps({
  associatedProjects: Array,
});

const confirm = useConfirm();

function onConfirmDisconnectProject(foo: string) {
  disconnectRoute(foo);
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
</script>

<template>
  <div class="card associatedProjectsTable">
    <Card style="border: solid">
      <template #title>Associated Projects</template>
      <template #content>
        <DataTable
          :value="props.associatedProjects"
          tableStyle="min-width: 50rem"
        >
          <Column field="name" header="Name" :sortable="true"></Column>
          <Column field="projectId" header="ID" :sortable="true"></Column>
          <Column field="created_at" header="Created" :sortable="true"></Column>
          <Column
            field="updated_at"
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
