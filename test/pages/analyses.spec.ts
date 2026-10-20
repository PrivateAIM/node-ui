import { mount } from "@vue/test-utils";
import { describe, expect, test } from "vitest";
import AnalysesPage from "~/pages/analyses/index.vue";

const AnalysesTableStub = {
  name: "AnalysesTable",
  template:
    "<div class='analyses-table-stub'><slot name='description' /></div>",
};

describe("pages/analyses/index.vue", () => {
  test("renders the page header around the analyses table", () => {
    const wrapper = mount(AnalysesPage, {
      global: { stubs: { AnalysesTable: AnalysesTableStub } },
    });

    expect(wrapper.find(".p-card-title").text()).toBe("Analyses");
    expect(wrapper.find(".analyses-table-stub").text()).toContain(
      "This table provides an overview of the analyses",
    );
  });
});
