<script setup lang="ts">
import { getAnalysisLogs } from "~/composables/useAPIFetch";

const props = defineProps({
  analysisId: String,
});

const analysisId = props.analysisId;

// let analysisMetaData = {
//   analysisId: "",
//   projectId: "",
//   runStatus: "",
// };
//
// const { data, status } = await getSpecificAnalysis(route.params.id);

// if (status.value === "success") {
//   const analysisMetaData = {
//     analysisId: data.value?.id,
//     projectId: data.value?.project_id,
//     runStatus: data.value?.run_status,
//   };
// }

const { data, refresh } = await getAnalysisLogs(props.analysisId);
</script>

<template>
  <Card class="contentCard">
    <template #title>Analysis {{ analysisId }} </template>
    <template #subtitle>{{ props.analysisId }}</template>
    <template #content>
      <div class="card analysisLogs">
        <Card class="analysisDataCard">
          <template #title>Metadata</template>
          <template #content>Hi</template>
        </Card>
        <Card class="analysisLogCard">
          <template #title>Logs</template>
          <template #content>
            <ScrollPanel style="width: 100%; height: 400px">
              <p>Lorem ipsum dolor ...</p>
            </ScrollPanel>
          </template>
        </Card>
      </div>
    </template>
  </Card>
</template>

<style scoped lang="scss"></style>
