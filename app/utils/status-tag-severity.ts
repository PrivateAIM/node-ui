import { ApprovalStatus } from "~/types/node";
import { PodStatus } from "~/services/Api";
import { ProcessStatus } from "~/services/hub";

export const getApprovalStatusSeverity = (status: ApprovalStatus) => {
  switch (status) {
    case ApprovalStatus.APPROVED:
      return "success";

    case ApprovalStatus.REJECTED:
      return "danger";
  }
};

export const getBuildStatusSeverity = (status: ProcessStatus) => {
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
