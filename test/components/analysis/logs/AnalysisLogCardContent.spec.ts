import { defineComponent, h } from "vue";
import { mount } from "@vue/test-utils";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import { fakeLogs } from "../constants";
import AnalysisLogCardContent from "~/components/analysis/logs/AnalysisLogCardContent.vue";
import { useToast } from "primevue/usetoast";
import Button from "primevue/button";
import type { FlatLogLine } from "~/types/logs";

// Stub VirtualScroller to render all items in tests (no DOM dimensions needed)
const VirtualScrollerStub = defineComponent({
  name: "VirtualScroller",
  props: { items: Array },
  setup(props, { slots }) {
    return () =>
      h(
        "div",
        (props.items ?? []).map((item) =>
          slots.item ? slots.item({ item }) : null,
        ),
      );
  },
});

const fakeFlatLines: FlatLogLine[] = [
  {
    content: fakeLogs,
    level: undefined,
    timestamp: "2025-01-01T00:00:00Z",
    isStacktrace: false,
  },
];

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
      props: { nginxLines: fakeFlatLines, analysisLines: fakeFlatLines },
      global: {
        stubs: { VirtualScroller: VirtualScrollerStub },
      },
    });
    expect(wrapper.text()).toContain("Starting FlameCoreSDK");

    const logBtns = wrapper.findAll(".log-btn");
    expect(logBtns.length).toBe(4); // 2 download btns + 2 copy btns
  });

  test("Report no logs found", () => {
    const wrapper = mount(AnalysisLogCardContent, {
      props: { nginxLines: [], analysisLines: [] },
    });
    expect(wrapper.text()).toContain("No logs found");

    const logBtns = wrapper.findAll(".log-btn");
    expect(logBtns.length).toBe(0); // No buttons displayed when no logs present
  });

  test("Download the logs", async () => {
    const wrapper = mount(AnalysisLogCardContent, {
      props: { nginxLines: fakeFlatLines, analysisLines: fakeFlatLines },
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
      props: { nginxLines: fakeFlatLines, analysisLines: fakeFlatLines },
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

  describe("scroll load-older trigger", () => {
    function makeScrollEvent(scrollTop: number, clientHeight: number, scrollHeight: number): Event {
      const el = document.createElement("div");
      Object.defineProperty(el, "scrollTop", { value: scrollTop, configurable: true });
      Object.defineProperty(el, "clientHeight", { value: clientHeight, configurable: true });
      Object.defineProperty(el, "scrollHeight", { value: scrollHeight, configurable: true });
      const event = new Event("scroll");
      Object.defineProperty(event, "target", { value: el, configurable: true });
      return event;
    }

    test("onNginxScroll calls onLoadOlderNginx when near top with nginxHasOlder=true and nginxLoading=false", async () => {
      const onLoadOlderNginx = vi.fn().mockResolvedValue(undefined);
      const wrapper = mount(AnalysisLogCardContent, {
        props: {
          nginxLines: fakeFlatLines,
          analysisLines: fakeFlatLines,
          nginxHasOlder: true,
          nginxLoading: false,
          onLoadOlderNginx,
        },
        global: {
          stubs: { VirtualScroller: VirtualScrollerStub },
        },
      });

      // Scrolled to near top: scrollTop=30 <= 50 ✓
      const event = makeScrollEvent(30, 100, 1000);
      (wrapper.vm as unknown as Record<string, (e: Event) => void>).onNginxScroll(event);
      await wrapper.vm.$nextTick();

      expect(onLoadOlderNginx).toHaveBeenCalledOnce();
    });

    test("onNginxScroll does NOT call onLoadOlderNginx when scrolled to bottom, even if nginxHasOlder=true", () => {
      const onLoadOlderNginx = vi.fn().mockResolvedValue(undefined);
      const wrapper = mount(AnalysisLogCardContent, {
        props: {
          nginxLines: fakeFlatLines,
          analysisLines: fakeFlatLines,
          nginxHasOlder: true,
          nginxLoading: false,
          onLoadOlderNginx,
        },
        global: {
          stubs: { VirtualScroller: VirtualScrollerStub },
        },
      });

      // Scrolled to bottom: scrollTop=900, well past the 50px threshold ✗
      const event = makeScrollEvent(900, 100, 1000);
      (wrapper.vm as unknown as Record<string, (e: Event) => void>).onNginxScroll(event);

      expect(onLoadOlderNginx).not.toHaveBeenCalled();
    });
  });
});
