import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Typography from "@mui/material/Typography";
import CircularProgress from "@mui/material/CircularProgress";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import Select from "@mui/material/Select";
import TextField from "@mui/material/TextField";

import StyledButton from "../Button";
import StyledDialogTitle from "../DialogTitle";
import { rejectReasons } from "../../constants";
import { showAlert } from "../../redux/reducers/alertSlice";
import { rejectTrainRequest } from "../../redux/reducers/stationSlice";
import UserService from "../../services/UserService";

const TrainRejectModal = ({ open, handleClose, selectedTrain }) => {
  const dispatch = useDispatch();
  const { pendingRejection, learning } = useSelector(
    (state) => state.station
  );
  const [reason, setReason] = useState("1");
  const [comment, setComment] = useState("");

  const handleChange = (event) => {
    setReason(event.target.value);
  };

  const handleRejectTrain = () => {
    if (reason === rejectReasons.OTHER_REASONS.key && !comment) {
      dispatch(
        showAlert({
          message: "Please enter a reason for rejection.",
          options: {
            key: "rejectionRequiredComment",
            variant: "error",
          },
        })
      );
      return;
    }

    dispatch(
      rejectTrainRequest({
        reason,
        comment,
        jobid: selectedTrain.jobID,
        mode: learning,
        user: UserService.getUsername(),
      })
    ).then(() => {
      setReason("1");
      setComment("");
    });
  };

  return (
    <Dialog fullWidth maxWidth="sm" open={open}>
      <StyledDialogTitle disable={pendingRejection} onClose={handleClose}>
        Train Reject
      </StyledDialogTitle>
      <DialogContent dividers>
        <Typography gutterBottom align="center" mb={4}>
          Job Id: <b>{selectedTrain?.jobID}</b>
        </Typography>
        <FormControl fullWidth disabled={pendingRejection}>
          <InputLabel id="reject-reason-label">Reason</InputLabel>
          <Select
            labelId="reject-reason-label"
            id="reject-reason"
            value={reason}
            label="Reason"
            onChange={handleChange}
          >
            {Object.values(rejectReasons).map((rs) => (
              <MenuItem key={rs.key} value={rs.key}>
                {rs.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        {reason === rejectReasons.OTHER_REASONS.key && (
          <TextField
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            name="comment"
            margin="normal"
            placeholder="Enter comments here..."
            disabled={pendingRejection}
            multiline
            fullWidth
            required
            rows={5}
          />
        )}
      </DialogContent>
      <DialogActions>
        <StyledButton
          disabled={pendingRejection}
          variant="contained"
          onClick={handleRejectTrain}
        >
          {pendingRejection ? (
            <CircularProgress size={25} thickness={5} />
          ) : (
            "Reject"
          )}
        </StyledButton>
      </DialogActions>
    </Dialog>
  );
};

export default TrainRejectModal;
