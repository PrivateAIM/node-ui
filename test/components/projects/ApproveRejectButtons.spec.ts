import { useToast } from "primevue/usetoast";
import { flushPromises, mount } from "@vue/test-utils";
import { vi, describe, it, expect, afterEach, beforeAll } from "vitest";
import ApproveRejectButtons from "~/components/table/ApproveRejectButtons.vue";
import {
  fakeInvalidProposalId,
  fakeValidProposalId,
} from "~/test/mockapi/handlers";

describe("ApproveRejectButtons.vue", () => {
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

  it("Valid project ID", async () => {
    const wrapper = mount(ApproveRejectButtons, {
      props: {
        objectId: fakeValidProposalId,
        objectClass: "project",
      },
    });

    expect(wrapper).toBeTruthy();

    const submitBtn = wrapper.find(".project-approve-btn");
    await submitBtn.trigger("click");

    await flushPromises();

    expect(spy).toHaveBeenCalledTimes(1);
    expect(spy).toHaveBeenCalledWith({
      severity: "info",
      summary: "Submission successful",
      detail: `Approval successfully submitted.`,
      life: 3000,
    });

    expect(wrapper.emitted()).toHaveProperty("updatedRow");
  });

  it("Invalid project ID", async () => {
    const wrapper = mount(ApproveRejectButtons, {
      props: {
        objectId: fakeInvalidProposalId,
        objectClass: "project",
      },
    });

    expect(wrapper).toBeTruthy();

    const submitBtn = wrapper.find(".project-approve-btn");
    await submitBtn.trigger("click");

    await flushPromises();

    expect(spy).toHaveBeenCalledTimes(1);
    expect(spy).toHaveBeenCalledWith({
      severity: "error",
      summary: "Submission failed",
      detail: "There was an error sending your submission.",
      life: 3000,
    });
  });
});
