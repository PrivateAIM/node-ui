import { useToast } from "primevue/usetoast";
import {
  showDownstreamConnectionErrorToast,
  showHubAdapterConnectionErrorToast,
  showHubConnectionError,
  showInvalidRobotCredentialsToast,
  showKongConnectionErrorToast,
  showWrongRobotIdToast,
} from "~/composables/connectionErrorToast";
import { $fetch } from "ofetch";

const toast = useToast();

export const fakeHubApi = $fetch.create({
  baseURL: "",
  onRequestError({ error }) {
    console.error(error);
  },
  async onResponseError({ request, response }) {
    // Handle the response errors
    if (response.status === 401) {
      console.warn("User not signed in, returning to login");
    }
    console.error(response);
    if (response.status === 500) {
      if (typeof request === "string" && request.includes("kong")) {
        showKongConnectionErrorToast(toast);
      } else {
        showHubAdapterConnectionErrorToast(toast);
      }
    } else if (response.status === 503) {
      let downstreamService: string;
      if (response._data.detail.service) {
        downstreamService = response._data.detail.service;
      } else {
        downstreamService = "needed";
      }
      showDownstreamConnectionErrorToast(toast, downstreamService);
    } else if (response.status === 400) {
      navigateTo("/");
      if (response._data.detail.code === "invalid_credentials") {
        showInvalidRobotCredentialsToast(toast);
      } else {
        showWrongRobotIdToast(toast);
      }
    } else if (response.status === 408) {
      navigateTo("/");
      showHubConnectionError(toast);
    }
  },
});
