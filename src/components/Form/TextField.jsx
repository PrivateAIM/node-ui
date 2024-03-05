import TextField from "@mui/material/TextField";
import { useField } from "formik";

const TextFieldWrapper = ({ name, ...otherProps }) => {
  const [field, meta] = useField(name);

  const textfieldConfig = {
    fullWidth: true,
    size: "small",
    variant: "outlined",
    ...field,
    ...otherProps,
    value: field.value || "", // This check is to avoid undefined values when adding custom envs
  };

  if (meta && meta.touched && meta.error) {
    textfieldConfig.error = true;
    textfieldConfig.helperText = meta.error;
  }

  return <TextField {...textfieldConfig} />;
};

export default TextFieldWrapper;
