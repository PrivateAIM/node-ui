import * as yup from "yup";

const VaultInitializeSchema = yup.object({
  keyShares: yup
    .number()
    .min(1, "Value must be greater or equal to 1.")
    .typeError("Key Shares must be a 'number'.")
    .required("This field is required."),
  keyThreshold: yup
    .number()
    .min(1, "Value must be greater or equal to 1.")
    .typeError("Key Threshold must be a 'number'.")
    .required("This field is required."),
});

export default VaultInitializeSchema;
