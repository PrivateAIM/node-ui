<script setup lang="ts">
import KeycloakAuth from "~/components/landing/KeycloakAuth.vue";

const { loggedIn } = useOidcAuth();
</script>

<template>
  <div class="landing-buttons">
    <div class="login-or-learn-container" v-if="!loggedIn">
      <KeycloakAuth />
      <div class="learn-more-btn landing-btn">
        <NuxtLink
          to="https://privateaim.de/de/index.html"
          target="_blank"
          rel="noopener"
        >
          <Button label="privateaim" severity="contrast" outlined
            >Learn More</Button
          >
        </NuxtLink>
      </div>
    </div>
    <div class="get-started-container" v-else>
      <h2 style="text-align: center">What would you like to do today?</h2>
      <div class="get-started-btns">
        <a class="get-started-btn" href="/projects">
          <i
            class="pi pi-objects-column get-started-btn-icon"
            style="font-size: 3em"
          />
          <p>Review projects and their statuses</p>
        </a>
        <a class="get-started-btn" href="/analyses">
          <i
            class="pi pi-lightbulb get-started-btn-icon"
            style="font-size: 3em"
          />
          <p>Inspect individual analyses</p>
        </a>
        <a class="get-started-btn" href="/data-stores/create">
          <i class="pi pi-hammer get-started-btn-icon" style="font-size: 3em" />
          <p>Create a data store for a project</p>
        </a>
        <a class="get-started-btn" href="/data-stores">
          <i class="pi pi-wrench get-started-btn-icon" style="font-size: 3em" />
          <p>Manage the active data stores</p>
        </a>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.login-or-learn-container {
  display: flex;
  flex-direction: row;
  justify-content: center;
}

.landing-btn {
  margin: 1em;
}

.get-started-container {
  margin-top: 5em;
}

.get-started-btns {
  display: flex;
  flex-direction: row;
  justify-content: safe center;
  height: 10em;
}

.get-started-btn {
  width: 10em;
  border: solid 1px gray;
  background: none;
  text-decoration: none;
  display: flex;
  flex-direction: column;
  text-align: center;
  align-items: center;
  color: deepskyblue;
  padding: 0.4em;
}

.get-started-btn-icon {
  margin: 0.3em;
}

.get-started-btn:hover {
  border-bottom: solid 2px yellow;
}
</style>
