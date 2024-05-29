<script lang="ts">
import DataTable from "primevue/datatable";
import Column from "primevue/column";

import { defineComponent } from "vue";

export default defineComponent({
  name: "ContainerList",
  components: {
    DataTable,
    Column,
  },
  data() {
    return {
      products: [{ name: "Foo", category: "TestInstance", quantity: 1 }],
    };
  },
});
</script>

<template>
  <h2>Data Table Example</h2>
  <DataTable
    :value="products"
    :pt="{
      table: 'table table-striped',
    }"
  >
    <Column field="name" header="Name"></Column>
    <Column field="category" header="Category"></Column>
    <Column field="quantity" header="Quantity"></Column>
  </DataTable>
</template>

<style scoped lang="scss"></style>
