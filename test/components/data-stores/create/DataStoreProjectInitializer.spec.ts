import { useToast } from "primevue/usetoast";
import { defineComponent } from "vue";
import { flushPromises, mount } from "@vue/test-utils";
import {
  afterEach,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";
import DataStoreProjectInitializer from "../../../../app/components/data-stores/create/DataStoreProjectInitializer.vue";
import { fakeParsedProjects } from "../constants";
import type { AvailableProject } from "../../../../app/components/data-stores/create/index";
import { DataStoreType } from "../../../../app/services/Api";
import { getProjectNodes } from "~/composables/useAPIFetch";

vi.mock("~/composables/useAPIFetch", () => ({
  getProjectNodes: vi.fn(),
}));

describe("DataStoreProjectInitializer.vue", () => {
  let spy;
  let mockToast;

  let wrapper;

  const DataStoreProjectInitializerTestComponent = defineComponent({
    components: { DataStoreProjectInitializer },
    template: "<Suspense><DataStoreProjectInitializer/></Suspense>",
  });

  beforeAll(() => {
    mockToast = { add: vi.fn() };
    vi.mocked(useToast).mockReturnValue(mockToast);
    spy = vi.spyOn(mockToast, "add");
  });

  beforeEach(async () => {
    vi.mocked(getProjectNodes).mockResolvedValue({
      data: ref(
        fakeParsedProjects.map((p) => ({
          project: { name: p.name },
          project_id: p.id,
        })),
      ),
      pending: ref(false),
      error: ref(undefined),
      status: ref("success"),
      refresh: vi.fn(),
      execute: vi.fn(),
      clear: vi.fn(),
    });

    wrapper = mount(DataStoreProjectInitializerTestComponent, {
      attachTo: document.body,
      global: {
        stubs: {
          teleport: true, // Now dropdowns are included/teleported in root element
        },
      },
    });
    await flushPromises();
    expect(wrapper).toBeTruthy();
  });

  afterEach(() => {
    spy.mockReset();
    wrapper.unmount();
  });

  function innerVm() {
    return wrapper.findComponent(DataStoreProjectInitializer).vm;
  }

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
    const dropDownOptions = fakeParsedProjects.map((item) => item.name);
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

  it("Header content", () => {
    expect(wrapper.text()).toContain("Create a Data Store for a Project");
    expect(wrapper.text()).toContain("Helpful tooltips");
  });

  async function checkDataStoreInit(
    projectDropdown: AvailableProject,
    validConnection: boolean = true,
    toastSeverity: string,
    toastMsg: string,
    toastDetail: string,
    server: string = "whonnock",
    path: string = "/fake/path",
    storeType: DataStoreType = DataStoreType.Fhir,
    port: string = "80",
    protocol: string = "http",
    // methods?: string[],
  ) {
    await wrapper.find(".project-picker").trigger("click"); // open dropdown menu
    expect(wrapper.findAll(".p-select-option").length).toBe(
      fakeParsedProjects.length,
    );
    const listItem = wrapper.find(
      `li[aria-label="${projectDropdown.name}"]`,
    );
    expect(listItem.exists()).toBe(true);
    await listItem.trigger("click");
    // Can't get manually clicking option to work so manually setting it
    // Use the actual availableProjects entry to ensure object identity matches Select options
    const matchingProject = innerVm().availableProjects.find(
      (p: AvailableProject) => p.id === projectDropdown.id,
    );
    innerVm().selectedProject = matchingProject;
    await innerVm().$nextTick();
    expect(wrapper.find(".project-picker span").text()).toBe(
      projectDropdown.name,
    );

    // Set server name
    const serverWrapper = wrapper.find(".data-store-server-input");
    await serverWrapper.find('input[type="text"]').setValue(server);
    expect(serverWrapper.find(".p-inputtext").attributes("value")).toBe(server);

    // Set data path
    const pathWrapper = wrapper.find(".data-store-path-input-fhir");
    await pathWrapper.find('input[type="text"]').setValue(path);
    expect(pathWrapper.find(".p-inputtext").attributes("value")).toBe(path);

    // Set data store type
    innerVm().selectedDataStoreType = storeType;
    await innerVm().$nextTick();
    expect(
      wrapper.find(".data-store-type-input span").text().toLowerCase(),
    ).toBe(storeType);

    // Set port
    const portWrapper = wrapper.find(".data-store-port-input");
    await portWrapper.find('input[type="text"]').setValue(port);
    expect(portWrapper.find(".p-inputtext").attributes("value")).toBe(port);

    // Set protocol
    await wrapper.find(".communication-protocol-picker").trigger("click"); // open dropdown menu
    await wrapper.find(`li[aria-label="${protocol}"]`).trigger("click"); // select first option

    // TODO: Make methods

    const submit = wrapper.find(".create-data-store-btn");
    await submit.trigger("click");

    await flushPromises();

    const connectionMessage = wrapper.find(".data-store-connection-test-text");
    const expectedConnMsg = validConnection
      ? "Connection validated!"
      : "Invalid connection!";
    expect(connectionMessage.exists()).toBe(true);
    expect(connectionMessage.text()).toBe(expectedConnMsg);

    expect(spy).toHaveBeenCalledTimes(1);
    expect(spy).toHaveBeenCalledWith({
      severity: toastSeverity,
      summary: toastMsg,
      detail: toastDetail,
      life: 5000,
    });
  }

  it("Create a valid data store", async () => {
    await checkDataStoreInit(
      fakeParsedProjects[0]!,
      true,
      "success",
      "Registration success",
      "The data store and project were successfully registered, returning to the analyses page...",
    );
  });

  it("Try to create a duplicate data store", async () => {
    await checkDataStoreInit(
      fakeParsedProjects[1]!, // pseudo-duplicate
      false,
      "error",
      "Registration failure",
      "An error occurred while trying to register the data store",
    );
  });

  it("Invoke an error", async () => {
    await checkDataStoreInit(
      fakeParsedProjects[0]!, // pseudo-duplicate
      false,
      "error",
      "Registration failure",
      "An error occurred while trying to register the data store",
      "void",
    );
  });

  it("Check S3 fields", async () => {
    expect(
      wrapper.findComponent(".bucket-access-policy-radio").exists(),
    ).toBeFalsy(); // Starts on FHIR so should not be in view
    const select = wrapper.findComponent(".data-store-type-picker");
    await select.vm.$emit("update:modelValue", DataStoreType.S3); // Simulate the S3 option being clicked
    await innerVm().$nextTick();
    expect(wrapper.find(".bucket-access-policy-radio").exists()).toBe(true); // Check radio options exist now

    expect(
      wrapper.findComponent(".data-store-path-input-s3-private").exists(),
    ).toBeTruthy();

    innerVm().selectedBucketAccessPolicy = "Public"; // Simulate public being selected
    await innerVm().$nextTick();
    expect(
      wrapper.findComponent(".data-store-path-input-s3-private").exists(),
    ).toBeFalsy();
  });
});
