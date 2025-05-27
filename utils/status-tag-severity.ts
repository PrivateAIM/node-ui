import { ApprovalStatus } from "~/types/node";
import { AnalysisBuildStatus, AnalysisNodeRunStatus } from "~/types/analysis";

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
    case AnalysisBuildStatus.Starting:
      return "info";

    case AnalysisBuildStatus.Started:
      return "info";

    case AnalysisBuildStatus.Stopping:
      return "warning";

    case AnalysisBuildStatus.Stopped:
      return "warning";

    case AnalysisBuildStatus.Failed:
      return "danger";

    case AnalysisBuildStatus.Finished:
      return "success";
  }
};

export const getRunStatusSeverity = (status: string) => {
  switch (status) {
    case AnalysisNodeRunStatus.Starting:
      return "info";

    case AnalysisNodeRunStatus.Started:
      return "info";

    case AnalysisNodeRunStatus.Running:
      return "contrast";

    case AnalysisNodeRunStatus.Stopping:
      return "warning";

    case AnalysisNodeRunStatus.Stopped:
      return "warning";

    case AnalysisNodeRunStatus.Failed:
      return "danger";

    case AnalysisNodeRunStatus.Finished:
      return "success";
  }
};

export const getDataStoreTypeSeverity = (status: string) => {
  switch (status) {
    case "s3":
      return "info";

    case "fhir":
      return "danger";
  }
};
