import { useLocation } from "react-router-dom";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";

import { toolbarTitle } from "../../constants";

export default function TableToolbar() {
  const { pathname } = useLocation();

  return (
    <Toolbar sx={{ px: { sm: 2 } }}>
      <Typography
        sx={{ flex: "1 1 100%", fontWeight: "bold" }}
        variant="h6"
        component="div"
      >
        {toolbarTitle[pathname]}
      </Typography>
    </Toolbar>
  );
}
