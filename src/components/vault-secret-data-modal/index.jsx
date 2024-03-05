import { Formik, Form } from "formik";
import { useState, Fragment } from "react";
import { useDispatch, useSelector } from "react-redux";
import { grey } from "@mui/material/colors";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import Grid from "@mui/material/Grid";
import IconButton from "@mui/material/IconButton";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
import AddIcon from "@mui/icons-material/AddCircleOutlineRounded";
import DeleteIcon from "@mui/icons-material/Delete";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";

import AddCustomEnvForm from "../../core-ui/AddCustomEnvForm";
import StyledButton from "../Button";
import StyledDialogTitle from "../DialogTitle";
import TextFieldWrapper from "../Form/TextField";
import { getValidationProps } from "../../utils";
import {
  getVaultSecrets,
  addCustomKeyValue,
  createVaultSecret,
  removeCustomKeyValue,
  modifyVaultSecretData,
} from "../../redux/reducers/stationSlice";
import { HtmlTooltip } from "../Tooltip";

const VaultSecretDataModal = ({
  open,
  handleClose,
  selectedEngine,
  editSecret,
}) => {
  const dispatch = useDispatch();
  const vaultSecrets = useSelector(getVaultSecrets);
  const [secretPath, setSecretPath] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [openAddKVPair, setOpenAddKVPair] = useState(false);

  const { initialFormState, FormSchema } = getValidationProps(
    vaultSecrets.secretData || []
  );

  const handleSaveKVPairs = (formdata) => {
    const payload = {
      secretPath,
      vaultPath: editSecret ? vaultSecrets.path : selectedEngine,
      secretData: vaultSecrets.secretData.reduce(
        (acc, secret) => ({
          ...acc,
          [secret.name]: formdata[secret.name],
        }),
        {}
      ),
    };

    if (!editSecret && !secretPath) {
      alert("Please enter a Secret Path");
      return;
    }

    if (editSecret) {
      dispatch(modifyVaultSecretData(payload)).then(() => {
        handleClose();
      });
    } else {
      dispatch(createVaultSecret(payload))
        .unwrap()
        .then(() => {
          setSecretPath("");
          handleClose();
        })
        .catch((err) => console.log(err));
    }
  };

  const handleRemoveKVPair = (kvPair) => (_) => {
    dispatch(removeCustomKeyValue(kvPair));
  };

  const formId = "vault-kvpair-form";
  return (
    <Dialog fullWidth maxWidth="md" open={open}>
      <StyledDialogTitle
        onClose={() => {
          setShowPassword(false);
          handleClose();
        }}
      >
        {editSecret ? (
          "Edit Secret Data"
        ) : (
          <div>
            Create Secret for Engine{" "}
            <Typography
              component="span"
              variant="h6"
              sx={{ fontWeight: "bold", color: "info.main" }}
            >
              {selectedEngine}
            </Typography>
          </div>
        )}
      </StyledDialogTitle>
      <DialogContent dividers>
        {editSecret ? (
          <Stack
            spacing={1}
            direction="row"
            sx={{ p: 2, bgcolor: grey[100], borderRadius: 2, mb: 2 }}
          >
            <b>Vault Path: </b>
            <Typography fontWeight={500}>{vaultSecrets.path}</Typography>
          </Stack>
        ) : (
          <>
            <Typography variant="h6" fontWeight="bold" mb={2}>
              Secret Path
            </Typography>
            <TextField
              fullWidth
              size="small"
              label="Path"
              name="key"
              value={secretPath}
              onChange={({ target }) => setSecretPath(target.value)}
              placeholder="Enter a secret path. For e.g. 'dev', 'prod', 'staging'"
            />
          </>
        )}
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
          my={2}
        >
          <Typography variant="h6" fontWeight="bold">
            Key-Value Pairs
          </Typography>
          <Stack direction="row" spacing={1}>
            <HtmlTooltip
              placement="top"
              title={showPassword ? "Hide values" : "Show values"}
            >
              <IconButton onClick={() => setShowPassword(!showPassword)}>
                {showPassword ? <VisibilityOff /> : <Visibility />}
              </IconButton>
            </HtmlTooltip>
            <HtmlTooltip placement="top" title="Add key-value pair">
              <span>
                <IconButton
                  color="inherit"
                  onClick={() => setOpenAddKVPair(!openAddKVPair)}
                >
                  <AddIcon />
                </IconButton>
              </span>
            </HtmlTooltip>
          </Stack>
        </Stack>
        <AddCustomEnvForm
          open={openAddKVPair}
          handleClose={() => setOpenAddKVPair(false)}
          action={addCustomKeyValue}
          formTitle="Add Key-Value Pair"
        />
        {vaultSecrets.secretData.length === 0 && (
          <Stack
            mb={4}
            direction="row"
            justifyContent="center"
            sx={{ p: 2, bgcolor: grey[100], borderRadius: 2 }}
          >
            <Typography>
              To <b>add a key-value</b> pair, click the
            </Typography>
            <AddIcon sx={{ mx: 1 }} />
            <Typography>button above.</Typography>
          </Stack>
        )}
        <Formik
          initialValues={initialFormState}
          validationSchema={FormSchema}
          onSubmit={handleSaveKVPairs}
        >
          <Form id={formId} noValidate>
            <Grid container spacing={2}>
              {vaultSecrets.secretData?.map((secret, idx) => (
                <Fragment key={`kvpair-${secret?.name}-${idx}`}>
                  <Grid item xs={5.7}>
                    <TextField
                      fullWidth
                      size="small"
                      label="Key"
                      name="key"
                      value={secret?.name}
                    />
                  </Grid>
                  <Grid item xs={5.7}>
                    <TextFieldWrapper
                      label="Value"
                      id={secret?.name}
                      name={secret?.name}
                      type={showPassword ? "text" : secret?.type}
                    />
                  </Grid>
                  <Grid item container xs={0.6} justifyContent="center">
                    <HtmlTooltip title="Remove" placement="right">
                      <IconButton
                        color="error"
                        onClick={handleRemoveKVPair(secret?.name)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </HtmlTooltip>
                  </Grid>
                </Fragment>
              ))}
            </Grid>
          </Form>
        </Formik>
      </DialogContent>
      <DialogActions>
        <StyledButton type="submit" form={formId} variant="contained">
          Save
        </StyledButton>
      </DialogActions>
    </Dialog>
  );
};

export default VaultSecretDataModal;
