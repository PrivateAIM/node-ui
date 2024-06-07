<script setup lang="ts">
import { ref } from "vue";
import { useAPIFetch } from "~/composables/useAPIFetch";

// onMounted(() => {
//   CustomerService.getCustomersMedium().then((data) => (customers.value = data));
// });

let testContainers = ref([
  {
    name: "Foo",
    category: "TestInstance",
    quantity: 1,
  },
  {
    name: "Failed API Call",
    category: "ShortAndStout",
    quantity: 3,
  },
]);

const { data: APIcontainers } = await useAPIFetch<Array>(
    "/containers", {
      method: "GET",
    }
);

let containers = APIcontainers || testContainers;
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
