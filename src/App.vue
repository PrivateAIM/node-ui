<template>
  <div>
    <PageSidebar />
    <MenuHeader />
    <ContainerList />
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import "primeicons/primeicons.css";
import "primevue/resources/themes/aura-light-noir/theme.css";
import MenuHeader from "@/components/MenuHeader.vue";
import ContainerList from "@/components/ContainerList.vue";
import PageSidebar from "@/components/PageSidebar.vue";

export default defineComponent({
  name: "App",
  components: {
    ContainerList,
    MenuHeader,
    PageSidebar,
  },
  data() {
    return {
      checked: true,
    };
  },
});
</script>

<style lang="scss">
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  //text-align: left;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
