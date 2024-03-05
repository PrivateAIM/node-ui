import * as yup from "yup";

const AddCustomEnvSchema = yup.object({
  name: yup
    .string("")
    .min(2, "Variable name is too short - should be 2 chars minimum")
    .required("Variable name is required"),
});

export default AddCustomEnvSchema;
