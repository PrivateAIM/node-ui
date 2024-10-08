<script setup lang="ts">
import Dropdown from "primevue/dropdown";
import {
  connectAnalysisProject,
  getAnalysisNodes,
} from "~/composables/useAPIFetch";
import type { AnalysisNode } from "~/services/Api";

const props = defineProps({
  projects: Array,
});

const availableAnalyses = ref([]);
const selectedProject = ref();
const selectedAnalysis = ref();

const loading = ref(false);
const toast = useToast();

const { data: analyses, status } = await getAnalysisNodes({
  lazy: true,
});
if (status.value === "success") {
  const analysisData = analyses!.data as unknown as Array<AnalysisNode>;
  availableAnalyses.value = analysisData.map((analysisNode: AnalysisNode) => {
    return { name: analysisNode.analysis.name, id: analysisNode.analysis_id };
  });
}

async function onSubmitProjectAnalysisBinding() {
  const props = {
    project_id: selectedProject.value.id,
    analysis_id: selectedAnalysis.value.id,
  };
  loading.value = true;
  const { status, error } = await connectAnalysisProject(props);
  if (status.value === "success") {
    toast.add({
      severity: "info",
      summary: "Link success",
      detail: "The project was successfully bound to the data store",
      life: 3000,
    });
    // Conflict
  } else if (error.value?.statusCode === 409) {
    toast.add({
      severity: "warn",
      summary: "Duplicate entry",
      detail: "Link already exists between this project and data store!",
      life: 4000,
    });
  } else {
    toast.add({
      severity: "error",
      summary: "Link failure",
      detail:
        "An error occurred while trying to link the project to the data store",
      life: 3000,
    });
  }
  loading.value = false;
}
</script>

<template>
  <div>
    <Card style="margin-top: 10px">
      <template #title>Analysis-Project Binder</template>
      <template #content>
        <InputGroup>
          <InputGroupAddon class="fieldName">
            <i class="pi pi-lightbulb"></i>
            <p class="dsFieldName">Analysis</p>
          </InputGroupAddon>
          <Dropdown
            v-model="selectedAnalysis"
            :options="availableAnalyses"
            optionLabel="name"
            placeholder="Select an Analysis"
          />
        </InputGroup>
        <InputGroup>
          <InputGroupAddon class="fieldName">
            <i class="pi pi-cog"></i>
            <p class="dsFieldName">Project</p>
          </InputGroupAddon>
          <Dropdown
            v-model="selectedProject"
            :options="props.projects"
            optionLabel="name"
            placeholder="Select a Project"
          />
        </InputGroup>
        <Button
          label="Submit"
          icon="pi pi-check"
          iconPos="right"
          severity="info"
          style="margin-top: 20px"
          :loading="loading"
          @click="onSubmitProjectAnalysisBinding"
        />
      </template>
    </Card>
  </div>
</template>

<style scoped lang="scss">
.dsFieldName {
  margin-left: 10px;
}

.fieldName {
  width: 200px;
  height: 50px;
}
</style>
