<script setup lang="ts">
import ContainerLogs from "~/components/analysis/ContainerLogs.vue";

definePageMeta({
  middleware: ["auth"],
});

const route = useRoute();
</script>

<template>
  <ContainerLogs :analysisData="route.params.id" />
</template>

<style scoped lang="scss"></style>
