import { ApprovalStatus } from "~/types/node";
import { PodStatus } from "~/services/Api";
import { ProcessStatus } from "~/types/analysis";
import type { TagSeverity } from "~/types/statusTag";

export const getApprovalStatusSeverity = (status: ApprovalStatus) => {
  switch (status) {
    case ApprovalStatus.Approved:
      return "success";

    case ApprovalStatus.Rejected:
      return "danger";
  }
};

export const getBuildStatusSeverity = (status: ProcessStatus): TagSeverity => {
  switch (status) {
    case ProcessStatus.Starting:
      return "info";

    case ProcessStatus.Started:
      return "info";

    case ProcessStatus.Stopping:
      return "warning";

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

export const getExecutionStatusSeverity = (status: PodStatus): TagSeverity => {
  switch (status) {
    case PodStatus.Starting:
      return "info";

    case PodStatus.Started:
      return "info";

    case PodStatus.Executing:
      return "contrast";

    case PodStatus.Stopping:
      return "warning";

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
