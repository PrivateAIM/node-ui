<script setup lang="ts">
import AnalysesTable from "~/components/analysis/AnalysesTable.vue";

definePageMeta({
  // or middleware: 'auth'
  middleware: ["auth"],
});
</script>

<template>
  <AnalysesTable />
</template>

<style scoped lang="scss"></style>
