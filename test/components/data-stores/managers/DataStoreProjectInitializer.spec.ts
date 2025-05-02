import { useToast } from "primevue/usetoast";
import { mount, flushPromises } from "@vue/test-utils";
import {
  vi,
  describe,
  it,
  expect,
  afterEach,
  beforeAll,
  beforeEach,
} from "vitest";
import DataStoreProjectInitializer from "~/components/data-stores/managers/DataStoreProjectInitializer.vue";
import { fakeParsedProjects } from "~/test/components/data-stores/constants";

describe("DataStoreProjectInitializer.vue", () => {
  let spy;
  let mockToast;

  let wrapper;

  beforeAll(() => {
    mockToast = { add: vi.fn() };
    vi.mocked(useToast).mockReturnValue(mockToast);
    spy = vi.spyOn(mockToast, "add");
  });

  beforeEach(async () => {
    wrapper = mount(DataStoreProjectInitializer, {
      attachTo: document.body,
      props: {
        projects: fakeParsedProjects,
      },
      global: {
        stubs: {
          teleport: true, // Now dropdowns are included/teleported in root element
        },
      },
    });
    expect(wrapper).toBeTruthy();
  });

  afterEach(() => {
    spy.mockReset();
    wrapper.unmount();
  });

  async function checkDropdown(
    className: string,
    listItems: string[],
    placeholder?: string,
  ) {
    const dropdown = wrapper.find(className);
    expect(dropdown.find(".p-select-label").attributes("aria-expanded")).toBe(
      "false",
    );
    await dropdown.trigger("click");
    expect(dropdown.find(".p-select-label").attributes("aria-expanded")).toBe(
      "true",
    );
    expect(wrapper.find(".p-select-option").exists()).toBe(true);
    if (placeholder) {
      expect(wrapper.find(".p-select-label").text()).toBe(placeholder);
    }

    // Rendered outside root components so need document body
    const items = wrapper.findAll(".p-select-option");
    expect(items).toHaveLength(listItems.length);
    items.forEach((item) => {
      expect(item.text()).toBeOneOf(listItems);
    });
  }

  it("Create Data Store - Header", () => {
    expect(wrapper).toBeTruthy();
    expect(wrapper.text()).toContain("Create a Data Store for a Project");
    expect(wrapper.text()).toContain("Helpful tooltips");
  });

  it("Check data store project dropdown options", () => {
    const dropDownOptions = fakeParsedProjects.map((item) => item.dropdown);
    checkDropdown(".project-picker", dropDownOptions, "Select a Project");
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

  it("Header content", () => {
    expect(wrapper.text()).toContain("Create a Data Store for a Project");
    expect(wrapper.text()).toContain("Helpful tooltips");
  });

  async function checkDataStoreInit(
    projectDropdown: string,
    toastSeverity: string,
    toastMsg: string,
    toastDetail: string,
    server: string = "whonnock",
    path: string = "/fake/path",
    storeType: string = "FHIR",
    port?: string,
    protocol: string = "http",
    // methods?: string[],
  ) {
    await wrapper.find(".project-picker").trigger("click"); // open dropdown menu
    expect(wrapper.findAll(".p-select-option").length).toBe(
      fakeParsedProjects.length,
    );
    const listItem = wrapper.find(`li[aria-label="${projectDropdown}"]`);
    expect(listItem).toBeTruthy();
    await listItem.trigger("click");
    // expect(wrapper.find(".project-picker span").text()).toBe(projectDropdown);

    // Set server name
    const serverWrapper = wrapper.find(".data-store-server-input");
    await serverWrapper.find('input[type="text"]').setValue(server);
    expect(serverWrapper.find(".p-inputtext").attributes("value")).toBe(server);

    // Set data path
    const pathWrapper = wrapper.find(".data-store-path-input");
    await pathWrapper.find('input[type="text"]').setValue(path);
    expect(pathWrapper.find(".p-inputtext").attributes("value")).toBe(path);

    // Set data store type
    await wrapper.find(".data-store-type-picker").trigger("click"); // open dropdown menu
    await wrapper.find(`li[aria-label="${storeType}"]`).trigger("click"); // select first option
    // expect(wrapper.find(".data-store-type-input span").text()).toBe(storeType);

    // TODO: make port

    // Set protocol
    await wrapper.find(".communication-protocol-picker").trigger("click"); // open dropdown menu
    await wrapper.find(`li[aria-label="${protocol}"]`).trigger("click"); // select first option
    // expect(wrapper.find(".communication-protocol-picker span").text()).toBe(
    //   protocol,
    // );

    // TODO: Make methods

    const submit = wrapper.find(".create-data-store-btn");
    await submit.trigger("click");

    await flushPromises();

    // expect(spy).toHaveBeenCalledTimes(1);
    // expect(spy).toHaveBeenCalledWith({
    //   severity: toastSeverity,
    //   summary: toastMsg,
    //   detail: toastDetail,
    //   life: 5000,
    // });
  }

  it("Create a valid data store", async () => {
    await checkDataStoreInit(
      fakeParsedProjects[0].dropdown,
      "info",
      "Creation success",
      "The data store and project were successfully registered",
    );
  });

  it("Try to create a duplicate data store", async () => {
    await checkDataStoreInit(
      fakeParsedProjects[1].dropdown, // pseudo-duplicate
      "error",
      "Duplicate entry error",
      "A data store for this project already exists!",
    );
  });

  it("Invoke an error", async () => {
    await checkDataStoreInit(
      fakeParsedProjects[0].dropdown, // pseudo-duplicate
      "error",
      "Creation failure",
      "An error occurred while trying to register the data store or project",
      "whonnock",
      "fake/path",
      "S3", // Triggers an error (only during testing)
    );
  });
});
