import { expect, test, describe, vi, beforeEach } from "vitest";
import { defineComponent, getCurrentInstance, h, ref } from "vue";
import { flushPromises, mount } from "@vue/test-utils";
import {
  buildProjectNameMap,
  useDataStoreList,
} from "~/composables/useDataStoreList";
import { getDataStores, getProjects } from "~/composables/useAPIFetch";

vi.mock("~/composables/useAPIFetch", () => ({
  getProjects: vi.fn(),
  getDataStores: vi.fn(),
}));

function fakeAsyncData(data: unknown) {
  return {
    data: ref(data),
    pending: ref(false),
    error: ref(undefined),
    status: ref("success"),
    refresh: vi.fn(),
    execute: vi.fn(),
    clear: vi.fn(),
  };
}

describe("buildProjectNameMap", () => {
  test("maps project id to name", () => {
    const projects = [
      { id: "abc-123", display_name: "My Project" },
      { id: "def-456", display_name: "Other Project" },
    ];
    const map = buildProjectNameMap(projects as any);
    expect(map.get("abc-123")).toBe("My Project");
    expect(map.get("def-456")).toBe("Other Project");
  });

  test("uses N/A when name is undefined", () => {
    const projects = [{ id: "abc-123", display_name: undefined }];
    const map = buildProjectNameMap(projects as any);
    expect(map.get("abc-123")).toBe("N/A");
  });

  test("skips entries without id", () => {
    const projects = [{ id: undefined, display_name: "No ID" }];
    const map = buildProjectNameMap(projects as any);
    expect(map.size).toBe(0);
  });

  test("returns empty map for empty array", () => {
    const map = buildProjectNameMap([]);
    expect(map.size).toBe(0);
  });
});

describe("useDataStoreList", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("calls every data fetcher while a component instance is active", async () => {
    const instances: Record<string, unknown> = {};

    vi.mocked(getDataStores).mockImplementation(() => {
      instances.getDataStores = getCurrentInstance();
      return fakeAsyncData(undefined) as never;
    });
    vi.mocked(getProjects).mockImplementation(() => {
      instances.getProjects = getCurrentInstance();
      return fakeAsyncData(undefined) as never;
    });

    const TestComponent = defineComponent({
      setup() {
        useDataStoreList();
        return () => h("div");
      },
    });

    mount(TestComponent);
    await flushPromises();

    // A null instance is what makes Nuxt log
    // "[useAsyncData] Component is already mounted, please use $fetch instead."
    expect(instances.getDataStores).not.toBeNull();
    expect(instances.getProjects).not.toBeNull();
  });
});
