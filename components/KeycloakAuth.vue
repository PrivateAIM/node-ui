<script setup lang="ts">
import Keycloak from "keycloak-js";
import { useKeycloak } from "@/stores/keycloak";

const config = useRuntimeConfig();
const store = useKeycloak();
const loggedIn = ref(false);

const keycloakInitOptions = {
  url: config.public.keycloakUrl as string,
  realm: config.public.keycloakRealm as string,
  clientId: config.public.keycloakClientId as string,
  clientSecret: config.keycloakClientSecret,
};

const keycloak = new Keycloak(keycloakInitOptions);

keycloak.init({ onLoad: "check-sso" }).then((auth) => {
  if (!auth) {
    window.location.reload();
  } else {
    keycloak
      .updateToken(5)
      .then(function (refreshed) {
        if (refreshed) {
          console.log("Token was successfully refreshed");
        } else {
          console.log("Token is still valid");
        }
      })
      .catch(function () {
        console.log("Failed to refresh the token, or the session has expired");
      });

    store.setup(keycloak);
    loggedIn.value = true;
  }
});
</script>

<template>
  <div class="keycloakLoginButton">
    <div v-if="loggedIn">
      <h3>Welcome {{ store.userProfile!.Name }}!</h3>
      <Button @click="keycloak.logout()" severity="warning" outlined
        >Logout</Button
      >
    </div>
    <div v-else>
      <Button @click="keycloak.login()" severity="success" outlined
        >Login with Keycloak</Button
      >
    </div>
  </div>
</template>
