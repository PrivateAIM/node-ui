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
NUXT_PUBLIC_ORIGIN="$NUXT_PUBLIC_BASE_URL/api/auth"  # Relative path to sign page (you likely should not modify this)

NUXT_IDP_CLIENT_ID=node-ui  # Client ID defined in the IDP provided in NUXT_PUBLIC_IDP_ISSUER
NUXT_IDP_CLIENT_SECRET=xxx
NUXT_PUBLIC_IDP_PROVIDER="keycloak"  # Can be either 'keycloak' or 'authentik'
NUXT_PUBLIC_IDP_ISSUER="http://my-keycloak.com/realms/flame"

# If not using the same keycloak instance as the other FLAME Node services for user authentication, then this needs to be set
NUXT_PUBLIC_INTERNAL_KEYCLOAK_URL=""

NUXT_AUTH_SECRET=xxx  # Unique key for encrypting JWT
```

| EnvVar                            | Description                                                                                                                 | Default                        | Required |
|-----------------------------------|-----------------------------------------------------------------------------------------------------------------------------|--------------------------------|:--------:|
| NUXT_PUBLIC_BASE_URL              | URL of the website                                                                                                          |                                |    x     |
| NUXT_PUBLIC_HUB_ADAPTER_URL       | URL for hub adapter API                                                                                                     |                                |    x     |
| NUXT_PUBLIC_ORIGIN                | Relative path to sign page (you likely should not modify this)                                                              | $NUXT_PUBLIC_BASE_URL/api/auth |          |
| NUXT_IDP_CLIENT_ID                | Client ID defined in the IDP provided in NUXT_PUBLIC_IDP_ISSUER                                                             | node-ui                        |          |
| NUXT_IDP_CLIENT_SECRET            | Client secret defined in the IDP provided in NUXT_PUBLIC_IDP_ISSUER                                                         |                                |    x     |
| NUXT_PUBLIC_IDP_PROVIDER          | Can be either 'keycloak', 'auth0', 'authentik', 'onelogin', 'okta', or 'zitadel'                                            | keycloak                       |          |
| NUXT_PUBLIC_IDP_ISSUER            | URI for the IDP used to identify itself using OpenID Connect (OIDC) protocol                                                |                                |    x     |
| NUXT_PUBLIC_INTERNAL_KEYCLOAK_URL | If not using the same keycloak instance as the other FLAME Node services for user authentication, then this needs to be set |                                |          |
| NUXT_AUTH_SECRET                  | Unique key for encrypting JWT, see Setting a Secret below                                                                   |                                |    x     |

## Setting a Secret

In order to add additional security to the generated JWTs, a random string needs to be generated to hash tokens,
sign/encrypt cookies, and to generate cryptographic keys. To quickly generate such a string, run the following command:

```bash
openssl rand -base64 32
```