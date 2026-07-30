import {
  AnalysisNodeApprovalStatus,
  ProjectNodeApprovalStatus,
} from "@privateaim/core-kit";
import { ProcessStatus } from "@privateaim/kit";
import { PodStatus } from "~/services/Api";

// The Hub declares approval status twice, once per entity, with identical
// members. Taking the template-literal form of both widens them to their shared
// value union so one helper can serve project nodes and analysis nodes alike.
export type ApprovalStatusValue =
  | `${AnalysisNodeApprovalStatus}`
  | `${ProjectNodeApprovalStatus}`;

export const getApprovalStatusSeverity = (status: ApprovalStatusValue) => {
  switch (status) {
    case ProjectNodeApprovalStatus.APPROVED:
      return "success";

    case ProjectNodeApprovalStatus.REJECTED:
      return "danger";
  }
};

export const getBuildStatusSeverity = (status: `${ProcessStatus}`) => {
  switch (status) {
    case ProcessStatus.STARTING:
    case ProcessStatus.STARTED:
      return "info";

    case ProcessStatus.STOPPING:
    case ProcessStatus.STOPPED:
      return "warning";

    case ProcessStatus.FAILED:
      return "danger";

    case ProcessStatus.EXECUTING:
      return "contrast";

    case ProcessStatus.EXECUTED:
      return "success";
  }
};

export const getExecutionStatusSeverity = (status: PodStatus) => {
  switch (status) {
    case PodStatus.Starting:
    case PodStatus.Started:
      return "info";

    case PodStatus.Executing:
      return "contrast";

    case PodStatus.Stopping:
    case PodStatus.Stopped:
      return "warning";

    case PodStatus.Failed:
      return "danger";

    case PodStatus.Executed:
      return "success";
  }
};

export const getDataStoreTypeSeverity = (
  status: string,
): "info" | "warn" | undefined => {
  switch (status) {
    case "s3":
      return "info";

    case "fhir":
      return "warn";
  }
};
