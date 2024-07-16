<script setup lang="ts">
import { downloadLocalObject } from "~/composables/useAPIFetch";

const props = defineProps({
  objectId: String,
  local: Boolean,
});

const toast = useToast();

async function onDownloadLocalObject() {
  const {
    data: response,
    status,
    error,
  } = await downloadLocalObject(props.objectId!);
  if (status.value === "success") {
    const a = document.createElement("a");
    a.href = window.URL.createObjectURL(response.value as Blob);
    a.download = props.objectId!;
    a.click();
  } else {
    console.log(error);
    toast.add({
      severity: "error",
      summary: "Download failed",
      detail: `Unable to download object ${props.objectId}`,
      life: 3000,
    });
  }
}
</script>

<template>
  <div class="resultDownloadButtons">
    <Button
      icon="pi pi-file-import"
      aria-label="Download"
      v-tooltip="'Download file'"
      severity="info"
      style="margin-right: 10px"
      @click="onDownloadLocalObject"
    />
  </div>
</template>

<style scoped lang="scss"></style>
