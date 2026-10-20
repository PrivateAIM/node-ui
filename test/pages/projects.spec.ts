import { mount } from "@vue/test-utils";
import { describe, expect, test } from "vitest";
import ProjectsPage from "~/pages/projects.vue";

describe("pages/projects.vue", () => {
  test("renders the page header around the projects table", () => {
    const wrapper = mount(ProjectsPage, {
      global: {
        stubs: {
          ProjectsTable: {
            name: "ProjectsTable",
            template: "<div class='projects-table-stub' />",
          },
        },
      },
    });

    expect(wrapper.find(".p-card-title").text()).toBe("Projects");
    expect(wrapper.find(".project-description").text()).toContain(
      "The Projects overview gives a quick summary",
    );
    expect(wrapper.find(".projects-table-stub").exists()).toBe(true);
  });
});
