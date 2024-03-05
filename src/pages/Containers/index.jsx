import { useNavigate } from "react-router-dom";
import { useState, useEffect, Fragment } from "react";
import { useDispatch, useSelector } from "react-redux";
import PopupState, { bindTrigger, bindMenu } from "material-ui-popup-state";
import CircularProgress from "@mui/material/CircularProgress";
import Chip from "@mui/material/Chip";
import IconButton from "@mui/material/IconButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import Typography from "@mui/material/Typography";
import TableRow from "@mui/material/TableRow";
import TableCell from "@mui/material/TableCell";
import ChangesIcon from "@mui/icons-material/TrackChanges";
import CreatedIcon from "@mui/icons-material/CheckRounded";
import ExitIcon from "@mui/icons-material/CloseRounded";
import LogsIcon from "@mui/icons-material/Notes";
import RemoveIcon from "@mui/icons-material/DeleteOutline";
import RunningIcon from "@mui/icons-material/AutorenewRounded";
import SaveIcon from "@mui/icons-material/Save";
import StartIcon from "@mui/icons-material/PlayCircleOutlineRounded";

import {
  fetchContainers,
  startContainer,
  removeContainer,
  commitContainer,
  resetResultTab,
  showContainerLogs,
  showContainerChanges,
  setContainerLogsModal,
  setContainerChangesModal,
} from "../../redux/reducers/stationSlice";
import {
  columnLabel,
  containerState,
  columnsContainers,
} from "../../constants";
import ContainerTable from "../../components/Table";
import ContainerLogsModal from "../../components/container-logs-modal";
import ContainerChangesModal from "../../components/container-changes-modal";
import UserService from "../../services/UserService";

const Containers = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = UserService.getUsername();
  const {
    containers,
    loadingContainers,
    pendingRowOperation,
    openContainerLogsModal,
    openContainerChangesModal,
    containerResultsFetchedId,
  } = useSelector((state) => state.station);
  const [selectedContainer, setSelectedContainer] = useState(containers[0]);

  useEffect(() => {
    dispatch(fetchContainers());
  }, [dispatch]);

  const handleSaveUpdates = (container, handleClose) => {
    const payload = {
      container: container.id.slice(0, 13),
      jobId: container.jobId,
      repo: container.repo,
      tag: container.tag,
      user,
    };

    dispatch(commitContainer(payload))
      .unwrap()
      .then(() => {
        // Navigate to Images page after committing container changes
        navigate("/images");
      })
      .catch((err) => console.log(err));

    handleClose();
  };

  const handleRemoveContainer = (container, handleClose) => {
    const payload = {
      container: container.id.slice(0, 13),
      jobId: container.jobId,
      user,
    };

    dispatch(removeContainer(payload));
    handleClose();
  };

  const handleShowLogs = (container, handleClose) => {
    setSelectedContainer(container);
    dispatch(showContainerLogs({ container: container.id.slice(0, 13) }));
    handleClose();
  };

  const handleShowChanges = (container, handleClose) => {
    const payload = {
      container: container.id.slice(0, 13),
      jobId: container.jobId,
    };

    // Reset Tab state everytime modal is opened.
    // Otherwise modal is stuck on other tabs from previous interaction.
    dispatch(resetResultTab());
    setSelectedContainer(container);

    // Avoid dispatch if results already fetched for container
    if (containerResultsFetchedId !== payload.container) {
      dispatch(showContainerChanges(payload));
    } else {
      dispatch(setContainerChangesModal(true));
    }

    handleClose();
  };

  const handleStartContainer = (container, handleClose) => {
    const payload = {
      container: container.id.slice(0, 13),
      jobId: container.jobId,
      user,
    };

    dispatch(startContainer(payload));
    handleClose();
  };

  const renderContainerState = (state) => {
    let props = {
      sx: { width: 100, fontWeight: "bold" },
      color: "default",
      icon: <ExitIcon />,
    };

    if (state === containerState.CREATED) {
      props.color = "success";
      props.icon = <CreatedIcon />;
    }
    if (state === containerState.RUNNING) {
      props.color = "info";
      props.icon = <RunningIcon />;
    }

    return <Chip {...props} label={state} />;
  };

  const renderTableRows = (row, idx) => {
    return (
      <TableRow hover key={row?.id}>
        <TableCell>{idx + 1}</TableCell>
        <TableCell>{row?.id?.slice(0, 13)}</TableCell>
        <TableCell sx={{ overflowWrap: "anywhere", minWidth: 130 }}>
          <b>{row?.trainID}</b>
        </TableCell>
        <TableCell>{row?.name}</TableCell>
        <TableCell sx={{ overflowWrap: "anywhere", minWidth: 170 }}>
          {row?.image}
        </TableCell>
        <TableCell>{renderContainerState(row?.state)}</TableCell>
        <TableCell sx={{ fontWeight: 600 }}>{row?.status}</TableCell>
        <TableCell>
          {row?.loading ? (
            <CircularProgress size={35} />
          ) : (
            <PopupState
              key={row?.id}
              variant="popover"
              popupId="container-popup-menu"
            >
              {(popupState) => (
                <Fragment>
                  <IconButton
                    {...bindTrigger(popupState)}
                    disabled={
                      pendingRowOperation ||
                      row?.state === containerState.RUNNING
                    }
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

  const menuItems = (row, popupClose) => [
    {
      label: "Save Updates",
      color: "text.primary",
      icon: <SaveIcon />,
      show: row?.state === containerState.EXITED,
      onClick: () => handleSaveUpdates(row, popupClose),
    },
    {
      label: "Logs",
      color: "text.primary",
      icon: <LogsIcon />,
      show: row?.state === containerState.EXITED,
      onClick: () => handleShowLogs(row, popupClose),
    },
    {
      label: "Changes",
      color: "text.primary",
      icon: <ChangesIcon />,
      show: row?.state === containerState.EXITED,
      onClick: () => handleShowChanges(row, popupClose),
    },
    {
      label: "Start",
      color: "success.main",
      icon: <StartIcon color="success" />,
      show: row?.state === containerState.CREATED,
      onClick: () => handleStartContainer(row, popupClose),
    },
    {
      label: "Remove",
      color: "error",
      icon: <RemoveIcon color="error" />,
      onClick: () => handleRemoveContainer(row, popupClose),
      show:
        row?.state === containerState.EXITED ||
        row?.state === containerState.CREATED,
    },
  ];

  return (
    <>
      <Typography variant="h4" fontWeight="bold" my={3}>
        Containers
      </Typography>
      <ContainerTable
        rows={containers}
        columns={columnsContainers}
        orderByKey={columnLabel.HASH.key}
        renderTableRows={renderTableRows}
        loading={loadingContainers}
        emptyRowLabel={
          <>
            No data available in table for <b>containers</b>
          </>
        }
      />
      <ContainerLogsModal
        open={openContainerLogsModal}
        handleClose={() => dispatch(setContainerLogsModal(false))}
        selectedContainer={selectedContainer}
      />
      <ContainerChangesModal
        open={openContainerChangesModal}
        handleClose={() => dispatch(setContainerChangesModal(false))}
        selectedContainer={selectedContainer}
      />
    </>
  );
};

export default Containers;
