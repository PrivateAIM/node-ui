import { ApprovalStatus } from "~/types/node";
import { PodStatus } from "~/services/Api";
import { ProcessStatus } from "~/types/analysis";

export const getApprovalStatusSeverity = (status: ApprovalStatus) => {
  switch (status) {
    case ApprovalStatus.Approved:
      return "success";

    case ApprovalStatus.Rejected:
      return "danger";
  }
};

export const getBuildStatusSeverity = (status: ProcessStatus) => {
  switch (status) {
    case ProcessStatus.Starting:
    case ProcessStatus.Started:
      return "info";

    case ProcessStatus.Stopping:
    case ProcessStatus.Stopped:
      return "warning";

    case ProcessStatus.Failed:
      return "danger";

    case ProcessStatus.Executing:
      return "contrast";

    case ProcessStatus.Executed:
      return "success";
  }
};

export const getExecutionStatusSeverity = (status: PodStatus) => {
  switch (status) {
    case PodStatus.Starting:
    case PodStatus.Started:
      return "info";

    case PodStatus.Executing:
    case PodStatus.Running:
      return "contrast";

    case PodStatus.Stopping:
    case PodStatus.Stopped:
      return "warning";

    case PodStatus.Failed:
      return "danger";

    case PodStatus.Executed:
    case PodStatus.Finished:
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
