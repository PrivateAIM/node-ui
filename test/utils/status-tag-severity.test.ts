import { expect, test } from "vitest";
import {
  getApprovalStatusSeverity,
  getBuildStatusSeverity,
  getDataStoreTypeSeverity,
  getRunStatusSeverity,
} from "~/utils/status-tag-severity";
import { AnalysisBuildStatus, AnalysisNodeRunStatus } from "~/types/analysis";
import { ApprovalStatus } from "~/types/node";

test("Approval status severity tag", () => {
  const expectations = {
    approved: "success",
    rejected: "danger",
  };
  for (const approvalStatus of Object.values(ApprovalStatus)) {
    expect(getApprovalStatusSeverity(approvalStatus)).toStrictEqual(
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
  for (const buildStatus of Object.values(AnalysisBuildStatus)) {
    expect(getBuildStatusSeverity(buildStatus)).toStrictEqual(
      expectations[buildStatus],
    );
  }
});

test("Analysis run status severity tag", () => {
  const expectations = {
    starting: "info",
    started: "info",
    running: "contrast",
    stopping: "warning",
    stopped: "warning",
    finished: "success",
    failed: "danger",
  };

  for (const runStatus of Object.values(AnalysisNodeRunStatus)) {
    expect(getRunStatusSeverity(runStatus)).toStrictEqual(
      expectations[runStatus],
    );
  }
});

test("Data store type status severity tag", () => {
  const expectations = {
    s3: "info",
    fhir: "danger",
  };
  for (const dsType in ["s3", "fhir"]) {
    expect(getDataStoreTypeSeverity(dsType)).toStrictEqual(
      expectations[dsType],
    );
  }
});
