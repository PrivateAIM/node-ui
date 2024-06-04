<script setup lang="ts">
import { ref } from "vue";

// onMounted(() => {
//   CustomerService.getCustomersMedium().then((data) => (customers.value = data));
// });

const containers = ref([
  {
    name: "Foo",
    category: "TestInstance",
    quantity: 1,
  },
  {
    name: "Teacup",
    category: "ShortAndStout",
    quantity: 3,
  },
]);
</script>

<template>
  <div class="containerTable">
    <h2 style="color: blue">Data Table Example</h2>
    <DataTable
      :value="containers"
      :pt="{
        table: 'table table-striped',
      }"
      paginator
      :rows="10"
      :rowsPerPageOptions="[10, 20, 50]"
      tableStyle="min-width: 50rem"
    >
      <Column field="name" header="Name"></Column>
      <Column field="category" header="Category"></Column>
      <Column field="quantity" header="Quantity"></Column>
    </DataTable>
  </div>
</template>

<style scoped lang="scss"></style>
