import { useToast } from "primevue/usetoast";
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
} from "../../app/composables/connectionErrorToast";

const toast = useToast();

export const fakeHubApi = $fetch.create({
  baseURL: "",
  onRequestError({ error }) {
    console.error(error);
  },
  async onResponseError({ request, response }) {
    // Handle the response errors
    const errMsg = response._data?.detail?.message ?? "no message provided";
    const errSvc = response._data?.detail?.service ?? undefined;

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
