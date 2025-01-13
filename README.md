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
NUXT_PUBLIC_ORIGIN="$NUXT_PUBLIC_BASE_URL/api/auth"

KEYCLOAK_CLIENT_ID=node-ui
KEYCLOAK_CLIENT_SECRET=xxx
KEYCLOAK_BASE_URL="http://localhost:8080/realms/flame"

NUXT_AUTH_SECRET=xxx
```

