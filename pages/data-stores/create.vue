<script setup lang="ts">
import DataStoreCreator from "~/components/data-stores/managers/DataStoreCreator.vue";
import ProjectBinder from "~/components/data-stores/managers/ProjectBinder.vue";
import AnalysisBinder from "~/components/data-stores/managers/AnalysisBinder.vue";

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
