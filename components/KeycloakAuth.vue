<script setup>
const { loggedIn, user, login, logout } = useOidcAuth();
</script>

<template>
  <div v-if="loggedIn">
    <h1>Welcome {{ user.providerInfo.preferred_username }}!</h1>
    <p>Logged in since {{ user.accessToken }}</p>
    <button @click="logout()">Logout</button>
  </div>
  <div v-else>
    <h1>Not logged in</h1>
    <button @click="login()">Login with Keycloak</button>
  </div>
</template>
