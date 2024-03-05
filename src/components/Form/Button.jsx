import Button from "@mui/material/Button";

const ButtonWrapper = (props) => {
  const { children, ...otherProps } = props;

  const buttonConfig = {
    type: "submit",
    variant: "contained",
    color: "primary",
    fullWidth: true,
    ...otherProps,
  };

  return <Button {...buttonConfig}>{children}</Button>;
};

export default ButtonWrapper;
