# Node UI
The Node UI is the primary interface for admins of the node installation at participating institutions. With this 
website, the administrators have access to an overview of the submitted projects and analyses that wish to make use of 
the data at the data center, as well as have full control over the individual containers running on their systems and 
manage which projects/analyses have access to the various datasets.  

## Required Environment Variables
This frontend requires the following environment variables to be set. The SSR framework used for this project (Nuxt) 
in addition to the OIDC library (nuxt-oidc-auth) requires the keycloak-related environment variables to be precisely 
named and explicitly defined in order to overwrite the default configuration during runtime 
(i.e. when deployed in a container).
```dotenv
NUXT_PUBLIC_BASE_URL="http://localhost:3000"  # URL of the website
NUXT_PUBLIC_HUB_ADAPTER_URL="http://urlForHubAdapterApi.de"  # URL for hub adapter API

# Keycloak
NUXT_OIDC_PROVIDERS_KEYCLOAK_CLIENT_ID="node-ui"
NUXT_OIDC_PROVIDERS_KEYCLOAK_CLIENT_SECRET="someSecret"
NUXT_OIDC_PROVIDERS_KEYCLOAK_BASE_URL="http://urlForKeycloak/realms/flame"

# Nuxt Configuration Options
# The following just needs to be copied/pasted into the .env file
NUXT_OIDC_PROVIDERS_KEYCLOAK_REDIRECT_URI="$NUXT_PUBLIC_BASE_URL/auth/keycloak/callback"  # Be sure this redirect URI is defined in your keycloak for this client
NUXT_OIDC_PROVIDERS_KEYCLOAK_AUTHORIZATION_URL="$NUXT_OIDC_PROVIDERS_KEYCLOAK_BASE_URL/protocol/openid-connect/auth"
NUXT_OIDC_PROVIDERS_KEYCLOAK_TOKEN_URL="$NUXT_OIDC_PROVIDERS_KEYCLOAK_BASE_URL/protocol/openid-connect/token"
NUXT_OIDC_PROVIDERS_KEYCLOAK_USERINFO_URL="$NUXT_OIDC_PROVIDERS_KEYCLOAK_BASE_URL/protocol/openid-connect/userinfo"
NUXT_OIDC_PROVIDERS_KEYCLOAK_OPEN_ID_CONFIGURATION="$NUXT_OIDC_PROVIDERS_KEYCLOAK_BASE_URL/.well-known/openid-configuration"
NUXT_OIDC_PROVIDERS_KEYCLOAK_LOGOUT_URL="$NUXT_OIDC_PROVIDERS_KEYCLOAK_BASE_URL/protocol/openid-connect/logout"
NUXT_OIDC_PROVIDERS_KEYCLOAK_LOGOUT_REDIRECT_URI=$NUXT_PUBLIC_BASE_URL
NUXT_OIDC_PROVIDERS_KEYCLOAK_VALIDATE_ACCESS_TOKEN="true"

# Nuxt OIDC Tokens
# https://nuxt.com/modules/nuxt-oidc-auth#_3-set-secrets
# NOTE: These will automatically be generated in helm/docker so they do not need to be explicitly set or added to .env

# NUXT_OIDC_TOKEN_KEY is a cryptographic AES key in base64 used to encrypt the server side token store
NUXT_OIDC_TOKEN_KEY=""
# NUXT_OIDC_SESSION_SECRET is a 48 character random string that encrypts the user session
NUXT_OIDC_SESSION_SECRET=""
# NUXT_OIDC_AUTH_SESSION_SECRET is a 48 character random string that encrypts individual sessions during OAuth flows
NUXT_OIDC_AUTH_SESSION_SECRET=""
```

