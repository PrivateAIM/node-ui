export const useAPIFetch: typeof useFetch = (request, opts?) => {
  const config = useRuntimeConfig();
  const baseUrl = config.public.baseURL as string;

  return useFetch(request, { baseURL: baseUrl, ...opts });
};
