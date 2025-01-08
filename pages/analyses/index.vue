<script setup lang="ts">
import AnalysesTable from "~/components/analysis/AnalysesTable.vue";

definePageMeta({
  middleware: ["sidebase-auth"],
});
</script>

<template>
  <AnalysesTable />
</template>

<style scoped lang="scss"></style>
