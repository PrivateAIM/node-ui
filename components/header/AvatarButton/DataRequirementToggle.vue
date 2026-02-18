<script setup lang="ts">
import { useToast } from "primevue/usetoast";
import { useDatastoreRequirement } from "~/composables/useDatastoreRequirement";
import { useNuxtApp } from "#app";

const toast = useToast();
const loading = ref(false);

const { datastoreState, setDatastoreRequired } =
  await useDatastoreRequirement();
const dataRequired = ref<boolean>(datastoreState.value.datastoreRequired);

const emit = defineEmits(["updateDataRequirement"]);

watch(dataRequired, async (newValue, oldValue) => {
  if (newValue !== oldValue) {
    await onUpdateDataRequirement();
  }
});

async function onUpdateDataRequirement() {
  loading.value = true;
  const nodeConfigResp = (await useNuxtApp()
    .$hubApi("/node/settings", {
      method: "POST",
      body: { data_required: dataRequired.value },
    })
    .catch(() => null)) as NodeSettings;

  if (nodeConfigResp) {
    const updatedRequirementSettings = nodeConfigResp.data_required;
    setDatastoreRequired(updatedRequirementSettings);
    dataRequired.value = updatedRequirementSettings;
  }
  loading.value = false;
}
</script>

<template>
  <div class="datastore-requirement-toggle">
    <ToggleButton
      v-model="dataRequired"
      onIcon="pi pi-check"
      offIcon="pi pi-times"
      :invalid="!dataRequired"
      class="w-full sm:w-40"
      aria-label="Confirmation"
    />
  </div>
</template>

<style scoped lang="scss"></style>
