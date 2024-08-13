<script setup lang="ts">
const { loggedIn, user, login, logout } = useOidcAuth();
console.log(user.value);

async function customLogout() {
  await logout();
}
</script>

<template>
  <div class="keycloakLoginButton">
    <div v-if="loggedIn">
      <h3>Welcome {{ user.providerInfo?.preferred_username || "Friend" }}!</h3>
      <Button @click="customLogout()" severity="warning" outlined
        >Logout</Button
      >
    </div>
    <div v-else>
      <Button @click="login()" severity="success" outlined
        >Login with Keycloak</Button
      >
    </div>
  </div>
</template>
