import { Formik, Form } from "formik";
import { Fragment, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { grey } from "@mui/material/colors";
import Alert from "@mui/material/Alert";
import CircularProgress from "@mui/material/CircularProgress";
import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Grid from "@mui/material/Grid";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import MenuItem from "@mui/material/MenuItem";
import FormControlLabel from "@mui/material/FormControlLabel";
import Checkbox from "@mui/material/Checkbox";
import Stack from "@mui/material/Stack";
import InfoIcon from "@mui/icons-material/InfoOutlined";
import AddIcon from "@mui/icons-material/AddCircleOutlineRounded";

import StyledButton from "../Button";
import SelectWrapper from "../Form/Select";
import StyledDialogTitle from "../DialogTitle";
import TextFieldWrapper from "../Form/TextField";
import AddCustomEnvForm from "../../core-ui/AddCustomEnvForm";
import { envOptions, privacySettingOptions } from "../../constants";
import { getValidationProps } from "../../utils";
import { HtmlTooltip } from "../Tooltip";
import {
  setBindMount,
  setEnvVariable,
  createContainer,
  addCustomEnvVariable,
  startFederatedLearning,
} from "../../redux/reducers/stationSlice";
import UserService from "../../services/UserService";

const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;
const SelectProps = {
  MenuProps: {
    PaperProps: {
      style: {
        maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
      },
    },
  },
};

const CreateContainerModal = ({
  open,
  handleClose,
  rowSelected,
  incremental = true,
}) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { containerConfig, pendingCreation } = useSelector(
    (state) => state.station
  );
  const environmentVars = containerConfig?.envVariableList;

  const [shmSize, setShmSize] = useState("");
  const [readOnly, setReadOnly] = useState(false);
  const [openAddEnv, setOpenAddEnv] = useState(false);
  const [privacySetting, setPrivacySetting] = useState(
    privacySettingOptions.INSPECT_RESULTS
  );

  const isInspectResults =
    privacySetting === privacySettingOptions.INSPECT_RESULTS;

  const { initialFormState, FormSchema } = getValidationProps(
    environmentVars || []
  );

  const handleReadyOnly = (evt) => {
    setReadOnly(evt.target.checked);
  };

  const handleChangeShmSize = (evt) => {
    setShmSize(evt.target.value);
  };

  const handleChangeBindMount = (evt) => {
    const { name, value } = evt.target;
    dispatch(setBindMount({ name, value }));
  };

  const handleChangePrivacy = (evt) => {
    setPrivacySetting(evt.target.value);
  };

  const handleCreateContainer = (formdata) => {
    const payload = {
      user: UserService.getUsername(),
      envs: environmentVars.map((env) => ({
        name: env.name,
        type: env.option,
        value: formdata[env.name],
      })),
      bindMount: {
        hostSource: containerConfig.hostMount,
        containerDestination: containerConfig.containerMount,
        ...(readOnly ? { readOnly: "on" } : {}),
      },
      shmSize,
      ...(incremental
        ? // Payload for incremental learning container
          { jobId: rowSelected.jobID, image: rowSelected.imageTag }
        : {
            // Payload for federated learning container
            jobid: rowSelected.jobID,
            trainclassidlearning: rowSelected.trainClassIdLearning,
            learningstoragelocation: rowSelected.learningImage,
            currentround: rowSelected.currentRound,
            maxrounds: rowSelected.learningRounds,
            pid: rowSelected.pid,
            privacysetting: privacySetting,
          }),
    };

    dispatch(
      incremental ? createContainer(payload) : startFederatedLearning(payload)
    )
      .unwrap()
      .then(() => {
        // Navigate to either container or federated jobs page
        navigate(incremental ? "/containers" : "/federated-jobs");
      })
      .catch((err) => console.log(err));
  };

  let vaultOptions = [{ label: <b>Select a path</b>, value: "" }];
  if (containerConfig?.paths?.length > 0) {
    vaultOptions.push(
      ...containerConfig?.paths?.map((path) => ({
        label: `${path.path}:${path.key}`,
        value: JSON.stringify(path),
      }))
    );
  }

  const renderFederatedPrivacySettings = (
    <Stack sx={{ my: 2 }} spacing={2}>
      <Stack direction="row" spacing={1} alignItems="center">
        <Typography variant="h6" sx={{ fontWeight: "bold" }}>
          Privacy Settings
        </Typography>
        <HtmlTooltip
          placement="right"
          title="Control how data will leave your station"
        >
          <InfoIcon />
        </HtmlTooltip>
      </Stack>
      <Alert
        severity={isInspectResults ? "info" : "warning"}
        sx={{ fontWeight: "500" }}
      >
        {isInspectResults ? (
          <>
            With this setting, the station admin has <b>full control</b> over
            which data is leaving the station. After every learning round, the
            admin can view the data that will be transmitted and approve the
            transmission.
          </>
        ) : (
          <>
            With this setting, the station will <b>automatically transmit</b>{" "}
            the data after every learning round. The station admin can inspect
            the data <b>after transmission.</b>
          </>
        )}
      </Alert>
      <TextField
        select
        fullWidth
        size="small"
        label="Setting"
        value={privacySetting}
        disabled={pendingCreation}
        onChange={handleChangePrivacy}
      >
        <MenuItem value={privacySettingOptions.INSPECT_RESULTS}>
          Require data inspection before transmission (default)
        </MenuItem>
        <MenuItem value={privacySettingOptions.NO_RESULT_INSPECTION}>
          Transmit data without inspection
        </MenuItem>
      </TextField>
    </Stack>
  );

  const formId = "create-container-form";
  return (
    <Dialog fullWidth maxWidth="md" open={open}>
      <StyledDialogTitle disable={pendingCreation} onClose={handleClose}>
        Create Container {!incremental && "for Federated Learning"}
      </StyledDialogTitle>
      <DialogContent dividers>
        <Stack spacing={1} sx={{ p: 2, bgcolor: grey[100], borderRadius: 2 }}>
          <Typography>
            <b>Job ID: </b>
            {containerConfig?.jobid || containerConfig?.jobId}
          </Typography>
          <Typography>
            <b>Learning Image: </b>
            {containerConfig?.trainclassidlearning || containerConfig?.image}
          </Typography>
        </Stack>
        {!incremental && renderFederatedPrivacySettings}
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
          my={2}
        >
          <Typography variant="h6" fontWeight="bold">
            Environment Variables
          </Typography>
          <HtmlTooltip placement="left" title="Add environment variable">
            <span>
              <IconButton
                color="inherit"
                disabled={pendingCreation}
                onClick={() => setOpenAddEnv(!openAddEnv)}
              >
                <AddIcon />
              </IconButton>
            </span>
          </HtmlTooltip>
        </Stack>
        <AddCustomEnvForm
          open={openAddEnv}
          handleClose={() => setOpenAddEnv(false)}
          action={addCustomEnvVariable}
          formTitle="Add Environment Variable"
        />
        {environmentVars?.length === 0 && (
          <Stack
            mb={4}
            direction="row"
            justifyContent="center"
            sx={{ p: 2, bgcolor: grey[100], borderRadius: 2 }}
          >
            <Typography>
              There are no environment variables for this image. You can add
              using
            </Typography>
            <AddIcon sx={{ mx: 1 }} />
            <Typography>button above.</Typography>
          </Stack>
        )}
        <Formik
          initialValues={initialFormState}
          validationSchema={FormSchema}
          onSubmit={handleCreateContainer}
        >
          {({ setFieldValue }) => (
            <Form id={formId} noValidate>
              <Grid container spacing={2}>
                {environmentVars?.map((env, idx) => (
                  <Fragment key={`env-variable-${env?.name}-${idx}`}>
                    <Grid item xs={4}>
                      <TextField
                        fullWidth
                        size="small"
                        label="Name"
                        name="name"
                        value={env?.name}
                        disabled={Boolean(env?.disabled)}
                      />
                    </Grid>
                    <Grid item xs={4}>
                      <TextField
                        select
                        fullWidth
                        size="small"
                        label="Type"
                        name="option"
                        value={env?.option}
                        disabled={pendingCreation}
                        onChange={(evt) => {
                          const { name, value } = evt.target;
                          /**
                           * Resetting previous value in Formik form state to avoid
                           * conflict with different env types i.e. manual/vault.
                           * To reproduce conflict, comment 'setFieldValue' below and
                           * change env variable type.
                           */
                          setFieldValue(env?.name, "");
                          dispatch(setEnvVariable({ idx, name, value }));
                        }}
                      >
                        <MenuItem value="manual">Manual</MenuItem>
                        <MenuItem
                          value="vault"
                          disabled={env?.type === "select"}
                        >
                          Vault
                        </MenuItem>
                      </TextField>
                    </Grid>
                    <Grid item xs={4}>
                      {env?.option === envOptions.VAULT ? (
                        <SelectWrapper
                          label="Value"
                          id={env?.name}
                          name={env?.name}
                          options={vaultOptions}
                          disabled={pendingCreation}
                          SelectProps={SelectProps}
                        />
                      ) : env?.type === "select" ? (
                        <SelectWrapper
                          label="Value"
                          id={env?.name}
                          name={env?.name}
                          options={env?.options}
                          required={Boolean(env?.required)}
                          disabled={pendingCreation}
                        />
                      ) : (
                        <TextFieldWrapper
                          label="Value"
                          id={env?.name}
                          name={env?.name}
                          type={env?.type !== "number" ? env?.type : undefined}
                          required={Boolean(env?.required)}
                          disabled={pendingCreation}
                        />
                      )}
                    </Grid>
                  </Fragment>
                ))}
              </Grid>
            </Form>
          )}
        </Formik>
        <Stack direction="row" spacing={1} sx={{ my: 2, alignItems: "center" }}>
          <Typography variant="h6" sx={{ fontWeight: "bold" }}>
            Bind Mounts
          </Typography>
          <HtmlTooltip placement="right" title="Paths are case-sensitive">
            <InfoIcon />
          </HtmlTooltip>
        </Stack>
        <Grid container spacing={2}>
          <Grid item xs={6}>
            <HtmlTooltip title="Absolute path on the train container where the file/directory should be mounted.">
              <TextField
                fullWidth
                size="small"
                variant="outlined"
                label="Container Destination Absolute Path"
                name="containerMount"
                color="success"
                disabled={pendingCreation}
                value={containerConfig.containerMount}
                onChange={handleChangeBindMount}
              />
            </HtmlTooltip>
          </Grid>
          <Grid item xs={6}>
            <HtmlTooltip
              title="Absolute path on Docker-in-Docker container from where the
              file/directory needs to be mounted. The file/directory must
              exist."
            >
              <TextField
                fullWidth
                size="small"
                variant="outlined"
                label="Host Source Absolute Path"
                name="hostMount"
                color="success"
                disabled={pendingCreation}
                value={containerConfig.hostMount}
                onChange={handleChangeBindMount}
              />
            </HtmlTooltip>
          </Grid>
          <Grid item xs={6}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={readOnly}
                  disabled={pendingCreation}
                  onChange={handleReadyOnly}
                  inputProps={{ "aria-label": "controlled" }}
                />
              }
              label="Read-Only"
            />
          </Grid>
        </Grid>
        <Typography variant="h6" sx={{ fontWeight: "bold", my: 2 }}>
          Shared Memory Size
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={6}>
            <HtmlTooltip
              title="Size of /dev/shm in MB. The size must be greater than 0. If
              omitted the system uses 64MB."
            >
              <TextField
                fullWidth
                size="small"
                variant="outlined"
                label="Size of /dev/shm in MB"
                type="number"
                color="success"
                disabled={pendingCreation}
                inputProps={{ min: 0 }}
                value={shmSize}
                onChange={handleChangeShmSize}
              />
            </HtmlTooltip>
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <StyledButton
          type="submit"
          form={formId}
          disabled={pendingCreation}
          variant="contained"
        >
          {pendingCreation ? (
            <CircularProgress size={25} thickness={5} />
          ) : incremental ? (
            "Create"
          ) : (
            "Start Learning"
          )}
        </StyledButton>
      </DialogActions>
    </Dialog>
  );
};

export default CreateContainerModal;
