<script setup lang="ts">
import DataStoreCreator from "~/components/data-stores/managers/DataStoreCreator.vue";
import ProjectBinder from "~/components/data-stores/managers/ProjectBinder.vue";
import AnalysisBinder from "~/components/data-stores/managers/AnalysisBinder.vue";
</script>

<template>
  <div class="card tabCard">
    <TabView>
      <TabPanel header="Create a Data Store">
        <DataStoreCreator />
      </TabPanel>
      <TabPanel header="Bind a Project to a Data Store">
        <ProjectBinder />
      </TabPanel>
      <TabPanel header="Link an Analysis to a Project">
        <AnalysisBinder />
      </TabPanel>
    </TabView>
  </div>
</template>

<style scoped lang="scss"></style>
