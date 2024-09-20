<script setup lang="ts">
import AnalysesTable from "~/components/analysis/AnalysesTable.vue";
import { getProjects } from "~/composables/useAPIFetch";

definePageMeta({
  middleware: ["auth"],
});

const { data: projResponse } = getProjects({
  method: "GET",
  query: {
    fields: "id,name",
  },
});
</script>

<template>
  <AnalysesTable :projectData="projResponse" />
</template>

<style scoped lang="scss"></style>
