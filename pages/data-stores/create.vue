<script setup lang="ts">
import DataStoreCreator from "~/components/data-stores/DataStoreCreator.vue";
import ProjectBinder from "~/components/data-stores/ProjectBinder.vue";
import AnalysisBinder from "~/components/data-stores/AnalysisBinder.vue";

definePageMeta({
  middleware: ["auth"],
});
</script>

<template>
  <DataStoreCreator />
  <ProjectBinder />
  <AnalysisBinder />
</template>

<style scoped lang="scss"></style>
