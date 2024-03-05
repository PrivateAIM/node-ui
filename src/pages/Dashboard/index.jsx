import { useState, useEffect, Fragment } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import IconButton from "@mui/material/IconButton";
import Collapse from "@mui/material/Collapse";
import Stack from "@mui/material/Stack";
import TableRow from "@mui/material/TableRow";
import TableCell from "@mui/material/TableCell";
import Typography from "@mui/material/Typography";
import RejectIcon from "@mui/icons-material/DoDisturbAltRounded";
import PullIcon from "@mui/icons-material/DownloadRounded";
import AcceptIcon from "@mui/icons-material/CheckCircleOutlineRounded";
import HighlightOffIcon from '@mui/icons-material/HighlightOff';
import VerifiedIcon from '@mui/icons-material/Verified';
import WarningIcon from '@mui/icons-material/Warning';

import {
  fetchTrains,
  fetchImages,
  fetchFederatedContainerConfig,
  fetchContainers,
  setRejectModal,
  setContainerModal,
  pullIncrementalImage,
  pullFederatedImage,
} from "../../redux/reducers/stationSlice";
import { fetchFederatedJobs } from "../../redux/reducers/federatedSlice";
import RequestedTrainsTable from "../../components/Table";
import TrainRejectModal from "../../components/train-reject-modal";
import CreateFederatedContainerModal from "../../components/create-container-modal";
import LinearProgress from "../../components/LinearProgress";
import LogsComponent from "../../components/LogsComponent";
import { HtmlTooltip } from "../../components/Tooltip";
import { columnLabel, learningType, columns, columnsFL } from "../../constants";
import UserService from "../../services/UserService";

export default function Dashboard() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { trains, loading, learning, openRejectModal, openContainerModal } =
    useSelector((state) => state.station);
  const [selectedTrain, setSelectedTrain] = useState(trains[0]);
  const isIncremental = learning === learningType.INCREMENTAL;

  useEffect(() => {
    dispatch(fetchTrains());
    if (isIncremental) {
      dispatch(fetchImages());
      dispatch(fetchContainers());
    } else {
      dispatch(fetchFederatedJobs());
    }
  }, [dispatch, learning, isIncremental]);

  const handlePullIncrementalImage = (row) => (_) => {
    const payload = {
      jobid: row.jobID,
      trainstoragelocation: row.location,
      trainclassid: row.trainID,
      currentstation: row.current,
      nextstation: row.next,
      user: UserService.getUsername(),
    };

    dispatch(pullIncrementalImage(payload))
      .unwrap()
      .then(() => {
        navigate("/images");
      })
      .catch((err) => console.log(err));
  };

  const handlePullFederatedImage = (row) => (_) => {
    const payload = {
      jobid: row.jobID,
      learningstoragelocation: row.learningImage,
      trainclassidlearning: row.trainClassIdLearning,
      currentround: row.currentRound.toString(),
      maxrounds: row.learningRounds.toString(),
      pid: row.pid,
    };

    setSelectedTrain(row);
    dispatch(pullFederatedImage(payload))
      .unwrap()
      .then(() => {
        // Fetch federated container config when image is pulled
        dispatch(fetchFederatedContainerConfig(payload));
      })
      .catch((err) => console.log(err));
  };

  const renderImageVerificationStatus = (imageVerificationStatus) => {
    if (imageVerificationStatus === 'COSIGN_VERIFIED') {
      return (
        <HtmlTooltip title="Image signature successfully verified.">
          <VerifiedIcon color="success" />
        </HtmlTooltip>
      )
    } else if (imageVerificationStatus === 'COSIGN_UNVERIFIED') {
      return (
        <HtmlTooltip title="Image signature verification failed. Be very careful before proceeding to run as it cannot be guaranteed this train has not been altered.">
          <HighlightOffIcon color="error" />
        </HtmlTooltip>
      )
    } else {
      return (
        <HtmlTooltip title="Image signature verification is not enabled for your station. This poses a safety risk, only proceed if you are sure the train has not been altered.">
          <WarningIcon color="warning" />
        </HtmlTooltip>
      )
    }
  }

  const renderTableRows = (row) => (
    <Fragment key={row.id}>
      <TableRow hover>
        <TableCell>{row.id}</TableCell>
        {isIncremental ? (
          <Fragment>
            <TableCell>
              <Stack spacing={1}>
                <b>{row.trainID}</b>
                {row.open && (
                  <>
                    <b>{`(${row.completedLayers}/${row.totalLayers}) layers download completed`}</b>
                    <LinearProgress value={row.progress} />
                  </>
                )}
              </Stack>
            </TableCell>
            <TableCell>{row.location}</TableCell>
            <TableCell>{row.pid}</TableCell>
            <TableCell>{row.current}</TableCell>
            <TableCell>{row.next}</TableCell>
          </Fragment>
        ) : (
          <Fragment>
            <TableCell>
              <Stack spacing={1}>
                <b>{row.learningImage}</b>
                {row.open && (
                  <>
                    <b>{`(${row.completedLayers}/${row.totalLayers}) layers download completed`}</b>
                    <LinearProgress value={row.progress} />
                  </>
                )}
              </Stack>
            </TableCell>
            <TableCell>
              {renderImageVerificationStatus(row.verified)}
            </TableCell>
            <TableCell>{row.jobID}</TableCell>
            <TableCell>{row.pid}</TableCell>
            <TableCell>{row.learningRounds}</TableCell>
          </Fragment>
        )}
        <TableCell>
          <HtmlTooltip title="Reject">
            <span>
              <IconButton
                disabled={row.open}
                color="error"
                onClick={() => {
                  setSelectedTrain(row);
                  dispatch(setRejectModal(true));
                }}
              >
                <RejectIcon />
              </IconButton>
            </span>
          </HtmlTooltip>
          {isIncremental ? (
            <HtmlTooltip title="Pull Image">
              <span>
                <IconButton
                  disabled={row.open}
                  color="info"
                  onClick={handlePullIncrementalImage(row)}
                >
                  <PullIcon />
                </IconButton>
              </span>
            </HtmlTooltip>
          ) : (
            <HtmlTooltip title="Accept Job">
              <span>
                <IconButton
                  disabled={row.open}
                  color="info"
                  onClick={handlePullFederatedImage(row)}
                >
                  <AcceptIcon />
                </IconButton>
              </span>
            </HtmlTooltip>
          )}
        </TableCell>
      </TableRow>
      <TableRow>
        <TableCell
          style={{ paddingBottom: 0, paddingTop: 0 }}
          colSpan={isIncremental ? columns.length : columnsFL.length}
        >
          <Collapse in={row.open} timeout="auto" unmountOnExit>
            <LogsComponent logs={row.logs} jobID={row.jobID} />
          </Collapse>
        </TableCell>
      </TableRow>
    </Fragment>
  );

  return (
    <>
      <Typography variant="h4" fontWeight="bold" my={3}>
        Dashboard
      </Typography>
      <RequestedTrainsTable
        rows={trains}
        columns={isIncremental ? columns : columnsFL}
        orderByKey={columnLabel.ID.key}
        renderTableRows={renderTableRows}
        loading={loading}
        emptyRowLabel={
          <>
            No data available in table for <b>{learning}</b> learning
          </>
        }
      />
      <TrainRejectModal
        open={openRejectModal}
        handleClose={() => dispatch(setRejectModal(false))}
        selectedTrain={selectedTrain}
      />
      <CreateFederatedContainerModal
        open={openContainerModal}
        handleClose={() => dispatch(setContainerModal(false))}
        rowSelected={selectedTrain}
        incremental={false}
      />
    </>
  );
}
