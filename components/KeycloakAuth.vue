<script setup lang="ts">
const { data, signIn, signOut } = useAuth();
</script>

<template>
  <div class="keycloakLoginButton">
    <div v-if="data">
      <h3>Welcome {{ data.user!.name }}!</h3>
      <Button @click="() => signOut" severity="warning" outlined>Logout</Button>
    </div>
    <div v-else>
      <Button @click="() => signIn('keycloak')" severity="success" outlined
        >Login with Keycloak</Button
      >
    </div>
  </div>
</template>
