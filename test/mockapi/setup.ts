import { afterAll, afterEach, beforeAll, vi } from "vitest";
import { computed, onMounted, readonly, ref, watch } from "vue";

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
import ConfirmDialog from "primevue/confirmdialog";
import ToggleSwitch from "primevue/toggleswitch";
import MultiSelect from "primevue/multiselect";
import InputIcon from "primevue/inputicon";
import InputText from "primevue/inputtext";
import IconField from "primevue/iconfield";
import VirtualScroller from "primevue/virtualscroller";

/* eslint-disable  @typescript-eslint/no-explicit-any */
const globalThis = global as any;
globalThis.ref = ref;
globalThis.computed = computed;
globalThis.onMounted = onMounted;
globalThis.watch = watch;
globalThis.readonly = readonly;

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
  ConfirmDialog,
  ToggleSwitch,
  MultiSelect,
  InputIcon,
  InputText,
  IconField,
  VirtualScroller,
};

// Stub NuxtLink via stubs (matches by component `name` property) rather than
// config.global.components, so it intercepts directly-imported NuxtLink too.
config.global.stubs = {
  NuxtLink: { template: "<a><slot /></a>" },
};

vi.mock(
  "@sidebase/nuxt-auth",
  async () => import("@/test/mockapi/nuxt-auth-mock"),
);

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
export const testServer = setupServer(...handlers);

// Start server before all tests
beforeAll(() => testServer.listen({ onUnhandledRequest: "error" }));

// Close server after all tests
afterAll(() => testServer.close());

// Reset handlers after each test for test isolation
afterEach(() => testServer.resetHandlers());
