import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { showAlert } from "./alertSlice";
import {
  learningType,
  containerState,
  resultTab,
  resultItemSupportedTypes,
} from "../../constants";
import * as API from "../api";
import {
  createData,
  createDataFL,
  createImageData,
  createContainerData,
  updateProgressBar,
} from "../../utils";

let pullingFsLayers = [];
const regex = /\\u([\d\w]{4})/gi;
const imageRegex = /\.(gif|jpe?g|tiff?|png|webp|bmp)$/i;
const textFileRegex = /\.(txt|csv)$/i;

function handleFsLayers(logs, jobid) {
  logs = logs.split("\n");
  for (let i = 0; i < logs.length - 1; i++) {
    let log = JSON.parse(logs[i]);

    if (log["status"] === "Pulling fs layer") {
      if (pullingFsLayers && pullingFsLayers.length !== 0) {
        let alreadyExist = false;
        for (let j = 0; j < pullingFsLayers.length; j++) {
          if (pullingFsLayers[j][0] === [log["id"]][0]) {
            alreadyExist = true;
          }
        }
        if (!alreadyExist) {
          /**
           * log["id"] = fs layers id
           *
           * [0,-1,-1]
           *  0 = first index represents flag of completion (0: not completed, 1: complete)
           * -1 = second index represents current download
           * -1 = third index represnts total size of layers
           */

          pullingFsLayers.push([log["id"], [0, -1, -1]]);
        }
      } else {
        pullingFsLayers.push([log["id"], [0, -1, -1]]);
      }
    }

    if (log["progressDetail"]) {
      for (let j = 0; j < pullingFsLayers.length; j++) {
        let layerID = pullingFsLayers[j][0];
        let logID = [log["id"]][0];

        if (layerID.localeCompare(logID) === 0) {
          if (log.progressDetail["current"]) {
            let current = log.progressDetail.current;
            let total = log.progressDetail.total;
            if (log["status"] === "Downloading" && current !== total) {
              if (current > pullingFsLayers[j][1][1]) {
                pullingFsLayers[j][1][1] = current;
                if (pullingFsLayers[j][1][2] === -1) {
                  pullingFsLayers[j][1][2] = total;
                }
              }
            } else if (
              (log["status"] === "Download complete" || current === total) &&
              pullingFsLayers[j][1][0] === 0
            ) {
              pullingFsLayers[j][1][1] = total;
              pullingFsLayers[j][1][2] = total;
              pullingFsLayers[j][1][0] = 1;
            }
          } else if (log["status"] === "Download complete") {
            pullingFsLayers[j][1][1] = pullingFsLayers[j][1][2];
            pullingFsLayers[j][1][0] = 1;
          }
        }
      }
    }
  }

  return updateProgressBar(pullingFsLayers, jobid);
}

export const fetchVaultStatus = createAsyncThunk(
  "station/fetchVaultStatus",
  async (_, { dispatch, rejectWithValue }) => {
    try {
      const response = await API.fetchVaultStatusAPI();
      return response.data;
    } catch (err) {
      const message = `Error fetching Vault status (${err.message})`;
      dispatch(
        showAlert({
          message,
          options: {
            key: "station/fetchVaultStatusError",
            variant: "error",
          },
        })
      );
      return rejectWithValue(message);
    }
  }
);

export const fetchKVEngineConfiguration = createAsyncThunk(
  "station/fetchKVEngineConfiguration",
  async (kvEngine, { dispatch, rejectWithValue }) => {
    try {
      const response = await API.fetchKVEngineConfigurationAPI(kvEngine);
      return response.data;
    } catch (err) {
      const message = `Unable to fetch configuration for (${kvEngine})`;
      dispatch(
        showAlert({
          message,
          options: {
            key: "station/fetchKVEngineConfiguration",
            variant: "error",
          },
        })
      );

      return rejectWithValue(message);
    }
  }
);

export const fetchKVEngines = createAsyncThunk(
  "station/fetchKVEngines",
  async (_, { dispatch, rejectWithValue }) => {
    try {
      const response = await API.fetchKVEnginesAPI();
      return response.data;
    } catch (err) {
      const message = `Unable to fetch Vault Key Value Engines`;
      dispatch(
        showAlert({
          message,
          options: {
            key: "station/fetchKVEngines",
            variant: "error",
          },
        })
      );

      return rejectWithValue(message);
    }
  }
);

export const fetchVaultSecretData = createAsyncThunk(
  "station/fetchVaultSecretData",
  async (vaultPath, { dispatch, rejectWithValue }) => {
    try {
      const response = await API.fetchVaultSecretDataAPI(vaultPath);
      return response.data;
    } catch (err) {
      const message = `Unable to fetch secret data for (${vaultPath})`;
      dispatch(
        showAlert({
          message,
          options: {
            key: "station/fetchVaultSecretData",
            variant: "error",
          },
        })
      );

      return rejectWithValue(message);
    }
  }
);

export const modifyVaultSecretData = createAsyncThunk(
  "station/modifyVaultSecretData",
  async (payload, { dispatch, rejectWithValue }) => {
    try {
      await API.modifyVaultSecretDataAPI(payload);
      dispatch(
        showAlert({
          message: "Secret data has been updated successfully",
          options: {
            key: "station/modifyVaultSecretDataSuccess",
            variant: "success",
          },
        })
      );
    } catch (err) {
      const message = `Unable to modify secret data for (${payload.vaultPath})`;
      dispatch(
        showAlert({
          message,
          options: {
            key: "station/modifyVaultSecretDataError",
            variant: "error",
          },
        })
      );

      return rejectWithValue(message);
    }
  }
);

export const enableKVEngine = createAsyncThunk(
  "station/enableKVEngine",
  async (payload, { dispatch, rejectWithValue }) => {
    try {
      const response = await API.enableKVEngineAPI(payload);
      dispatch(
        showAlert({
          message: response.data,
          options: {
            key: "station/enableKVEngineSuccess",
            variant: "success",
          },
        })
      );

      dispatch(fetchKVEngines());
    } catch (err) {
      const message = `Error enabling kv engine for ${payload.path}`;
      dispatch(
        showAlert({
          message,
          options: {
            key: "station/enableKVEngineError",
            variant: "error",
          },
        })
      );

      return rejectWithValue(message);
    }
  }
);

export const disableKVEngine = createAsyncThunk(
  "station/disableKVEngine",
  async (kvEngine, { dispatch, rejectWithValue }) => {
    try {
      const response = await API.disableKVEngineAPI(kvEngine);
      dispatch(
        showAlert({
          message: response.data,
          options: {
            key: "station/disableKVEngineSuccess",
            variant: "success",
          },
        })
      );
    } catch (err) {
      const message = `Error disabling KV Engine for (${kvEngine})`;
      dispatch(
        showAlert({
          message,
          options: {
            key: "station/disableKVEngineError",
            variant: "error",
          },
        })
      );

      return rejectWithValue(message);
    }
  }
);

export const deleteVaultSecret = createAsyncThunk(
  "station/deleteVaultSecret",
  async (vaultPath, { dispatch, rejectWithValue }) => {
    try {
      const response = await API.deleteVaultSecretAPI(vaultPath);
      dispatch(
        showAlert({
          message: response.data,
          options: {
            key: "station/deleteVaultSecretSuccess",
            variant: "success",
          },
        })
      );

      dispatch(fetchKVEngines());
    } catch (err) {
      const message = `Error deleting Secret (${vaultPath})`;
      dispatch(
        showAlert({
          message,
          options: {
            key: "station/deleteVaultSecretError",
            variant: "error",
          },
        })
      );

      return rejectWithValue(message);
    }
  }
);

export const createVaultSecret = createAsyncThunk(
  "station/createVaultSecret",
  async (payload, { dispatch, rejectWithValue }) => {
    try {
      const response = await API.createVaultSecretAPI(payload);
      dispatch(
        showAlert({
          message: response.data,
          options: {
            key: "station/createVaultSecretSuccess",
            variant: "success",
          },
        })
      );

      dispatch(fetchKVEngines());
    } catch (err) {
      const message =
        err?.response?.data || `Error creating Secret (${payload.secretPath})`;
      dispatch(
        showAlert({
          message,
          options: {
            key: "station/createVaultSecretError",
            variant: "error",
          },
        })
      );

      return rejectWithValue(message);
    }
  }
);

export const fetchVaultUnsealStatus = createAsyncThunk(
  "station/fetchVaultUnsealStatus",
  async (_, { dispatch, rejectWithValue }) => {
    try {
      const response = await API.fetchVaultUnsealStatusAPI();
      return response.data;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const fetchTrains = createAsyncThunk(
  "station/fetchTrains",
  async (_, { dispatch, rejectWithValue }) => {
    try {
      const response = await API.fetchTrainsAPI();
      return response.data;
    } catch (err) {
      const message = `Unable to fetch Trains: (${err.message})`;
      dispatch(
        showAlert({
          message: err?.response?.data?.message || message,
          options: {
            key: "station/fetchTrainsError",
            variant: "error",
          },
        })
      );
      return rejectWithValue(message);
    }
  }
);

export const fetchImages = createAsyncThunk(
  "station/fetchImages",
  async (_, { dispatch, rejectWithValue }) => {
    try {
      const response = await API.fetchImagesAPI();
      return response.data;
    } catch (err) {
      const message = `Unable to fetch Images: (${err.message})`;
      dispatch(
        showAlert({
          message: err?.response?.data?.message || message,
          options: {
            key: "station/fetchImagesError",
            variant: "error",
          },
        })
      );
      return rejectWithValue(message);
    }
  }
);

export const fetchContainers = createAsyncThunk(
  "station/fetchContainers",
  async (_, { dispatch, rejectWithValue }) => {
    try {
      const response = await API.fetchContainersAPI();
      return response.data;
    } catch (err) {
      const message = `Unable to fetch Containers: (${err.message})`;
      dispatch(
        showAlert({
          message: err?.response?.data?.message || message,
          options: {
            key: "station/fetchContainersError",
            variant: "error",
          },
        })
      );
      return rejectWithValue(message);
    }
  }
);

export const fetchFederatedContainerConfig = createAsyncThunk(
  "station/fetchFederatedContainerConfig",
  async (payload, { dispatch, rejectWithValue }) => {
    try {
      const response = await API.fetchFederatedContainerConfigAPI(payload);
      return response.data;
    } catch (err) {
      const vaultErr = err?.response?.data?.includes("Vault");
      const message = vaultErr
        ? "Vault is sealed. Please unseal Vault and try again."
        : `Unable to fetch container config for (${payload.jobid})`;

      dispatch(
        showAlert({
          message,
          options: {
            key: payload.jobid,
            variant: vaultErr ? "warning" : "error",
          },
        })
      );

      return rejectWithValue(err.message);
    }
  }
);

export const fetchIncrementalContainerConfig = createAsyncThunk(
  "station/fetchIncrementalContainerConfig",
  async (payload, { dispatch, rejectWithValue }) => {
    try {
      const response = await API.fetchIncrementalContainerConfigAPI(payload);
      return response.data;
    } catch (err) {
      const vaultErr = err?.response?.data?.includes("Vault");
      const message = vaultErr
        ? "Vault is sealed. Please unseal Vault and try again."
        : `Unable to fetch container config for (${payload.jobId})`;

      dispatch(
        showAlert({
          message,
          options: {
            key: payload.jobid,
            variant: vaultErr ? "warning" : "error",
          },
        })
      );

      return rejectWithValue(err.message);
    }
  }
);

export const rejectTrainRequest = createAsyncThunk(
  "station/rejectTrainRequest",
  async (payload, { dispatch, rejectWithValue }) => {
    try {
      await API.rejectTrainRequestAPI(payload);
      dispatch(
        showAlert({
          message: `The job (${payload.jobid}) has been rejected`,
          options: {
            key: payload.jobid,
            variant: "success",
          },
        })
      );
      return payload.jobid;
    } catch (err) {
      const message = `Failed to reject the job (${payload.jobid})`;
      dispatch(
        showAlert({
          message,
          options: {
            key: payload.jobid,
            variant: "error",
          },
        })
      );
      return rejectWithValue(message);
    }
  }
);

export const pullIncrementalImage = createAsyncThunk(
  "station/pullIncrementalImage",
  async (payload, { dispatch, rejectWithValue }) => {
    try {
      const options = {
        onDownloadProgress: ({ event }) => {
          const logs = event.target.response.replace(regex, (match, grp) =>
            String.fromCharCode(parseInt(grp, 16))
          );

          const { progress, totalFsLayersCompleted, totalFsLayers } =
            handleFsLayers(logs, payload.jobid);

          dispatch(
            stationSlice.actions.setPullImageLogs({
              logs,
              progress,
              jobID: payload.jobid,
              completedLayers: totalFsLayersCompleted,
              totalLayers: totalFsLayers,
            })
          );
        },
      };

      await API.pullIncrementalImageAPI(payload, options);
      dispatch(
        showAlert({
          message: `The image for job (${payload.jobid}) has been pulled`,
          options: {
            key: `station/pullIncrementalImage-${payload.jobid}`,
            variant: "success",
          },
        })
      );
    } catch (err) {
      dispatch(
        showAlert({
          message: `Unable to pull image for job (${payload.jobid})`,
          options: {
            key: `station/pullIncrementalImage-${payload.jobid}`,
            variant: "error",
          },
        })
      );

      return rejectWithValue(err.message);
    }
  }
);

export const pullFederatedImage = createAsyncThunk(
  "station/pullFederatedImage",
  async (payload, { dispatch, rejectWithValue }) => {
    try {
      const options = {
        onDownloadProgress: ({ event }) => {
          const logs = event.target.response.replace(regex, (match, grp) =>
            String.fromCharCode(parseInt(grp, 16))
          );

          const { progress, totalFsLayersCompleted, totalFsLayers } =
            handleFsLayers(logs, payload.jobid);

          dispatch(
            stationSlice.actions.setPullImageLogs({
              logs,
              progress,
              jobID: payload.jobid,
              completedLayers: totalFsLayersCompleted,
              totalLayers: totalFsLayers,
            })
          );
        },
      };

      await API.pullFederatedImageAPI(payload, options);
      dispatch(
        showAlert({
          message: `The image for job (${payload.jobid}) has been pulled`,
          options: {
            key: `station/pullFederatedImage-${payload.jobid}`,
            variant: "success",
          },
        })
      );
    } catch (err) {
      const vaultErr = err?.response?.data?.includes("Vault");
      const message = vaultErr
        ? "Vault is sealed. Please unseal Vault and try again."
        : `Unable to pull image for job (${payload.jobid})`;

      dispatch(
        showAlert({
          message,
          options: {
            key: `station/pullFederatedImage-${payload.jobid}`,
            variant: vaultErr ? "warning" : "error",
          },
        })
      );

      return rejectWithValue(err.message);
    }
  }
);

export const decryptImage = createAsyncThunk(
  "station/decryptImage",
  async (payload, { dispatch, rejectWithValue }) => {
    try {
      await API.decryptImageAPI(payload);
      dispatch(
        showAlert({
          message: `Image (${payload.image}) has been decrypted.`,
          options: {
            key: `station/decryptImage-${payload.jobId}`,
            variant: "success",
          },
        })
      );
    } catch (err) {
      const vaultErr = err?.response?.data?.includes("Vault");
      const message = vaultErr
        ? "Vault is sealed. Please unseal Vault and try again."
        : `Error: Decryption failed for image (${payload.image})`;

      dispatch(
        showAlert({
          message,
          options: {
            key: `station/decryptImage-${payload.jobId}`,
            variant: vaultErr ? "warning" : "error",
          },
        })
      );

      return rejectWithValue(err.message);
    }
  }
);

export const deleteImage = createAsyncThunk(
  "station/deleteImage",
  async (payload, { dispatch, rejectWithValue }) => {
    try {
      await API.deleteImageAPI(payload);
      dispatch(
        showAlert({
          message: `Image (${payload.image}) has been removed.`,
          options: {
            key: payload.jobId,
            variant: "success",
          },
        })
      );
    } catch (err) {
      dispatch(
        showAlert({
          message: `Unable to delete image (${payload.image}).`,
          options: {
            key: payload.jobId,
            variant: "error",
          },
        })
      );

      return rejectWithValue(err.message);
    }
  }
);

export const pushImage = createAsyncThunk(
  "station/pushImage",
  async (payload, { dispatch, rejectWithValue }) => {
    try {
      await API.pushImageAPI(payload);
      dispatch(
        showAlert({
          message: `Image (${payload.image}) has been pushed`,
          options: {
            key: payload.jobId,
            variant: "success",
          },
        })
      );
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const createContainer = createAsyncThunk(
  "station/createContainer",
  async (payload, { dispatch, rejectWithValue }) => {
    try {
      const res = await API.createContainerAPI(payload);
      dispatch(
        showAlert({
          message: res.data,
          options: {
            key: payload?.jobId || payload?.jobid,
            variant: "success",
          },
        })
      );
    } catch (err) {
      const message =
        err?.response?.data?.message ||
        `Unable to create container for image (${
          payload?.trainclassidlearning || payload?.image
        })`;

      dispatch(
        showAlert({
          message,
          options: {
            key: payload?.jobId || payload?.jobid,
            variant: "error",
          },
        })
      );

      return rejectWithValue(message);
    }
  }
);

export const startFederatedLearning = createAsyncThunk(
  "station/startFederatedLearning",
  async (payload, { dispatch, rejectWithValue }) => {
    try {
      await API.startFederatedLearningAPI(payload);
      dispatch(
        showAlert({
          message: `Federated job (${payload.jobid}) successfully started learning`,
          options: {
            key: `fedLearningSuccess-${payload?.jobId || payload?.jobid}`,
            variant: "success",
          },
        })
      );
    } catch (err) {
      const message =
        err?.response?.data?.message ||
        `Unable to start federated job: (${payload.jobid})`;

      dispatch(
        showAlert({
          message,
          options: {
            key: `fedLearningErr-${payload?.jobId || payload?.jobid}`,
            variant: "error",
          },
        })
      );

      return rejectWithValue(message);
    }
  }
);

export const initializeVault = createAsyncThunk(
  "station/initializeVault",
  async (payload, { dispatch, rejectWithValue }) => {
    try {
      const response = await API.initializeVaultAPI(payload);
      dispatch(
        showAlert({
          message: `Vault has been initialized`,
          options: {
            key: "station/initializeVaultSuccess",
            variant: "success",
          },
        })
      );
      return response.data;
    } catch (err) {
      dispatch(
        showAlert({
          message: `Unable to initialize vault`,
          options: {
            key: "station/initializeVaultError",
            variant: "error",
          },
        })
      );
      return rejectWithValue(err.message);
    }
  }
);

export const unsealVault = createAsyncThunk(
  "station/unsealVault",
  async (payload, { dispatch, rejectWithValue }) => {
    try {
      const response = await API.unsealVaultAPI(payload);
      return response.data;
    } catch (err) {
      dispatch(
        showAlert({
          message: err?.response?.data || "Unable to unseal vault",
          options: {
            key: "station/unsealVaultError",
            variant: "error",
          },
        })
      );
      return rejectWithValue(err.message);
    }
  }
);

export const loginVault = createAsyncThunk(
  "station/loginVault",
  async (payload, { dispatch, rejectWithValue }) => {
    try {
      await API.loginVaultAPI(payload);
    } catch (err) {
      dispatch(
        showAlert({
          message: "Unable to login vault. Please ensure if token is correct",
          options: {
            key: "station/loginVaultError",
            variant: "error",
          },
        })
      );
      return rejectWithValue(err.message);
    }
  }
);

export const startContainer = createAsyncThunk(
  "station/startContainer",
  async (payload, { dispatch, rejectWithValue }) => {
    try {
      await API.startContainerAPI(payload);
      dispatch(
        showAlert({
          message: `Container (${payload.container}) has been started`,
          options: {
            key: `${payload.container}`,
            variant: "success",
          },
        })
      );
    } catch (err) {
      const message =
        err?.response?.data?.message ||
        `Unable to start container (${payload.container})`;
      dispatch(
        showAlert({
          message,
          options: {
            key: `${payload.container}`,
            variant: "error",
          },
        })
      );
      return rejectWithValue(message);
    }
  }
);

export const removeContainer = createAsyncThunk(
  "station/removeContainer",
  async (payload, { dispatch, rejectWithValue }) => {
    try {
      await API.removeContainerAPI(payload);
      dispatch(
        showAlert({
          message: `Container (${payload.container}) has been removed`,
          options: {
            key: `${payload.container}`,
            variant: "success",
          },
        })
      );
    } catch (err) {
      const message =
        err?.response?.data?.message ||
        `Unable to remove container (${payload.container})`;
      dispatch(
        showAlert({
          message,
          options: {
            key: `${payload.container}`,
            variant: "error",
          },
        })
      );
      return rejectWithValue(message);
    }
  }
);

export const commitContainer = createAsyncThunk(
  "station/commitContainer",
  async (payload, { dispatch, rejectWithValue }) => {
    try {
      await API.commitContainerAPI(payload);
      dispatch(
        showAlert({
          message: `Container (${payload.container}) has been encrypted and committed`,
          options: {
            key: `${payload.container}`,
            variant: "success",
          },
        })
      );
    } catch (err) {
      const vaultErr = err?.response?.data?.includes("Vault");
      const message = vaultErr
        ? "Vault is sealed. Please unseal Vault and try again."
        : err?.response?.data ||
          `Unable to save updates for container (${payload.container})`;

      dispatch(
        showAlert({
          message,
          options: {
            key: `${payload.container}`,
            variant: vaultErr ? "warning" : "error",
          },
        })
      );
      return rejectWithValue(message);
    }
  }
);

export const showContainerLogs = createAsyncThunk(
  "station/showContainerLogs",
  async (payload, { dispatch, rejectWithValue }) => {
    try {
      const response = await API.showContainerLogsAPI(payload);
      return response.data;
    } catch (err) {
      const message =
        err?.response?.data?.message ||
        `Unable to show logs for container (${payload.container})`;
      dispatch(
        showAlert({
          message,
          options: {
            key: `${payload.container}-containerLogsError`,
            variant: "error",
          },
        })
      );
      return rejectWithValue(err.message);
    }
  }
);

export const showContainerChanges = createAsyncThunk(
  "station/showContainerChanges",
  async (payload, { dispatch, rejectWithValue }) => {
    try {
      const response = await API.showContainerChangesAPI(payload);
      return response.data;
    } catch (err) {
      const message =
        err?.response?.data?.message ||
        `Unable to get results for container (${payload.container})`;
      dispatch(
        showAlert({
          message,
          options: {
            key: `${payload.container}-containerChangesError`,
            variant: "error",
          },
        })
      );
      return rejectWithValue(err.message);
    }
  }
);

export const showContainerDiff = createAsyncThunk(
  "station/showContainerDiff",
  async (payload, { dispatch, rejectWithValue }) => {
    try {
      const response = await API.showContainerDiffAPI(payload);
      return response.data;
    } catch (err) {
      const message =
        err?.response?.data?.message ||
        `Unable to get changes for container (${payload.container})`;
      dispatch(
        showAlert({
          message,
          options: {
            key: `${payload.container}-containerDiffError`,
            variant: "error",
          },
        })
      );
      return rejectWithValue(err.message);
    }
  }
);

export const downloadJobResult = createAsyncThunk(
  "station/downloadJobResult",
  async (payload, { dispatch, rejectWithValue }) => {
    try {
      const response = await API.downloadJobResultAPI(payload);

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
    } catch (error) {
      const message = `Download failed for container (${payload.container})`;
      dispatch(
        showAlert({
          message,
          options: {
            key: `${payload.container}-downloadError`,
            variant: "error",
          },
        })
      );

      return rejectWithValue(message);
    }
  }
);

export const showContainerFileChanges = createAsyncThunk(
  "station/showContainerFileChanges",
  async (payload, { dispatch, rejectWithValue }) => {
    try {
      const isImageFile = imageRegex.test(payload.filepath);
      const response = await API.showContainerFileChangesAPI({
        responseType: isImageFile ? "blob" : "json",
        params: payload,
      });

      return { content: response.data, file: payload.filepath };
    } catch (err) {
      const message = `Failed to view file (${payload.filepath})`;
      dispatch(
        showAlert({
          message,
          options: {
            key: payload.filepath,
            variant: "error",
          },
        })
      );
      return rejectWithValue(err?.response?.data || err.message);
    }
  }
);

export const fetchStationInfo = createAsyncThunk(
  "station/fetchStationInfo",
  async (_, { dispatch, rejectWithValue }) => {
    try {
      const response = await API.fetchStationInfoAPI();
      return response.data;
    } catch (err) {
      const message = `Error fetching station info (${err.message})`;
      dispatch(
        showAlert({
          message,
          options: {
            key: "station/fetchStationInfoError",
            variant: "error",
          },
        })
      );
      return rejectWithValue(message);
    }
  }
);

const initialState = {
  jobs: [],
  trains: [],
  images: [],
  containers: [],
  containerConfig: {
    containerMount: "",
    hostMount: "",
  },
  stationID: "",
  stationName: "",
  stationVersion: "",
  containerLogs: "",
  containerCompareDiff: "",
  containerResultsFetchedId: "",
  selectedContainer: {},
  selectedFileToView: { name: "", kindCode: null }, // Filename to show in View Tab
  resultItem: { type: "", content: null }, // Item for Viewing in Tab
  containerResults: [],
  downloadFiles: [],
  vault: {
    initialized: false,
    sealed: true,
    authenticated: false,
    keyThreshold: 0,
    keysProvided: null,
    keysTotal: null,
    vaultKeys: {},
    kvEngines: [],
    kvEngineConfig: {},
    vaultSecrets: { secretData: [] },
  },
  openTab: 0, // List Tab: 0, View Tab: 1
  openTabId: resultTab.LIST,
  learning: window.location.pathname.includes(learningType.FEDERATED)
    ? learningType.FEDERATED
    : learningType.INCREMENTAL,
  message: "",
  // Modal states
  openRejectModal: false,
  openContainerModal: false,
  openContainerLogsModal: false,
  openContainerChangesModal: false,
  // Loading states
  loading: false,
  loadingVault: false,
  loadingImages: false,
  loadingContainers: false,
  loadingContainerLogs: false,
  loadingContainerChanges: false,
  loadingContainerView: false, // For Compare Tab
  loadingContainerDiff: false, // For Compare Tab
  loadingConfig: false,
  loadingFederatedJobs: false,
  pendingRejection: false,
  pendingCreation: false,
  pendingVaultInit: false,
  pendingVaultUnseal: false,
  pendingVaultLogin: false,
  pendingRowOperation: false,
};

const stationSlice = createSlice({
  name: "station",
  initialState,
  reducers: {
    setLearningType: (state, { payload }) => {
      state.learning = payload;
    },
    setRejectModal: (state, { payload }) => {
      state.openRejectModal = payload;
    },
    setContainerModal: (state, { payload }) => {
      state.openContainerModal = payload;
    },
    setContainerLogsModal: (state, { payload }) => {
      state.openContainerLogsModal = payload;
    },
    setContainerChangesModal: (state, { payload }) => {
      state.openContainerChangesModal = payload;
    },
    setDownloadFiles: (state, { payload }) => {
      state.downloadFiles = payload;
    },
    setPullImageLogs: (state, { payload }) => {
      const idx = state.trains.findIndex(
        (train) => train.jobID === payload.jobID
      );

      state.trains[idx].progress = payload.progress;
      state.trains[idx].completedLayers = payload.completedLayers;
      state.trains[idx].totalLayers = payload.totalLayers;
      state.trains[idx].logs = `${state.trains[idx].logs}${payload.logs}`;
    },
    setEnvVariable: (state, { payload }) => {
      state.containerConfig.envVariableList[payload.idx][payload.name] =
        payload.value;
    },
    setBindMount: (state, { payload }) => {
      state.containerConfig[payload.name] = payload.value;
    },
    addCustomEnvVariable: (state, { payload }) => {
      state.containerConfig.envVariableList.push(payload);
    },
    addCustomKeyValue: (state, { payload }) => {
      state.vault.vaultSecrets.secretData.push(payload);
    },
    resetVaultSecretData: (state) => {
      state.vault.vaultSecrets.secretData = [];
    },
    removeCustomKeyValue: (state, { payload }) => {
      const idx = state.vault.vaultSecrets.secretData.findIndex(
        (kv) => kv.name === payload
      );
      state.vault.vaultSecrets.secretData.splice(idx, 1);
    },
    setOpenTab: (state, { payload }) => {
      state.openTab = payload.tab;
      state.openTabId = payload.tabId;
    },
    resetResultTab: (state) => {
      if (state.resultItem.type === resultItemSupportedTypes.IMAGE) {
        URL.revokeObjectURL(state.resultItem.content);
      }

      // Resetting tab state
      state.selectedFileToView = { name: "", kindCode: null };
      state.openTab = 0;
      state.openTabId = resultTab.LIST;
      state.resultItem = { type: "", content: null };
      state.downloadFiles = [];
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchStationInfo.fulfilled, (state, { payload }) => {
        state.stationVersion = payload.appVersion;
      })
      .addCase(fetchVaultStatus.pending, (state) => {
        state.loadingVault = true;
      })
      .addCase(fetchVaultStatus.fulfilled, (state, { payload }) => {
        state.loadingVault = false;
        state.vault.initialized = payload?.initialized;
        state.vault.sealed = payload?.sealed;
        state.vault.authenticated = payload?.authenticated;
        // state.vault.kvEngines = payload.kvEngines;
        state.stationID = payload.config.stationID;
        state.stationName = payload.config.stationName;
      })
      .addCase(fetchVaultStatus.rejected, (state) => {
        state.loadingVault = false;
      })
      .addCase(fetchKVEngineConfiguration.pending, (state) => {
        state.loadingVault = true;
      })
      .addCase(fetchKVEngineConfiguration.fulfilled, (state, { payload }) => {
        state.loadingVault = false;
        state.vault.kvEngineConfig = payload;
      })
      .addCase(fetchKVEngineConfiguration.rejected, (state) => {
        state.loadingVault = false;
      })
      .addCase(fetchKVEngines.pending, (state) => {
        state.loadingVault = true;
      })
      .addCase(fetchKVEngines.fulfilled, (state, { payload }) => {
        state.loadingVault = false;
        state.vault.kvEngines = payload;
      })
      .addCase(fetchKVEngines.rejected, (state) => {
        state.loadingVault = false;
      })
      .addCase(fetchVaultSecretData.pending, (state) => {
        state.loadingVault = true;
      })
      .addCase(fetchVaultSecretData.fulfilled, (state, { payload }) => {
        state.loadingVault = false;
        state.vault.vaultSecrets = payload;
      })
      .addCase(fetchVaultSecretData.rejected, (state) => {
        state.loadingVault = false;
      })
      .addCase(modifyVaultSecretData.pending, (state) => {
        state.loadingVault = true;
      })
      .addCase(modifyVaultSecretData.fulfilled, (state) => {
        state.loadingVault = false;
      })
      .addCase(modifyVaultSecretData.rejected, (state) => {
        state.loadingVault = false;
      })
      .addCase(disableKVEngine.fulfilled, (state, { meta }) => {
        const idx = state.vault.kvEngines.findIndex(
          (eng) => eng.name === meta.arg
        );
        state.vault.kvEngines.splice(idx, 1);
      })
      .addCase(fetchVaultUnsealStatus.pending, (state) => {
        state.loadingVault = true;
      })
      .addCase(fetchVaultUnsealStatus.fulfilled, (state, { payload }) => {
        state.loadingVault = false;
        state.vault.keysProvided = payload?.progress;
        state.vault.keysTotal = payload?.total;
      })
      .addCase(fetchVaultUnsealStatus.rejected, (state) => {
        state.loadingVault = false;
      })
      .addCase(initializeVault.pending, (state) => {
        state.pendingVaultInit = true;
      })
      .addCase(initializeVault.fulfilled, (state, { payload }) => {
        state.pendingVaultInit = false;
        state.vault.vaultKeys = payload?.vaultKeys;
        state.vault.keyThreshold = payload?.keyThreshold;
        state.vault.initialized = true;
      })
      .addCase(initializeVault.rejected, (state) => {
        state.pendingVaultInit = false;
      })
      .addCase(unsealVault.pending, (state) => {
        state.pendingVaultUnseal = true;
      })
      .addCase(unsealVault.fulfilled, (state, { payload }) => {
        state.pendingVaultUnseal = false;
        state.vault.keysProvided = payload?.progress;
        state.vault.keysTotal = payload?.total;
        state.vault.sealed = payload?.sealed;
      })
      .addCase(unsealVault.rejected, (state) => {
        state.pendingVaultUnseal = false;
      })
      .addCase(loginVault.pending, (state) => {
        state.pendingVaultLogin = true;
      })
      .addCase(loginVault.fulfilled, (state) => {
        state.pendingVaultLogin = false;
        state.vault.authenticated = true;
      })
      .addCase(loginVault.rejected, (state) => {
        state.pendingVaultLogin = false;
      })
      .addCase(fetchTrains.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchTrains.fulfilled, (state, { payload }) => {
        state.loading = false;

        const loadedTrains =
          state.learning === learningType.INCREMENTAL
            ? payload?.incrementalTrains?.map((incTrain, idx) =>
                createData(
                  idx + 1,
                  incTrain.jobid,
                  incTrain.trainclassid,
                  incTrain.trainstoragelocation,
                  incTrain.pid,
                  incTrain.currentstation,
                  incTrain.nextstation
                )
              )
            : payload?.federatedTrains?.map((flTrain, idx) =>
                createDataFL(
                  idx + 1,
                  flTrain.learningstoragelocation,
                  flTrain.jobid,
                  flTrain.pid,
                  flTrain.currentround,
                  flTrain.maxrounds,
                  flTrain.trainclassidlearning,
                  flTrain.verified
                )
              );

        state.trains = loadedTrains;
      })
      .addCase(fetchTrains.rejected, (state, { payload }) => {
        state.loading = false;
        state.message = payload;
      })
      .addCase(fetchImages.pending, (state) => {
        state.loadingImages = true;
      })
      .addCase(fetchImages.fulfilled, (state, { payload }) => {
        state.loadingImages = false;
        state.images = [...payload.pullImages, ...payload.pushImages].map(
          (img) =>
            createImageData(
              img.Id,
              img.TrainClassId,
              img.RepoTag,
              img.status,
              img?.JobId,
              img?.Labels ? JSON.parse(img?.Labels) : ""
            )
        );
      })
      .addCase(fetchImages.rejected, (state) => {
        state.loadingImages = false;
      })
      .addCase(fetchContainers.pending, (state) => {
        state.loadingContainers = true;
      })
      .addCase(fetchContainers.fulfilled, (state, { payload }) => {
        state.loadingContainers = false;
        state.containers = payload.containers.map((cntr) =>
          createContainerData(
            cntr.Id,
            cntr.TrainClassId,
            cntr.Name,
            cntr.Image,
            cntr.State,
            cntr.Status,
            cntr.JobId,
            cntr.NextTag,
            cntr.Repo
          )
        );
      })
      .addCase(fetchContainers.rejected, (state) => {
        state.loadingContainers = false;
      })
      .addCase(createContainer.pending, (state) => {
        state.pendingCreation = true;
      })
      .addCase(createContainer.fulfilled, (state) => {
        state.pendingCreation = false;
        state.openContainerModal = false;
      })
      .addCase(createContainer.rejected, (state, { payload }) => {
        state.pendingCreation = false;
        state.message = payload;
      })
      .addCase(startFederatedLearning.pending, (state) => {
        state.pendingCreation = true;
      })
      .addCase(startFederatedLearning.fulfilled, (state) => {
        state.pendingCreation = false;
        state.openContainerModal = false;
      })
      .addCase(startFederatedLearning.rejected, (state, { payload }) => {
        state.pendingCreation = false;
        state.message = payload;
      })
      .addCase(showContainerLogs.pending, (state) => {
        state.loadingContainerLogs = true;
        state.openContainerLogsModal = true;
        state.containerLogs = "";
      })
      .addCase(showContainerLogs.fulfilled, (state, { payload }) => {
        state.loadingContainerLogs = false;
        state.containerLogs = payload || "No logs available";
      })
      .addCase(showContainerLogs.rejected, (state, { payload }) => {
        state.loadingContainerLogs = false;
        state.message = payload;
      })
      .addCase(showContainerChanges.pending, (state) => {
        state.loadingContainerChanges = true;
        state.openContainerChangesModal = true;
        state.containerResults = [];
        state.downloadFiles = []; // Clear file selection from previous container modal
      })
      .addCase(showContainerChanges.fulfilled, (state, { payload, meta }) => {
        state.loadingContainerChanges = false;
        state.containerResultsFetchedId = meta.arg.container;
        state.selectedContainer = meta.arg;
        state.containerResults = payload;
      })
      .addCase(showContainerChanges.rejected, (state, { payload }) => {
        state.loadingContainerChanges = false;
        state.message = payload;
      })
      .addCase(showContainerDiff.pending, (state) => {
        state.loadingContainerDiff = true;
      })
      .addCase(showContainerDiff.fulfilled, (state, { payload }) => {
        state.loadingContainerDiff = false;
        state.containerCompareDiff = payload;
      })
      .addCase(showContainerDiff.rejected, (state, { payload, meta }) => {
        state.loadingContainerDiff = false;
        state.message = payload;
        state.containerCompareDiff = `<h3>Could not find file changes for container: (${meta.arg.container})</h3>`;
      })
      .addCase(decryptImage.pending, (state, { meta }) => {
        const idx = state.images.findIndex((img) => img.id === meta.arg.id);
        state.images[idx].loading = true;
        state.pendingRowOperation = true;
      })
      .addCase(decryptImage.fulfilled, (state, { meta }) => {
        const idx = state.images.findIndex((img) => img.id === meta.arg.id);
        state.images[idx].loading = false;
        state.pendingRowOperation = false;
      })
      .addCase(decryptImage.rejected, (state, { payload, meta }) => {
        const idx = state.images.findIndex((img) => img.id === meta.arg.id);
        state.images[idx].loading = false;
        state.pendingRowOperation = false;
        state.message = payload;
      })
      .addCase(showContainerFileChanges.pending, (state, { meta }) => {
        state.loadingContainerView = true;
        state.downloadFiles = []; // Resetting the checkbox state in List Tab

        // Releasing previous object to prevent memory leaks
        if (state.resultItem.type === resultItemSupportedTypes.IMAGE) {
          URL.revokeObjectURL(state.resultItem.content);
        }

        // Reset previous file content
        state.resultItem = { type: "", content: null };

        // Jump to View tab
        state.openTab = 1;
        state.openTabId = resultTab.VIEW;
        state.selectedFileToView = {
          name: meta.arg.filepath,
          kindCode: meta.arg.kindCode,
        };
      })
      .addCase(showContainerFileChanges.fulfilled, (state, { payload }) => {
        state.loadingContainerView = false;

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
      })
      .addCase(showContainerFileChanges.rejected, (state, { payload }) => {
        state.loadingContainerView = false;
        state.message = payload;
      })
      .addCase(deleteImage.pending, (state, { meta }) => {
        const idx = state.images.findIndex((img) => img.id === meta.arg.id);
        state.images[idx].loading = true;
        state.pendingRowOperation = true;
      })
      .addCase(deleteImage.fulfilled, (state, { meta }) => {
        // Remove from list after deleted
        const idx = state.images.findIndex((img) => img.id === meta.arg.id);
        state.images.splice(idx, 1);
        state.pendingRowOperation = false;
      })
      .addCase(deleteImage.rejected, (state, { payload, meta }) => {
        const idx = state.images.findIndex((img) => img.id === meta.arg.id);
        state.images[idx].loading = false;
        state.pendingRowOperation = false;
        state.message = payload;
      })
      .addCase(removeContainer.pending, (state, { meta }) => {
        const idx = state.containers.findIndex(
          (ctr) => ctr.jobId === meta.arg.jobId
        );
        state.containers[idx].loading = true;
        state.pendingRowOperation = true;
      })
      .addCase(removeContainer.fulfilled, (state, { meta }) => {
        // Remove from list after deleted
        const idx = state.containers.findIndex(
          (ctr) => ctr.jobId === meta.arg.jobId
        );
        state.containers.splice(idx, 1);
        state.pendingRowOperation = false;
      })
      .addCase(removeContainer.rejected, (state, { payload, meta }) => {
        const idx = state.containers.findIndex(
          (ctr) => ctr.jobId === meta.arg.jobId
        );
        state.containers[idx].loading = false;
        state.pendingRowOperation = false;
        state.message = payload;
      })
      .addCase(startContainer.pending, (state, { meta }) => {
        const idx = state.containers.findIndex(
          (ctr) => ctr.jobId === meta.arg.jobId
        );
        state.containers[idx].loading = true;
        state.pendingRowOperation = true;
      })
      .addCase(startContainer.fulfilled, (state, { meta }) => {
        const idx = state.containers.findIndex(
          (ctr) => ctr.jobId === meta.arg.jobId
        );
        state.containers[idx].loading = false;
        state.containers[idx].state = containerState.RUNNING;
        state.containers[idx].status = "Up Less than a second";
        state.pendingRowOperation = false;
      })
      .addCase(startContainer.rejected, (state, { payload, meta }) => {
        const idx = state.containers.findIndex(
          (ctr) => ctr.jobId === meta.arg.jobId
        );
        state.containers[idx].loading = false;
        state.pendingRowOperation = false;
        state.message = payload;
      })
      .addCase(commitContainer.pending, (state, { meta }) => {
        const idx = state.containers.findIndex(
          (ctr) => ctr.jobId === meta.arg.jobId
        );
        state.containers[idx].loading = true;
        state.pendingRowOperation = true;
      })
      .addCase(commitContainer.fulfilled, (state, { meta }) => {
        const idx = state.containers.findIndex(
          (ctr) => ctr.jobId === meta.arg.jobId
        );

        // Remove container from list after changes are saved
        state.containers.splice(idx, 1);
        state.pendingRowOperation = false;
      })
      .addCase(commitContainer.rejected, (state, { payload, meta }) => {
        const idx = state.containers.findIndex(
          (ctr) => ctr.jobId === meta.arg.jobId
        );
        state.containers[idx].loading = false;
        state.pendingRowOperation = false;
        state.message = payload;
      })
      .addCase(pushImage.pending, (state, { meta }) => {
        const idx = state.images.findIndex((img) => img.id === meta.arg.id);
        state.images[idx].loading = true;
        state.pendingRowOperation = true;
      })
      .addCase(pushImage.fulfilled, (state, { meta }) => {
        // Remove from list after image is pushed
        const idx = state.images.findIndex((img) => img.id === meta.arg.id);
        state.images.splice(idx, 1);
        state.pendingRowOperation = false;
      })
      .addCase(pushImage.rejected, (state, { payload, meta }) => {
        const idx = state.images.findIndex((img) => img.id === meta.arg.id);
        state.images[idx].loading = false;
        state.pendingRowOperation = false;
        state.message = payload;
      })
      .addCase(fetchFederatedContainerConfig.pending, (state, { meta }) => {
        state.loadingConfig = true;
      })
      .addCase(
        fetchFederatedContainerConfig.fulfilled,
        (state, { payload }) => {
          state.loadingConfig = false;
          state.openContainerModal = true;
          state.containerConfig = payload;
          state.containerConfig.envVariableList.forEach((env) => {
            env.option = "manual";
            env.value = "";
            env.disabled = env.name.length > 0;

            if (env.type === "select") {
              env.options = [
                { label: <b>None</b>, value: "" },
                ...env.options.map((opt) => ({ label: opt, value: opt })),
              ];
            }
          });
        }
      )
      .addCase(fetchFederatedContainerConfig.rejected, (state) => {
        state.loadingConfig = false;
      })
      .addCase(fetchIncrementalContainerConfig.pending, (state) => {
        state.loadingConfig = true;
      })
      .addCase(
        fetchIncrementalContainerConfig.fulfilled,
        (state, { payload }) => {
          state.loadingConfig = false;
          state.openContainerModal = true;
          state.containerConfig = payload;
          state.containerConfig.envVariableList.forEach((env) => {
            env.option = "manual";
            env.value = "";
            env.disabled = env.name.length > 0;

            if (env.type === "select") {
              env.options = [
                { label: <b>None</b>, value: "" },
                ...env.options.map((opt) => ({ label: opt, value: opt })),
              ];
            }
          });
        }
      )
      .addCase(fetchIncrementalContainerConfig.rejected, (state) => {
        state.loadingConfig = false;
      })
      .addCase(rejectTrainRequest.pending, (state) => {
        state.pendingRejection = true;
      })
      .addCase(rejectTrainRequest.fulfilled, (state, { payload }) => {
        state.pendingRejection = false;
        state.trains = state.trains.filter((train) => train.jobID !== payload);
        state.openRejectModal = false;
      })
      .addCase(rejectTrainRequest.rejected, (state, { payload }) => {
        state.pendingRejection = false;
        state.message = payload;
      })
      .addCase(pullIncrementalImage.pending, (state, { meta }) => {
        // debugger;
        const idx = state.trains.findIndex(
          (train) => train.jobID === meta.arg.jobid
        );
        state.trains[idx].open = true;
      })
      .addCase(pullIncrementalImage.fulfilled, (state, { meta }) => {
        // debugger;
        const idx = state.trains.findIndex(
          (train) => train.jobID === meta.arg.jobid
        );
        // state.trains[idx].open = false;
        state.trains.splice(idx, 1);
      })
      .addCase(pullIncrementalImage.rejected, (state, { meta }) => {
        // debugger;
        const idx = state.trains.findIndex(
          (train) => train.jobID === meta.arg.jobid
        );
        state.trains[idx].open = false;
      })
      .addCase(pullFederatedImage.pending, (state, { meta }) => {
        const idx = state.trains.findIndex(
          (train) => train.jobID === meta.arg.jobid
        );
        state.trains[idx].open = true;
      })
      .addCase(pullFederatedImage.fulfilled, (state, { meta }) => {
        const idx = state.trains.findIndex(
          (train) => train.jobID === meta.arg.jobid
        );
        state.trains[idx].open = false;
      })
      .addCase(pullFederatedImage.rejected, (state, { meta }) => {
        const idx = state.trains.findIndex(
          (train) => train.jobID === meta.arg.jobid
        );
        state.trains[idx].open = false;
      });
  },
});

export const {
  setOpenTab,
  setBindMount,
  setRejectModal,
  setEnvVariable,
  setLearningType,
  setDownloadFiles,
  setContainerModal,
  setContainerLogsModal,
  setContainerChangesModal,
  displayPullConfig,
  setImagePullProgress,
  addCustomEnvVariable,
  addCustomKeyValue,
  removeCustomKeyValue,
  resetVaultSecretData,
  resetResultTab,
} = stationSlice.actions;

export const isLoading = (state) => state.station.loading;
export const isPendingRejection = (state) => state.station.pendingRejection;
export const getLearningType = (state) => state.station.learning;
export const getVaultStatus = (state) => state.station.vault;
export const getDownloadFiles = (state) => state.station.downloadFiles;
export const getKVEngineConfig = (state) => state.station.vault.kvEngineConfig;
export const getVaultSecrets = (state) => state.station.vault.vaultSecrets;

export default stationSlice.reducer;
