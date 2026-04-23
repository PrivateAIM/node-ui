import { mount } from "@vue/test-utils";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import { fakeLogs, fakePodLogs } from "../constants";
import AnalysisLogCardContent from "~/components/analysis/logs/AnalysisLogCardContent.vue";
import { useToast } from "primevue/usetoast";
import Button from "primevue/button";

describe("AnalysisLogCardContent.vue", () => {
  let mockToast;

  beforeEach(() => {
    mockToast = { add: vi.fn() };
    vi.mocked(useToast).mockReturnValue(mockToast);

    // Mock DOM methods
    global.URL.createObjectURL = vi.fn(() => "blob:url");
    global.URL.revokeObjectURL = vi.fn();

    // Mock DOM methods
    document.body.appendChild = vi.fn();
    document.body.removeChild = vi.fn();

    // Mock clipboard
    Object.defineProperty(global.navigator, "clipboard", {
      value: {
        writeText: vi.fn(),
      },
      writable: true,
      configurable: true,
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  test("Render the logs", () => {
    const wrapper = mount(AnalysisLogCardContent, {
      props: { nginxLogs: fakePodLogs, analysisLogs: fakePodLogs },
    });
    expect(wrapper.text()).toContain("Starting FlameCoreSDK");

    const logBtns = wrapper.findAll(".log-btn");
    expect(logBtns.length).toBe(4); // 2 download btns + 2 copy btns
  });

  test("Report no logs found", () => {
    const wrapper = mount(AnalysisLogCardContent, {});
    expect(wrapper.text()).toContain("No logs found");

    const logBtns = wrapper.findAll(".log-btn");
    expect(logBtns.length).toBe(0); // No buttons displayed when no logs present
  });

  test("Download the logs", async () => {
    const wrapper = mount(AnalysisLogCardContent, {
      props: { nginxLogs: fakePodLogs, analysisLogs: fakePodLogs },
      global: {
        stubs: {
          Toast: true, // prevent PrimeVue Toast from mounting a portal
        },
      },
    });

    const mockLink = {
      href: "",
      download: "",
      click: vi.fn(),
    };
    // @ts-expect-error faking an HTMLElement
    vi.spyOn(document, "createElement").mockReturnValue(mockLink);

    const downloadButtons = wrapper
      .findAllComponents(Button)
      .filter((btn) => btn.props("icon") === "pi pi-download");

    await downloadButtons[0].trigger("click");

    expect(global.URL.createObjectURL).toHaveBeenCalled();
    expect(document.createElement).toHaveBeenCalledWith("a");
    expect(global.URL.revokeObjectURL).toHaveBeenCalled();
    expect(mockLink.download).toMatch(/^nginx-logs-\d+$/); // log download file name
  });

  test("Copy the logs", async () => {
    const wrapper = mount(AnalysisLogCardContent, {
      props: { nginxLogs: fakePodLogs, analysisLogs: fakePodLogs },
      global: {
        stubs: {
          Toast: true, // prevent PrimeVue Toast from mounting a portal
        },
      },
    });

    const copyButtons = wrapper
      .findAllComponents(Button)
      .filter((btn) => btn.props("icon") === "pi pi-copy");
    await copyButtons[0].trigger("click");

    expect(global.navigator.clipboard.writeText).toHaveBeenCalledWith(fakeLogs);

    // Wait a tick to let the "copied" state update
    await wrapper.vm.$nextTick();
    expect(mockToast.add).toHaveBeenCalledWith({
      severity: "contrast",
      summary: "Copied to clipboard!",
      life: 3000,
      group: "copiedLogs",
    });
  });
});
