<script setup lang="ts">
import DataStoreTable from "~/components/data-stores/DataStoreTable.vue";

definePageMeta({
  // or middleware: 'auth'
  middleware: ["auth"],
});
</script>

<template>
  <DataStoreTable />
</template>

<style scoped lang="scss"></style>
