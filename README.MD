# Node UI
## Needed `.env`
```dotenv
HUB_ADAPTER_API_URL="http://localhost:8081"
BASE_URL="http://localhost:3000"
KEYCLOAK_URL="http://localhost:8080"
KEYCLOAK_REALM="flame"
KEYCLOAK_CLIENT_ID="node-ui"
KEYCLOAK_CLIENT_SECRET="someRandomSecret"

# Nuxt OIDC Tokens
# https://nuxt.com/modules/nuxt-oidc-auth#_3-set-secrets
# NOTE: These will automatically be generated in helm/docker
# NUXT_OIDC_TOKEN_KEY is a cryptographic AES key in base64 used to encrypt the server side token store
NUXT_OIDC_TOKEN_KEY=xxx
# NUXT_OIDC_SESSION_SECRET is a 48 character random string that encrypts the user session
NUXT_OIDC_SESSION_SECRET=xxx
# NUXT_OIDC_AUTH_SESSION_SECRET is a 48 character random string that encrypts individual sessions during OAuth flows
NUXT_OIDC_AUTH_SESSION_SECRET=xxx
```
