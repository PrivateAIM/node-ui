import { mount } from "@vue/test-utils";
import { describe, expect, it } from "vitest";

import ContainerCounter from "~/components/analysis/ContainerCounter.vue";
import { fakeAnalysisNodes } from "@/test/components/analysis/constants";
import { type AnalysisNode } from "~/services/Api";

interface filterData {
  value: string[] | undefined;
  matchMode: string;
}

interface filterObject {
  global?: filterData;
  execution_status: filterData;
  approval_status?: filterData;
}

describe("ContainerCounter.vue", () => {
  function countStatusOccurences(inputAnalyses: AnalysisNode[]) {
    const statusCounts = {
      started: 0,
      executing: 0,
      stopped: 0,
      failed: 0,
      executed: 0,
    };
    inputAnalyses.forEach((analysisNode) => {
      if (analysisNode.execution_status) {
        statusCounts[analysisNode.execution_status]++;
      }
    });
    return statusCounts;
  }

  function counterCheck(
    mockAnalyses: AnalysisNode[],
    mockFilters: filterObject,
  ) {
    const wrapper = mount(ContainerCounter, {
      props: {
        analyses: mockAnalyses,
        activeFilters: mockFilters,
      },
    });

    expect(ContainerCounter).toBeTruthy();
    const statusCounts = countStatusOccurences(mockAnalyses);

    // Success check
    let emitCounts = 0;
    const fillCounterDiv = wrapper.find(".counter-badge-all");
    ["Started", "Executing", "Stopped", "Failed", "Executed"].forEach(
      (executionStatus, index) => {
        let displayedStatus = "";
        if (executionStatus === "Executing") {
          displayedStatus = "Running";
        } else if (executionStatus === "Executed") {
          displayedStatus = "Finished";
        } else {
          displayedStatus = executionStatus;
        }
        expect(fillCounterDiv.text()).toContain(displayedStatus);
        const lowerStatus = executionStatus.toLowerCase();
        const statusCount = statusCounts[lowerStatus];

        // Check individual badge properties
        const counterDiv = wrapper.find(`.container-counter-${lowerStatus}`);
        const badgeDiv = wrapper.find(`.counter-badge-${lowerStatus}`);
        expect(badgeDiv.text()).toContain(statusCount); // check status count

        // If not in filter list and filter list is not empty, then it should be opaque
        if (
          mockFilters.execution_status.value &&
          !mockFilters.execution_status.value.includes(lowerStatus)
        ) {
          expect(counterDiv.attributes("class")).toContain("opaque-badge");
        }

        if (executionStatus === "Executing" || executionStatus === "Executed") {
          // Emit extra for running and finished
          emitCounts += 2;
        } else {
          emitCounts++;
        }
        // Clicking on badge emits correctly
        badgeDiv.trigger("click");
        console.log(wrapper.emitted().applyExecutionStatusFilter);
        expect(wrapper.emitted()).toHaveProperty("applyExecutionStatusFilter");
        expect(wrapper.emitted().applyExecutionStatusFilter).toHaveLength(
          emitCounts,
        );

        const emittedStatuses = wrapper.emitted().applyExecutionStatusFilter;
        expect(emittedStatuses).toBeDefined();
        expect(emittedStatuses!.flat()).toContain(lowerStatus);
      },
    );

    return wrapper;
  }

  it("No filters applied", () => {
    counterCheck(fakeAnalysisNodes, {
      execution_status: {
        value: undefined,
        matchMode: "in",
      },
    });
  });

  it("Filters applied", () => {
    counterCheck(fakeAnalysisNodes, {
      execution_status: {
        value: ["started", "executed"],
        matchMode: "in",
      },
    });
  });
});
