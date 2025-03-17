import { expect, test } from "vitest";
import {
  getApprovalStatusSeverity,
  getBuildStatusSeverity,
  getRunStatusSeverity,
  getDataStoreTypeSeverity,
} from "../status-tag-severity";
import {
  AnalysisBuildStatus,
  AnalysisRunStatus,
  ApprovalStatus,
} from "~/services/Api";

test("Approval status severity tag", () => {
  const expectations = {
    approved: "success",
    rejected: "danger",
  };
  for (const approvalStatus in ApprovalStatus) {
    expect(getApprovalStatusSeverity(approvalStatus)).toBe(
      expectations[approvalStatus],
    );
  }
});

test("Build status severity tag", () => {
  const expectations = {
    starting: "info",
    started: "info",
    stopping: "warning",
    stopped: "warning",
    finished: "success",
    failed: "danger",
  };
  for (const buildStatus in AnalysisBuildStatus) {
    expect(getBuildStatusSeverity(buildStatus)).toBe(expectations[buildStatus]);
  }
});

test("Analysis run status severity tag", () => {
  const expectations = {
    starting: "info",
    started: "info",
    running: "info",
    stopping: "warning",
    stopped: "warning",
    finished: "success",
    failed: "danger",
  };
  for (const runStatus in AnalysisRunStatus) {
    expect(getRunStatusSeverity(runStatus)).toStrictEqual(
      expectations[runStatus],
    );
  }
});
