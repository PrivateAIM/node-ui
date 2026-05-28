<script setup lang="ts">
import { prettifyKey } from "~/utils/prettify-key";

const props = defineProps({
  rowMetadata: Object,
});
</script>

<template>
  <Card class="metadata-card">
    <template #title>Additional Metadata</template>
    <template #content>
      <p v-for="(value, key) in props.rowMetadata" :key="key">
        <b>{{ prettifyKey(key as unknown as string) }}</b
        >: {{ value }}
        <Divider />
      </p>
    </template>
  </Card>
</template>

<style scoped lang="scss">
.metadata-card {
  border: 1px solid var(--p-surface-200);
}
</style>
