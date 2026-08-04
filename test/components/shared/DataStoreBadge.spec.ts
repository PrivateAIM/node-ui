import { mount } from "@vue/test-utils";
import { describe, expect, test } from "vitest";
import DataStoreBadge from "~/components/shared/DataStoreBadge.vue";

describe("DataStoreBadge.vue", () => {
  test("shows a check when the data store is present", () => {
    const wrapper = mount(DataStoreBadge, {
      props: { hasDataStore: true, required: true, projectId: "proj-1" },
    });

    expect(wrapper.find(".pi-check").exists()).toBe(true);
    expect(wrapper.find("button").exists()).toBe(false);
  });

  test("shows an actionable cross when the data store is missing and required", () => {
    const wrapper = mount(DataStoreBadge, {
      props: { hasDataStore: false, required: true, projectId: "proj-1" },
    });

    const button = wrapper.find("button");
    expect(wrapper.find(".pi-times").exists()).toBe(true);
    expect(button.attributes("disabled")).toBeUndefined();
    expect(button.attributes("aria-label")).toContain("create a data store");
  });

  test("disables the cross when a data store is not required", () => {
    const wrapper = mount(DataStoreBadge, {
      props: { hasDataStore: false, required: false, projectId: "proj-1" },
    });

    const button = wrapper.find("button");
    expect(button.attributes("disabled")).toBeDefined();
    expect(button.attributes("aria-label")).toContain("not required");
  });

  test("emits createDataStore with the project id when clicked", async () => {
    const wrapper = mount(DataStoreBadge, {
      props: { hasDataStore: false, required: true, projectId: "proj-1" },
    });

    await wrapper.find("button").trigger("click");

    expect(wrapper.emitted("createDataStore")).toEqual([["proj-1"]]);
  });

  test("emits createDataStore with a null project id when there is none", async () => {
    const wrapper = mount(DataStoreBadge, {
      props: { hasDataStore: false, required: true, projectId: null },
    });

    await wrapper.find("button").trigger("click");

    expect(wrapper.emitted("createDataStore")).toEqual([[null]]);
  });

  test("does not emit when a data store is not required", async () => {
    const wrapper = mount(DataStoreBadge, {
      props: { hasDataStore: false, required: false, projectId: "proj-1" },
    });

    await wrapper.find("button").trigger("click");

    expect(wrapper.emitted("createDataStore")).toBeUndefined();
  });
});
