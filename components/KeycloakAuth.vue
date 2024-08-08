<script setup lang="ts">
import { useAuth } from "~/stores/auth";
import { useServices } from "~/composables/useServices";

const authStore = useAuth();
const services = useServices();

const user = authStore.user;

const signIn = () => services.$auth.signInRedirect();
const signOut = () => services.$auth.logout();
</script>

<template>
  <div class="keycloakLoginButton">
    <div v-if="user">
      <h3>Welcome {{ user.profile.name }}!</h3>
      <Button @click="signOut" severity="warning" outlined>Logout</Button>
    </div>
    <div v-else>
      <Button @click="signIn" severity="success" outlined
        >Login with Keycloak</Button
      >
    </div>
  </div>
</template>
