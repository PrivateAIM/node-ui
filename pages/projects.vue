<script setup>
import ProjectTable from "~/components/projects/ProjectTable.vue";

definePageMeta({
  middleware: ["auth"],
});
</script>

<template>
  <!--  <div v-if="loggedIn">-->
  <ProjectTable />
  <!--  </div>-->
</template>

<style scoped lang="scss"></style>
