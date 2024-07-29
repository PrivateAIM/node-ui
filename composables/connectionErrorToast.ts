import { useToast } from "primevue/usetoast";

export const useToastService = () => {
  const nuxtApp = useNuxtApp();
  const getToast: typeof useToast = () =>
    nuxtApp.vueApp.config.globalProperties.$toast;
  return getToast();
};

export const showConnectionErrorToast = () => {
  const toast = useToastService();
  toast.add({
    severity: "error",
    summary: "Connection error",
    detail: "Unable to contact the API.",
    life: 3000,
  });
};
