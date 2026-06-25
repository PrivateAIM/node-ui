import { useToast } from "primevue/usetoast";
import { flushPromises, mount, VueWrapper } from "@vue/test-utils";
import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";
import AnalysisControlButtons from "~/components/analysis/AnalysisControlButtons.vue";
import {
  fakeAnalysisId,
  fakeBrokenAnalysisId,
  fakeInvalidRoleAnalysisId,
  fakeMissingAnalysisId,
} from "@/test/mockapi/handlers";
import { PodStatus } from "~/services/Api";
import { ProcessStatus } from "~/types/analysis";

interface ButtonStates {
  playActive: boolean;
  rerunActive: boolean;
  stopActive: boolean;
  deleteActive: boolean;
  logsActive: boolean;
}

function isButtonVisible(wrapper: VueWrapper, selector: string): boolean {
  const btn = wrapper.find(selector);
  if (!btn.exists()) return false;

  const style = btn.attributes("style");
  return !style || !style.includes("display: none");
}

// The logs button is wrapped in a NuxtLink that carries the v-show, so the
// `display: none` lands on the anchor rather than the button itself.
function isLogsBtnVisible(wrapper: VueWrapper): boolean {
  const btn = wrapper.find(".logs-analysis-btn");
  if (!btn.exists()) return false;

  const anchor = btn.element.closest("a");
  const style = anchor?.getAttribute("style");
  return !style || !style.includes("display: none");
}

describe("AnalysisControlButtons.vue", () => {
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
    className: string,
    toastSeverity: string,
    toastSummary: string,
    toastMsg: string,
    analysisId: string,
    expectedButtonStates: ButtonStates,
    initialExecutionStatus: string = PodStatus.Executing,
    expectedFinalStatus: string = "",
    expectedToastCalls: number = 1,
  ) {
    const wrapper = mount(AnalysisControlButtons, {
      props: {
        analysisBuildStatus: ProcessStatus.Executed,
        analysisExecutionStatus: initialExecutionStatus,
        analysisNodeId: "8003eefe-e39b-4bd4-aec4-78046c63b39b",
        analysisDistributionStatus: ProcessStatus.Executed,
        analysisId: analysisId,
        approvalStatus: "approved",
        projectId: "7f2f3b59-3b6d-4fb6-a900-2a4d5c2ea483",
        nodeId: "e3b89572-327f-4936-8cf0-fbfbcc6336b7",
        datastore: true,
        requireDatastore: true,
      },
    });

    expect(AnalysisControlButtons).toBeTruthy();

    // Success check
    const toggle = wrapper.find(className);
    expect(toggle.attributes("data-p-disabled")).toBe("false");
    await toggle.trigger("click");

    await flushPromises();

    if (expectedToastCalls > 0) {
      expect(spy).toHaveBeenCalledTimes(expectedToastCalls);
      expect(spy).toHaveBeenCalledWith({
        severity: toastSeverity,
        summary: toastSummary,
        detail: toastMsg,
        life: 5000,
      });
    }

    await wrapper.setProps({ analysisExecutionStatus: expectedFinalStatus });

    // @ts-expect-error Linted can't interpret valid refVars
    expect(wrapper.vm.buttonStatuses).toEqual(expectedButtonStates);

    return wrapper;
  }

  it("Start analysis button - working", async () => {
    const wrapper = await basicButtonCheck(
      ".start-analysis-btn",
      "success",
      "Start success",
      "Successfully started the container",
      fakeAnalysisId,
      {
        playActive: false,
        rerunActive: false,
        stopActive: true,
        deleteActive: true,
        logsActive: false,
      },
      "",
      PodStatus.Started,
    );

    // Once running, the start/rerun buttons are inactive and hidden; only the
    // stop and delete buttons remain visible
    expect(isButtonVisible(wrapper, ".start-analysis-btn")).toBe(false);
    expect(isButtonVisible(wrapper, ".rerun-analysis-btn")).toBe(false);
    expect(isButtonVisible(wrapper, ".stop-analysis-btn")).toBe(true);
    expect(isButtonVisible(wrapper, ".delete-analysis-btn")).toBe(true);
  });

  it("Start analysis button - PO broken", async () => {
    await basicButtonCheck(
      ".start-analysis-btn",
      "error",
      "Start failure",
      "Failed to start the analysis",
      fakeBrokenAnalysisId,
      {
        playActive: true,
        rerunActive: false,
        stopActive: false,
        deleteActive: false,
        logsActive: false,
      },
      "",
      "",
    );
  });

  it("Start analysis button - Missing data store", async () => {
    const wrapper = await basicButtonCheck(
      ".start-analysis-btn",
      "error",
      "Start failure",
      "Failed to start the analysis",
      fakeMissingAnalysisId,
      {
        playActive: true,
        rerunActive: false,
        stopActive: false,
        deleteActive: false,
        logsActive: false,
      },
      "",
      "",
      0,
    );
    expect(wrapper.emitted().missingDataStore).toBeTruthy();
  });

  it("Stop analysis button - working", async () => {
    await basicButtonCheck(
      ".stop-analysis-btn",
      "success",
      "Stop success",
      "Successfully stopped the container",
      fakeAnalysisId,
      {
        playActive: false,
        rerunActive: true,
        stopActive: false,
        deleteActive: true,
        logsActive: true,
      },
      PodStatus.Executing,
      PodStatus.Stopped,
    );
  });

  it("Stop analysis button - missing", async () => {
    await basicButtonCheck(
      ".stop-analysis-btn",
      "warn",
      "Status unknown",
      "Pod was not found, but the command was still issued",
      fakeMissingAnalysisId,
      {
        playActive: false,
        rerunActive: true,
        stopActive: false,
        deleteActive: true,
        logsActive: true,
      },
      PodStatus.Executing,
      PodStatus.Stopped,
    );
  });

  it("Stop analysis button - PO broken", async () => {
    await basicButtonCheck(
      ".stop-analysis-btn",
      "error",
      "Stop failure",
      "Failed to stop the analysis container",
      fakeBrokenAnalysisId,
      {
        playActive: false,
        rerunActive: false,
        stopActive: true,
        deleteActive: true,
        logsActive: true,
      },
      PodStatus.Executing,
      PodStatus.Executing,
    );
  });

  it("Delete analysis button - working", async () => {
    await basicButtonCheck(
      ".delete-analysis-btn",
      "success",
      "Delete success",
      "Successfully removed the container",
      fakeAnalysisId,
      {
        playActive: true,
        rerunActive: false,
        stopActive: false,
        deleteActive: false,
        logsActive: false,
      },
      PodStatus.Executing,
      "",
    );
  });

  it("Delete analysis button - missing", async () => {
    await basicButtonCheck(
      ".delete-analysis-btn",
      "warn",
      "Status unknown",
      "Pod was not found, but the command was still issued",
      fakeMissingAnalysisId,
      {
        playActive: true,
        rerunActive: false,
        stopActive: false,
        deleteActive: false,
        logsActive: false,
      },
    );
  });

  it("Delete analysis button - PO broken", async () => {
    await basicButtonCheck(
      ".delete-analysis-btn",
      "error",
      "Terminate request failure",
      "Failed to terminate the analysis",
      fakeBrokenAnalysisId,
      {
        playActive: false,
        rerunActive: false,
        stopActive: true,
        deleteActive: true,
        logsActive: true,
      },
      PodStatus.Executing,
      PodStatus.Executing,
    );
  });

  it("Start analysis button - invalid role", async () => {
    await basicButtonCheck(
      ".start-analysis-btn",
      "error",
      "Start failure",
      "Failed to start the analysis",
      fakeInvalidRoleAnalysisId,
      {
        playActive: true,
        rerunActive: false,
        stopActive: false,
        deleteActive: false,
        logsActive: false,
      },
      "",
    );
  });

  it("Log btn - hidden until the pod has logs to show", async () => {
    const wrapper = mountControls(null);

    expect(AnalysisControlButtons).toBeTruthy();

    // No run yet, so there is nothing to view
    expect(isLogsBtnVisible(wrapper)).toBe(false);

    // Shown for statuses that have produced logs
    for (const status of [
      PodStatus.Failed,
      PodStatus.Stopped,
      PodStatus.Stopping,
      PodStatus.Executing,
      PodStatus.Executed,
    ]) {
      await wrapper.setProps({ analysisExecutionStatus: status });
      expect(isLogsBtnVisible(wrapper)).toBe(true);
    }

    // Hidden again for statuses without logs
    for (const status of [PodStatus.Starting, PodStatus.Started, ""]) {
      await wrapper.setProps({ analysisExecutionStatus: status });
      expect(isLogsBtnVisible(wrapper)).toBe(false);
    }
  });

  function mountControls(analysisExecutionStatus: string | null) {
    return mount(AnalysisControlButtons, {
      props: {
        analysisBuildStatus: ProcessStatus.Executed,
        analysisExecutionStatus,
        analysisNodeId: "8003eefe-e39b-4bd4-aec4-78046c63b39b",
        analysisDistributionStatus: ProcessStatus.Executed,
        analysisId: fakeAnalysisId,
        approvalStatus: "approved",
        projectId: "7f2f3b59-3b6d-4fb6-a900-2a4d5c2ea483",
        nodeId: "e3b89572-327f-4936-8cf0-fbfbcc6336b7",
        datastore: true,
        requireDatastore: true,
      },
    });
  }

  it("Update button - disabled when execution status is null", () => {
    const wrapper = mountControls(null);
    const updateBtn = wrapper.find(".update-analysis-btn");
    expect(updateBtn.exists()).toBe(true);
    expect(updateBtn.attributes("data-p-disabled")).toBe("true");
  });

  it("Update button - enabled for an in-progress execution status", () => {
    const wrapper = mountControls(PodStatus.Executing);
    const updateBtn = wrapper.find(".update-analysis-btn");
    expect(updateBtn.attributes("data-p-disabled")).toBe("false");
    // v-show is applied to the AnalysisUpdateButton root container
    expect(isButtonVisible(wrapper, ".update-analysis-btn-container")).toBe(
      true,
    );
  });

  it("Update button - hidden when execution status is failed or executed", async () => {
    const wrapper = mountControls(PodStatus.Failed);
    expect(isButtonVisible(wrapper, ".update-analysis-btn-container")).toBe(
      false,
    );

    await wrapper.setProps({ analysisExecutionStatus: PodStatus.Executed });
    expect(isButtonVisible(wrapper, ".update-analysis-btn-container")).toBe(
      false,
    );

    await wrapper.setProps({ analysisExecutionStatus: PodStatus.Executing });
    expect(isButtonVisible(wrapper, ".update-analysis-btn-container")).toBe(
      true,
    );
  });
});
