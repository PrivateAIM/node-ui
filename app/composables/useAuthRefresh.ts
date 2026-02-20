import { ref } from "vue";
import type { SessionData } from "h3";

interface RefreshResponse {
  success: boolean;
  error?: string;
}

export const useAuthRefresh = () => {
  const { status, data, refresh } = useAuth();
  const isRefreshing = ref(false);
  const refreshError = ref<string | null>(null);

  const refreshToken = async (): Promise<RefreshResponse> => {
    // Prevent multiple simultaneous refresh attempts
    if (isRefreshing.value) {
      return { success: false, error: "Refresh in progress" };
    }

    // Check if user is authenticated
    if (status.value !== "authenticated") {
      return { success: false, error: "No active session" };
    }

    isRefreshing.value = true;
    refreshError.value = null;

    try {
      await refresh(); // From sidebase methods

      // Verify the refresh was successful
      if (status.value === "authenticated") {
        return { success: true };
      } else {
        refreshError.value = "Session refresh failed";
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
    }
  };

  const shouldRefreshToken = (bufferSeconds: number = 120): boolean => {
    if (status.value !== "authenticated" || !data.value) {
      return false;
    }

    const tokenData = data.value as SessionData;
    const exp = tokenData.expiresAt;

    if (!exp) {
      console.warn("Token expiration time not found in session data");
      return false;
    }

    const expiryTime =
      typeof exp === "number" ? exp * 1000 : new Date(exp).getTime();
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
