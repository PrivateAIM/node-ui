<script setup lang="ts">
import ResourceManagerLayout from "~/components/data-stores/ResourceManagerTabs.vue";

definePageMeta({
  middleware: ["auth"],
});
</script>

<template>
  <ResourceManagerLayout />
</template>

<style scoped lang="scss"></style>
