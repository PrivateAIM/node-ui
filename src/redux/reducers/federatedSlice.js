import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { showAlert } from "./alertSlice";
import { createDataFLJobs } from "../../utils";
import { resultTab, resultItemSupportedTypes } from "../../constants";
import * as API from "../api";

const imageRegex = /\.(gif|jpe?g|tiff?|png|webp|bmp)$/i;
const textFileRegex = /\.(txt|csv)$/i;

export const fetchFederatedJobs = createAsyncThunk(
  "federated/fetchFederatedJobs",
  async (_, { dispatch, rejectWithValue }) => {
    try {
      const response = await API.fetchFederatedJobsAPI();
      return response.data;
    } catch (err) {
      const message = `Unable to fetch Federated Jobs: ${err.message}`;
      dispatch(
        showAlert({
          message: err?.response?.data?.message || message,
          options: {
            key: "federated/fetchFederatedJobsError",
            variant: "error",
          },
        })
      );
      return rejectWithValue(message);
    }
  }
);

export const showFederatedLogs = createAsyncThunk(
  "federated/showFederatedLogs",
  async (payload, { signal, dispatch, rejectWithValue }) => {
    try {
      const response = await API.showFederatedLogsAPI(payload, signal);
      return response.data;
    } catch (err) {
      // Show alert if signal is not aborted intentionally
      if (!signal.aborted) {
        dispatch(
          showAlert({
            message: "Something went wrong while loading logs",
            options: {
              key: payload.jobId,
              variant: "error",
            },
          })
        );
      }
      return rejectWithValue(err.message);
    }
  }
);

export const showFederatedJobResults = createAsyncThunk(
  "federated/showFederatedJobResults",
  async (payload, { dispatch, rejectWithValue }) => {
    try {
      const response = await API.showFederatedJobResultsAPI(payload.jobID);
      return response.data;
    } catch (err) {
      dispatch(
        showAlert({
          message: "Something went wrong while loading results",
          options: {
            key: `jobResultErr-${payload.jobID}`,
            variant: "error",
          },
        })
      );
      return rejectWithValue(err.message);
    }
  }
);

export const approveFederatedJob = createAsyncThunk(
  "federated/approveFederatedJob",
  async (jobId, { dispatch, rejectWithValue }) => {
    try {
      await API.approveFederatedJobAPI(jobId);
      dispatch(
        showAlert({
          message: `Approved changes for job with id (${jobId}) for transmission`,
          options: {
            key: `approveFLJobSuccess-${jobId}`,
            variant: "success",
            anchorOrigin: {
              vertical: "top",
              horizontal: "center",
            },
          },
        })
      );
    } catch (err) {
      const message =
        err?.response?.data || `Error approving FL job with id ${jobId}`;

      dispatch(
        showAlert({
          message,
          options: {
            key: `approveFLJobErr-${jobId}`,
            variant: "error",
            anchorOrigin: {
              vertical: "top",
              horizontal: "center",
            },
          },
        })
      );
      return rejectWithValue(err.message);
    }
  }
);

export const removeFederatedJob = createAsyncThunk(
  "federated/removeFederatedJob",
  async (jobId, { dispatch, rejectWithValue }) => {
    try {
      await API.removeFederatedJobAPI(jobId);
      dispatch(
        showAlert({
          message: `FL job with id ${jobId} sucessfully removed`,
          options: {
            key: `removeFLJobSuccess-${jobId}`,
            variant: "success",
          },
        })
      );
    } catch (err) {
      const message =
        err?.response?.data || `Error removing FL job with id ${jobId}`;

      dispatch(
        showAlert({
          message,
          options: {
            key: `removeFLJobErr-${jobId}`,
            variant: "error",
            anchorOrigin: {
              vertical: "top",
              horizontal: "center",
            },
          },
        })
      );
      return rejectWithValue(err.message);
    }
  }
);

export const cancelFederatedJob = createAsyncThunk(
  "federated/cancelFederatedJob",
  async (jobId, { dispatch, rejectWithValue }) => {
    try {
      await API.cancelFederatedJobAPI(jobId);
      dispatch(
        showAlert({
          message: `Cancellation request for job ${jobId} successfully sent`,
          options: {
            key: `cancelFLJobSuccess-${jobId}`,
            variant: "success",
          },
        })
      );
    } catch (err) {
      const message =
        err?.response?.data || `Error cancelling FL job with id ${jobId}`;

      dispatch(
        showAlert({
          message,
          options: {
            key: `cancelFLJobErr-${jobId}`,
            variant: "error",
            anchorOrigin: {
              vertical: "top",
              horizontal: "center",
            },
          },
        })
      );
      return rejectWithValue(err.message);
    }
  }
);

export const fetchJobUpdates = createAsyncThunk(
  "federated/fetchJobUpdates",
  async (payload, { signal, dispatch, rejectWithValue }) => {
    try {
      const response = await API.fetchFederatedJobUpdatesAPI(payload, signal);
      return response.data;
    } catch (err) {
      // Show alert if signal is not aborted intentionally
      if (!signal.aborted) {
        dispatch(
          showAlert({
            message: "Something went wrong while fetching job updates",
            options: {
              key: "federated/fetchJobUpdatesError",
              variant: "error",
            },
          })
        );
      }
      return rejectWithValue(err.message);
    }
  }
);

export const downloadJobResult = createAsyncThunk(
  "federated/downloadJobResult",
  async (payload, { dispatch, rejectWithValue }) => {
    try {
      const response = await API.downloadFederatedJobResultsAPI(payload, {
        responseType: "blob",
      });

      // Create file link in browser's memory
      const href = URL.createObjectURL(response.data);
      const contentDisposition = response.headers["content-disposition"];
      const filename = contentDisposition.match(/filename=(.+)/)[1];

      var anchor = document.createElement("a");
      anchor.setAttribute("href", href);
      anchor.setAttribute("download", filename);
      anchor.setAttribute("target", "_blank");
      anchor.click();

      // Release object to prevent memory leak
      URL.revokeObjectURL(href);
    } catch (err) {
      dispatch(
        showAlert({
          message: `Download failed for job id: ${payload.jobId}`,
          options: {
            key: `downloadJobResultError-${payload.jobId}`,
            variant: "error",
          },
        })
      );

      return rejectWithValue(err.message);
    }
  }
);

export const downloadResultItem = createAsyncThunk(
  "federated/downloadResultItem",
  async (payload, { dispatch, rejectWithValue }) => {
    try {
      const isImageFile = imageRegex.test(payload.params.path);
      const response = await API.downloadFederatedJobResultsAPI(payload, {
        responseType: isImageFile ? "blob" : "json",
      });

      return { content: response.data, file: payload.params.path };
    } catch (err) {
      const message = `Failed to view file: ${payload.params.path}.`;
      dispatch(
        showAlert({
          message,
          options: {
            key: `downloadResultItemErr-${payload.params.path}`,
            variant: "error",
          },
        })
      );
      return rejectWithValue(err);
    }
  }
);

const initialState = {
  lastLogId: 0,
  lastUpdateId: 0,
  downloadFiles: [],
  federatedJobs: [],
  federatedLogs: [],
  federatedResults: [],
  fetchNewUpdates: true,
  loadingFederatedLogs: false,
  loadingFederatedJobs: false,
  loadingFLJobResults: false,
  loadingViewTab: false, // For View Tab
  pendingRowOperation: false,
  openTab: 0, // List Tab: 0, View Tab: 1
  openTabId: resultTab.LIST,
  selectedFLJob: {},
  selectedFileToView: "", // Filename to show in View Tab
  resultItem: { type: "", content: null }, // Item for Viewing in Tab
  message: "",
};

const federatedSlice = createSlice({
  name: "federated",
  initialState,
  reducers: {
    resetFederatedLogs: (state) => {
      state.federatedLogs = [];
      state.lastLogId = 0;
    },
    resetResultTab: (state) => {
      if (state.resultItem.type === resultItemSupportedTypes.IMAGE) {
        URL.revokeObjectURL(state.resultItem.content);
      }

      // Resetting tab state
      state.selectedFileToView = "";
      state.openTab = 0;
      state.openTabId = resultTab.LIST;
      state.resultItem = { type: "", content: null };
      state.downloadFiles = [];
    },
    setOpenTab: (state, { payload }) => {
      state.openTab = payload.tab;
      state.openTabId = payload.tabId;
    },
    setDownloadFiles: (state, { payload }) => {
      state.downloadFiles = payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchFederatedJobs.pending, (state) => {
        state.loadingFederatedJobs = true;
      })
      .addCase(fetchFederatedJobs.fulfilled, (state, { payload }) => {
        state.loadingFederatedJobs = false;
        state.federatedJobs = payload?.map((flJob, idx) =>
          createDataFLJobs(
            idx + 1,
            flJob.trainclassidlearning,
            flJob.jobid,
            flJob.pid,
            flJob.state,
            flJob.currentround,
            flJob.maxrounds,
            flJob.date
          )
        );
      })
      .addCase(fetchFederatedJobs.rejected, (state) => {
        state.loadingFederatedJobs = false;
      })
      .addCase(fetchJobUpdates.pending, (state) => {
        state.fetchNewUpdates = false;
      })
      .addCase(fetchJobUpdates.fulfilled, (state, { payload }) => {
        state.fetchNewUpdates = true;

        if (state.federatedJobs.length > 0) {
          payload.forEach(({ id, jobId, state: status, round }) => {
            const idx = state.federatedJobs.findIndex(
              (job) => job.jobID === jobId
            );

            /**
             * Update API might be fulfilled earlier than Federated Jobs fetch API.
             * This might lead to invalid index (-1) or job not existing in state.
             * This edge case check is to ensure job already exists in state before updation.
             */
            if (idx >= 0) {
              state.federatedJobs[idx].status = status;
              state.federatedJobs[idx].currentRound = round;
              state.lastUpdateId =
                id > state.lastUpdateId ? id : state.lastUpdateId;
            }
          });
        }
      })
      .addCase(fetchJobUpdates.rejected, (state, { meta }) => {
        /**
         * Update API gets stuck in rejection loop when backend server malfunctions/throws error.
         * To avoid this, we check if the request was legitimately aborted/rejected by client.
         */
        if (meta.aborted) {
          /**
           * When Component (Federated Jobs page) is unmounted, useEffect cleanup aborts()
           * update API and action is rejected. Setting 'fetchNewUpdates = true' here
           * to invoke update API when component re-mounts.
           */
          state.fetchNewUpdates = true;
        }
      })
      .addCase(showFederatedLogs.pending, (state) => {
        state.loadingFederatedLogs = true;
      })
      .addCase(showFederatedLogs.fulfilled, (state, { payload }) => {
        state.loadingFederatedLogs = false;
        const logPayload = payload.map((logs) => logs.content);

        // Check to see if logs are not empty
        if (logPayload.length > 0) {
          state.federatedLogs = [...state.federatedLogs, ...logPayload];
          state.lastLogId = payload[payload.length - 1].id;
        }
      })
      .addCase(showFederatedLogs.rejected, (state, { payload }) => {
        state.loadingFederatedLogs = false;
        state.message = payload;
      })
      .addCase(approveFederatedJob.pending, (state, { meta }) => {
        const idx = state.federatedJobs.findIndex(
          (job) => job.jobID === meta.arg
        );
        state.federatedJobs[idx].loading = true;
        state.pendingRowOperation = true;
      })
      .addCase(approveFederatedJob.fulfilled, (state, { meta }) => {
        const idx = state.federatedJobs.findIndex(
          (job) => job.jobID === meta.arg
        );
        state.federatedJobs[idx].loading = false;
        state.pendingRowOperation = false;
      })
      .addCase(approveFederatedJob.rejected, (state, { meta }) => {
        const idx = state.federatedJobs.findIndex(
          (job) => job.jobID === meta.arg
        );
        state.federatedJobs[idx].loading = false;
        state.pendingRowOperation = false;
      })
      .addCase(removeFederatedJob.pending, (state, { meta }) => {
        const idx = state.federatedJobs.findIndex(
          (job) => job.jobID === meta.arg
        );
        state.federatedJobs[idx].loading = true;
        state.pendingRowOperation = true;
      })
      .addCase(removeFederatedJob.fulfilled, (state, { meta }) => {
        const idx = state.federatedJobs.findIndex(
          (job) => job.jobID === meta.arg
        );
        state.federatedJobs.splice(idx, 1);
        state.pendingRowOperation = false;
      })
      .addCase(removeFederatedJob.rejected, (state, { meta }) => {
        const idx = state.federatedJobs.findIndex(
          (job) => job.jobID === meta.arg
        );
        state.federatedJobs[idx].loading = false;
        state.pendingRowOperation = false;
      })
      .addCase(cancelFederatedJob.pending, (state, { meta }) => {
        const idx = state.federatedJobs.findIndex(
          (job) => job.jobID === meta.arg
        );
        state.federatedJobs[idx].loading = true;
        state.pendingRowOperation = true;
      })
      .addCase(cancelFederatedJob.fulfilled, (state, { meta }) => {
        const idx = state.federatedJobs.findIndex(
          (job) => job.jobID === meta.arg
        );
        state.federatedJobs[idx].loading = false;
        state.pendingRowOperation = false;
      })
      .addCase(cancelFederatedJob.rejected, (state, { meta }) => {
        const idx = state.federatedJobs.findIndex(
          (job) => job.jobID === meta.arg
        );
        state.federatedJobs[idx].loading = false;
        state.pendingRowOperation = false;
      })
      .addCase(showFederatedJobResults.pending, (state, { meta }) => {
        state.loadingFLJobResults = true;
        state.selectedFLJob = meta.arg;
        state.federatedResults = [];
        state.downloadFiles = [];

        // state.openFLResultModal = true; REMOVE
      })
      .addCase(showFederatedJobResults.fulfilled, (state, { payload }) => {
        state.loadingFLJobResults = false;
        // state.containerResultsFetchedId = meta.arg.container;
        // state.selectedContainer = meta.arg;
        state.federatedResults = payload;
      })
      .addCase(showFederatedJobResults.rejected, (state, { payload, meta }) => {
        state.loadingFLJobResults = false;
        state.message = payload;
      })
      .addCase(downloadResultItem.pending, (state) => {
        state.loadingViewTab = true;
        state.downloadFiles = []; // Resetting the checkbox state in List Tab

        // Releasing previous object to prevent memory leaks
        if (state.resultItem.type === resultItemSupportedTypes.IMAGE) {
          URL.revokeObjectURL(state.resultItem.content);
        }

        state.resultItem = { type: "", content: null };
      })
      .addCase(downloadResultItem.fulfilled, (state, { payload }) => {
        state.loadingViewTab = false;

        const { file, content } = payload;
        if (imageRegex.test(file)) {
          state.resultItem.type = resultItemSupportedTypes.IMAGE;
          state.resultItem.content = URL.createObjectURL(content);
        } else if (textFileRegex.test(file)) {
          state.resultItem.type = file.endsWith(".csv")
            ? resultItemSupportedTypes.CSV
            : resultItemSupportedTypes.TEXT;
          state.resultItem.content = content;
        }

        // Jump to View tab after fetching file contents
        state.openTab = 1;
        state.openTabId = resultTab.VIEW;
        state.selectedFileToView = file;
      })
      .addCase(downloadResultItem.rejected, (state, { payload }) => {
        state.loadingViewTab = false;
        state.message = payload;
      });
  },
});

export const {
  setOpenTab,
  resetResultTab,
  setDownloadFiles,
  resetFederatedLogs,
} = federatedSlice.actions;
export default federatedSlice.reducer;
