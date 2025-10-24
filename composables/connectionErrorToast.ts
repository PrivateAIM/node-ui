import type { ToastServiceMethods } from "primevue/toastservice";

const activeToasts = new Set();

export function showConnectionErrorToast(
  toast: ToastServiceMethods,
  { severity, summary, detail, life },
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
    life: 300,
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
    life: 500,
  });
  console.warn(`The ${service} service is unreachable`);
};

// Kong error toasts

export const showKongConnectionErrorToast = (toast: ToastServiceMethods) => {
  showConnectionErrorToast(toast, {
    severity: "error",
    summary: "Connection error",
    detail: "Unable to contact the Kong gateway service.",
    life: 500,
  });
  console.warn("Kong service unreachable");
};

export const showKongDuplicateErrorToast = (toast: ToastServiceMethods) => {
  showConnectionErrorToast(toast, {
    severity: "error",
    summary: "Duplicate entry error",
    detail: "A data store for this project and server type already exists!",
    life: 500,
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
    life: 800,
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
    life: 500,
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
    life: 500,
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
    life: 500,
  });
};

export const showKongFhirErrorToast = (
  toast: ToastServiceMethods,
  msg: string,
) => {
  showConnectionErrorToast(toast, {
    severity: "error",
    summary: "FHIR connection error",
    detail: msg,
    life: 500,
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
    life: 100,
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
    life: 500,
  });
  console.warn("Missing registry credentials");
};

export const showWrongRobotIdToast = (toast: ToastServiceMethods) => {
  showConnectionErrorToast(toast, {
    severity: "error",
    summary: "Invalid Robot ID",
    detail:
      "The robot ID is not a valid UUID. Please verify the robot ID was used during deployment and not the name.",
    life: 500,
  });
  console.warn("Invalid robot ID");
};

export const showHubConnectionError = (toast: ToastServiceMethods) => {
  showConnectionErrorToast(toast, {
    severity: "error",
    summary: "Connection error",
    detail: "Unable to contact the Hub.",
    life: 400,
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
    life: 500,
  });
  console.warn(msg);
};
