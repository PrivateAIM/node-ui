import TextField from "@mui/material/TextField";
import MenuItem from "@mui/material/MenuItem";
import { useField, useFormikContext } from "formik";

const SelectWrapper = ({ name, options, renderMenu = null, ...otherProps }) => {
  const [field, meta] = useField(name);
  const { setFieldValue } = useFormikContext(); // 'setFieldValue' to update form state for select field

  const handleChange = (event) => {
    const { value } = event.target;
    setFieldValue(name, value);
  };

  const selectConfig = {
    select: true,
    fullWidth: true,
    size: "small",
    variant: "outlined",
    onChange: handleChange,
    ...field,
    ...otherProps,
  };

  if (meta && meta.touched && meta.error) {
    selectConfig.error = true;
    selectConfig.helperText = meta.error;
  }

  return (
    <TextField {...selectConfig}>
      {renderMenu
        ? renderMenu
        : options?.map((item, pos) => (
            <MenuItem key={pos} value={item?.value}>
              {item?.label}
            </MenuItem>
          ))}
    </TextField>
  );
};

export default SelectWrapper;
