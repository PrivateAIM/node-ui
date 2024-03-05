import axios from "../../services/AxiosService";

export const fetchStationInfoAPI = () => axios.get("/dashboard/v2/stationInfo");

export const fetchTrainsAPI = () => axios.get("/dashboard/v2");

export const fetchImagesAPI = () => axios.get("/dashboard/images/v2");

export const fetchContainersAPI = () => axios.get("/dashboard/containers/v2");

export const startFederatedLearningAPI = (payload) =>
  axios.post("/dashboard/federated/startLearning/v2", payload);

export const showFederatedLogsAPI = ({ jobId, logId }, signal) =>
  axios.get(`/federated/logs/${jobId}?since=${logId}`, { signal });

export const showFederatedJobResultsAPI = (jobId) =>
  axios.get(`/federated/results/${jobId}/v2`);

export const downloadFederatedJobResultsAPI = ({ jobId, params }, config) =>
  axios.get(`/federated/results/${jobId}/download/v2`, { params, ...config });

export const removeFederatedJobAPI = (jobId) =>
  axios.put(`/federated/delete/${jobId}/v2`);

export const cancelFederatedJobAPI = (jobId) =>
  axios.put(`/federated/cancel/${jobId}/v2`);

export const approveFederatedJobAPI = (jobId) =>
  axios.put(`/federated/approve/${jobId}/v2`);

export const fetchFederatedJobUpdatesAPI = ({ updateId }, signal) =>
  axios.get(`/federated/updates?since=${updateId}`, { signal });

export const fetchFederatedJobsAPI = () => axios.get("/dashboard/federated/v2");

export const fetchFederatedContainerConfigAPI = (payload) =>
  axios.get("/dashboard/federated/createContainer/v2", { params: payload });

export const fetchIncrementalContainerConfigAPI = (payload) =>
  axios.get("/dashboard/create/container/v2", { params: payload });

export const rejectTrainRequestAPI = (payload) =>
  axios.post("/docker/train/reject/v2", payload);

export const pullIncrementalImageAPI = (payload, options) =>
  axios.get("/docker/image/pull/v2", { params: payload, ...options });

export const pullFederatedImageAPI = (payload, options) =>
  axios.get("/docker/image/pullfederated/v2", { params: payload, ...options });

export const decryptImageAPI = (payload) =>
  axios.get("/docker/image/decrypt/v2", { params: payload });

export const deleteImageAPI = (payload) =>
  axios.get("/docker/image/remove/v2", { params: payload });

export const pushImageAPI = (payload) =>
  axios.get("/docker/image/push/v2", { params: payload });

export const createContainerAPI = (payload) =>
  axios.post("/docker/container/create/v2", payload);

export const commitContainerAPI = (payload) =>
  axios.get("/docker/container/commit/v2", { params: payload });

export const startContainerAPI = (payload) =>
  axios.get("/docker/container/start/v2", { params: payload });

export const removeContainerAPI = (payload) =>
  axios.get("/docker/container/remove/v2", { params: payload });

export const showContainerLogsAPI = (payload) =>
  axios.get("/docker/container/logs/v2", { params: payload });

export const showContainerChangesAPI = (payload) =>
  axios.get("/docker/container/changes/v2", { params: payload });

export const showContainerDiffAPI = (payload) =>
  axios.get("/docker/container/compare/v2", { params: payload });

export const downloadJobResultAPI = (payload) =>
  axios.get("/docker/container/archive/v2", {
    params: payload,
    responseType: "blob",
  });

export const showContainerFileChangesAPI = (paylaod) =>
  axios.get("/docker/container/changes/file/v2", paylaod);

export const fetchVaultStatusAPI = () => axios.get("/vault/status");

export const fetchVaultUnsealStatusAPI = () =>
  axios.get("/vault/unseal/status");

export const initializeVaultAPI = (payload) =>
  axios.post("/vault/init/v2", payload);

export const unsealVaultAPI = (payload) =>
  axios.post("/vault/unseal/v2", payload);

export const loginVaultAPI = (payload) =>
  axios.post("/vault/set-token/v2", payload);

export const fetchKVEnginesAPI = () => axios.get("/vault/kv/engines/v2");

export const fetchKVEngineConfigurationAPI = (kvEngine) =>
  axios.get(`/vault/kv/configuration/v2/${kvEngine}`);

export const fetchVaultSecretDataAPI = (vaultPath) =>
  axios.get(`/vault/kv/secret/read/v2/${encodeURIComponent(vaultPath)}`);

export const modifyVaultSecretDataAPI = (payload) =>
  axios.post("/vault/kv/secret/edit/v2", payload);

export const enableKVEngineAPI = (payload) =>
  axios.post("/vault/kv/enable/v2", payload);

export const disableKVEngineAPI = (kvEngine) =>
  axios.get(`/vault/kv/disable/v2/${encodeURIComponent(kvEngine)}`);

export const createVaultSecretAPI = (payload) =>
  axios.post("/vault/kv/secret/create/v2/", payload);

export const deleteVaultSecretAPI = (vaultPath) =>
  axios.get(`/vault/kv/secret/delete/v2/${encodeURIComponent(vaultPath)}`);
