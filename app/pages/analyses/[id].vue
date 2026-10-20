<script setup lang="ts">
const route = useRoute();
const analysisId = route.params.id as string;
const analysisNodeId = route.query.nodeId as string | undefined;
</script>

<template>
  <ContainerLogs :analysisId="analysisId" :analysisNodeId="analysisNodeId" />
</template>
