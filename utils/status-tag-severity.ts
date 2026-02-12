import { ApprovalStatus } from "~/types/node";
import { PodStatus } from "~/services/Api";
import { ProcessStatus } from "~/types/analysis";

export const getApprovalStatusSeverity = (status: string) => {
  switch (status) {
    case ApprovalStatus.Approved:
      return "success";

    case ApprovalStatus.Rejected:
      return "danger";
  }
};

export const getBuildStatusSeverity = (status: string) => {
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

    case ProcessStatus.Executed:
      return "success";
  }
};

export const getExecutionStatusSeverity = (status: string) => {
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

export const getDataStoreTypeSeverity = (status: string) => {
  switch (status) {
    case "s3":
      return "info";

    case "fhir":
      return "warn";
  }
};
