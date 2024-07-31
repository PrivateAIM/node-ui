<script setup lang="ts">
import Dropdown from "primevue/dropdown";
import { connectAnalysisProject } from "~/composables/useAPIFetch";

const props = defineProps({
  projects: Array,
  analyses: Array,
});

const selectedProject = ref();
const selectedAnalysis = ref();

const loading = ref(false);
const created = ref("");

async function onSubmitProjectAnalysisBinding() {
  created.value = "";
  const props = {
    project_id: selectedProject.value.id,
    analysis_id: selectedAnalysis.value.id,
  };
  loading.value = true;
  const { status, error } = await connectAnalysisProject(props);
  if (error && error.value?.statusCode == 409) {
    created.value = "duplicate";
  } else {
    created.value = status.value;
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
        <InputGroup>
          <InputGroupAddon class="fieldName">
            <i class="pi pi-lightbulb"></i>
            <p class="dsFieldName">Analysis</p>
          </InputGroupAddon>
          <Dropdown
            v-model="selectedAnalysis"
            :options="props.analyses"
            optionLabel="name"
            placeholder="Select an Analysis"
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
        <p style="color: green" v-if="created === 'success'">
          Link successfully created
        </p>
        <p style="color: yellow" v-if="created === 'duplicate'">
          This project and analysis are already linked!
        </p>
        <p style="color: red" v-else-if="created && created !== 'success'">
          Failed to create link
        </p>
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
