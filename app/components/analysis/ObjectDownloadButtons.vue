<script setup lang="ts">
import {
  downloadIntermediateObject,
  downloadLocalObject,
} from "~/composables/useAPIFetch";

const props = defineProps({
  objectId: {
    type: String,
    required: true,
  },
  isLocal: {
    type: Boolean,
    default() {
      return true;
    },
  },
});

const toast = useToast();

async function onDownloadObject() {
  try {
    const response = props.isLocal
      ? await downloadLocalObject(props.objectId!)
      : await downloadIntermediateObject(props.objectId!);

    const a = document.createElement("a");
    a.href = window.URL.createObjectURL(response);
    a.download = props.objectId!;
    a.click();
  } catch {
    toast.add({
      severity: "error",
      summary: "Download failed",
      detail: `Unable to download object ${props.objectId}`,
      life: 6000,
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
      @click="onDownloadObject"
    />
  </div>
</template>

<style scoped lang="scss"></style>
