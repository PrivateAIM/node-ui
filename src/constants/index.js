import Badge from "@mui/material/Badge";
import AccountIcon from "@mui/icons-material/AccountCircle";
import ContainerIcon from "@mui/icons-material/ViewInAr";
import DashboardIcon from "@mui/icons-material/SpaceDashboard";
import FederatedJobIcon from "@mui/icons-material/Assignment";
import ImageIcon from "@mui/icons-material/Cloud";
import MetadataIcon from "@mui/icons-material/IntegrationInstructionsRounded";
import VaultIcon from "@mui/icons-material/VpnKey";
import ErrorIcon from "@mui/icons-material/ErrorRounded";
import SuccessIcon from "@mui/icons-material/CheckCircleRounded";

import store from "../redux/store";
import { HtmlTooltip } from "../components/Tooltip";

const learningType = {
  INCREMENTAL: "incremental",
  FEDERATED: "federated",
};

const resultItemSupportedTypes = {
  IMAGE: "image",
  TEXT: "text",
  CSV: "csv",
};

const fileView = {
  TABLE: "table",
  CHART: "chart",
};

const plotTypes = {
  SCATTER: "scatter",
  LINE: "line",
  BAR: "bar",
};

const contentChangeKind = {
  0: "warning.light", // Modified
  1: "success.light", // Added
  2: "error", // Deleted
};

const trainStates = {
  WAITING_TO_PUSH: "waiting_to_push",
  PULLED: "pulled",
};

const federatedJobStates = {
  WAIT_FOR_ACCEPT: {
    title: "WAIT_FOR_ACCEPT",
    info: "Waiting for job to be accepted",
    color: "default",
  },
  WAITING_FOR_NEXT_ROUND: {
    title: "WAITING_FOR_NEXT_ROUND",
    info: "Waiting for next learning round",
    color: "info",
  },
  DOWNLOADING_NEW_MODEL: {
    title: "DOWNLOADING_NEW_MODEL",
    info: "Downloading model for round",
    color: "info",
  },
  LEARNING: { title: "LEARNING", info: "Learning", color: "info" },
  GATHING_RESULTS: {
    title: "GATHING_RESULTS",
    info: "Fetching learning results",
    color: "info",
  },
  PUSHING_RESULTS: {
    title: "PUSHING_RESULTS",
    info: "Transferring results to CS",
    color: "info",
  },
  CANCELED: { title: "CANCELED", info: "Canceled", color: "warning" },
  WAITING_FOR_INSPECTION: {
    title: "WAITING_FOR_INSPECTION",
    info: "Waiting for result inspection (please inspect job results)",
    color: "warning",
  },
  WAITING_FOR_APPROVAL: {
    title: "WAITING_FOR_APPROVAL",
    info: "Waiting for user approval",
    color: "warning",
  },
  FINISHED: { title: "FINISHED", info: "Finished", color: "success" },
  ERROR: { title: "ERROR", info: "Error", color: "error" },
};

const resultTab = {
  LIST: "container-tab-0",
  VIEW: "container-tab-1",
  COMPARE: "container-tab-2",
};

const containerState = {
  CREATED: "created",
  RUNNING: "running",
  EXITED: "exited",
};

const envOptions = {
  MANUAL: "manual",
  VAULT: "vault",
};

const envType = {
  URL: "url",
  TEXT: "text",
  NUMBER: "number",
  PASSWORD: "password",
};

const toolbarTitle = {
  "/": "Requested Trains",
  "/images": "Pulled & Push Images",
  "/containers": "Incremental Learning Containers",
  "/federated-jobs": "Federated Learning Jobs",
  "/metadata": "",
  "/profile": "",
  "/vault": "",
};

const rejectReasons = {
  NO_ANONYMITY: { key: "1", label: "No anonymity" },
  NO_ACCESS_RIGHT: { key: "2", label: "No access right" },
  OTHER_REASONS: { key: "3", label: "Other reasons" },
};

const privacySettingOptions = {
  INSPECT_RESULTS: "inspect-results",
  NO_RESULT_INSPECTION: "no-result-inspection",
};

const navLinks = (learning) => {
  const { federatedJobs } = store.getState().federated;
  const { trains, containers, images, vault } = store.getState().station;

  const renderIcon = (contentLength, icon, { color = "primary" } = {}) => (
    <Badge badgeContent={contentLength} color={color}>
      {icon}
    </Badge>
  );

  return [
    {
      title: "Dashboard",
      index: 0,
      to: "/",
      icon: renderIcon(trains?.length, <DashboardIcon />),
    },
    ...(learning === learningType.INCREMENTAL
      ? [
        {
          title: "Images",
          index: 1,
          to: "/images",
          icon: renderIcon(images?.length, <ImageIcon />),
        },
        {
          title: "Containers",
          index: 2,
          to: "/containers",
          icon: renderIcon(containers?.length, <ContainerIcon />),
        },
      ]
      : [
        {
          title: "Federated Jobs",
          index: 3,
          to: "/federated-jobs",
          icon: renderIcon(federatedJobs?.length, <FederatedJobIcon />),
        },
      ]),
    { title: "Metadata", index: 4, to: "/metadata", icon: <MetadataIcon /> },
    { title: "Profile", index: 5, to: "/profile", icon: <AccountIcon /> },
    {
      title: "Vault",
      index: 6,
      to: "/vault",
      icon: renderIcon(
        vault.authenticated ? (
          <HtmlTooltip title="Vault is unsealed" placement="right">
            <SuccessIcon fontSize="small" color="success" />
          </HtmlTooltip>
        ) : (
          <HtmlTooltip title="Vault is sealed" placement="right">
            <ErrorIcon fontSize="small" color="warning" />
          </HtmlTooltip>
        ),
        <VaultIcon />,
        { color: "default" }
      ),
    },
  ];
};

const columnLabel = {
  CONTAINER_NAME: { key: "name", label: "Name" },
  CONTAINER_IMAGE: { key: "image", label: "Image" },
  CONTAINER_STATE: { key: "state", label: "Curr. State" },
  CURRENT: { key: "current", label: "Current" },
  CURRENT_ROUND: { key: "currentRound", label: "Current Round" },
  HASH: { key: "hash", label: "#" },
  ID: { key: "id", label: "ID" },
  IMAGE_TAG: { key: "imageTag", label: "Image Tag" },
  JOB_ID: { key: "jobID", label: "Job ID" },
  LEARNING_ROUNDS: { key: "learningRounds", label: "Learning Rounds" },
  TOTAL_ROUNDS: { key: "totalRounds", label: "Total Rounds" },
  LOCATION: { key: "location", label: "Location" },
  LEARNING_IMAGE: { key: "learningImage", label: "Learning Image" },
  NEXT: { key: "next", label: "Next" },
  OPERATION: { key: "operation", label: "Operation" },
  PID: { key: "pid", label: "PID" },
  STATUS: { key: "status", label: "Status" },
  TRAIN_ID: { key: "trainID", label: "Train ID" },
  LAST_UPDATE: { key: "lastUpdate", label: "Last Update" },
  SIGNED_BY_COSIGN: { key: "signatureVerified", label: "Signature Verified" }
};

const columns = [
  {
    id: columnLabel.ID.key,
    align: "left",
    label: columnLabel.ID.label,
  },
  {
    id: columnLabel.TRAIN_ID.key,
    align: "left",
    label: columnLabel.TRAIN_ID.label,
  },
  {
    id: columnLabel.LOCATION.key,
    align: "left",
    label: columnLabel.LOCATION.label,
  },
  {
    id: columnLabel.PID.key,
    align: "left",
    label: columnLabel.PID.label,
  },
  {
    id: columnLabel.CURRENT.key,
    align: "left",
    label: columnLabel.CURRENT.label,
  },
  {
    id: columnLabel.NEXT.key,
    align: "left",
    label: columnLabel.NEXT.label,
  },
  {
    id: columnLabel.OPERATION.key,
    align: "left",
    label: columnLabel.OPERATION.label,
  },
];

const columnsFL = [
  {
    id: columnLabel.ID.key,
    align: "left",
    label: columnLabel.ID.label,
  },
  {
    id: columnLabel.LEARNING_IMAGE.key,
    align: "left",
    label: columnLabel.LEARNING_IMAGE.label,
  },
  {
    id: columnLabel.SIGNED_BY_COSIGN.key,
    align: "left",
    label: columnLabel.SIGNED_BY_COSIGN.label,
  },
  {
    id: columnLabel.JOB_ID.key,
    align: "left",
    label: columnLabel.JOB_ID.label,
  },
  {
    id: columnLabel.PID.key,
    align: "left",
    label: columnLabel.PID.label,
  },
  {
    id: columnLabel.LEARNING_ROUNDS.key,
    align: "left",
    label: columnLabel.LEARNING_ROUNDS.label,
  },
  {
    id: columnLabel.OPERATION.key,
    align: "left",
    label: columnLabel.OPERATION.label,
  },
];

const columnsFLJobs = [
  {
    id: columnLabel.ID.key,
    align: "left",
    label: columnLabel.ID.label,
  },
  {
    id: columnLabel.LEARNING_IMAGE.key,
    align: "left",
    label: columnLabel.LEARNING_IMAGE.label,
  },
  {
    id: columnLabel.JOB_ID.key,
    align: "left",
    label: columnLabel.JOB_ID.label,
  },
  {
    id: columnLabel.PID.key,
    align: "left",
    label: columnLabel.PID.label,
  },
  {
    id: columnLabel.STATUS.key,
    align: "center",
    label: columnLabel.STATUS.label,
  },
  {
    id: columnLabel.CURRENT_ROUND.key,
    align: "center",
    label: columnLabel.CURRENT_ROUND.label,
  },
  {
    id: columnLabel.TOTAL_ROUNDS.key,
    align: "center",
    label: columnLabel.TOTAL_ROUNDS.label,
  },
  {
    id: columnLabel.LAST_UPDATE.key,
    align: "center",
    label: columnLabel.LAST_UPDATE.label,
  },
  {
    id: columnLabel.OPERATION.key,
    align: "left",
    label: columnLabel.OPERATION.label,
  },
];

const columnsImages = [
  {
    id: columnLabel.HASH.key,
    align: "left",
    label: columnLabel.HASH.label,
  },
  {
    id: columnLabel.ID.key,
    align: "left",
    label: columnLabel.ID.label,
  },
  {
    id: columnLabel.TRAIN_ID.key,
    align: "left",
    label: columnLabel.TRAIN_ID.label,
  },
  {
    id: columnLabel.IMAGE_TAG.key,
    align: "left",
    label: columnLabel.IMAGE_TAG.label,
  },
  {
    id: columnLabel.STATUS.key,
    align: "center",
    label: columnLabel.STATUS.label,
  },
  {
    id: columnLabel.OPERATION.key,
    align: "center",
    label: columnLabel.OPERATION.label,
  },
];

const columnsContainers = [
  {
    id: columnLabel.HASH.key,
    align: "left",
    label: columnLabel.HASH.label,
  },
  {
    id: columnLabel.ID.key,
    align: "left",
    label: columnLabel.ID.label,
  },
  {
    id: columnLabel.TRAIN_ID.key,
    align: "left",
    label: columnLabel.TRAIN_ID.label,
  },
  {
    id: columnLabel.CONTAINER_NAME.key,
    align: "left",
    label: columnLabel.CONTAINER_NAME.label,
  },
  {
    id: columnLabel.CONTAINER_IMAGE.key,
    align: "left",
    label: columnLabel.CONTAINER_IMAGE.label,
  },
  {
    id: columnLabel.CONTAINER_STATE.key,
    align: "center",
    label: columnLabel.CONTAINER_STATE.label,
  },
  {
    id: columnLabel.STATUS.key,
    align: "left",
    label: columnLabel.STATUS.label,
  },
  {
    id: columnLabel.OPERATION.key,
    align: "center",
    label: columnLabel.OPERATION.label,
  },
];

export {
  envType,
  envOptions,
  learningType,
  navLinks,
  columns,
  columnsFL,
  columnsFLJobs,
  columnsImages,
  columnsContainers,
  columnLabel,
  containerState,
  contentChangeKind,
  federatedJobStates,
  fileView,
  plotTypes,
  privacySettingOptions,
  rejectReasons,
  toolbarTitle,
  trainStates,
  resultTab,
  resultItemSupportedTypes,
};
