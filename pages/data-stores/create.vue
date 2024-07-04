<script setup lang="ts">
import DataStoreCreator from "~/components/data-stores/DataStoreCreator.vue";
import ProjectBinder from "~/components/data-stores/ProjectBinder.vue";

definePageMeta({
  middleware: ["auth"],
});
</script>

<template>
  <DataStoreCreator />
  <ProjectBinder />
</template>

<style scoped lang="scss"></style>
