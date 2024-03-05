import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  notifications: [],
};

const alertSlice = createSlice({
  name: "alert",
  initialState,
  reducers: {
    showAlert: (state, { payload }) => {
      const key = payload.options.key;
      state.notifications = [
        ...state.notifications,
        {
          key: key || new Date().getTime() + Math.random(),
          ...payload,
        },
      ];
    },
    closeAlert: (state, { payload }) => {
      state.notifications = state.notifications.map((notification) =>
        payload.dismissAll || notification.key === payload.key
          ? { ...notification, dismissed: true }
          : { ...notification }
      );
    },
    removeAlert: (state, { payload }) => {
      state.notifications = state.notifications.filter(
        (notif) => notif.key !== payload
      );
    },
  },
});

export const getNotifications = (state) => state.alert.notifications;

export const { showAlert, closeAlert, removeAlert } = alertSlice.actions;
export default alertSlice.reducer;
