export default defineNuxtRouteMiddleware(async (to) => {
  const { loggedIn, login, user } = useOidcAuth();
  if (!loggedIn.value && to.path !== "/") {
    console.warn("Not logged in");
    return login();
  }
});
