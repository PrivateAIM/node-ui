import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import Alert from "@mui/material/Alert";
import Button from "@mui/material/Button";
import Container from "@mui/material/Container";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import DownloadIcon from "@mui/icons-material/CloudDownloadRounded";
import SkipIcon from "@mui/icons-material/NavigateNext";

import { HtmlTooltip } from "../../components/Tooltip";

const InitializeComplete = () => {
  const navigate = useNavigate();
  const vault = useSelector((state) => state.station.vault);

  const downloadVaultKeys = () => {
    const dateStr = new Date().toISOString();
    const keys = JSON.stringify(vault.vaultKeys, null, 2);
    const blob = new Blob([keys], { type: "application/json" });
    const href = URL.createObjectURL(blob);
    const filename = `vault-${dateStr.replaceAll(":", "_")}.json`;

    let element = document.createElement("a");
    element.setAttribute("href", href);
    element.setAttribute("download", filename);
    element.setAttribute("target", "_blank");
    element.click();

    // Release object to prevent memory leak
    URL.revokeObjectURL(href);

    // Reload page to trigger Protected routing in App.js
    localStorage.setItem("vaultKeysDownloaded", true);
    navigate("/vault/unseal");
  };

  const handleSkipStep = () => {
    // Reload page to trigger Protected routing in App.js
    localStorage.setItem("vaultKeysDownloaded", true);
    window.location.reload();
  };

  return (
    <Container maxWidth="md">
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" fontWeight="bold" align="center" mb={2}>
          Vault has been initialized
        </Typography>
        <Alert severity="warning">
          <b>IMPORTANT</b>: You will not be redirected to this page later.
          Please download the keys now and store them safely.
        </Alert>
        <Typography my={2}>
          Please securely distribute the keys below. When the Vault is
          re-sealed, restarted, or stopped, you must provide at least{" "}
          <b>{vault.keyThreshold || "NaN"}</b> of these keys to unseal it again.
          Vault does not store the master key. Without at least{" "}
          <b>{vault.keyThreshold || "NaN"}</b> keys, your Vault will remain
          permanently sealed.
        </Typography>
        <Stack alignItems="center" spacing={2}>
          <Button
            variant="contained"
            sx={{ fontWeight: "bold" }}
            startIcon={<DownloadIcon />}
            onClick={downloadVaultKeys}
          >
            Download Keys
          </Button>
          <b>OR</b>
          <HtmlTooltip title="If you already have the keys, you can skip this part">
            <Button
              variant="outlined"
              sx={{ fontWeight: "bold" }}
              startIcon={<SkipIcon />}
              onClick={handleSkipStep}
            >
              Skip this step
            </Button>
          </HtmlTooltip>
        </Stack>
      </Paper>
    </Container>
  );
};

export default InitializeComplete;
