<script setup lang="ts">
const props = defineProps({
  // Have to use null since [String, null] gives an error: "No overload matches this call"
  analysisStatus: { type: null },
});

function isRunning(): boolean {
  const analysisIsRunning = ["running", "starting", "started"];
  return analysisIsRunning.includes(props.analysisStatus);
}
</script>

<template>
  <div class="analysisButtons">
    <Button
      icon="pi pi-play"
      aria-label="Start"
      severity="success"
      style="margin-right: 10px"
      :disabled="!isRunning"
    />
    <Button
      icon="pi pi-stop"
      aria-label="Stop"
      severity="danger"
      :disabled="isRunning"
    />
  </div>
</template>

<style scoped lang="scss"></style>
