<script setup lang="ts">
import KeycloakAuth from "~/components/KeycloakAuth.vue";
</script>

<template>
  <div id="home" class="row">
    <div class="col-6 welcome">
      <h1>FLAME Node UI</h1>
      <KeycloakAuth />
    </div>
    <div class="col-6">
      <img
        src="../assets/hospital_network.jpg"
        alt="Hospital Network"
        class="pimg networkImg"
      />
    </div>
  </div>
</template>

<style scoped lang="scss">
#home {
  display: flex;
  justify-content: center;
  align-items: center;
}

.pimg {
  height: 650px;
  float: right;
  display: flex;
}

.row {
  display: flex;
}
</style>
