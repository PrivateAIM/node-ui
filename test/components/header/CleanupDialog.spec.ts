import { useToast } from "primevue/usetoast";
import { flushPromises, mount } from "@vue/test-utils";
import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";
import CleanupDialog from "~/components/header/CleanupDialog.vue";

describe("CleanupDialog.vue", () => {
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

  async function checkCleanupEndpoint(ariaLabel: string) {
    const wrapper = mount(CleanupDialog, {
      global: {
        stubs: {
          teleport: true, // Now dropdowns are included/teleported in root element
        },
      },
    });
    expect(wrapper).toBeTruthy();

    // @ts-expect-error Linted can't interpret valid refVars
    wrapper.vm.cleanupVisible = true;
    await wrapper.vm.$nextTick();

    const cleanupBox = wrapper.find(".cleanup-dialog");
    const submitButton = wrapper.find(".cleanup-submit-btn");

    // Should be disabled until option clicked
    expect(submitButton.attributes("data-p-disabled")).toBe("true");

    const option = cleanupBox.find(`[aria-label="${ariaLabel}"]`);

    await option.trigger("click");
    expect(submitButton.attributes("data-p-disabled")).toBe("false");
    expect(option.attributes("aria-selected")).toBe("true");

    await submitButton.trigger("click");
    await flushPromises();

    expect(spy).toHaveBeenCalledTimes(1);

    if (ariaLabel === "Result Service") {
      // Test error
      expect(spy).toHaveBeenCalledWith({
        severity: "error",
        summary: "Unable to perform cleanup",
        detail: "There was an error while deleting or restarting the resource.",
        life: 5000,
      });
    } else {
      expect(spy).toHaveBeenCalledWith({
        severity: "info",
        summary: "Cleanup Started",
        detail: "Cleanup request successfully submitted",
        life: 5000,
      });
    }
    spy.mockReset(); // Reset the toast counter
  }

  it("Test cleanup response", async () => {
    const listboxAriaLabels: string[] = [
      "All services and analyzes",
      "Analyzes",
      "Services",
      "Message Broker",
      "Result Service", // Should result in error
    ];
    for (const ariaLabel of listboxAriaLabels) {
      await checkCleanupEndpoint(ariaLabel);
    }
  });

  it("Close cleanup", async () => {
    const wrapper = mount(CleanupDialog, {
      global: {
        stubs: {
          teleport: true, // Now dropdowns are included/teleported in root element
          transition: true,
        },
      },
    });
    expect(wrapper).toBeTruthy();

    // @ts-expect-error Linted can't interpret valid refVars
    wrapper.vm.cleanupVisible = true;
    await wrapper.vm.$nextTick();

    const cleanupBox = wrapper.find(".cleanup-dialog");
    expect(cleanupBox.exists()).toBeTruthy();

    const cancelBtn = wrapper.find(".cleanup-cancel-btn");
    await cancelBtn.trigger("click");
    await wrapper.vm.$nextTick(); // add this

    const cleanupBoxAfter = wrapper.find(".cleanup-dialog");
    expect(cleanupBoxAfter.exists()).toBeFalsy();
  });
});
