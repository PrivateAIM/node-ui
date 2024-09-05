import { useToast } from "primevue/usetoast";

export const useToastService = () => {
  const nuxtApp = useNuxtApp();
  const getToast: typeof useToast = () =>
    nuxtApp.vueApp.config.globalProperties.$toast;
  return getToast();
};

export const showHubAdapterConnectionErrorToast = () => {
  const toast = useToastService();
  toast.add({
    severity: "error",
    summary: "Connection error",
    detail: "Unable to contact the API.",
    life: 3000,
  });
  console.warn("Hub Adapter API service unreachable");
};

export const showKongConnectionErrorToast = () => {
  const toast = useToastService();
  toast.add({
    severity: "error",
    summary: "Connection error",
    detail: "Unable to contact the Kong gateway service.",
    life: 5000,
  });
  console.warn("Kong service unreachable");
};

export const showDownstreamConnectionErrorToast = (service: string) => {
  const toast = useToastService();
  toast.add({
    severity: "error",
    summary: "Service unavailable error",
    detail: `Unable to contact the ${service} service.`,
    life: 5000,
  });
  console.warn(`The ${service} service is unreachable`);
};
