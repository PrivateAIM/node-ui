import { useToast } from "primevue/usetoast";
import { useConfirm } from "primevue/useconfirm";
import { flushPromises, mount } from "@vue/test-utils";
import { beforeEach, describe, expect, it, vi } from "vitest";
import ApproveRejectToggle from "~/components/table/ApproveRejectToggle.vue";
import { ApprovalStatus } from "~/types/node";
import {
  fakeInvalidProposalId,
  fakeValidProposalId,
} from "@/test/mockapi/handlers";

// Stubbed ToggleSwitch so we can drive the `@click` handler deterministically.
// It exposes the bound model value via `data-checked` and intentionally does
// NOT emit `update:modelValue` on click, so `checked` only changes via the
// component's own reset logic.
const ToggleSwitchStub = {
  props: ["modelValue"],
  emits: ["update:modelValue"],
  template: '<button :data-checked="String(modelValue)" />',
};

function mountToggle(props: Record<string, unknown>) {
  return mount(ApproveRejectToggle, {
    props,
    global: {
      stubs: { ToggleSwitch: ToggleSwitchStub },
    },
  });
}

describe("ApproveRejectToggle.vue", () => {
  const confirmRequire = vi.fn();
  let mockToast: { add: ReturnType<typeof vi.fn> };
  let toastSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    confirmRequire.mockReset();
    mockToast = { add: vi.fn() };
    toastSpy = vi.spyOn(mockToast, "add");
    vi.mocked(useToast).mockReturnValue(mockToast);
    vi.mocked(useConfirm).mockReturnValue({
      require: confirmRequire,
    } as unknown as ReturnType<typeof useConfirm>);
  });

  it("dims the approved tag when the proposal is not approved", () => {
    const wrapper = mountToggle({
      objectClass: "project",
      currentStatus: ApprovalStatus.Rejected,
    });

    expect(wrapper.find(".approval-tag-approved").classes()).toContain(
      "dimmed",
    );
    expect(wrapper.find(".approval-tag-rejected").classes()).not.toContain(
      "dimmed",
    );
  });

  it("dims the rejected tag when the proposal is approved", () => {
    const wrapper = mountToggle({
      objectClass: "project",
      currentStatus: ApprovalStatus.Approved,
    });

    expect(wrapper.find(".approval-tag-rejected").classes()).toContain(
      "dimmed",
    );
    expect(wrapper.find(".approval-tag-approved").classes()).not.toContain(
      "dimmed",
    );
  });

  it("requests approval confirmation and submits when accepted", async () => {
    const wrapper = mountToggle({
      objectId: fakeValidProposalId,
      objectClass: "project",
      currentStatus: ApprovalStatus.Rejected,
    });

    await wrapper.find(".approval-toggle-switch").trigger("click");

    expect(confirmRequire).toHaveBeenCalledTimes(1);
    const options = confirmRequire.mock.calls[0][0];
    expect(options.header).toBe("Approval Confirmation");
    expect(options.message).toContain("approve");

    // Simulate the user confirming the dialog
    options.accept();
    await flushPromises();

    expect(toastSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        severity: "info",
        summary: "Submission successful",
        detail: "Approval successfully submitted.",
      }),
    );
    expect(wrapper.emitted()).toHaveProperty("updatedRow");
  });

  it("requests rejection confirmation and submits when accepted", async () => {
    const wrapper = mountToggle({
      objectId: fakeValidProposalId,
      objectClass: "project",
      currentStatus: ApprovalStatus.Approved,
    });

    await wrapper.find(".approval-toggle-switch").trigger("click");

    expect(confirmRequire).toHaveBeenCalledTimes(1);
    const options = confirmRequire.mock.calls[0][0];
    expect(options.header).toBe("Rejection Confirmation");
    expect(options.message).toContain("reject");

    options.accept();
    await flushPromises();

    expect(toastSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        severity: "info",
        summary: "Submission successful",
        detail: "Rejection successfully submitted.",
      }),
    );
    expect(wrapper.emitted()).toHaveProperty("updatedRow");
  });

  it("does not submit when the confirmation is cancelled", async () => {
    const wrapper = mountToggle({
      objectId: fakeValidProposalId,
      objectClass: "project",
      currentStatus: ApprovalStatus.Rejected,
    });

    await wrapper.find(".approval-toggle-switch").trigger("click");

    expect(confirmRequire).toHaveBeenCalledTimes(1);
    const options = confirmRequire.mock.calls[0][0];

    // Simulate the user cancelling the dialog
    options.reject();
    await flushPromises();

    expect(toastSpy).not.toHaveBeenCalled();
    expect(wrapper.emitted()).not.toHaveProperty("updatedRow");
  });

  it("shows a failure toast and does not emit when the API response is invalid", async () => {
    const wrapper = mountToggle({
      objectId: fakeInvalidProposalId,
      objectClass: "project",
      currentStatus: ApprovalStatus.Rejected,
    });

    await wrapper.find(".approval-toggle-switch").trigger("click");

    const options = confirmRequire.mock.calls[0][0];
    options.accept();
    await flushPromises();

    expect(toastSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        severity: "error",
        summary: "Submission failed",
        detail: "There was an error sending your submission.",
      }),
    );
    expect(wrapper.emitted()).not.toHaveProperty("updatedRow");
  });
});
