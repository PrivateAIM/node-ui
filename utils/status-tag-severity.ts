import { ApprovalStatus } from "~/types/node";
import { ProcessStatus } from "~/types/analysis";
import { PodStatus } from "~/services/Api";

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

    case ProcessStatus.Finished:
      return "success";
  }
};

export const getRunStatusSeverity = (status: string) => {
  switch (status) {
    case PodStatus.Starting:
      return "info";

    case PodStatus.Started:
      return "info";

    case PodStatus.Running:
      return "contrast";

    case PodStatus.Stopping:
      return "warning";

    case PodStatus.Stopped:
      return "warning";

    case PodStatus.Failed:
      return "danger";

    case PodStatus.Finished:
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
