import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { Outlet } from "react-router-dom";
import Typography from "@mui/material/Typography";

import { fetchVaultStatus } from "../../redux/reducers/stationSlice";
import InitializeVault from "./InitializeVault";
import InitializeComplete from "./InitializeComplete";
import UnsealVault from "./UnsealVault";
import LoginVault from "./LoginVault";
import KVEngine from "./KVEngine";

const Vault = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(fetchVaultStatus());
  }, [dispatch]);

  return (
    <>
      <Typography variant="h4" fontWeight="bold" my={3}>
        Vault
      </Typography>
      <Outlet />
    </>
  );
};

export {
  InitializeVault,
  InitializeComplete,
  UnsealVault,
  LoginVault,
  KVEngine,
};

export default Vault;
