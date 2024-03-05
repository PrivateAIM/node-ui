import { forwardRef } from "react";
import Button from "@mui/material/Button";

const StyledButton = forwardRef(function StyledButton(
  { children, sx, ...otherProps },
  ref
) {
  return (
    <Button
      {...otherProps}
      ref={ref}
      sx={{ minWidth: 100, fontWeight: "bold", ...sx }}
    >
      {children}
    </Button>
  );
});

export default StyledButton;
