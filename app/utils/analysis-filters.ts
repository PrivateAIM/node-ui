import { PodStatus } from "~/services/Api";
import type { HubStatuses } from "~/services/modifiedApiInterfaces";
import { ProcessStatus } from "~/types/analysis";
import { ApprovalStatus } from "~/types/node";
import {
  getApprovalStatusSeverity,
  getBuildStatusSeverity,
} from "~/utils/status-tag-severity";

export const HUB_STATUS_FILTER_MATCH_MODE = "hubStatusMatch";

export type HubStatusGroup =
  "approval_status" | "build_status" | "distribution_status";

export const podStatuses = Object.values(PodStatus);

const approvalStatuses = Object.values(ApprovalStatus);
const processStatuses = Object.values(ProcessStatus);

export function getHubStatusSeverity(group: HubStatusGroup, status: string) {
  return group === "approval_status"
    ? getApprovalStatusSeverity(status as ApprovalStatus)
    : getBuildStatusSeverity(status as ProcessStatus);
}

export const hubStatusFilterOptions = [
  {
    label: "Approval Status",
    items: approvalStatuses.map((status) => ({
      label: status,
      value: `approval_status::${status}`,
      group: "approval_status" as HubStatusGroup,
      status,
    })),
  },
  {
    label: "Build Status",
    items: processStatuses.map((status) => ({
      label: status,
      value: `build_status::${status}`,
      group: "build_status" as HubStatusGroup,
      status,
    })),
  },
  {
    label: "Distribution Status",
    items: processStatuses.map((status) => ({
      label: status,
      value: `distribution_status::${status}`,
      group: "distribution_status" as HubStatusGroup,
      status,
    })),
  },
];

/** Matches a row when any of the selected statuses matches its respective column. */
export function matchesHubStatusFilter(
  value: HubStatuses | undefined,
  filter: string[] | undefined | null,
): boolean {
  if (!filter || filter.length === 0) return true;
  if (!value) return false;
  return filter.some((selected) => {
    const [group, status] = selected.split("::");
    return value[group as HubStatusGroup] === status;
  });
}

/** Adds the status to the selection, or removes it; an emptied selection becomes undefined. */
export function toggleStatusFilter(
  selected: string[] | undefined | null,
  status: string,
): string[] | undefined {
  if (!selected) return [status];
  if (!selected.includes(status)) return [...selected, status];

  const remaining = selected.filter((item) => item !== status);
  return remaining.length === 0 ? undefined : remaining;
}
