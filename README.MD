# Node UI
## Needed `.env`
```dotenv
NUXT_PUBLIC_BASE_URL="http://localhost:3000"  # URL of the website
NUXT_PUBLIC_HUB_ADAPTER_URL="http://urlForHubAdapterApi.de"  # URL for hub adapter API

NUXT_OIDC_PROVIDERS_KEYCLOAK_BASE_URL="http://your.keycloak.instance.de/realms/flame"
NUXT_OIDC_PROVIDERS_KEYCLOAK_CLIENT_ID="node-ui"
NUXT_OIDC_PROVIDERS_KEYCLOAK_CLIENT_SECRET="someSecret"

# Nuxt OIDC Tokens
# https://nuxt.com/modules/nuxt-oidc-auth#_3-set-secrets
# NOTE: These will automatically be generated in helm/docker so they do not need to be explicitly set

# NUXT_OIDC_TOKEN_KEY is a cryptographic AES key in base64 used to encrypt the server side token store
NUXT_OIDC_TOKEN_KEY=xxx
# NUXT_OIDC_SESSION_SECRET is a 48 character random string that encrypts the user session
NUXT_OIDC_SESSION_SECRET=xxx
# NUXT_OIDC_AUTH_SESSION_SECRET is a 48 character random string that encrypts individual sessions during OAuth flows
NUXT_OIDC_AUTH_SESSION_SECRET=xxx
```
