import { describe, expect, it } from "vitest";
import {
  getHubStatusSeverity,
  hubStatusFilterOptions,
  matchesHubStatusFilter,
  toggleStatusFilter,
} from "~/utils/analysis-filters";
import {
  getApprovalStatusSeverity,
  getBuildStatusSeverity,
} from "~/utils/status-tag-severity";
import { ApprovalStatus } from "~/types/node";
import { ProcessStatus } from "~/types/analysis";

const statuses = {
  approvalStatus: "approved",
  buildStatus: "executed",
  distributionStatus: null,
} as const;

describe("matchesHubStatusFilter", () => {
  it("matches everything when no filter is selected", () => {
    expect(matchesHubStatusFilter(statuses, undefined)).toBe(true);
    expect(matchesHubStatusFilter(statuses, [])).toBe(true);
  });

  it("rejects rows without statuses once a filter is selected", () => {
    expect(
      matchesHubStatusFilter(undefined, ["approvalStatus::approved"]),
    ).toBe(false);
  });

  it("matches when any selected status matches its column", () => {
    expect(
      matchesHubStatusFilter(statuses, [
        "approvalStatus::rejected",
        "buildStatus::executed",
      ]),
    ).toBe(true);
    expect(
      matchesHubStatusFilter(statuses, ["distributionStatus::executed"]),
    ).toBe(false);
  });
});

describe("toggleStatusFilter", () => {
  it("starts a selection", () => {
    expect(toggleStatusFilter(undefined, "failed")).toEqual(["failed"]);
  });

  it("adds and removes statuses", () => {
    expect(toggleStatusFilter(["failed"], "executed")).toEqual([
      "failed",
      "executed",
    ]);
    expect(toggleStatusFilter(["failed", "executed"], "failed")).toEqual([
      "executed",
    ]);
  });

  it("returns undefined when the last status is removed", () => {
    expect(toggleStatusFilter(["failed"], "failed")).toBeUndefined();
  });
});

describe("hub status filter options", () => {
  it("offers one group per hub status column", () => {
    expect(hubStatusFilterOptions.map((group) => group.label)).toEqual([
      "Approval Status",
      "Build Status",
      "Distribution Status",
    ]);
    expect(hubStatusFilterOptions[0]!.items[0]!.value).toBe(
      `approvalStatus::${Object.values(ApprovalStatus)[0]}`,
    );
  });

  it("uses the approval severity for approvals and build severity otherwise", () => {
    expect(
      getHubStatusSeverity("approvalStatus", ApprovalStatus.Approved),
    ).toBe(getApprovalStatusSeverity(ApprovalStatus.Approved));
    expect(
      getHubStatusSeverity("distributionStatus", ProcessStatus.Failed),
    ).toBe(getBuildStatusSeverity(ProcessStatus.Failed));
  });
});
