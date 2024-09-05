<script setup lang="ts">
import ContainerLogs from "~/components/analysis/ContainerLogs.vue";

definePageMeta({
  middleware: ["auth"],
});
</script>

<template>
  <ContainerLogs />
</template>

<style scoped lang="scss"></style>
