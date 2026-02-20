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
  showNotAuthenticatedToast,
  showRbacPermissionError,
  showWrongRobotIdToast,
} from "~/composables/connectionErrorToast";
import { useToast } from "primevue/usetoast";

export default defineNuxtPlugin(() => {
  const { signIn, getSession } = useAuth();
  const { shouldRefreshToken, refreshToken } = useAuthRefresh();
  const toast = useToast();

  const config = useRuntimeConfig();
  const idpProvider: string = config.public.idpProvider as string;
  const baseUrl = config.public.hubAdapterUrl as string;

  const hubApi = $fetch.create({
    baseURL: baseUrl,
    async onRequest({ options }) {
      const sessionData = await getSession();

      if (shouldRefreshToken(120)) {
        const refreshStatus = await refreshToken();
        if (!refreshStatus.success) {
          await signIn(idpProvider); // Force sign in again if auto refresh fails
        }
      }

      // Annoying workaround to avoid typescript from complaining - cast to Headers then set explicitly
      if (sessionData && sessionData.accessToken) {
        const headers = options.headers
          ? new Headers(options.headers)
          : new Headers();
        headers.set("Authorization", `Bearer ${sessionData.accessToken}`);
        options.headers = headers;
      } else {
        showNotAuthenticatedToast(toast);
      }
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
        showRbacPermissionError(toast, errMsg);
      }

      // Kong connection test errors
      else if (typeof request === "string" && request.includes("kong")) {
        switch (response.status) {
          case 403:
            showKongS3BucketErrorToast(toast, errMsg);
            break;

          case 404:
            showKongMissingHealthConsumerErrorToast(toast, errMsg);
            break;

          case 409:
            showKongDuplicateErrorToast(toast);
            break;

          case 502:
            showKongGatewayErrorToast(toast, errMsg);
            break;

          case 503:
            if (errMsg && (errSvc == "FHIR" || errSvc == "S3")) {
              showKongConsumerConnectionErrorToast(toast, errSvc, errMsg);
            } else {
              showKongConnectionErrorToast(toast);
            }
            break;

          default: {
            showKongConnectionTestErrorToast(toast, errMsg);
            break;
          }
        }
      }
      if (response.status === 500) {
        showHubAdapterConnectionErrorToast(toast, errSvc);
      } else if (response.status === 503) {
        const downstreamService = errSvc ?? "needed";
        showDownstreamConnectionErrorToast(toast, downstreamService);
      } else if (response.status === 400) {
        if (response._data.detail.code === "invalid_credentials") {
          showInvalidRobotCredentialsToast(toast);
        } else if (errMsg) {
          showHubSpecificErrorMessage(toast, errMsg);
        } else {
          showWrongRobotIdToast(toast);
        }
      } else if (response.status === 408) {
        showHubConnectionError(toast);
      }
    },
  });

  return {
    provide: {
      hubApi,
    },
  };
});
