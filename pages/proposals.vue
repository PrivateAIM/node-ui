<script setup lang="ts">
import ProjectProposalTable from "~/components/projects/ProjectProposalTable.vue";

definePageMeta({
  middleware: ["auth"],
});
</script>

<template>
  <ProjectProposalTable />
</template>

<style scoped lang="scss"></style>
