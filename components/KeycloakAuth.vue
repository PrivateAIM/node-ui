<script setup>
const { loggedIn, user, login, logout } = useOidcAuth();
</script>

<template>
  <div class="keycloakLoginButton">
    <div v-if="loggedIn">
      <h3>Welcome {{ user.providerInfo.preferred_username }}!</h3>
      <button @click="logout()">Logout</button>
    </div>
    <div v-else>
      <button @click="login()">Login with Keycloak</button>
    </div>
  </div>
</template>
