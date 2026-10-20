import { computed, type Ref, ref, watch } from "vue";
import { navigateTo, useNuxtApp } from "nuxt/app";
import { useToast } from "primevue/usetoast";
import {
  type BodyKongInitializeKongInitializePost,
  DataStoreType,
} from "~/services/Api";
import type { AvailableProject } from "~/types/dataStore";
import {
  findMissingSetting,
  normalizeDataStorePath,
} from "~/utils/data-store-form";
import {
  generateRandomDataStoreName,
  isValidDataStoreName,
} from "~/utils/data-store-name";

type BucketAccessPolicy = "Public" | "Private";

/** Holds the data store creation form state and registers the data store with Kong on submit. */
export function useDataStoreForm() {
  const toast = useToast();
  const loading = ref(false);
  const connMsg = ref("");

  const selectedDataStoreType = ref<DataStoreType>(DataStoreType.Fhir);

  const selectedBucketAccessPolicy = ref<BucketAccessPolicy>("Private");
  const bucketAccessKey = ref<string>("");
  const bucketSecretKey = ref<string>("");

  const selectedProject = ref<AvailableProject | string | null | undefined>();
  const selectedProjectOption = computed<AvailableProject | undefined>(() =>
    selectedProject.value && typeof selectedProject.value === "object"
      ? selectedProject.value
      : undefined,
  );

  const dataStoreName = ref("");
  const host = ref("");
  const path = ref("");
  const port = ref(80);
  const protocol = ref("http");

  function rerollDataStoreName() {
    const project = selectedProjectOption.value;
    if (project) {
      dataStoreName.value = generateRandomDataStoreName(
        project.name ?? project.id,
      );
    }
  }

  watch(selectedProjectOption, rerollDataStoreName);

  function preselectProject(
    projects: Ref<AvailableProject[]>,
    projectId: string | undefined,
  ) {
    if (projectId) {
      selectedProject.value = projects.value.find(
        (proj) => proj.id === projectId,
      );
    }
  }

  function autofillFields(
    afDatastoreType: DataStoreType,
    afHostname: string,
    afPort: number,
  ) {
    selectedDataStoreType.value = afDatastoreType;
    host.value = afHostname;
    port.value = afPort;
  }

  function verifyValuesFilled(settings: Record<string, unknown>): boolean {
    const missingValue = findMissingSetting(settings);
    if (missingValue) {
      toast.add({
        severity: "error",
        summary: "Value missing",
        detail: `${missingValue} is not defined!`,
        life: 5000,
      });
      return false;
    }
    return true;
  }

  async function submit() {
    if (!isValidDataStoreName(dataStoreName.value)) {
      toast.add({
        severity: "error",
        summary: "Invalid data store name",
        detail:
          "Only letters, digits, '.', '_', '~', and '-' are allowed, and the name cannot be a bare UUID",
        life: 5000,
      });
      return;
    }

    const datastoreSettings = {
      name: dataStoreName.value,
      host: host.value,
      path: normalizeDataStorePath(path.value),
      port: port.value,
      protocol: protocol.value,
    };

    const configSettings: BodyKongInitializeKongInitializePost = {
      datastore: datastoreSettings,
      project_id: selectedProjectOption.value!.id,
      ds_type: selectedDataStoreType.value,
    };

    const s3Settings = {
      s3_access_key: bucketAccessKey.value || "",
      s3_secret_key: bucketSecretKey.value || "",
    };

    let settingsValidated = verifyValuesFilled(datastoreSettings);

    if (
      selectedDataStoreType.value === DataStoreType.S3 &&
      selectedBucketAccessPolicy.value === "Private"
    ) {
      configSettings.s3_config = s3Settings;
      settingsValidated = settingsValidated && verifyValuesFilled(s3Settings);
    }

    if (settingsValidated) {
      loading.value = true;
      const creationResp = await useNuxtApp()
        .$hubApi("/kong/initialize", {
          method: "POST",
          body: configSettings,
        })
        .catch(() => {
          toast.add({
            severity: "error",
            summary: "Registration failure",
            detail: "An error occurred while trying to register the data store",
            life: 5000,
          });
          connMsg.value = "Invalid connection!";
        });

      loading.value = false;

      if (creationResp) {
        toast.add({
          severity: "success",
          summary: "Registration success",
          detail:
            "The data store and project were successfully registered, returning to the analyses page...",
          life: 5000,
        });
        connMsg.value = "Connection validated!";
        await new Promise((resolve) => setTimeout(resolve, 5000));
        navigateTo("/analyses");
      }
    }
  }

  return {
    loading,
    connMsg,
    selectedDataStoreType,
    selectedBucketAccessPolicy,
    bucketAccessKey,
    bucketSecretKey,
    selectedProject,
    selectedProjectOption,
    dataStoreName,
    host,
    path,
    port,
    protocol,
    rerollDataStoreName,
    preselectProject,
    autofillFields,
    submit,
  };
}
