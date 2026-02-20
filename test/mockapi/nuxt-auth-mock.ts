import { vi } from "vitest";
import { ref } from "vue";

export const useAuth = vi.fn(() => ({
  status: ref("unauthenticated"),
  signIn: vi.fn(),
  signOut: vi.fn(),
  data: ref(null),
  getSession: vi.fn(),
}));

export const useAuthState = vi.fn(() => ({
  status: ref("unauthenticated"),
  data: ref(null),
  loading: ref(false),
  lastRefreshedAt: ref(undefined),
}));

export default useAuth;
