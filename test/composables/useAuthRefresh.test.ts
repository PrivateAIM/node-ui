import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ref } from "vue";
import { useAuth } from "@sidebase/nuxt-auth";
import { useAuthRefresh } from "~/composables/useAuthRefresh";

// Helpers to build mock useAuth state
function mockAuthAs(
  status: string,
  expiresAt?: number,
  refreshFn: () => Promise<void> = vi.fn().mockResolvedValue(undefined),
) {
  vi.mocked(useAuth).mockReturnValue({
    status: ref(status),
    data: ref(expiresAt !== undefined ? { expiresAt } : expiresAt),
    refresh: refreshFn,
    signIn: vi.fn(),
    signOut: vi.fn(),
  });
}

describe("useAuthRefresh", () => {
  let warnSpy: ReturnType<typeof vi.spyOn>;
  let errorSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
    errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    warnSpy.mockRestore();
    errorSpy.mockRestore();
  });

  describe("shouldRefreshToken", () => {
    it("returns false when not authenticated", () => {
      mockAuthAs("unauthenticated");
      const { shouldRefreshToken } = useAuthRefresh();
      expect(shouldRefreshToken()).toBe(false);
    });

    it("returns false when data is null", () => {
      vi.mocked(useAuth).mockReturnValue({
        status: ref("authenticated"),
        data: ref(null),
        refresh: vi.fn(),
        signIn: vi.fn(),
        signOut: vi.fn(),
      });
      const { shouldRefreshToken } = useAuthRefresh();
      expect(shouldRefreshToken()).toBe(false);
    });

    it("returns false and warns when session has no expiresAt", () => {
      vi.mocked(useAuth).mockReturnValue({
        status: ref("authenticated"),
        data: ref({}), // no expiresAt
        refresh: vi.fn(),
        signIn: vi.fn(),
        signOut: vi.fn(),
      });
      const { shouldRefreshToken } = useAuthRefresh();
      expect(shouldRefreshToken()).toBe(false);
      expect(warnSpy).toHaveBeenCalledWith(
        "Token expiration time not found in session data",
      );
    });

    it("returns false when token expires far in the future (beyond buffer)", () => {
      const farFuture = Math.floor(Date.now() / 1000) + 600; // 10 min away
      mockAuthAs("authenticated", farFuture);
      const { shouldRefreshToken } = useAuthRefresh();
      expect(shouldRefreshToken(120)).toBe(false); // 120s buffer
    });

    it("returns true when token expires within the buffer window", () => {
      const soonExpiry = Math.floor(Date.now() / 1000) + 60; // 60s away
      mockAuthAs("authenticated", soonExpiry);
      const { shouldRefreshToken } = useAuthRefresh();
      expect(shouldRefreshToken(120)).toBe(true); // 120s buffer → 60s < 120s
    });

    it("returns false when token has already expired", () => {
      const pastExpiry = Math.floor(Date.now() / 1000) - 10; // 10s ago
      mockAuthAs("authenticated", pastExpiry);
      const { shouldRefreshToken } = useAuthRefresh();
      expect(shouldRefreshToken()).toBe(false);
    });

    it("respects a custom bufferSeconds argument", () => {
      const expiry = Math.floor(Date.now() / 1000) + 200; // 200s away
      mockAuthAs("authenticated", expiry);
      const { shouldRefreshToken } = useAuthRefresh();
      expect(shouldRefreshToken(300)).toBe(true); // 200s < 300s buffer
      expect(shouldRefreshToken(120)).toBe(false); // 200s > 120s buffer
    });
  });

  describe("refreshToken", () => {
    it("returns 'No active session' when not authenticated", async () => {
      mockAuthAs("unauthenticated");
      const { refreshToken } = useAuthRefresh();
      const result = await refreshToken();
      expect(result).toEqual({ success: false, error: "No active session" });
    });

    it("returns success when refresh succeeds and session stays authenticated", async () => {
      const expiry = Math.floor(Date.now() / 1000) + 3600;
      mockAuthAs("authenticated", expiry);
      const { refreshToken } = useAuthRefresh();
      const result = await refreshToken();
      expect(result).toEqual({ success: true });
    });

    it("returns 'Refresh in progress' when called concurrently", async () => {
      const expiry = Math.floor(Date.now() / 1000) + 3600;
      let resolveRefresh!: () => void;
      const slowRefresh = () =>
        new Promise<void>((res) => {
          resolveRefresh = res;
        });
      mockAuthAs("authenticated", expiry, slowRefresh);
      const { refreshToken } = useAuthRefresh();

      const first = refreshToken(); // starts, isRefreshing → true
      const second = refreshToken(); // should be blocked
      resolveRefresh();
      const [r1, r2] = await Promise.all([first, second]);
      expect(r1).toEqual({ success: true });
      expect(r2).toEqual({ success: false, error: "Refresh in progress" });
    });

    it("returns error when refresh() throws", async () => {
      const expiry = Math.floor(Date.now() / 1000) + 3600;
      const throwingRefresh = vi
        .fn()
        .mockRejectedValue(new Error("network failure"));
      mockAuthAs("authenticated", expiry, throwingRefresh);
      const { refreshToken } = useAuthRefresh();
      const result = await refreshToken();
      expect(result).toEqual({ success: false, error: "network failure" });
      expect(errorSpy).toHaveBeenCalledWith(
        "Token refresh error:",
        expect.any(Error),
      );
    });

    it("exposes isRefreshing that reflects in-flight state", async () => {
      const expiry = Math.floor(Date.now() / 1000) + 3600;
      let resolveRefresh!: () => void;
      mockAuthAs(
        "authenticated",
        expiry,
        () =>
          new Promise<void>((res) => {
            resolveRefresh = res;
          }),
      );
      const { refreshToken, isRefreshing } = useAuthRefresh();

      expect(isRefreshing.value).toBe(false);
      const p = refreshToken();
      expect(isRefreshing.value).toBe(true);
      resolveRefresh();
      await p;
      expect(isRefreshing.value).toBe(false);
    });
  });
});
