import type { KeycloakConfig } from "keycloak-js";
import Keycloak from "keycloak-js";
import { useRuntimeConfig } from "#app/nuxt";

export default defineNuxtPlugin((nuxtApp) => {
  const config = useRuntimeConfig();

  const initOptions: KeycloakConfig = {
    url: config.public.keycloakUrl,
    realm: config.public.keycloakRealm,
    clientId: config.public.keycloakClientId,
    // clientSecret: config.public.keycloakClientSecret,
  };

  const keycloak = new Keycloak(initOptions);

  nuxtApp.$keycloak = keycloak;

  keycloak.init({
    onLoad: "check-sso",
  });
});
