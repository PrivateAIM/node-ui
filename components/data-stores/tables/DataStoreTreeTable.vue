<script setup lang="ts">
import type { Consumer, DetailedService, Route } from "~/services/Api";
import type { TreeNode } from "primevue/treenode";
import { extractUuid } from "~/utils/extract-uuid-from-kong-username";

const props = defineProps({
  dataStoreList: {
    type: Array<DetailedService>,
    required: true,
  },
  analyses: {
    type: Array<Consumer>,
    required: true,
  },
  analysisNameMap: {
    type: Map<string, string>,
    required: true,
  },
  projectNameMap: {
    type: Map<string, string>,
    required: true,
  },
});

const nodes = ref();

onMounted(() => {
  const pNodes = formatAnalysisNodes();
  formatDataStoreNodes(pNodes);
});

function formatAnalysisNodes() {
  let projectNodes = new Map<string, TreeNode[]>();

  props.analyses.forEach((analysis: Consumer) => {
    const analysisUuid = extractUuid(analysis.username!);
    const analysisNode = {
      key: analysis.id!,
      label: analysisUuid,
      type: "Analysis",
      data: {
        uuid: analysisUuid,
        name: props.analysisNameMap.get(analysisUuid),
        resourceType: "Analysis",
      },
    };
    analysis.tags?.forEach((tag: string) => {
      if (!projectNodes.has(tag)) {
        projectNodes.set(tag, []);
      }
      projectNodes.get(tag)!.push(analysisNode);
    });
  });
  return projectNodes;
}

function formatDataStoreNodes(projectNodeMap: Map<string, TreeNode[]>) {
  let compiledNodes = new Array<TreeNode>();
  props.dataStoreList?.forEach((ds: DetailedService) => {
    const dataStoreNode = {
      key: ds.id!,
      label: ds.name,
      type: "DataStore",
      leaf: false,
      data: {
        uuid: ds.id,
        name: ds.name,
        resourceType: "DataStore",
      },
      children: new Array<TreeNode>(),
    } as TreeNode;
    const projects = ds.routes!;
    projects.forEach((project: Route) => {
      const projParts = extractUuid(project.name!);
      const projUuid = projParts[1];
      const projChildren = projectNodeMap.get(projUuid);
      const projectNode = {
        key: project.id!,
        label: projUuid,
        type: "Project",
        data: {
          uuid: projUuid,
          name: props.projectNameMap.get(projUuid),
          resourceType: "Project",
        },
        leaf: false,
        children: projChildren,
      };
      dataStoreNode.children!.push(projectNode);
    });
    compiledNodes.push(dataStoreNode);
  });
  nodes.value = compiledNodes;
}
</script>

<template>
  <div class="card">
    <TreeTable :value="nodes">
      <Column field="name" header="Name" expander></Column>
      <Column field="uuid" header="UUID"></Column>
      <Column field="resourceType" header="Type"></Column>
    </TreeTable>
  </div>
</template>

<style scoped lang="scss"></style>
