import { useToast } from "primevue/usetoast";
import { flushPromises, mount } from "@vue/test-utils";
import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";
import AnalysisControlButtons from "~/components/analysis/AnalysisControlButtons.vue";
import { AnalysisBuildStatus, AnalysisNodeRunStatus } from "~/types/analysis";
import {
  fakeAnalysisId,
  fakeBrokenAnalysisId,
  fakeMissingAnalysisId,
} from "~/test/mockapi/handlers";

interface ButtonStates {
  playActive: boolean;
  rerunActive: boolean;
  stopActive: boolean;
  deleteActive: boolean;
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
    expectError: boolean = false,
    expectedButtonStates: ButtonStates,
    initialRunStatus: string = AnalysisNodeRunStatus.Running,
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

    if (expectError) {
      expect(toggle.attributes("data-p-disabled")).toBe("false");
    } else {
      expect(toggle.attributes("data-p-disabled")).toBe("true");
    }

    if (expectedToastCalls > 0) {
      expect(spy).toHaveBeenCalledTimes(1);
      expect(spy).toHaveBeenCalledWith({
        severity: toastSeverity,
        summary: toastSummary,
        detail: toastMsg,
        life: 5000,
      });
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
      true, // Start button disappears so can't check if disabled
      {
        playActive: false,
        rerunActive: false,
        stopActive: true,
        deleteActive: true,
      },
      "",
    );
    // Start button should be replaced by rerun
    expect(wrapper.find(".start-analysis-btn").exists()).toBeFalsy();
    expect(wrapper.find(".rerun-analysis-btn").exists()).toBeTruthy();
  });

  it("Start analysis button - PO broken", async () => {
    await basicButtonCheck(
      ".start-analysis-btn",
      "error",
      "Start failure",
      "Failed to start the analysis",
      fakeBrokenAnalysisId,
      true,
      {
        playActive: true,
        rerunActive: false,
        stopActive: false,
        deleteActive: false,
      },
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
      true,
      {
        playActive: true,
        rerunActive: false,
        stopActive: false,
        deleteActive: false,
      },
      "",
      0,
    );
    expect(wrapper.emitted().missingDataStore).toBeTruthy();
  });

  it("Stop analysis button - working", async () => {
    await basicButtonCheck(
      ".stop-analysis-btn",
      "info",
      "Stop success",
      "Successfully stopped the container",
      fakeAnalysisId,
      false,
      {
        playActive: false,
        rerunActive: true,
        stopActive: false,
        deleteActive: true,
      },
    );
  });

  it("Stop analysis button - missing", async () => {
    await basicButtonCheck(
      ".stop-analysis-btn",
      "warn",
      "Status unknown",
      "Pod was not found, but the stop command was still issued",
      fakeMissingAnalysisId,
      false,
      {
        playActive: false,
        rerunActive: true,
        stopActive: false,
        deleteActive: true,
      },
    );
  });

  it("Stop analysis button - PO broken", async () => {
    await basicButtonCheck(
      ".stop-analysis-btn",
      "warn",
      "Stop failure",
      "Failed to stop the analysis container",
      fakeBrokenAnalysisId,
      true,
      {
        playActive: false,
        rerunActive: false,
        stopActive: true,
        deleteActive: true,
      },
    );
  });

  it("Delete analysis button - working", async () => {
    await basicButtonCheck(
      ".delete-analysis-btn",
      "info",
      "Delete success",
      "Successfully removed the container",
      fakeAnalysisId,
      false,
      {
        playActive: true,
        rerunActive: false,
        stopActive: false,
        deleteActive: false,
      },
    );
  });

  it("Delete analysis button - missing", async () => {
    await basicButtonCheck(
      ".delete-analysis-btn",
      "warn",
      "Status unknown",
      "Pod was not found, but the stop command was still issued",
      fakeMissingAnalysisId,
      false,
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
      "warn",
      "Terminate request failure",
      "Failed to terminate the analysis",
      fakeBrokenAnalysisId,
      true,
      {
        playActive: false,
        rerunActive: false,
        stopActive: true,
        deleteActive: true,
      },
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
        nodeType: "default"
      },
    });

    expect(AnalysisControlButtons).toBeTruthy();

    // Success check
    const logBtn = wrapper.find(".logs-analysis-btn");
    expect(logBtn.attributes("data-p-disabled")).toBe("true");

    // @ts-expect-error Accessing a known method
    wrapper.vm.setButtonStates(AnalysisNodeRunStatus.Started);
    await wrapper.vm.$nextTick();
    expect(logBtn.attributes("data-p-disabled")).toBe("false");

    // @ts-expect-error Accessing a known method
    wrapper.vm.setButtonStates(AnalysisNodeRunStatus.Running);
    await wrapper.vm.$nextTick();
    expect(logBtn.attributes("data-p-disabled")).toBe("false");

    // @ts-expect-error Accessing a known method
    wrapper.vm.setButtonStates(AnalysisNodeRunStatus.Failed);
    await wrapper.vm.$nextTick();
    expect(logBtn.attributes("data-p-disabled")).toBe("false");

    // @ts-expect-error Accessing a known method
    wrapper.vm.setButtonStates(AnalysisNodeRunStatus.Finished);
    await wrapper.vm.$nextTick();
    expect(logBtn.attributes("data-p-disabled")).toBe("false");

    // @ts-expect-error Accessing a known method
    wrapper.vm.setButtonStates("");
    await wrapper.vm.$nextTick();
    expect(logBtn.attributes("data-p-disabled")).toBe("true");
  });
});
