import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
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

import { loginVault } from "../../redux/reducers/stationSlice";
import { showAlert } from "../../redux/reducers/alertSlice";

const LoginVault = () => {
  const dispatch = useDispatch();
  const [showKey, setShowKey] = useState(false);
  const [token, setToken] = useState("");
  const { pendingVaultLogin } = useSelector((state) => state.station);

  const handleClickShowKey = () => setShowKey((show) => !show);

  const handleLoginVault = () => {
    if (!token) {
      dispatch(
        showAlert({
          message: "Token is required and cannot be empty",
          options: {
            key: "tokenError",
            variant: "error",
          },
        })
      );
      return;
    }

    dispatch(loginVault({ token })).then(() => {
      setToken("");
    });
  };

  return (
    <Container maxWidth="sm">
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" fontWeight="bold" align="center" mb={3}>
          Login to Vault
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <TextField
              fullWidth
              required
              type={showKey ? "text" : "password"}
              label="Token"
              value={token}
              disabled={pendingVaultLogin}
              onChange={(e) => setToken(e.target.value)}
              onKeyDown={(evt) => {
                if (evt.key === "Enter") handleLoginVault();
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
          <Grid item xs={12}>
            <Button
              fullWidth
              variant="contained"
              disabled={pendingVaultLogin}
              sx={{ fontWeight: "bold" }}
              onClick={handleLoginVault}
            >
              {pendingVaultLogin ? (
                <CircularProgress size={25} thickness={5} />
              ) : (
                "Login"
              )}
            </Button>
          </Grid>
        </Grid>
      </Paper>
    </Container>
  );
};

export default LoginVault;
