<template>
  <div>
    <MenuHeader />
    <ContainerList></ContainerList>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import MenuHeader from "@/components/MenuHeader.vue";
import ContainerList from "@/components/ContainerList.vue";

export default defineComponent({
  name: "App",
  components: {
    ContainerList,
    MenuHeader,
  },
  data() {
    return {
      checked: true,
    };
  },
});
</script>

<style lang="scss">
//#app {
//  font-family: Avenir, Helvetica, Arial, sans-serif;
//  -webkit-font-smoothing: antialiased;
//  -moz-osx-font-smoothing: grayscale;
//  text-align: left;
//  color: #2c3e50;
//  margin-top: 60px;
//}
</style>
