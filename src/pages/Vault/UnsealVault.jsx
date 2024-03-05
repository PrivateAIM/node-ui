import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import Alert from "@mui/material/Alert";
import AlertTitle from "@mui/material/AlertTitle";
import Button from "@mui/material/Button";
import Container from "@mui/material/Container";
import CircularProgress from "@mui/material/CircularProgress";
import Grid from "@mui/material/Grid";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import IconButton from "@mui/material/IconButton";
import InputAdornment from "@mui/material/InputAdornment";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";

import {
  unsealVault,
  fetchVaultUnsealStatus,
} from "../../redux/reducers/stationSlice";
import LinearProgress from "../../components/LinearProgress";

const UnsealVault = () => {
  const dispatch = useDispatch();
  const [showKey, setShowKey] = useState(false);
  const [masterKey, setMasterKey] = useState("");
  const { vault, pendingVaultUnseal } = useSelector((state) => state.station);

  useEffect(() => {
    dispatch(fetchVaultUnsealStatus());
  }, [dispatch]);

  const handleClickShowKey = () => setShowKey((show) => !show);

  const handleUnsealVault = () => {
    dispatch(unsealVault({ key: masterKey })).then(() => {
      setMasterKey("");
    });
  };

  return (
    <Container maxWidth="md">
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" fontWeight="bold" align="center" mb={2}>
          Unseal Vault
        </Typography>
        <Alert severity="warning">
          <AlertTitle>
            <b>Vault is sealed</b>
          </AlertTitle>
          You can unseal the vault by entering a portion of the master key. Once
          all portions are entered, the vault will be unsealed.
        </Alert>
        <Grid container mt={1} spacing={2}>
          <Grid item xs={12}>
            <TextField
              fullWidth
              type={showKey ? "text" : "password"}
              label="Master Key Portion"
              value={masterKey}
              disabled={pendingVaultUnseal}
              onChange={(e) => setMasterKey(e.target.value)}
              onKeyDown={(evt) => {
                if (evt.key === "Enter") handleUnsealVault();
              }}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="toggle master key"
                      onClick={handleClickShowKey}
                      edge="end"
                      size="small"
                    >
                      {showKey ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          {vault.keysProvided > 0 && (
            <Grid item xs={12}>
              <LinearProgress
                value={vault.keysProvided}
                total={vault.keysTotal}
                usePercentage={false}
                placeholder="keys provided"
              />
            </Grid>
          )}
          <Grid item xs={12}>
            <Button
              fullWidth
              variant="contained"
              disabled={pendingVaultUnseal}
              sx={{ fontWeight: "bold" }}
              onClick={handleUnsealVault}
            >
              {pendingVaultUnseal ? (
                <CircularProgress size={25} thickness={5} />
              ) : (
                "Unseal"
              )}
            </Button>
          </Grid>
        </Grid>
      </Paper>
    </Container>
  );
};

export default UnsealVault;
