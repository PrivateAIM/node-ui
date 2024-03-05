import { useEffect, useState, Fragment } from "react";
import { useDispatch, useSelector } from "react-redux";
import PopupState, { bindTrigger, bindMenu } from "material-ui-popup-state";
import Chip from "@mui/material/Chip";
import CircularProgress from "@mui/material/CircularProgress";
import IconButton from "@mui/material/IconButton";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import TableRow from "@mui/material/TableRow";
import TableCell from "@mui/material/TableCell";
import Typography from "@mui/material/Typography";
import CreatedIcon from "@mui/icons-material/CheckRounded";
import ExitIcon from "@mui/icons-material/CloseRounded";
import ListItemIcon from "@mui/material/ListItemIcon";
import LogsIcon from "@mui/icons-material/Notes";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import RemoveIcon from "@mui/icons-material/DeleteOutline";
import ResultIcon from "@mui/icons-material/DownloadRounded";

import { HtmlTooltip } from "../../components/Tooltip";
import FederatedJobsTable from "../../components/Table";
import FederatedLogsModal from "../../components/federated-logs-modal";
import FederatedResultsModal from "../../components/federated-results-modal";
import {
  fetchJobUpdates,
  fetchFederatedJobs,
  resetFederatedLogs,
  approveFederatedJob,
  removeFederatedJob,
  cancelFederatedJob,
  showFederatedJobResults,
  resetResultTab,
} from "../../redux/reducers/federatedSlice";
import {
  columnLabel,
  columnsFLJobs,
  federatedJobStates,
} from "../../constants";

const FederatedJobs = () => {
  const dispatch = useDispatch();
  const {
    lastUpdateId,
    federatedJobs,
    fetchNewUpdates,
    pendingRowOperation,
    loadingFederatedJobs,
  } = useSelector((state) => state.federated);
  const [openLogs, setOpenLogs] = useState(false);
  const [openResults, setOpenResults] = useState(false);
  const [updatesPromise, setUpdatesPromise] = useState(null);
  const [selectedJob, setSelectedJob] = useState(federatedJobs[0]);

  useEffect(() => {
    dispatch(fetchFederatedJobs());
  }, [dispatch]);

  // Hook for fetching job updates
  useEffect(() => {
    if (fetchNewUpdates) {
      setUpdatesPromise(dispatch(fetchJobUpdates({ updateId: lastUpdateId })));
    }

    return () => {
      if (updatesPromise) {
        updatesPromise.abort();
      }
    };
  }, [dispatch, lastUpdateId, fetchNewUpdates, updatesPromise]);

  const renderJobStatus = (state) => {
    const label = state.replace(/_/g, " ").toLowerCase();

    let props = {
      sx: { width: 160, fontWeight: "bold" },
      color: federatedJobStates[state].color || "default",
    };

    return (
      <HtmlTooltip title={federatedJobStates[state].info}>
        <Chip {...props} label={label} />
      </HtmlTooltip>
    );
  };

  const handleShowLogs = (job, handleClose) => {
    setSelectedJob(job);
    dispatch(resetFederatedLogs());
    setOpenLogs(true);
    handleClose();
  };

  const handleShowResults = (job, handleClose) => {
    // Reset Tab state everytime modal is opened.
    // Otherwise modal is stuck on other tabs from previous interaction.
    dispatch(resetResultTab());

    setSelectedJob(job);
    dispatch(showFederatedJobResults(job));
    setOpenResults(true);
    handleClose();
  };

  const handleRemoveFLJob = (job, handleClose) => {
    dispatch(removeFederatedJob(job.jobID));
    handleClose();
  };

  const handleCancelFLJob = (job, handleClose) => {
    dispatch(cancelFederatedJob(job.jobID));
    handleClose();
  };

  const handleApproveFLJob = (job, handleClose) => {
    dispatch(approveFederatedJob(job.jobID));
    handleClose();
  };

  const menuItems = (row, popupClose) => [
    {
      label: "Approve",
      color: "success.main",
      icon: <CreatedIcon color="success" />,
      disabled: row?.status === federatedJobStates.WAITING_FOR_INSPECTION.title,
      show: [
        federatedJobStates.WAITING_FOR_APPROVAL.title,
        federatedJobStates.WAITING_FOR_INSPECTION.title,
      ].includes(row?.status),
      onClick: () => handleApproveFLJob(row, popupClose),
    },
    {
      label: "Results",
      icon: <ResultIcon />,
      show: true,
      onClick: () => handleShowResults(row, popupClose),
    },
    {
      label: "Logs",
      color: "info.main",
      icon: <LogsIcon color="info" />,
      show: true,
      onClick: () => handleShowLogs(row, popupClose),
    },
    {
      label: "Cancel",
      color: "error",
      icon: <ExitIcon color="error" />,
      show: ![
        federatedJobStates.ERROR.title,
        federatedJobStates.FINISHED.title,
        federatedJobStates.CANCELED.title,
      ].includes(row?.status),
      onClick: () => handleCancelFLJob(row, popupClose),
    },
    {
      label: "Remove",
      color: "error",
      icon: <RemoveIcon color="error" />,
      show: [
        federatedJobStates.ERROR.title,
        federatedJobStates.FINISHED.title,
        federatedJobStates.CANCELED.title,
      ].includes(row?.status),
      onClick: () => handleRemoveFLJob(row, popupClose),
    },
  ];

  const renderTableRows = (row, idx) => {
    return (
      <TableRow hover key={row?.id}>
        <TableCell>{idx + 1}</TableCell>
        <TableCell sx={{ overflowWrap: "anywhere", minWidth: 250 }}>
          <b>{row?.learningImage}</b>
        </TableCell>
        <TableCell>{row?.jobID}</TableCell>
        <TableCell>{row?.pid}</TableCell>
        <TableCell>{renderJobStatus(row?.status)}</TableCell>
        <TableCell align="center">
          <b>{row?.currentRound}</b>
        </TableCell>
        <TableCell align="center">
          <b>{row?.totalRounds}</b>
        </TableCell>
        <TableCell>{new Date(row?.lastUpdate).toLocaleString("de")}</TableCell>
        <TableCell>
          {row?.loading ? (
            <CircularProgress size={35} />
          ) : (
            <PopupState
              key={row?.id}
              variant="popover"
              popupId="federated-job-popup-menu"
            >
              {(popupState) => (
                <Fragment>
                  <IconButton
                    {...bindTrigger(popupState)}
                    disabled={pendingRowOperation}
                  >
                    <MoreVertIcon />
                  </IconButton>
                  <Menu {...bindMenu(popupState)}>
                    {menuItems(row, popupState.close).map(
                      (item) =>
                        item.show && (
                          <MenuItem
                            key={`${row?.id}-${item.label}`}
                            onClick={item.onClick}
                            disabled={item.disabled}
                          >
                            <ListItemIcon>{item.icon}</ListItemIcon>
                            <Typography color={item.color}>
                              {item.label}
                            </Typography>
                          </MenuItem>
                        )
                    )}
                  </Menu>
                </Fragment>
              )}
            </PopupState>
          )}
        </TableCell>
      </TableRow>
    );
  };

  return (
    <>
      <Typography variant="h4" fontWeight="bold" my={3}>
        Federated Jobs
      </Typography>
      <FederatedJobsTable
        rows={federatedJobs}
        columns={columnsFLJobs}
        orderAsc={false}
        orderByKey={columnLabel.LAST_UPDATE.key}
        renderTableRows={renderTableRows}
        loading={loadingFederatedJobs}
        emptyRowLabel={
          <>
            No data available in table for <b>federated</b> jobs
          </>
        }
      />
      <FederatedLogsModal
        open={openLogs}
        handleClose={() => setOpenLogs(false)}
        selectedJob={selectedJob}
      />
      <FederatedResultsModal
        open={openResults}
        handleClose={() => setOpenResults(false)}
        selectedJob={selectedJob}
      />
    </>
  );
};

export default FederatedJobs;
