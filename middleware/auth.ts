export default defineNuxtRouteMiddleware(async (to) => {
  const { loggedIn, login, user } = useOidcAuth();
  if (!loggedIn.value && to.path !== "/") {
    console.warn("Not logged in");
    return login();
  }

  if (Date.now() > Date.parse(user?.value.expireAt.toString())) {
    console.warn("Token expired, routing to IDP");
    await login();
    navigateTo(to.path);
  }
});
