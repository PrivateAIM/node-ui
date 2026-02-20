import { afterAll, afterEach, beforeAll, vi } from "vitest";
import { computed, onMounted, ref, watch } from "vue";
import { config } from "@vue/test-utils";
import { setupServer } from "msw/node";
import { handlers } from "./handlers";
import { fakeHubApi } from "./api";

import PrimeVue from "primevue/config";
import DataTable from "primevue/datatable";
import Column from "primevue/column";
import Button from "primevue/button";
import Toast from "primevue/toast";
import Message from "primevue/message";
import Tag from "primevue/tag";
import Select from "primevue/select";
import Card from "primevue/card";
import ConfirmPopup from "primevue/confirmpopup";
import MultiSelect from "primevue/multiselect";
import InputIcon from "primevue/inputicon";
import InputText from "primevue/inputtext";
import IconField from "primevue/iconfield";

/* eslint-disable  @typescript-eslint/no-explicit-any */
const globalThis = global as any;
globalThis.ref = ref; // Ensures `ref()` can be used in tests
globalThis.computed = computed;
globalThis.onMounted = onMounted;
globalThis.watch = watch;

// Register PrimeVue components globally for testing
config.global.plugins = [PrimeVue];

// Register commonly used PrimeVue components
config.global.components = {
  Toast,
  DataTable,
  Column,
  Button,
  Message,
  Tag,
  Select,
  Card,
  ConfirmPopup,
  MultiSelect,
  InputIcon,
  InputText,
  IconField,
  NuxtLink: {
    template: "<a><slot /></a>", // Simple stub to replace NuxtLink with an <a>
  },
};

// 2️⃣ Example: Mock a `v-tooltip` directive
config.global.directives.tooltip = {
  mounted: (el, binding) => {
    el.setAttribute("data-tooltip", binding.value || "Tooltip");
  },
};

// 2️⃣ Example: Mock a `v-ripple` directive
config.global.directives.ripple = {
  mounted: (el, binding) => {
    el.setAttribute("data-pd-ripple", binding.value || "Ripple");
  },
};

// Mock router-link
vi.mock("vue-router", async () => ({
  RouterLink: {
    template: "<a><slot /></a>",
  },
}));

vi.mock("nuxt/app", () => ({
  useNuxtApp: () => ({
    $hubApi: fakeHubApi,
  }),
  useState: vi.fn(() => ({
    value: "default",
  })),
  useFetch: vi.fn(),
  useRuntimeConfig: () => ({
    public: {
      baseUrl: "https://fakenode.com",
      primevue: vi.fn(),
      hubAdapterUrl: "https://fakenode.com/api",
      keycloakBaseUrl: "https://fakenode.com/keycloak/realms/flame",
      auth: {
        baseURL: "https://fakenode.com/flame/api/auth",
        disableInternalRouting: false,
        disableServerSideAuth: false,
        globalAppMiddleware: true,
        isEnabled: true,
        originEnvKey: "NUXT_PUBLIC_ORIGIN",
        provider: {
          addDefaultCallbackUrl: true,
          defaultProvider: "keycloak",
          trustHost: false,
          type: "authjs",
        },
        sessionRefresh: {
          enableOnWindowFocus: true,
          enablePeriodically: 15000,
          handler: "",
        },
      },
      origin: "https://fakenode.com/flame/api/auth",
      version: "0.2.2",
    },
  }),
}));

// Mock PrimeVue's `useToast`
vi.mock("primevue/usetoast", () => ({
  useToast: vi.fn(() => ({
    add: vi.fn(), // Mock the `add` method
  })),
}));

// Mock PrimeVue's `useToast`
vi.mock("primevue/useconfirm", () => ({
  useConfirm: vi.fn(() => ({})),
}));

// Mock MSW server for HTTP requests
const server = setupServer(...handlers);

// Start server before all tests
beforeAll(() => server.listen({ onUnhandledRequest: "error" }));

// Close server after all tests
afterAll(() => server.close());

// Reset handlers after each test for test isolation
afterEach(() => server.resetHandlers());
