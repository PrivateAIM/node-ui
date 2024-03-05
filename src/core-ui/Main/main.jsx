import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import { useAlert, useVault } from "../../hooks";

import DrawerHeader from "../../components/DrawerHeader";
import Navbar from "../Navbar";

export default function Main({ children }) {
  useAlert();
  useVault();

  return (
    <Box sx={{ display: "flex" }}>
      <Navbar />
      {/* overflow is important here otherwise the table goes out of screen width' */}
      <Box component="main" sx={{ flexGrow: 1, overflow: "hidden" }}>
        <DrawerHeader />
        <Container sx={{ mb: 1 }} maxWidth="xl">
          {children}
        </Container>
      </Box>
    </Box>
  );
}
