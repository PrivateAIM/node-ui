import { Formik, Form } from "formik";
import { useDispatch, useSelector } from "react-redux";
import Container from "@mui/material/Container";
import CircularProgress from "@mui/material/CircularProgress";
import Grid from "@mui/material/Grid";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";

import Button from "../../components/Form/Button";
import TextField from "../../components/Form/TextField";
import { initializeVault } from "../../redux/reducers/stationSlice";
import { VaultInitializeSchema } from "../../validation";

const intialState = {
  keyShares: 5,
  keyThreshold: 3,
};

const InitializeVault = () => {
  const dispatch = useDispatch();
  const { pendingVaultInit } = useSelector((state) => state.station);

  const handleInitializeVault = (formdata) => {
    const payload = {
      keyShares: formdata.keyShares,
      keyThreshold: formdata.keyThreshold,
    };

    dispatch(initializeVault(payload));
  };

  return (
    <Container maxWidth="sm">
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" fontWeight="bold" align="center" mb={3}>
          Initialize Vault
        </Typography>
        <Formik
          initialValues={intialState}
          validationSchema={VaultInitializeSchema}
          onSubmit={handleInitializeVault}
        >
          <Form noValidate>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <TextField
                  id="keyShares"
                  name="keyShares"
                  label="Key shares"
                  disabled={pendingVaultInit}
                  required
                  helperText={
                    <>
                      The number of key shares to split the master key into.{" "}
                      <b>Recommended value is '{intialState.keyShares}'</b>.
                    </>
                  }
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  id="keyThreshold"
                  name="keyThreshold"
                  label="Key threshold"
                  disabled={pendingVaultInit}
                  required
                  helperText={
                    <>
                      Key shares required to reconstruct the master key.{" "}
                      <b>Recommended value is '{intialState.keyThreshold}'</b>.
                    </>
                  }
                />
              </Grid>
              <Grid item xs={12}>
                <Button disabled={pendingVaultInit} sx={{ fontWeight: "bold" }}>
                  {pendingVaultInit ? (
                    <CircularProgress size={25} thickness={5} />
                  ) : (
                    "Initialize"
                  )}
                </Button>
              </Grid>
            </Grid>
          </Form>
        </Formik>
      </Paper>
    </Container>
  );
};

export default InitializeVault;
