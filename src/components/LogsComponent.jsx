import { useEffect } from "react";
import { grey } from "@mui/material/colors";
import TextField from "@mui/material/TextField";

const LogsComponent = ({ logs, jobID }) => {
  useEffect(() => {
    const logsElement = document.getElementById(`image-pull-logs-${jobID}`);
    if (logsElement) logsElement.scrollTop = logsElement?.scrollHeight;
  }, [logs, jobID]);

  return (
    <TextField
      id={`image-pull-logs-${jobID}`}
      rows={10}
      multiline
      fullWidth
      value={logs}
      InputProps={{ readOnly: true }}
      sx={{
        padding: 2,
        ".MuiInputBase-root": {
          fontFamily: "monospace",
          fontSize: "14px",
          bgcolor: grey[100],
        },
      }}
    />
  );
};

export default LogsComponent;
