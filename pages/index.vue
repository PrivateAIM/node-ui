<script setup lang="ts">
import LandingButtons from "~/components/landing/LandingButtons.vue";

const { status, getSession, data } = useAuth();
const session = await getSession();

console.log(status.value);
console.log(session);
console.log(data.value);
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
      <div class="landing-btns"><LandingButtons /></div>
    </div>
    <div class="col-6 landing-img">
      <img
        src="@/assets/img/hospital_network.jpg"
        alt="Hospital Network"
        class="pimg networkImg"
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
  height: 35em;
}

.landing-img {
  align-items: end;
  display: flex;
  float: right;
  margin: 1em;
}

.p-tabview-header {
  margin-right: 5px;
}

.contentCard {
  margin-top: 1em;
}

.tabCard {
  margin-top: 1em;
}
</style>
