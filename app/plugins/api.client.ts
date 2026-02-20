import {
  showDownstreamConnectionErrorToast,
  showHubAdapterConnectionErrorToast,
  showHubConnectionError,
  showHubSpecificErrorMessage,
  showInvalidRobotCredentialsToast,
  showKongConnectionErrorToast,
  showKongConnectionTestErrorToast,
  showKongConsumerConnectionErrorToast,
  showKongDuplicateErrorToast,
  showKongGatewayErrorToast,
  showKongMissingHealthConsumerErrorToast,
  showKongS3BucketErrorToast,
  showRbacPermissionError,
  showWrongRobotIdToast,
} from "~/composables/connectionErrorToast";
import type { SessionData } from "h3";
import { useToast } from "primevue/usetoast";

export default defineNuxtPlugin(() => {
  const { signIn, data } = useAuth();
  const { shouldRefreshToken, refreshToken } = useAuthRefresh();
  let toast: ReturnType<typeof useToast> | null = null;
  try {
    toast = useToast();
  } catch (e) {
    // useToast may not be available during server-side initialization
    toast = null;
    console.error(e);
  }

  const config = useRuntimeConfig();
  const idpProvider: string = config.public.idpProvider as string;
  const baseUrl = config.public.hubAdapterUrl as string;

  const hubApi = $fetch.create({
    baseURL: baseUrl,
    async onRequest({ options }) {
      const sessionData = (data as SessionData).value!;

      if (shouldRefreshToken(120)) {
        const refreshStatus = await refreshToken();
        if (!refreshStatus.success) {
          await signIn(idpProvider); // Force sign in again if auto refresh fails
        }
      }

      // Annoying workaround to avoid typescript from complaining - cast to Headers then set explicitly
      const headers = options.headers
        ? new Headers(options.headers)
        : new Headers();
      headers.set("Authorization", `Bearer ${sessionData.accessToken}`);
      options.headers = headers;
    },
    onRequestError({ error }) {
      console.error(error);
    },
    async onResponseError({ request, response }) {
      // Handle the response errors
      const errMsg = response._data.detail?.message ?? "no message provided";
      const errSvc = response._data.detail?.service ?? null;
      // if (response.status === 401) {
      //   console.warn("User not signed in, returning to login");
      //   await signIn(idpProvider);
      // }
      console.error(response);

      // Catch RBAC permission error
      if (errSvc && errSvc === "Auth" && response.status === 403) {
        if (toast) showRbacPermissionError(toast, errMsg);
        else console.warn("RBAC permission error:", errMsg);
      }

      // Kong connection test errors
      else if (typeof request === "string" && request.includes("kong")) {
        switch (response.status) {
          case 403:
            if (toast) showKongS3BucketErrorToast(toast, errMsg);
            else console.warn("Kong S3 bucket error:", errMsg);
            break;

          case 404:
            if (toast) showKongMissingHealthConsumerErrorToast(toast, errMsg);
            else console.warn("Kong missing health consumer:", errMsg);
            break;

          case 409:
            if (toast) showKongDuplicateErrorToast(toast);
            else console.warn("Kong duplicate error");
            break;

          case 502:
            if (toast) showKongGatewayErrorToast(toast, errMsg);
            else console.warn("Kong gateway error:", errMsg);
            break;

          case 503:
            if (errMsg && (errSvc == "FHIR" || errSvc == "S3")) {
              if (toast)
                showKongConsumerConnectionErrorToast(toast, errSvc, errMsg);
              else console.warn(`${errSvc} consumer connection error:`, errMsg);
            } else {
              if (toast) showKongConnectionErrorToast(toast);
              else console.warn("Kong connection error");
            }
            break;

          default: {
            showKongConnectionTestErrorToast(toast, errMsg);
            break;
          }
        }
      }
      if (response.status === 500) {
        if (toast) showHubAdapterConnectionErrorToast(toast, errSvc);
        else console.error("Hub adapter 500", errSvc);
      } else if (response.status === 503) {
        const downstreamService = errSvc ?? "needed";
        if (toast) showDownstreamConnectionErrorToast(toast, downstreamService);
        else
          console.error("Downstream service unavailable:", downstreamService);
      } else if (response.status === 400) {
        if (response._data.detail.code === "invalid_credentials") {
          if (toast) showInvalidRobotCredentialsToast(toast);
          else console.warn("Invalid robot credentials");
        } else if (errMsg) {
          if (toast) showHubSpecificErrorMessage(toast, errMsg);
          else console.warn("Hub error:", errMsg);
        } else {
          if (toast) showWrongRobotIdToast(toast);
          else console.warn("Wrong robot id");
        }
      } else if (response.status === 408) {
        if (toast) showHubConnectionError(toast);
        else console.warn("Hub connection timeout");
      }
    },
  });

  return {
    provide: {
      hubApi,
    },
  };
});
