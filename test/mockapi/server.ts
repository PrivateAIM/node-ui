import { vi, afterAll, afterEach, beforeAll } from "vitest";
import { setupServer } from "msw/node";
import { handlers } from "~/test/mockapi/handlers";
import { fakeHubApi } from "~/test/mockapi/api";

vi.mock("#app", () => ({
  useNuxtApp: () => ({
    $hubApi: fakeHubApi,
  }),
}));

const server = setupServer(...handlers);

// Start server before all tests
beforeAll(() => server.listen({ onUnhandledRequest: "error" }));

// Close server after all tests
afterAll(() => server.close());

// Reset handlers after each test for test isolation
afterEach(() => server.resetHandlers());
