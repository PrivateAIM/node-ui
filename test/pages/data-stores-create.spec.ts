import { mount } from "@vue/test-utils";
import { afterEach, describe, expect, test, vi } from "vitest";
import CreateDataStorePage from "~/pages/data-stores/create.vue";

const { routeMock } = vi.hoisted(() => ({
  routeMock: { query: {} as Record<string, unknown> },
}));

vi.mock("#app/composables/router", async (importOriginal) => ({
  ...(await importOriginal<object>()),
  useRoute: () => routeMock,
}));

const InitializerStub = {
  name: "DataStoreProjectInitializer",
  props: ["preselectedProjectId"],
  template: "<div class='initializer-stub'>{{ preselectedProjectId }}</div>",
};

function mountPage() {
  return mount(CreateDataStorePage, {
    global: { stubs: { DataStoreProjectInitializer: InitializerStub } },
  });
}

describe("pages/data-stores/create.vue", () => {
  afterEach(() => {
    routeMock.query = {};
  });

  test("renders the page header and introduction", () => {
    const wrapper = mountPage();

    expect(wrapper.find(".p-card-title").text()).toBe(
      "Create a Data Store for a Project",
    );
    expect(wrapper.find(".intro-text").text()).toContain("Helpful tooltips");
  });

  test("passes the projectId query parameter to the form", () => {
    routeMock.query = { projectId: "project-1" };

    expect(mountPage().find(".initializer-stub").text()).toBe("project-1");
  });

  test("ignores a projectId query parameter that is not a single string", () => {
    routeMock.query = { projectId: ["a", "b"] };

    expect(mountPage().find(".initializer-stub").text()).toBe("");
  });
});
