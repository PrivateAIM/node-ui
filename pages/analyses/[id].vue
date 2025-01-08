<script setup lang="ts">
import ContainerLogs from "~/components/analysis/logs/ContainerLogs.vue";

definePageMeta({
  middleware: ["sidebase-auth"],
});
</script>

<template>
  <ContainerLogs />
</template>

<style scoped lang="scss"></style>
