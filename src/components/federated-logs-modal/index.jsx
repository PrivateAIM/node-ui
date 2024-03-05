import { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { grey } from "@mui/material/colors";
import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import Typography from "@mui/material/Typography";
import CircularProgress from "@mui/material/CircularProgress";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";

import StyledDialogTitle from "../DialogTitle";
import { showFederatedLogs } from "../../redux/reducers/federatedSlice";
import { federatedJobStates } from "../../constants";

const FederatedLogsModal = ({ open, handleClose, selectedJob }) => {
  const dispatch = useDispatch();
  const federatedJobID = selectedJob?.jobID;
  const federatedJobStatus = selectedJob?.status;
  const logsElementID = `federated-logs-${federatedJobID}`;
  const [logsPromise, setLogsPromise] = useState(null);
  const { federatedLogs, loadingFederatedLogs, lastLogId } = useSelector(
    (state) => state.federated
  );

  useEffect(() => {
    /**
     * If modal opened and logs request was fulfilled
     * i.e. loadingFederatedLogs=false, dispatch logs request for federated.
     * Also check if job is not in error, finished or canceled state or lastLogId is 0, if so, dispatch logs request.
     */
    if (open && !loadingFederatedLogs) {
      if (![
        federatedJobStates.ERROR.title,
        federatedJobStates.FINISHED.title,
        federatedJobStates.CANCELED.title,
      ].includes(federatedJobStatus) || lastLogId === 0) {
        const promise = dispatch(
          showFederatedLogs({
            jobId: federatedJobID,
            logId: lastLogId,
          })
        );
        setLogsPromise(promise);

        // When promise resolves, scroll to the bottom of logs.
        promise.then(() => {
          const logsElement = document.getElementById(logsElementID);
          if (logsElement) logsElement.scrollTop = logsElement?.scrollHeight;
        });
      }
    }
  }, [dispatch, open, lastLogId, loadingFederatedLogs, logsElementID, federatedJobID, federatedJobStatus]);

  const handleCloseModal = () => {
    // Perform cleanup and abort() any log requests when modal is closed.
    if (logsPromise) {
      logsPromise.abort();
    }
    handleClose();
  };

  return (
    <Dialog fullWidth maxWidth="md" open={open}>
      <StyledDialogTitle onClose={handleCloseModal}>
        Federated Logs
      </StyledDialogTitle>
      <DialogContent dividers>
        <Stack
          spacing={1}
          sx={{ p: 2, bgcolor: grey[100], borderRadius: 2, mb: 2 }}
        >
          <Typography>
            <b>Job ID: </b>
            {federatedJobID}
          </Typography>
          <Typography>
            <b>Learning Image: </b>
            {selectedJob?.learningImage}
          </Typography>
        </Stack>
        <TextField
          rows={23}
          multiline
          fullWidth
          id={logsElementID}
          value={federatedLogs.join("\n")}
          InputProps={{
            readOnly: true,
            endAdornment: loadingFederatedLogs && (
              <CircularProgress
                size={30}
                sx={{ position: "absolute", top: 10, right: 35 }}
              />
            ),
          }}
          sx={{
            position: "relative",
            ".MuiInputBase-root": {
              fontFamily: "monospace",
              fontSize: "14px",
              bgcolor: grey[100],
            },
          }}
        />
      </DialogContent>
    </Dialog>
  );
};

export default FederatedLogsModal;
