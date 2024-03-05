import Keycloak from "keycloak-js";
import axios from "axios";

async function getKeycloakConfig() {
  const baseURL = process.env.NODE_ENV === "production" ? "/" : "http://127.0.0.1:3030/";
  const response = await axios.get(`${baseURL}dashboard/v2/keycloakConfig`);
  return response.data;
}

let _kc;

/**
 * Initializes Keycloak instance and calls the provided
 * callback function if successfully authenticated.
 */
const initKeycloak = async (onAuthenticatedCallback) => {
  const config = await getKeycloakConfig();
  _kc = new Keycloak({
    realm: config.realm,
    url: config.url,
    clientId: config.clientId,
  });

  _kc
    .init({
      onLoad: "login-required",
    })
    .then((authenticated) => {
      if (!authenticated) {
        console.log("user is not authenticated..!");
      }
      onAuthenticatedCallback();
    })
    .catch(console.error);
};

const doLogin = () => _kc.login();

const doLogout = () => _kc.logout();

const getToken = () => _kc.token;

const isLoggedIn = () => !!_kc.token;

const updateToken = (successCallback) =>
  _kc.updateToken(5).then(successCallback).catch(doLogin);

const getUsername = () => _kc.tokenParsed?.preferred_username;

const UserService = {
  initKeycloak,
  doLogin,
  doLogout,
  isLoggedIn,
  getToken,
  updateToken,
  getUsername,
};

export default UserService;
