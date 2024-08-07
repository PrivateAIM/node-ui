export default defineNuxtRouteMiddleware((to) => {
  const { data, signIn } = useAuth();
  if (!data.value && to.path !== "/") {
    console.warn("Not logged in");
    return signIn("keycloak");
  }
});
