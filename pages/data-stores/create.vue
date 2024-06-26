<script setup lang="ts">
import DataStoreCreator from "~/components/data-stores/DataStoreCreator.vue";

definePageMeta({
  // or middleware: 'auth'
  middleware: ["auth"],
});
</script>

<template>
  <DataStoreCreator />
</template>

<style scoped lang="scss"></style>
