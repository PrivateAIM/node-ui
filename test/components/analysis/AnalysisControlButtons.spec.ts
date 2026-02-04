import { useToast } from "primevue/usetoast";
import { flushPromises, mount, VueWrapper } from "@vue/test-utils";
import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";
import AnalysisControlButtons from "~/components/analysis/AnalysisControlButtons.vue";
import { AnalysisBuildStatus, AnalysisNodeRunStatus } from "~/types/analysis";
import {
  fakeAnalysisId,
  fakeBrokenAnalysisId,
  fakeInvalidRoleAnalysisId,
  fakeMissingAnalysisId,
} from "~/test/mockapi/handlers";

interface ButtonStates {
  playActive: boolean;
  rerunActive: boolean;
  stopActive: boolean;
  deleteActive: boolean;
}

function isButtonVisible(wrapper: VueWrapper, selector: string): boolean {
  const btn = wrapper.find(selector);
  if (!btn.exists()) return false;

  const style = btn.attributes("style");
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
    initialRunStatus: string = AnalysisNodeRunStatus.Running,
    expectedFinalStatus: string = "",
    expectedToastCalls: number = 1,
  ) {
    const wrapper = mount(AnalysisControlButtons, {
      props: {
        analysisBuildStatus: AnalysisBuildStatus.Finished,
        analysisRunStatus: initialRunStatus,
        analysisNodeId: "8003eefe-e39b-4bd4-aec4-78046c63b39b",
        analysisId: analysisId,
        projectId: "7f2f3b59-3b6d-4fb6-a900-2a4d5c2ea483",
        nodeId: "e3b89572-327f-4936-8cf0-fbfbcc6336b7",
        datastore: true,
        nodeType: "default",
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

    if (expectedFinalStatus !== undefined) {
      await wrapper.setProps({ analysisRunStatus: expectedFinalStatus });
    }

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
      },
      "",
      AnalysisNodeRunStatus.Started,
    );

    // Start button should be replaced by rerun
    expect(isButtonVisible(wrapper, ".start-analysis-btn")).toBe(false);
    expect(isButtonVisible(wrapper, ".rerun-analysis-btn")).toBe(true);
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
      },
      AnalysisNodeRunStatus.Running,
      AnalysisNodeRunStatus.Stopped,
    );
  });

  it("Stop analysis button - missing", async () => {
    await basicButtonCheck(
      ".stop-analysis-btn",
      "warn",
      "Status unknown",
      "Pod was not found, but the stop command was still issued",
      fakeMissingAnalysisId,
      {
        playActive: false,
        rerunActive: true,
        stopActive: false,
        deleteActive: true,
      },
      AnalysisNodeRunStatus.Running,
      AnalysisNodeRunStatus.Stopped,
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
      },
      AnalysisNodeRunStatus.Running,
      AnalysisNodeRunStatus.Running,
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
      },
      AnalysisNodeRunStatus.Running,
      "",
    );
  });

  it("Delete analysis button - missing", async () => {
    await basicButtonCheck(
      ".delete-analysis-btn",
      "warn",
      "Status unknown",
      "Pod was not found, but the stop command was still issued",
      fakeMissingAnalysisId,
      {
        playActive: true,
        rerunActive: false,
        stopActive: false,
        deleteActive: false,
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
        playActive: true,
        rerunActive: false,
        stopActive: true,
        deleteActive: true,
      },
      AnalysisNodeRunStatus.Running,
      AnalysisNodeRunStatus.Running,
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
      },
      "",
    );
  });

  it("Log btn check", async () => {
    const wrapper = mount(AnalysisControlButtons, {
      props: {
        analysisBuildStatus: AnalysisBuildStatus.Finished,
        analysisRunStatus: null,
        analysisNodeId: "8003eefe-e39b-4bd4-aec4-78046c63b39b",
        analysisId: fakeAnalysisId,
        projectId: "7f2f3b59-3b6d-4fb6-a900-2a4d5c2ea483",
        nodeId: "e3b89572-327f-4936-8cf0-fbfbcc6336b7",
        datastore: true,
        nodeType: "default",
      },
    });

    expect(AnalysisControlButtons).toBeTruthy();

    // Success check
    const logBtn = wrapper.find(".logs-analysis-btn");
    expect(logBtn.attributes("data-p-disabled")).toBe("true");

    await wrapper.setProps({
      analysisRunStatus: AnalysisNodeRunStatus.Started,
    });
    expect(logBtn.attributes("data-p-disabled")).toBe("false");

    await wrapper.setProps({
      analysisRunStatus: AnalysisNodeRunStatus.Running,
    });
    expect(logBtn.attributes("data-p-disabled")).toBe("false");

    await wrapper.setProps({
      analysisRunStatus: "",
    });
    expect(logBtn.attributes("data-p-disabled")).toBe("true");

    await wrapper.setProps({
      analysisRunStatus: AnalysisNodeRunStatus.Failed,
    });
    expect(logBtn.attributes("data-p-disabled")).toBe("false");

    await wrapper.setProps({
      analysisRunStatus: AnalysisNodeRunStatus.Finished,
    });
    expect(logBtn.attributes("data-p-disabled")).toBe("false");
    //
  });
});
