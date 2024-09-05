import {
  showKongConnectionErrorToast,
  showHubAdapterConnectionErrorToast,
  showDownstreamConnectionErrorToast,
} from "~/composables/connectionErrorToast";

export default defineNuxtPlugin(() => {
  const { user, login } = useOidcAuth();
  const config = useRuntimeConfig();
  const baseUrl = config.public.hubAdapterUrl as string;
  const hubApi = $fetch.create({
    baseURL: baseUrl,
    onRequest({ options }) {
      // Annoying workaround to avoid typescript from complaining - cast to Headers then set explicitly
      const headers = options.headers
        ? new Headers(options.headers)
        : new Headers();
      headers.set("Authorization", `Bearer ${user?.value.accessToken}`);
      options.headers = headers;
    },
    onRequestError({ error }) {
      console.error(error);
    },
    async onResponseError({ request, response }) {
      // Handle the response errors
      if (response.status === 401 || response.status === 403) {
        console.warn("User not signed in, returning to login");
        return login();
      }
      console.error(response);
      if (response.status === 500) {
        if (typeof request === "string" && request.includes("kong")) {
          showKongConnectionErrorToast();
        } else {
          showHubAdapterConnectionErrorToast();
        }
      } else if (response.status === 503) {
        showDownstreamConnectionErrorToast();
      }
    },
  });

  return {
    provide: {
      hubApi,
    },
  };
});
