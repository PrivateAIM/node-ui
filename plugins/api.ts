export default defineNuxtPlugin((nuxtApp) => {
  const { user } = useOidcAuth();
  const config = useRuntimeConfig();
  const baseUrl = config.public.baseURL as string;
  const hubApi = $fetch.create({
    baseURL: baseUrl,
    onRequest({ options }) {
      // Annoying workaround to avoid typescript from complaining - cast to Headers then set explicitly
      const headers = options.headers
        ? new Headers(options.headers)
        : new Headers();
      headers.set("Authorization", `Bearer ${user?.value.accessToken}`);
      options.headers = headers;
    },
    onRequestError({ error }) {
      console.log(error);
    },
    onResponse({ response }) {
      // Process the response data
      localStorage.setItem("token", response._data.token);
    },
    onResponseError({ response }) {
      // Handle the response errors
      console.log(response);
      if (response.status === 401 || response.status === 403) {
        console.log("User signed out, routing to login");
        nuxtApp.runWithContext(() => navigateTo("/auth/login"));
      }
    },
  });

  return {
    provide: {
      hubApi,
    },
  };
});
