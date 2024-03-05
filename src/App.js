import { createContext } from "react";
import { useSelector } from "react-redux";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import Main from "./core-ui/Main/main";
import ProtectedRoute from "./components/ProtectedRoute";
import { learningType } from "./constants";
import { Dashboard, Images, Containers, FederatedJobs, Vault } from "./pages";
import {
  InitializeVault,
  InitializeComplete,
  UnsealVault,
  LoginVault,
  KVEngine,
} from "./pages/Vault";

export const LearningContext = createContext(learningType.INCREMENTAL);

function App() {
  const { vault, learning } = useSelector((state) => state.station);

  return (
    <LearningContext.Provider value={learning}>
      <Router>
        <Main>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/images" element={<Images />} />
            <Route path="/containers" element={<Containers />} />
            <Route path="/federated-jobs" element={<FederatedJobs />} />
            <Route path="/vault" element={<Vault />}>
              <Route
                index
                element={
                  <ProtectedRoute
                    isAllowed={!vault.initialized}
                    redirectPath="initialize-complete"
                  >
                    <InitializeVault />
                  </ProtectedRoute>
                }
              />
              <Route
                path="initialize-complete"
                element={
                  <ProtectedRoute
                    isAllowed={
                      !Boolean(localStorage.getItem("vaultKeysDownloaded"))
                    }
                    redirectPath="/vault/unseal"
                  >
                    <InitializeComplete />
                  </ProtectedRoute>
                }
              />
              <Route
                path="unseal"
                element={
                  <ProtectedRoute
                    isAllowed={vault.initialized && vault.sealed}
                    redirectPath="/vault/login"
                  >
                    <UnsealVault />
                  </ProtectedRoute>
                }
              />
              <Route
                path="login"
                element={
                  <ProtectedRoute
                    isAllowed={!vault.sealed && !vault.authenticated}
                    redirectPath="/vault/kv-engine"
                  >
                    <LoginVault />
                  </ProtectedRoute>
                }
              />
              <Route
                path="kv-engine"
                element={
                  <ProtectedRoute
                    isAllowed={
                      vault.initialized && !vault.sealed && vault.authenticated
                    }
                    redirectPath="/vault"
                  >
                    <KVEngine />
                  </ProtectedRoute>
                }
              />
            </Route>
          </Routes>
        </Main>
      </Router>
    </LearningContext.Provider>
  );
}

export default App;
