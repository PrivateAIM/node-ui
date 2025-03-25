import { useToast } from "primevue/usetoast";
import { flushPromises, mount } from "@vue/test-utils";
import { vi, describe, it, expect, beforeEach } from "vitest";
import AnalysisControlButtons from "~/components/analysis/AnalysisControlButtons.vue";
import { AnalysisBuildStatus, AnalysisNodeRunStatus } from "~/services/Api";
import { fakeAnalysisId } from "~/test/mockapi/handlers";

describe("AnalysisControlButtons.vue", () => {
  let mockToast;

  beforeEach(() => {
    mockToast = { add: vi.fn() };
    vi.mocked(useToast).mockReturnValue(mockToast);
  });

  it("Stop analysis with button", async () => {
    const wrapper = mount(AnalysisControlButtons, {
      props: {
        analysisBuildStatus: AnalysisBuildStatus.Finished,
        analysisRunStatus: AnalysisNodeRunStatus.Running,
        analysisNodeId: "8003eefe-e39b-4bd4-aec4-78046c63b39b",
        analysisId: fakeAnalysisId,
        projectId: "7f2f3b59-3b6d-4fb6-a900-2a4d5c2ea483",
        nodeId: "e3b89572-327f-4936-8cf0-fbfbcc6336b7",
      },
    });

    expect(AnalysisControlButtons).toBeTruthy();

    const toggle = wrapper.find(".stop-analysis-btn");
    expect(toggle.attributes("data-p-disabled")).toBe("false");
    await toggle.trigger("click");
    expect(toggle.attributes("data-p-disabled")).toBe("true");

    await flushPromises();

    const spy = vi.spyOn(mockToast, "add");
    expect(spy).toHaveBeenCalledTimes(1);
    expect(spy).toHaveBeenCalledWith({
      severity: "info",
      summary: "Stop success",
      detail: "Successfully stopped the container",
      life: 5000,
    });
  });
});
