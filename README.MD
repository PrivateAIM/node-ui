# Node UI
The Node UI is the primary interface for admins of the node installation at participating institutions. With this 
website, the administrators have access to an overview of the submitted projects and analyses that wish to make use of 
the data at the data center, as well as have full control over the individual containers running on their systems and 
manage which projects/analyses have access to the various datasets.  

## Needed `.env`
This frontend requires the following environment variables to be set. While some appear as though they can be 
auto-generated (e.g. the keycloak endpoints), they cannot be since the SSR framework used for this project (Nuxt) 
requires the environment variable to be precisely named and explicitly defined in order to overwrite the 
default configuration.
```dotenv
NUXT_PUBLIC_BASE_URL="http://localhost:3000"  # URL of the website
NUXT_PUBLIC_HUB_ADAPTER_URL="http://urlForHubAdapterApi.de"  # URL for hub adapter API

NUXT_OIDC_PROVIDERS_KEYCLOAK_CLIENT_ID="node-ui"
NUXT_OIDC_PROVIDERS_KEYCLOAK_CLIENT_SECRET="someSecrets"

# The following need to be explicitly set in order to apply them to the Nuxt config, they can't be built from the domain
NUXT_OIDC_PROVIDERS_KEYCLOAK_REDIRECT_URI="http://localhost:3000/auth/keycloak/callback"  # Be sure this redirect URI is defined in your keycloak for this client
NUXT_OIDC_PROVIDERS_KEYCLOAK_AUTHORIZATION_URL="https://my.keycloak.domain.de/realms/flame/protocol/openid-connect/auth"
NUXT_OIDC_PROVIDERS_KEYCLOAK_TOKEN_URL="https://my.keycloak.domain.de/realms/flame/protocol/openid-connect/token"
NUXT_OIDC_PROVIDERS_KEYCLOAK_USERINFO_URL="https://my.keycloak.domain.de/realms/flame/protocol/openid-connect/userinfo"

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
