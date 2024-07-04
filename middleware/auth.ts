export default defineNuxtRouteMiddleware(async () => {
  const { loggedIn, login } = useOidcAuth();
  if (!loggedIn.value) {
    console.warn("Not logged in");
    return login();
  }
});
