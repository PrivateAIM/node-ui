<script lang="ts" setup>
import IdpAuthBtns from "~/components/landing/IdpAuthBtns.vue";

const { data } = useAuth();
</script>

<template>
  <div class="landing-buttons">
    <div v-if="!data" class="login-or-learn-container">
      <div class="keycloak-btn landing-btn">
        <IdpAuthBtns />
      </div>
      <div class="learn-more-btn landing-btn">
        <NuxtLink
          rel="noopener"
          target="_blank"
          to="https://privateaim.de/de/index.html"
        >
          <Button label="privateaim" outlined severity="contrast"
            >Learn More
          </Button>
        </NuxtLink>
      </div>
    </div>
    <div v-else class="get-started-container">
      <h2 style="text-align: center">What would you like to do today?</h2>
      <div class="get-started-btns">
        <a class="get-started-btn" href="/projects">
          <i class="pi pi-objects-column get-started-btn-icon" />
          <p>Review projects and their statuses</p>
        </a>
        <a class="get-started-btn" href="/analyses">
          <i class="pi pi-lightbulb get-started-btn-icon" />
          <p>Inspect individual analyses</p>
        </a>
        <a class="get-started-btn" href="/data-stores/create">
          <i class="pi pi-hammer get-started-btn-icon" />
          <p>Create a data store for a project</p>
        </a>
        <a class="get-started-btn" href="/data-stores">
          <i class="pi pi-wrench get-started-btn-icon" />
          <p>Manage the active data stores</p>
        </a>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.login-or-learn-container {
  display: flex;
  flex-direction: row;
  justify-content: center;
}

.get-started-container {
  margin-top: 5em;
}

.get-started-btns {
  display: flex;
  flex-direction: row;
  justify-content: safe center;
  margin: auto;
}

.get-started-btn {
  width: 40%;
  border: solid 2px rgba(gray, 0.2);
  background: none;
  text-decoration: none;
  text-align: center;
  color: deepskyblue;
  padding: 0.4em;
}

.get-started-btn:hover {
  border-bottom: solid 2px var(--p-button-contrast-border-color);
  margin-bottom: -2px;
  background-color: var(--p-button-secondary-hover-background);
}

.get-started-btn:not(:last-child) {
  border-right: solid 1px rgba(gray, 0.2);
}

.get-started-btn:not(:first-child) {
  border-left: solid 1px rgba(gray, 0.2);
}

.get-started-btn-icon {
  margin: 0.3em;
  font-size: 3em;
}

.landing-btn {
  padding: 0.5em;
}
</style>
