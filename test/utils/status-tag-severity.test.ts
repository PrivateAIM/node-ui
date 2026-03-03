import { expect, test } from "vitest";
import {
  getApprovalStatusSeverity,
  getBuildStatusSeverity,
  getDataStoreTypeSeverity,
  getExecutionStatusSeverity,
} from "~/utils/status-tag-severity";
import { ProcessStatus } from "~/types/analysis";
import { ApprovalStatus } from "~/types/node";
import { PodStatus } from "~/services/Api";

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
    executing: "contrast",
    executed: "success",
    failed: "danger",
  };
  for (const buildStatus of Object.values(ProcessStatus)) {
    expect(getBuildStatusSeverity(buildStatus)).toStrictEqual(
      expectations[buildStatus],
    );
  }
});

test("Analysis run status severity tag", () => {
  const expectations = {
    starting: "info",
    started: "info",
    running: "contrast", // deprecated
    executing: "contrast",
    stopping: "warning",
    stopped: "warning",
    executed: "success",
    finished: "success", // deprecated
    failed: "danger",
  };

  for (const executionStatus of Object.values(PodStatus)) {
    expect(getExecutionStatusSeverity(executionStatus)).toStrictEqual(
      expectations[executionStatus],
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
