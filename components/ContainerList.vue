<script>
import DataTable from "primevue/datatable";
import Column from "primevue/column";

// import { defineNuxtComponent } from "#app";

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
  <div class="containerList">
    <h2 style="color: blue">Data Table Example</h2>
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
  </div>
</template>

<style scoped lang="scss"></style>
