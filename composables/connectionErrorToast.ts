import type { ToastServiceMethods } from "primevue/toastservice";

const activeToasts = new Set();

export function showConnectionErrorToast(
  toast: ToastServiceMethods,
  { severity, summary, detail, life = 5000 },
) {
  const toastKey = `${severity}-${summary}-${detail}`;

  // Avoid showing duplicates
  if (activeToasts.has(toastKey)) return;

  activeToasts.add(toastKey);
  toast.add({ severity, summary, detail, life });

  // Remove from set when toast closes
  setTimeout(() => {
    activeToasts.delete(toastKey);
  }, life);
}

export const showHubAdapterConnectionErrorToast = (
  toast: ToastServiceMethods,
  svc: string | null,
) => {
  let msg = "The API encountered an error";
  if (svc) {
    msg = `An error occurred when contacting the ${svc}, please check its logs`;
  }
  showConnectionErrorToast(toast, {
    severity: "error",
    summary: "Service error",
    detail: msg,
  });
};

export const showDownstreamConnectionErrorToast = (
  toast: ToastServiceMethods,
  service: string,
) => {
  showConnectionErrorToast(toast, {
    severity: "error",
    summary: "Service unavailable error",
    detail: `Unable to contact the ${service} service.`,
  });
  console.warn(`The ${service} service is unreachable`);
};

// Kong error toasts

export const showKongConnectionErrorToast = (toast: ToastServiceMethods) => {
  showConnectionErrorToast(toast, {
    severity: "error",
    summary: "Connection error",
    detail: "Unable to contact the Kong gateway service.",
  });
  console.warn("Kong service unreachable");
};

export const showKongDuplicateErrorToast = (toast: ToastServiceMethods) => {
  showConnectionErrorToast(toast, {
    severity: "error",
    summary: "Duplicate entry error",
    detail: "A data store for this project and server type already exists!",
  });
};

export const showKongConnectionTestErrorToast = (
  toast: ToastServiceMethods,
  msg: string,
) => {
  showConnectionErrorToast(toast, {
    severity: "error",
    summary: "Connection test failed",
    detail: "The following error occurred when testing the connection: " + msg,
    life: 8000,
  });
  console.error(msg);
};

export const showKongMissingHealthConsumerErrorToast = (
  toast: ToastServiceMethods,
  msg: string,
) => {
  showConnectionErrorToast(toast, {
    severity: "error",
    summary: "Missing health endpoint",
    detail: msg,
  });
};

export const showKongS3BucketErrorToast = (
  toast: ToastServiceMethods,
  msg: string,
) => {
  showConnectionErrorToast(toast, {
    severity: "error",
    summary: "S3 bucket error",
    detail: msg,
  });
};

export const showKongGatewayErrorToast = (
  toast: ToastServiceMethods,
  msg: string,
) => {
  showConnectionErrorToast(toast, {
    severity: "error",
    summary: "Gateway error",
    detail: msg,
  });
};

export const showKongConsumerConnectionErrorToast = (
  toast: ToastServiceMethods,
  svc: string,
  msg: string,
) => {
  showConnectionErrorToast(toast, {
    severity: "error",
    summary: `${svc} connection error`,
    detail: msg,
  });
};

// Hub error toasts

export const showInvalidRobotCredentialsToast = (
  toast: ToastServiceMethods,
) => {
  showConnectionErrorToast(toast, {
    severity: "error",
    summary: "Invalid Robot Credentials",
    detail:
      "The robot credentials provided during deployment are not valid. Please verify the correct robot ID and " +
      "secret were used, then upgrade your installation",
  });
  console.warn("Invalid robot credentials");
};

export const showMissingRegistryRobotCredentialsToast = (
  toast: ToastServiceMethods,
) => {
  showConnectionErrorToast(toast, {
    severity: "error",
    summary: "Missing Registry Credentials",
    detail:
      "Unable to retrieve the credentials for accessing the registry so the analysis could not be started",
  });
  console.warn("Missing registry credentials");
};

export const showWrongRobotIdToast = (toast: ToastServiceMethods) => {
  showConnectionErrorToast(toast, {
    severity: "error",
    summary: "Invalid Robot ID",
    detail:
      "The robot ID is not a valid UUID. Please verify the robot ID was used during deployment and not the name.",
  });
  console.warn("Invalid robot ID");
};

export const showHubConnectionError = (toast: ToastServiceMethods) => {
  showConnectionErrorToast(toast, {
    severity: "error",
    summary: "Connection error",
    detail: "Unable to contact the Hub.",
  });
  console.warn("Hub is currently unreachable");
};

export const showHubSpecificErrorMessage = (
  toast: ToastServiceMethods,
  msg: string,
) => {
  showConnectionErrorToast(toast, {
    severity: "error",
    summary: "Connection error",
    detail: msg,
  });
  console.warn(msg);
};
