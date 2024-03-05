import { useState } from "react";
import { useDispatch } from "react-redux";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import InputAdornment from "@mui/material/InputAdornment";
import MenuItem from "@mui/material/MenuItem";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import InfoIcon from "@mui/icons-material/InfoOutlined";

import StyledDialogTitle from "../DialogTitle";
import { HtmlTooltip } from "../Tooltip";
import { enableKVEngine } from "../../redux/reducers/stationSlice";

const VaultEnableEngineModal = ({ open, handleClose }) => {
  const dispatch = useDispatch();
  const [engine, setEngine] = useState({
    path: "",
    version: "1",
  });

  const handleChange = (evt) => {
    const { name, value } = evt.target;
    setEngine((prev) => ({ ...prev, [name]: value }));
  };

  const handleEnableEngine = () => {
    if (!engine.path) {
      alert("Path is required");
      return;
    }

    dispatch(enableKVEngine({ ...engine })).then(() => {
      handleClose();
    });
  };

  return (
    <Dialog fullWidth maxWidth="xs" open={open}>
      <StyledDialogTitle onClose={handleClose}>
        Enable New KV Engine
      </StyledDialogTitle>
      <DialogContent dividers>
        <Stack mt={2} spacing={2}>
          <TextField
            fullWidth
            size="small"
            label="Path"
            name="path"
            onKeyDown={(evt) => {
              if (evt.key === "Enter") handleEnableEngine();
            }}
            onChange={handleChange}
            value={engine.path}
          />
          <TextField
            select
            fullWidth
            size="small"
            label="Version"
            name="version"
            value={engine.version}
            InputProps={{
              endAdornment: (
                <InputAdornment position="start" sx={{ mr: 2 }}>
                  <HtmlTooltip
                    title="The KV Secrets Engine can operate in different modes.
                    Version 1 is the original Generic Secrets Engine that allows
                    for storing of static key/value pairs. Version 2 added more 
                    features including data versioning, TTLs, and check/set."
                    placement="right"
                  >
                    <InfoIcon />
                  </HtmlTooltip>
                </InputAdornment>
              ),
            }}
          >
            <MenuItem value="1">1</MenuItem>
            <MenuItem value="2" disabled>
              2 (still in development)
            </MenuItem>
          </TextField>
          <Button
            variant="contained"
            sx={{ fontWeight: "bold" }}
            onClick={handleEnableEngine}
          >
            Enable Engine
          </Button>
        </Stack>
      </DialogContent>
    </Dialog>
  );
};

export default VaultEnableEngineModal;
