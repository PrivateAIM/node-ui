import { configureStore } from "@reduxjs/toolkit";

import alertReducer from "./reducers/alertSlice";
import stationReducer from "./reducers/stationSlice";
import federatedReducer from "./reducers/federatedSlice";

export default configureStore({
  reducer: {
    station: stationReducer,
    alert: alertReducer,
    federated: federatedReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoreActions: ["station/fetchFederatedContainerConfig/fulfilled"],
        ignoredPaths: ["station.containerConfig"],
      },
    }),
});
