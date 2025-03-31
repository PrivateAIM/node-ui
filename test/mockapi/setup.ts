import { vi, afterAll, afterEach, beforeAll } from "vitest";
import { ref, computed } from "vue";
import { config } from "@vue/test-utils";
import { setupServer } from "msw/node";
import { handlers } from "~/test/mockapi/handlers";
import { fakeHubApi } from "~/test/mockapi/api";

import PrimeVue from "primevue/config";
import DataTable from "primevue/datatable";
import Column from "primevue/column";
import Button from "primevue/button";
import Toast from "primevue/toast";
import Message from "primevue/message";
import Tag from "primevue/tag";
import Select from "primevue/select";
import Card from "primevue/card";
import MultiSelect from "primevue/multiselect";
import InputIcon from "primevue/inputicon";
import InputText from "primevue/inputtext";
import IconField from "primevue/iconfield";

/* eslint-disable  @typescript-eslint/no-explicit-any */
const globalThis = global as any;
globalThis.ref = ref; // Ensures `ref()` can be used in tests
globalThis.computed = computed;

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

vi.mock("#app", () => ({
  useNuxtApp: () => ({
    $hubApi: fakeHubApi,
  }),
  useFetch: vi.fn(),
}));

// Mock PrimeVue's `useToast`
vi.mock("primevue/usetoast", () => ({
  useToast: vi.fn(() => ({
    add: vi.fn(), // Mock the `add` method
  })),
}));

// Mock MSW server for HTTP requests
const server = setupServer(...handlers);

// Start server before all tests
beforeAll(() => server.listen({ onUnhandledRequest: "error" }));

// Close server after all tests
afterAll(() => server.close());

// Reset handlers after each test for test isolation
afterEach(() => server.resetHandlers());
