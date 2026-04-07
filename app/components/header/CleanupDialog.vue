<script lang="ts" setup>
import { type CleanupPodResponse, type DeleteService } from "~/services/Api";
import { useToast } from "primevue/usetoast";
import { useNuxtApp } from "nuxt/app";
import Dialog from "primevue/dialog";
import Listbox from "primevue/listbox";
import Message from "primevue/message";

interface cleanUpOption {
  name: string;
  data: {
    ep: string;
    message: string;
  };
}

const selectedCleanUpOption = ref();
const cleanUpOptions = ref<cleanUpOption[]>([
  {
    name: "All services and analyzes",
    data: {
      ep: "all",
      message:
        "All of the zombie analyzes will be deleted and both the Result Service and Message Broker will be restarted!",
    },
  },
  {
    name: "Analyzes",
    data: {
      ep: "analyzes",
      message: "All zombie analyzes will be deleted!",
    },
  },
  {
    name: "Services",
    data: {
      ep: "services",
      message: "Both the Result Service and Message Broker will be restarted!",
    },
  },
  {
    name: "Message Broker",
    data: {
      ep: "mb",
      message: "The Message Broker will be restarted!",
    },
  },
  {
    name: "Result Service",
    data: {
      ep: "rs",
      message: "The Result Service will be restarted!",
    },
  },
  {
    name: "Data Stores",
    data: {
      ep: "datastore",
      message: "All orphaned data stores will be removed!",
    },
  },
  {
    name: "Keycloak",
    data: {
      ep: "keycloak",
      message: "All analyses in Keycloak will be purged!",
    },
  },
  {
    name: "Zombies",
    data: {
      ep: "zombies",
      message: "All dangling analysis resources will be deleted!",
    },
  },
]);

const cleanupVisible = defineModel<boolean>("cleanUpVisible");

const toast = useToast();
const loading = ref(false);

const handleCleanupShow = () => {
  selectedCleanUpOption.value = undefined;
  cleanupVisible.value = true;
};

async function cleanUpResource(endpoint: string) {
  loading.value = true;
  let cleanupResponse: CleanupPodResponse | DeleteService | null;
  let modifiedResources: number | string = 0;

  // Only one kong cleanup endpoint
  if (endpoint === "datastore") {
    cleanupResponse = (await useNuxtApp()
      .$hubApi(`/kong/${endpoint}`, {
        method: "DELETE",
      })
      .catch(() => {
        toast.add({
          severity: "error",
          summary: "Unable to perform cleanup",
          detail:
            "There was an error while deleting or restarting the resource.",
          life: 5000,
        });
      })) as DeleteService;
    if (cleanupResponse) {
      modifiedResources = cleanupResponse.count;
    }
  } else {
    cleanupResponse = (await useNuxtApp()
      .$hubApi(`/po/cleanup/${endpoint}`, {
        method: "DELETE",
      })
      .catch(() => {
        toast.add({
          severity: "error",
          summary: "Unable to perform cleanup",
          detail:
            "There was an error while deleting or restarting the resource.",
          life: 5000,
        });
      })) as CleanupPodResponse;
    if (cleanupResponse && cleanupResponse.zombies) {
      modifiedResources = cleanupResponse.zombies;
    }
  }

  if (cleanupResponse) {
    let detail = "Cleanup request successfully submitted";
    if (modifiedResources) {
      detail += ", number of modified resources: " + modifiedResources;
    }
    toast.add({
      severity: "info",
      summary: "Cleanup Started",
      detail: detail,
      life: 5000,
    });
  }
  loading.value = false;
  cleanupVisible.value = false;
}
</script>

<template>
  <div class="cleanup-dialog-container">
    <Dialog
      v-model:visible="cleanupVisible"
      :style="{ width: '30rem' }"
      class="cleanup-dialog"
      header="Clean Up the Node"
      modal
      @show="handleCleanupShow"
    >
      <span class="p-text-secondary block mb-5"
        >Select the resource(s) you wish to delete or restart.</span
      >
      <div
        v-if="selectedCleanUpOption"
        class="cleanup-entry-warning block mb-5"
      >
        <Message icon="pi pi-info-circle" severity="warn"
          >{{ selectedCleanUpOption.message }}
        </Message>
      </div>
      <div class="flex align-items-center gap-3 mb-3">
        <Listbox
          v-model="selectedCleanUpOption"
          :options="cleanUpOptions"
          class="w-full md:w-16rem"
          optionLabel="name"
          optionValue="data"
        />
      </div>
      <div class="flex justify-content-end gap-2 cleanup-btns">
        <Button
          :disabled="!selectedCleanUpOption"
          :loading="loading"
          label="Submit"
          type="button"
          class="cleanup-submit-btn"
          @click="cleanUpResource(selectedCleanUpOption.ep)"
        />
        <Button
          label="Cancel"
          severity="secondary"
          type="button"
          class="cleanup-cancel-btn"
          @click="cleanupVisible = false"
        />
      </div>
    </Dialog>
  </div>
</template>

<style lang="scss" scoped>
.cleanup-entry-warning {
  padding: 0 0;
}
</style>
