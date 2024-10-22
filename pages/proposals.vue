<script setup lang="ts">
import ProposalTable from "~/components/projects/ProjectProposalTable.vue";

definePageMeta({
  middleware: ["auth"],
});
</script>

<template>
  <ProposalTable />
</template>

<style scoped lang="scss"></style>
