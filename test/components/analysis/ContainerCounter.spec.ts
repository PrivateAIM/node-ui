import { mount } from "@vue/test-utils";
import { describe, expect, it } from "vitest";

import ContainerCounter from "~/components/analysis/ContainerCounter.vue";
import { fakeAnalysisNodes } from "~/test/components/analysis/constants";
import type { AnalysisNode } from "~/services/Api";

interface filterData {
  value: string[] | null;
  matchMode: string;
}

interface filterObject {
  global?: filterData;
  run_status: filterData;
  approval_status?: filterData;
}

describe("ContainerCounter.vue", () => {
  function countStatusOccurences(inputAnalyses: AnalysisNode[]) {
    const statusCounts = {
      started: 0,
      running: 0,
      stopped: 0,
      failed: 0,
      finished: 0,
    };
    inputAnalyses.forEach((analysisNode) => {
      if (analysisNode.run_status) {
        statusCounts[analysisNode.run_status]++;
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
    const fillCounterDiv = wrapper.find(".counter-badge-all");
    ["Started", "Running", "Stopped", "Failed", "Finished"].forEach(
      (runStatus, index) => {
        expect(fillCounterDiv.text()).toContain(runStatus);
        const lowerStatus = runStatus.toLowerCase();
        const statusCount = statusCounts[lowerStatus];

        // Check individual badge properties
        const counterDiv = wrapper.find(`.container-counter-${lowerStatus}`);
        const badgeDiv = wrapper.find(`.counter-badge-${lowerStatus}`);
        expect(badgeDiv.text()).toContain(statusCount); // check status count

        // If not in filter list and filter list is not empty, then it should be opaque
        if (
          mockFilters.run_status.value &&
          !mockFilters.run_status.value.includes(lowerStatus)
        ) {
          expect(counterDiv.attributes("class")).toContain("opaque-badge");
        }

        // Clicking on badge emits correctly
        badgeDiv.trigger("click");
        expect(wrapper.emitted()).toHaveProperty("applyRunStatusFilter");
        expect(wrapper.emitted().applyRunStatusFilter).toHaveLength(index + 1);
        expect(wrapper.emitted().applyRunStatusFilter[index]).toEqual([
          lowerStatus,
        ]);
      },
    );

    return wrapper;
  }

  it("No filters applied", () => {
    counterCheck(fakeAnalysisNodes, {
      run_status: {
        value: null,
        matchMode: "in",
      },
    });
  });

  it("Filters applied", () => {
    counterCheck(fakeAnalysisNodes, {
      run_status: {
        value: ["started", "failed"],
        matchMode: "in",
      },
    });
  });
});
