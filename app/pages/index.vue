<script setup lang="ts">
import LandingButtons from "~/components/landing/LandingButtons.vue";

definePageMeta({
  auth: false,
});
</script>

<template>
  <div id="home">
    <div class="welcome">
      <div class="welcome-text">
        <h1><span class="brand-primary">FLAME</span> Node UI</h1>
        <h2 class="welcome-subtitle">
          A federated learning platform dedicated to preserving
          <span class="privacy-highlight">privacy</span> and
          <span class="privacy-highlight">security</span>
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
    <div class="landing-img">
      <img
        src="~/assets/img/hospital_network.webp"
        alt="Hospital Network"
        class="network-img"
      />
    </div>
  </div>
</template>

<style lang="scss">
#home {
  display: flex;
  justify-content: space-evenly;
  align-items: center;
  gap: 3rem;
  min-height: 60vh;
}

.welcome {
  flex: 1;
  max-width: 520px;
  display: flex;
  flex-direction: column;
}

.welcome-subtitle {
  margin-block-start: 0;
}

.brand-primary {
  color: var(--p-primary-color);
}

.privacy-highlight {
  color: var(--p-indigo-500);
  font-weight: 600;
}

.landing-img {
  flex: 1;
  display: flex;
  justify-content: center;
  max-width: 680px;
}

.network-img {
  width: 100%;
  height: auto;
}

/* Preserve card margin used by other pages */
.content-card {
  margin-top: 1rem;
}

.tab-card {
  margin-top: 1rem;
}

@media (max-width: 768px) {
  #home {
    flex-direction: column;
    min-height: auto;
    gap: 2rem;
  }

  .welcome {
    max-width: 100%;
  }

  .landing-img {
    max-width: 100%;
  }

  .network-img {
    max-width: 280px;
  }
}
</style>
