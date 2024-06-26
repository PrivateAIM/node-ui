<script setup>
import ProjectTable from "~/components/projects/ProjectTable.vue";

definePageMeta({
  // or middleware: 'auth'
  middleware: ["auth"],
});
</script>

<template>
  <!--  <div v-if="loggedIn">-->
  <ProjectTable />
  <!--  </div>-->
</template>

<style scoped lang="scss"></style>
