import { vi } from "vitest";
import { ref } from "vue";

export const useAuth = vi.fn(() => ({
  signIn: vi.fn(),
  signOut: vi.fn(),
}));

export const useAuthState = vi.fn(() => ({
  status: ref("unauthenticated"),
  data: ref({}),
}));

export default useAuth;
