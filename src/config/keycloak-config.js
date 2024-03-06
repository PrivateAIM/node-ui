const Keycloak = require('keycloak-connect');
const axios = require('axios').default;

let _keycloak;
const authServerUrl = process.env.KC_AUTH_SERVER_URL || "https://localhost:8443";
const realm = process.env.KC_REALM || "PHT-Station";
let _publicKey;

let keycloakConfig = {
    "realm": realm,
    "auth-server-url": authServerUrl,
    "ssl-required": process.env.KC_SSL_REQUIRED || "false",
    "resource": process.env.KC_CLIENT_ID || "pht-web-backend",
    "bearer-only": true
}

async function setPublicKey() {
    try {
        const publicKeyUrl = process.env.KC_PUBLIC_KEY_URL || `http://pht-keycloak:8080/realms/PHT-Station`;
        const response = await axios.get(publicKeyUrl);
        const { public_key } = response.data;
        _publicKey = public_key;
    } catch (error) {
        // handle error
        console.log(`Error getting Keycloak Public Key`, error);
    }
}

function initKeycloak(memoryStore) {
    if (_keycloak) {
        console.warn("Trying to init Keycloak again!");
        return _keycloak;
    }
    else {
        console.log("Initializing Keycloak...");
        keycloakConfig = { ...keycloakConfig, "realm-public-key": _publicKey };
        console.log('kcConfig', keycloakConfig);
        _keycloak = new Keycloak({ store: memoryStore }, keycloakConfig);
        return _keycloak;

    }
}

function getKeycloak() {
    if (!_keycloak) {
        console.error('Keycloak has not been initialized. Please called init first.');
    }
    return _keycloak;
}

module.exports = { initKeycloak, getKeycloak, setPublicKey };