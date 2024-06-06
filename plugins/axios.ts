import axios from "axios";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export default defineNuxtPlugin((nuxtApp) => {
  const hubAdapterUrl = process.env.HUB_ADAPTER_API_URL;

  const api = axios.create({
    baseURL: hubAdapterUrl,
    headers: {
      common: {},
    },
  });
  return {
    provide: {
      api: api,
    },
  };
});
