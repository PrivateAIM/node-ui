import type { ToastServiceMethods } from "primevue/toastservice";
import { showIdpUnreachableToast } from "~/composables/connectionErrorToast";

interface IdpHealth {
  reachable: boolean;
  error?: string;
}

/**
 * Checks that the IDP is reachable before signIn is called
 *
 * Returns true when sign in should go ahead
 */
export async function checkIdpReachable(
  toast: ToastServiceMethods,
): Promise<boolean> {
  let health: IdpHealth;

  try {
    health = await $fetch<IdpHealth>("/flame/api/health");
  } catch (error) {
    console.error("IDP health check failed:", error);
    showIdpUnreachableToast(toast);
    return false;
  }

  if (!health.reachable) {
    showIdpUnreachableToast(toast, health.error);
    return false;
  }

  return true;
}
