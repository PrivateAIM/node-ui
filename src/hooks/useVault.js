import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { useLocation } from "react-router-dom";
import { fetchVaultStatus } from "../redux/reducers/stationSlice";

const useVault = () => {
  const dispatch = useDispatch();
  const { pathname } = useLocation();

  useEffect(() => {
    /**
     * This check is to avoid multiple dispatch calls due to
     * redirections in 'Vault' page during authentication.
     */
    if (!pathname.includes("vault")) {
      dispatch(fetchVaultStatus());
    }
  }, [dispatch, pathname]);
};

export default useVault;
