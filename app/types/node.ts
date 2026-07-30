import { ProjectNodeApprovalStatus } from "~/services/hub";

/**
 * The Hub declares approval status twice — `ProjectNodeApprovalStatus` and
 * `AnalysisNodeApprovalStatus` — with identical members. The UI approves both
 * kinds of node through the same controls, so it aliases them to one name.
 */
export const ApprovalStatus = ProjectNodeApprovalStatus;
export type ApprovalStatus = ProjectNodeApprovalStatus;
