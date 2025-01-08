<script setup lang="ts">
import DataStoreListTabs from "~/components/data-stores/DataStoreListTabs.vue";

definePageMeta({
  middleware: ["sidebase-auth"],
});
</script>

<template>
  <DataStoreListTabs />
</template>

<style scoped lang="scss"></style>
