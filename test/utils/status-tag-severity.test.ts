import { expect, test } from "vitest";
import {
  getApprovalStatusSeverity,
  getBuildStatusSeverity,
  getDataStoreTypeSeverity,
  getExecutionStatusSeverity,
} from "~/utils/status-tag-severity";
import { ProjectNodeApprovalStatus } from "@privateaim/core-kit";
import { ProcessStatus } from "@privateaim/kit";
import { PodStatus } from "~/services/Api";

test("Approval status severity tag", () => {
  const expectations = {
    approved: "success",
    rejected: "danger",
  };
  for (const approvalStatus of Object.values(ProjectNodeApprovalStatus)) {
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
    executing: "contrast",
    stopping: "warning",
    stopped: "warning",
    executed: "success",
    failed: "danger",
  };

  for (const executionStatus of Object.values(PodStatus)) {
    expect(getExecutionStatusSeverity(executionStatus)).toStrictEqual(
      expectations[executionStatus],
    );
  }
});

test("Data store type status severity tag", () => {
  expect(getDataStoreTypeSeverity("s3")).toBe("info");
  expect(getDataStoreTypeSeverity("fhir")).toBe("warn");
  expect(getDataStoreTypeSeverity("unknown")).toBeUndefined();
});
