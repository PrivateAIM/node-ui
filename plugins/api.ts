import { useAuth } from "~/stores/auth";
import { useServices } from "~/composables/useServices";

export default defineNuxtPlugin((nuxtApp) => {
  const config = useRuntimeConfig();
  const authStore = useAuth();

  const token = authStore.user?.access_token;
  console.log(authStore.user);
  console.log(authStore);

  const baseUrl = config.public.hubAdapterUrl as string;
  const hubApi = $fetch.create({
    baseURL: baseUrl,
    onRequest({ options }) {
      // Annoying workaround to avoid typescript from complaining - cast to Headers then set explicitly
      const headers = options.headers
        ? new Headers(options.headers)
        : new Headers();
      headers.set("Authorization", `Bearer ${token}`);
      options.headers = headers;
    },
    onRequestError({ error }) {
      console.log(error);
    },
    onResponseError({ response }) {
      // Handle the response errors
      console.log(response);
      if (response.status === 401 || response.status === 403) {
        console.log("Token: " + token);
        console.warn("User signed out, routing to login");
        nuxtApp.runWithContext(() => navigateTo("/"));
      }
    },
  });

  return {
    provide: {
      hubApi,
    },
  };
});
