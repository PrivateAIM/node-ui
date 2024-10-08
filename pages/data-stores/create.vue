<script setup lang="ts">
import ResourceManagerTabs from "~/components/data-stores/ResourceManagerTabs.vue";

definePageMeta({
  middleware: ["auth"],
});
</script>

<template>
  <ResourceManagerTabs />
</template>

<style scoped lang="scss"></style>
