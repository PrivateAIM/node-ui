import { useToast } from "primevue/usetoast";

export const showHubAdapterConnectionErrorToast = () => {
  const toast = useToast();
  toast.add({
    severity: "error",
    summary: "Connection error",
    detail: "Unable to contact the API.",
    life: 3000,
  });
  console.warn("Hub Adapter API service unreachable");
};

export const showKongConnectionErrorToast = () => {
  const toast = useToast();
  toast.add({
    severity: "error",
    summary: "Connection error",
    detail: "Unable to contact the Kong gateway service.",
    life: 5000,
  });
  console.warn("Kong service unreachable");
};

export const showDownstreamConnectionErrorToast = (service: string) => {
  const toast = useToast();
  toast.add({
    severity: "error",
    summary: "Service unavailable error",
    detail: `Unable to contact the ${service} service.`,
    life: 5000,
  });
  console.warn(`The ${service} service is unreachable`);
};

export const showInvalidRobotCredentialsToast = () => {
  const toast = useToast();
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

export const showWrongRobotIdToast = () => {
  const toast = useToast();
  toast.add({
    severity: "error",
    summary: "Invalid Robot ID",
    detail:
      "The robot ID is not a valid UUID. Please verify the robot ID was used during deployment and not the name.",
    life: 10000,
  });
  console.warn("Invalid robot ID");
};

export const showHubConnectionError = () => {
  const toast = useToast();
  toast.add({
    severity: "error",
    summary: "Connection error",
    detail: "Unable to contact the Hub.",
    life: 3000,
  });
  console.warn("Hub is currently unreachable");
};
