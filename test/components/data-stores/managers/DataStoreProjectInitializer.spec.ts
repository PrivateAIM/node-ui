import { nextTick } from "vue";
import { useToast } from "primevue/usetoast";
import { mount } from "@vue/test-utils";
import { vi, describe, it, expect, afterEach, beforeAll } from "vitest";
import DataStoreProjectInitializer from "~/components/data-stores/managers/DataStoreProjectInitializer.vue";
import { fakeParsedProjects } from "~/test/components/data-stores/constants";

describe("DataStoreProjectInitializer.vue", () => {
  let spy;
  let mockToast;

  beforeAll(() => {
    mockToast = { add: vi.fn() };
    vi.mocked(useToast).mockReturnValue(mockToast);
    spy = vi.spyOn(mockToast, "add");
  });

  afterEach(() => {
    spy.mockReset();
  });

  async function checkDropdown(className: string, listItems: string[]) {
    const wrapper = mount(DataStoreProjectInitializer, {
      props: {
        projects: fakeParsedProjects,
      },
    });

    expect(wrapper).toBeTruthy();

    const dropdown = wrapper.find(className);
    expect(dropdown.find(".p-select-label").attributes("aria-expanded")).toBe(
      "false",
    );
    await dropdown.trigger("click");
    expect(dropdown.find(".p-select-label").attributes("aria-expanded")).toBe(
      "true",
    );

    await nextTick();

    // Rendered outside root components so need document body
    const items = document.querySelectorAll(".p-select-option");
    expect(items).toHaveLength(listItems.length);
    items.forEach((item) => {
      expect(item.textContent).toBeOneOf(listItems);
    });

    wrapper.unmount();
  }

  it("Create Data Store - Header", () => {
    const wrapper = mount(DataStoreProjectInitializer);
    expect(wrapper).toBeTruthy();
    expect(wrapper.text()).toContain("Create a Data Store for a Project");
    expect(wrapper.text()).toContain("Helpful tooltips");
  });

  it("Check data store project dropdown options", () => {
    const dropDownOptions = fakeParsedProjects.map((item) => item.dropdown);
    checkDropdown(".project-picker", dropDownOptions);
  });

  it("Check data store type dropdown options", () => {
    checkDropdown(".data-store-type-picker", ["FHIR", "S3"]);
  });

  it("Check data store communication protocol dropdown options", () => {
    const acceptedProtocols = [
      "grpc",
      "grpcs",
      "http",
      "https",
      "tcp",
      "tls",
      "tls_passthrough",
      "ws",
      "wss",
    ];
    checkDropdown(".communication-protocol-picker", acceptedProtocols);
  });

  // TODO: Fix for MultiSelect component
  // it("Check data store request method dropdown options", () => {
  //   const availableMethods = ["GET", "POST", "PUT", "DELETE"];
  //   checkDropdown(".methods-picker", availableMethods);
  // });
});
