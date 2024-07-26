<script setup lang="ts">
import DataStoreLayout from "~/components/data-stores/DataStoreListLayout.vue";

definePageMeta({
  middleware: ["auth"],
});
</script>

<template>
  <DataStoreLayout />
</template>

<style scoped lang="scss"></style>
