<script setup lang="ts">
import LandingButtons from "~/components/landing/LandingButtons.vue";

definePageMeta({
  auth: false,
});
</script>

<template>
  <div id="home" class="row">
    <div class="col-6 welcome">
      <div class="welcome-text">
        <h1><span style="color: orangered">FLAME</span> Node UI</h1>
        <h2 style="margin-block-start: 0">
          A federated learning platform dedicated to preserving
          <span style="color: blueviolet">privacy</span> and
          <span style="color: blueviolet">security</span>
        </h2>
        <p>
          Contribute to the Medical Informatics Initiative (MII) by becoming
          part of a federated network focused on improving healthcare, while
          maintaining full control of who has access to your data.
        </p>
      </div>
      <div class="landing-btns">
        <LandingButtons />
      </div>
    </div>
    <div class="col-6 landing-img">
      <img
        src="@/assets/img/node_network.png"
        alt="Hospital Network"
        class="pimg network-img"
      />
    </div>
  </div>
</template>

<style lang="scss">
#home {
  display: flex;
  justify-content: space-evenly;
  align-items: center;
}

.welcome {
  margin: 20px;
  display: flex;
  flex-direction: column;
  width: 40%;
}

.pimg {
  width: 70%;
}

.landing-img {
  justify-content: center;
  display: flex;
  float: right;
}

.p-tabview-header {
  margin-right: 5px;
}

.content-card {
  margin-top: 1em;
}

.tab-card {
  margin-top: 1em;
}
</style>
