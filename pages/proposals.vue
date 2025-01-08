<script setup lang="ts">
import ProjectProposalTable from "~/components/projects/ProjectProposalTable.vue";

definePageMeta({
  middleware: "sidebase-auth",
});
</script>

<template>
  <ProjectProposalTable />
</template>

<style scoped lang="scss"></style>
