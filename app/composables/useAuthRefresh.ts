import { ref } from "vue";
import type { Session } from "next-auth";

interface RefreshResponse {
  success: boolean;
  error?: string;
}

export const useAuthRefresh = () => {
  const { status, data, refresh } = useAuth();
  const isRefreshing = ref(false);
  const refreshError = ref<string | undefined>(undefined);
  let activeRefresh: Promise<RefreshResponse> | undefined;

  const doRefresh = async (): Promise<RefreshResponse> => {
    isRefreshing.value = true;
    refreshError.value = undefined;

    try {
      await refresh(); // From sidebase methods

      const sessionError = (data.value as Session | null)?.error;
      if (status.value === "authenticated" && !sessionError) {
        return { success: true };
      } else {
        refreshError.value = sessionError ?? "Session refresh failed";
        return { success: false, error: refreshError.value };
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error occurred";
      refreshError.value = errorMessage;
      console.error("Token refresh error:", error);
      return { success: false, error: errorMessage };
    } finally {
      isRefreshing.value = false;
      activeRefresh = undefined;
    }
  };

  const refreshToken = (): Promise<RefreshResponse> => {
    if (activeRefresh) {
      return activeRefresh;
    }

    if (status.value !== "authenticated") {
      return Promise.resolve({ success: false, error: "No active session" });
    }

    activeRefresh = doRefresh();
    return activeRefresh;
  };

  const shouldRefreshToken = (bufferSeconds: number = 120): boolean => {
    if (status.value !== "authenticated" || !data.value) {
      return false;
    }

    const tokenData = data.value as Session;
    const exp = tokenData.expiresAt;

    if (!exp) {
      console.warn("Token expiration time not found in session data");
      return false;
    }

    const expiryTime = exp * 1000;
    const timeUntilExpiry = expiryTime - Date.now(); // Time in ms

    return timeUntilExpiry < bufferSeconds * 1000 && timeUntilExpiry > 0;
  };

  return {
    refreshToken,
    shouldRefreshToken,
    isRefreshing: readonly(isRefreshing),
    refreshError: readonly(refreshError),
    status,
    data,
  };
};
