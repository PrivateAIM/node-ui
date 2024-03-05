import { useSelector } from "react-redux";
import { grey } from "@mui/material/colors";
import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import Typography from "@mui/material/Typography";
import CircularProgress from "@mui/material/CircularProgress";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import StyledDialogTitle from "../DialogTitle";

const ContainerLogsModal = ({ open, handleClose, selectedContainer }) => {
  const { containerLogs, loadingContainerLogs } = useSelector(
    (state) => state.station
  );

  return (
    <Dialog fullWidth maxWidth="md" open={open}>
      <StyledDialogTitle disable={loadingContainerLogs} onClose={handleClose}>
        Container Logs
      </StyledDialogTitle>
      <DialogContent dividers>
        <Stack
          spacing={1}
          sx={{ p: 2, bgcolor: grey[100], borderRadius: 2, mb: 2 }}
        >
          <Typography>
            <b>Container ID: </b>
            {selectedContainer?.id}
          </Typography>
          <Typography>
            <b>Learning Image: </b>
            {selectedContainer?.image}
          </Typography>
        </Stack>
        <TextField
          rows={23}
          multiline
          fullWidth
          value={containerLogs}
          InputProps={{
            readOnly: true,
            endAdornment: loadingContainerLogs && (
              <CircularProgress
                sx={{ position: "absolute", top: "45%", right: "45%" }}
              />
            ),
          }}
          sx={{
            position: "relative",
            ".MuiInputBase-root": {
              fontFamily: "Menlo, monospace",
              fontSize: "14px",
              bgcolor: grey[100],
            },
          }}
        />
      </DialogContent>
    </Dialog>
  );
};

export default ContainerLogsModal;
