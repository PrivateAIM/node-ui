import { styled } from "@mui/material/styles";

const DrawerHeader = styled("div")(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "flex-end",
  padding: theme.spacing(0, 1),
  // necessary for content to be below app bar
  ...theme.mixins.toolbar,
  "@media (min-width:600px)": {
    // hardcoded due to spacing in toolbar i.e. sx={{ py: 1 }}
    minHeight: 71,
  },
}));

export default DrawerHeader;
