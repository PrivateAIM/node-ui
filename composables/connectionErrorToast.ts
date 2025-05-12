export const showHubAdapterConnectionErrorToast = (
  toast,
  svc: string | null,
) => {
  let msg = "Unable to contact the API";
  if (svc) {
    msg = `Issue with the ${svc}, please check its logs`;
  }
  toast.add({
    severity: "error",
    summary: "Connection error",
    detail: msg,
    life: 3000,
  });
};

export const showKongConnectionErrorToast = (toast) => {
  toast.add({
    severity: "error",
    summary: "Connection error",
    detail: "Unable to contact the Kong gateway service.",
    life: 5000,
  });
  console.warn("Kong service unreachable");
};

export const showDownstreamConnectionErrorToast = (toast, service: string) => {
  toast.add({
    severity: "error",
    summary: "Service unavailable error",
    detail: `Unable to contact the ${service} service.`,
    life: 5000,
  });
  console.warn(`The ${service} service is unreachable`);
};

export const showInvalidRobotCredentialsToast = (toast) => {
  toast.add({
    severity: "error",
    summary: "Invalid Robot Credentials",
    detail:
      "The robot credentials provided during deployment are not valid. Please verify the correct robot ID and " +
      "secret were used, then upgrade your installation",
    life: 10000,
  });
  console.warn("Invalid robot credentials");
};

export const showWrongRobotIdToast = (toast) => {
  toast.add({
    severity: "error",
    summary: "Invalid Robot ID",
    detail:
      "The robot ID is not a valid UUID. Please verify the robot ID was used during deployment and not the name.",
    life: 10000,
  });
  console.warn("Invalid robot ID");
};

export const showHubConnectionError = (toast) => {
  toast.add({
    severity: "error",
    summary: "Connection error",
    detail: "Unable to contact the Hub.",
    life: 3000,
  });
  console.warn("Hub is currently unreachable");
};
