<script setup lang="ts">
import KeycloakAuth from "~/components/landing/KeycloakAuth.vue";

const { data, signOut } = useAuth();
</script>

<template>
  <div class="landing-buttons">
    <div class="login-or-learn-container" v-if="!data">
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
    <Button @click="signOut()" severity="warn" outlined>Sign Out</Button>
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
  border-bottom: solid 2px yellow;
  margin-bottom: -2px;
  background-color: black;
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
</style>
