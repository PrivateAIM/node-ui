import { useToast } from "primevue/usetoast";
import { flushPromises, mount } from "@vue/test-utils";
import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";
import AnalysisUpdateButton from "~/components/analysis/AnalysisUpdateButton.vue";
import {
  fakeAnalysisId,
  fakeBrokenAnalysisId,
  fakeMissingAnalysisId,
} from "~/test/mockapi/handlers";

describe("AnalysisUpdateButton.vue", () => {
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

  async function basicButtonCheck(
    toastSeverity: string,
    toastSummary: string,
    toastMsg: string,
    toastDuration: number,
    analysisId: string,
  ) {
    const wrapper = mount(AnalysisUpdateButton, {
      props: {
        analysisId: analysisId,
      },
    });

    expect(AnalysisUpdateButton).toBeTruthy();

    // Success check
    const toggle = wrapper.find(".update-analysis-btn");
    await toggle.trigger("click");

    await flushPromises();

    expect(spy).toHaveBeenCalledWith({
      severity: toastSeverity,
      summary: toastSummary,
      detail: toastMsg,
      life: toastDuration,
    });
    return wrapper;
  }

  it("Update analysis status - some running", async () => {
    const wrapper = await basicButtonCheck(
      "info",
      "Analysis status successfully update",
      "The current status of the analysis container was successfully updated.",
      5000,
      fakeAnalysisId,
    );
    expect(wrapper.emitted("updateAnalysisRun")).toHaveLength(1);
    expect(wrapper.emitted("updateAnalysisRun")![0]).toEqual([
      "executing",
      null,
    ]);
  });

  it("Update analysis status - none running", async () => {
    const wrapper = await basicButtonCheck(
      "warn",
      "No analysis pod found",
      "There are no running pods for this analysis on this node, the run status shown is the last reported update to the hub.",
      8000,
      fakeMissingAnalysisId,
    );
    expect(wrapper.emitted("updateAnalysisRun")).toBeFalsy();
  });

  it("Update analysis status - broken", async () => {
    await basicButtonCheck(
      "error",
      "Unable to get a status update",
      "An error occurred while trying to contact the PO for a status update. Try again later.",
      5000,
      fakeBrokenAnalysisId,
    );
  });
});
