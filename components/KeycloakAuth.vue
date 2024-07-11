<script setup lang="ts">
const { loggedIn, user, login, logout } = useOidcAuth();
</script>

<template>
  <div class="keycloakLoginButton">
    <div v-if="loggedIn">
      <h3>Welcome {{ user.providerInfo.preferred_username }}!</h3>
      <Button @click="logout()" severity="warning" outlined>Logout</Button>
    </div>
    <div v-else>
      <Button @click="login()" severity="success" outlined
        >Login with Keycloak</Button
      >
    </div>
  </div>
</template>
