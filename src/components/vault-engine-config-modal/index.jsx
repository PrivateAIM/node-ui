import { useSelector } from "react-redux";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import CancelIcon from "@mui/icons-material/Cancel";
import CheckIcon from "@mui/icons-material/CheckCircle";

import { getKVEngineConfig } from "../../redux/reducers/stationSlice";

const VaultKVEngineConfigModal = ({ open, handleClose }) => {
  const _config = useSelector(getKVEngineConfig);

  const engineConfig = {
    Version: _config?.options?.version,
    "Secret Engine Type": _config?.type,
    Path: _config?.path,
    Description: _config?.description,
    Accessor: _config?.accessor,
    Local: _config?.local ? (
      <CheckIcon fontSize="small" />
    ) : (
      <CancelIcon fontSize="small" />
    ),
    "Seal Wrap": _config?.seal_wrap ? (
      <CheckIcon fontSize="small" />
    ) : (
      <CancelIcon fontSize="small" />
    ),
    "Default Lease TTL": _config?.config?.default_lease_ttl,
    "Max Lease TTL": _config?.config?.max_lease_ttl,
    "Request Keys Excluded from HMACing in Audit": "",
    "Response Keys Excluded from HMACing in Audit": "",
    "Allowed Passthrough Request Headers": "",
  };

  return (
    <Dialog fullWidth maxWidth="sm" open={open} onClose={handleClose}>
      <DialogTitle fontWeight="bold">
        Configuration: {engineConfig.Path}
      </DialogTitle>
      <DialogContent>
        <TableContainer
          component={Paper}
          elevation={0}
          sx={{ border: "1px solid gainsboro" }}
        >
          <Table size="small">
            <TableBody>
              {Object.entries(engineConfig).map(([_key, value], idx) => (
                <TableRow
                  key={idx}
                  sx={({ palette }) => ({
                    "&:nth-of-type(odd)": {
                      bgcolor: palette.action.hover,
                    },
                  })}
                >
                  <TableCell component="th" scope="row">
                    <b>{_key}</b>
                  </TableCell>
                  <TableCell>{value || "-"}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </DialogContent>
    </Dialog>
  );
};

export default VaultKVEngineConfigModal;
