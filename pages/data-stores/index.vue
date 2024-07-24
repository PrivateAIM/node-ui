<script setup lang="ts">
import DataStoreLayout from "~/components/data-stores/DataStoreLayout.vue";

definePageMeta({
  middleware: ["auth"],
});
</script>

<template>
  <DataStoreLayout />
</template>

<style scoped lang="scss"></style>
