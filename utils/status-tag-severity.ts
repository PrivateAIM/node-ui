import {
  AnalysisBuildStatus,
  AnalysisRunStatus,
  ApprovalStatus,
} from "~/services/Api";

export const getApprovalStatusSeverity = (status) => {
  switch (status) {
    case ApprovalStatus.Approved:
      return "success";

    case ApprovalStatus.Rejected:
      return "danger";
  }
};

export const getBuildStatusSeverity = (status) => {
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

export const getRunStatusSeverity = (status) => {
  switch (status) {
    case AnalysisRunStatus.Starting:
      return "info";

    case AnalysisRunStatus.Started:
      return "info";

    case AnalysisRunStatus.Running:
      return null;

    case AnalysisRunStatus.Stopping:
      return "warning";

    case AnalysisRunStatus.Stopped:
      return "warning";

    case AnalysisRunStatus.Failed:
      return "danger";

    case AnalysisRunStatus.Finished:
      return "success";
  }
};
