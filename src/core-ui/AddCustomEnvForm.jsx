import { useState } from "react";
import { Formik, Form } from "formik";
import { useDispatch } from "react-redux";
import Collapse from "@mui/material/Collapse";
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import MenuItem from "@mui/material/MenuItem";
import AddIcon from "@mui/icons-material/AddCircleOutlineRounded";

import ButtonWrapper from "../components/Form/Button";
import TextFieldWrapper from "../components/Form/TextField";
import { AddCustomEnvSchema } from "../validation";
import { envType } from "../constants";

const AddCustomEnvForm = ({ open, handleClose, formTitle, action }) => {
  const dispatch = useDispatch();
  const [customEnvType, setCustomEnvType] = useState(envType.TEXT);
  const initialState = { name: "" };

  const handleSubmit = ({ name }) => {
    const payload = {
      name,
      type: customEnvType,
      required: false,
      option: "manual",
      value: "",
      disabled: false,
    };

    dispatch(action(payload));
    setCustomEnvType(envType.TEXT);
    handleClose();
  };

  return (
    <Collapse in={open} sx={{ mb: 5 }} timeout="auto" unmountOnExit>
      <Typography fontWeight="bold" mb={2}>
        {formTitle}
      </Typography>
      <Formik
        initialValues={initialState}
        validationSchema={AddCustomEnvSchema}
        onSubmit={handleSubmit}
      >
        <Form noValidate>
          <Grid container spacing={2}>
            <Grid item xs={5}>
              <TextField
                select
                fullWidth
                size="small"
                label="Type"
                value={customEnvType}
                onChange={({ target }) => setCustomEnvType(target.value)}
              >
                {Object.keys(envType).map((_key) => (
                  <MenuItem key={_key} value={envType[_key]}>
                    {envType[_key]}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={5}>
              <TextFieldWrapper id="name" name="name" label="Variable name" />
            </Grid>
            <Grid item xs={2}>
              <ButtonWrapper
                sx={{ fontWeight: "bold", height: "40px" }}
                endIcon={<AddIcon />}
              >
                Add
              </ButtonWrapper>
            </Grid>
          </Grid>
        </Form>
      </Formik>
    </Collapse>
  );
};

export default AddCustomEnvForm;
