import {
  showKongConnectionErrorToast,
  showHubAdapterConnectionErrorToast,
  showDownstreamConnectionErrorToast,
  showWrongRobotIdToast,
  showInvalidRobotCredentialsToast,
  showHubConnectionError,
} from "~/composables/connectionErrorToast";
import type { SessionData } from "h3";

export default defineNuxtPlugin(() => {
  const { signIn, data } = useAuth();

  const config = useRuntimeConfig();
  const baseUrl = config.public.hubAdapterUrl as string;

  const hubApi = $fetch.create({
    baseURL: baseUrl,
    onRequest({ options }) {
      // Annoying workaround to avoid typescript from complaining - cast to Headers then set explicitly
      const headers = options.headers
        ? new Headers(options.headers)
        : new Headers();
      headers.set(
        "Authorization",
        `Bearer ${(data as SessionData).value!.accessToken}`,
      );
      options.headers = headers;
    },
    onRequestError({ error }) {
      console.error(error);
    },
    async onResponseError({ request, response }) {
      // Handle the response errors
      if (response.status === 401) {
        console.warn("User not signed in, returning to login");
        await signIn("keycloak");
      }
      console.error(response);
      if (response.status === 500) {
        if (typeof request === "string" && request.includes("kong")) {
          showKongConnectionErrorToast();
        } else {
          showHubAdapterConnectionErrorToast();
        }
      } else if (response.status === 503) {
        let downstreamService: string;
        if (response._data.detail.service) {
          downstreamService = response._data.detail.service;
        } else {
          downstreamService = "for this process";
        }
        showDownstreamConnectionErrorToast(downstreamService);
      } else if (response.status === 400) {
        navigateTo("/");
        if (response._data.detail.code === "invalid_credentials") {
          showInvalidRobotCredentialsToast();
        } else {
          showWrongRobotIdToast();
        }
      } else if (response.status === 408) {
        navigateTo("/");
        showHubConnectionError();
      }
    },
  });

  return {
    provide: {
      hubApi,
    },
  };
});
