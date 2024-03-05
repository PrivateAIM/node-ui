import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import Chip from "@mui/material/Chip";
import CircularProgress from "@mui/material/CircularProgress";
import IconButton from "@mui/material/IconButton";
import PushIcon from "@mui/icons-material/Publish";
import Stack from "@mui/material/Stack";
import TableRow from "@mui/material/TableRow";
import TableCell from "@mui/material/TableCell";
import Typography from "@mui/material/Typography";
import CreateIcon from "@mui/icons-material/AddCircleOutline";
import DecryptIcon from "@mui/icons-material/LockOpen";
import DeleteIcon from "@mui/icons-material/Delete";

import ImagesTable from "../../components/Table";
import { HtmlTooltip } from "../../components/Tooltip";
import { columnLabel, columnsImages, trainStates } from "../../constants";
import CreateIncrementalContainerModal from "../../components/create-container-modal";
import {
  pushImage,
  fetchImages,
  deleteImage,
  decryptImage,
  setContainerModal,
  fetchIncrementalContainerConfig,
} from "../../redux/reducers/stationSlice";
import UserService from "../../services/UserService";

const Images = () => {
  const dispatch = useDispatch();
  const user = UserService.getUsername();
  const { images, loadingImages, pendingRowOperation, openContainerModal } =
    useSelector((state) => state.station);
  const [imageSelected, setImageSelected] = useState(images[0]);

  useEffect(() => {
    dispatch(fetchImages());
  }, [dispatch]);

  const renderCurrentStatus = (status) => {
    const label = status.replace(/_/g, " ");
    let props = {
      sx: { width: 100, fontWeight: "bold" },
      color: "warning",
    };

    if (status === trainStates.PULLED) props.color = "info";

    return status === trainStates.WAITING_TO_PUSH ? (
      <HtmlTooltip title={label}>
        <Chip {...props} label={label} />
      </HtmlTooltip>
    ) : (
      <Chip {...props} label={label} />
    );
  };

  const handleDecryptImage = (row) => () => {
    const payload = {
      id: row?.id,
      jobId: row?.jobID,
      image: row?.imageTag,
    };

    dispatch(decryptImage(payload))
      .unwrap()
      .then(() => {
        dispatch(fetchImages());
      })
      .catch((err) => console.log(err));
  };

  const handleDeleteImage = (row) => () => {
    const payload = {
      user,
      id: row?.id,
      jobId: row?.jobID,
      image: row?.imageTag,
    };

    dispatch(deleteImage(payload));
  };

  const handlePushImage = (row) => () => {
    const payload = {
      user,
      id: row?.id,
      jobId: row?.jobID,
      image: row?.imageTag,
    };

    dispatch(pushImage(payload));
  };

  const handleCreateContainer = (row) => () => {
    const payload = {
      id: row?.id,
      jobId: row?.jobID,
      image: row?.imageTag,
      labels: JSON.stringify(row?.labels),
    };

    setImageSelected(row);
    dispatch(fetchIncrementalContainerConfig(payload));
  };

  const renderTableRows = (row, idx) => (
    <TableRow hover key={row?.id}>
      <TableCell>{idx + 1}</TableCell>
      <TableCell sx={{ overflowWrap: "anywhere", minWidth: 150 }}>
        {row?.id}
      </TableCell>
      <TableCell>
        <b>{row?.trainID}</b> <br />
      </TableCell>
      <TableCell>{row?.imageTag}</TableCell>
      <TableCell>
        <Stack alignItems="center" spacing={1}>
          {renderCurrentStatus(row?.status)}
          {row?.labels?.decrypted && (
            <Stack direction="row" alignItems="center" spacing={0.5}>
              <DecryptIcon sx={{ fontSize: "17px" }} color="success" />
              <Typography
                variant="caption"
                sx={{ color: "green", fontWeight: "bold" }}
              >
                Decrypted
              </Typography>
            </Stack>
          )}
        </Stack>
      </TableCell>
      <TableCell align="center">
        {row?.loading ? (
          <CircularProgress size={35} />
        ) : (
          <>
            {row?.status === trainStates.WAITING_TO_PUSH ? (
              <HtmlTooltip title="Push Image">
                <span>
                  <IconButton
                    color="info"
                    disabled={pendingRowOperation}
                    onClick={handlePushImage(row)}
                  >
                    <PushIcon />
                  </IconButton>
                </span>
              </HtmlTooltip>
            ) : row?.labels?.decrypted ? (
              <HtmlTooltip title="Create Container">
                <span>
                  <IconButton
                    color="info"
                    disabled={pendingRowOperation}
                    onClick={handleCreateContainer(row)}
                  >
                    <CreateIcon />
                  </IconButton>
                </span>
              </HtmlTooltip>
            ) : (
              <HtmlTooltip title="Decrypt">
                <span>
                  <IconButton
                    color="warning"
                    disabled={pendingRowOperation}
                    onClick={handleDecryptImage(row)}
                  >
                    <DecryptIcon />
                  </IconButton>
                </span>
              </HtmlTooltip>
            )}
            <HtmlTooltip title="Delete Image">
              <span>
                <IconButton
                  color="error"
                  disabled={pendingRowOperation}
                  onClick={handleDeleteImage(row)}
                >
                  <DeleteIcon />
                </IconButton>
              </span>
            </HtmlTooltip>
          </>
        )}
      </TableCell>
    </TableRow>
  );

  return (
    <>
      <Typography variant="h4" fontWeight="bold" my={3}>
        Images
      </Typography>
      <ImagesTable
        rows={images}
        columns={columnsImages}
        orderByKey={columnLabel.HASH.key}
        renderTableRows={renderTableRows}
        loading={loadingImages}
        emptyRowLabel={
          <>
            No data available in table for <b>pulled & push images</b>
          </>
        }
      />
      <CreateIncrementalContainerModal
        open={openContainerModal}
        handleClose={() => dispatch(setContainerModal(false))}
        rowSelected={imageSelected}
      />
    </>
  );
};

export default Images;
