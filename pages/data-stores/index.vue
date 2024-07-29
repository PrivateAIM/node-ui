<script setup lang="ts">
import DataStoreLayout from "~/components/data-stores/DataStoreListTabs.vue";

definePageMeta({
  middleware: ["auth"],
});
</script>

<template>
  <DataStoreLayout />
</template>

<style scoped lang="scss"></style>
