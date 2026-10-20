# Node UI

The Node UI is the primary interface for admins of the node installation at participating institutions. With this
website, the administrators have access to an overview of the submitted projects and analyses that wish to make use of
the data at the data center, as well as have full control over the individual containers running on their systems and
manage which projects/analyses have access to the various datasets.

It is a [Nuxt 4](https://nuxt.com) single-page application built with [PrimeVue 4](https://primevue.org),
Tailwind CSS 4 and Pinia. Authentication is handled by [@sidebase/nuxt-auth](https://auth.sidebase.io) (Auth.js) through
the server route `server/routes/flame/api/auth/[...].ts`.

## Development

Requires Node.js 24 and pnpm (version pinned in `package.json` via `packageManager`; `corepack enable` will pick it up).

```bash
pnpm install   # also runs `nuxt prepare`
pnpm dev       # http://localhost:3000, reads .env (see Environment Variables)
```

| Command          | Purpose                                                                       |
|------------------|-------------------------------------------------------------------------------|
| `pnpm dev`       | Start the dev server with hot reload                                          |
| `pnpm build`     | Production build into `.output/` (runs type checking)                         |
| `pnpm prod`      | Serve the production build (`node .output/server/index.mjs`)                  |
| `pnpm test`      | Run the Vitest suite in watch mode (`pnpm test --run` for a single pass)      |
| `pnpm coverage`  | Run the tests with coverage                                                   |
| `pnpm lint`      | Lint with ESLint (`pnpm lint:fix` to apply automatic fixes)                   |
| `pnpm typecheck` | Type check the app, server and tests                                          |
| `pnpm build-api` | Regenerate `app/services/Api.ts` from `app/services/hub_adapter_swagger.json` |

### Project layout

```
app/
  assets/       global CSS (main.css is the entry) and the PrimeVue theme preset
  components/   UI components, auto-imported by file name
  composables/  use* functions that rely on Vue/Nuxt context
  layouts/      page shell (header, footer)
  pages/        file-based routes
  plugins/      Nuxt plugins (hub adapter $fetch client, node settings)
  services/     generated hub adapter API types (do not edit Api.ts by hand)
  stores/       Pinia stores
  types/        shared app types
  utils/        pure helper functions
server/         Nitro routes: auth handler and health endpoints
shared/types/   type augmentations shared by app and server
test/           Vitest specs mirroring app/, plus MSW mocks in test/mockapi
```

## Environment Variables

Variables prefixed with `NUXT_` override the Nuxt runtime config, so all of them can be changed at container start
without rebuilding the image. The auth server route reads them directly from the environment.

```dotenv
NUXT_PUBLIC_BASE_URL="http://localhost:3000"
NUXT_PUBLIC_ORIGIN="http://localhost:3000/flame/api/auth"
NUXT_PUBLIC_HUB_ADAPTER_URL="http://localhost:5000"

NUXT_PUBLIC_IDP_PROVIDER="hub"
NUXT_PUBLIC_IDP_ISSUER="https://auth.example.org"
NUXT_IDP_CLIENT_ID="node-ui"
NUXT_IDP_CLIENT_SECRET="xxx"

NUXT_AUTH_SECRET="xxx"  # see "Setting a Secret" below
```

### Required

| Variable                      | Description                                                                                                                                          |
|-------------------------------|------------------------------------------------------------------------------------------------------------------------------------------------------|
| `NUXT_PUBLIC_BASE_URL`        | Public URL of this website. Default: `http://localhost:3000`                                                                                         |
| `NUXT_PUBLIC_ORIGIN`          | Full public URL of the auth endpoint, i.e. `$NUXT_PUBLIC_BASE_URL/flame/api/auth`. Default: `http://localhost:3000/flame/api/auth`                   |
| `NUXT_PUBLIC_HUB_ADAPTER_URL` | URL of the hub adapter API. Used by the browser and by the auth route. Default: `http://localhost:5000`                                              |
| `NUXT_PUBLIC_IDP_PROVIDER`    | Identity provider type: `hub`, `keycloak`, `authentik`, `onelogin`, `okta` or `zitadel`. Default: `hub`                                              |
| `NUXT_PUBLIC_IDP_ISSUER`      | OIDC issuer URL of the identity provider, e.g. `https://keycloak.example.org/realms/flame`. Default: `https://auth.hub.privateaim.net/realms/master` |
| `NUXT_IDP_CLIENT_SECRET`      | Client secret of the OIDC client registered at the identity provider                                                                                 |
| `NUXT_AUTH_SECRET`            | Secret used to sign and encrypt the session JWT, see [Setting a Secret](#setting-a-secret)                                                           |

### Optional

| Variable                                | Description                                                                                                                                                                     | Default                           |
|-----------------------------------------|---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|-----------------------------------|
| `NUXT_IDP_CLIENT_ID`                    | Client ID of the OIDC client registered at the identity provider                                                                                                                | `node-ui`                         |
| `NUXT_PUBLIC_INTERNAL_KEYCLOAK_URL`     | Internal (cluster) URL of the identity provider used for server-side token, userinfo and JWKS requests when it differs from the public issuer. Not used with the `hub` provider | value of `NUXT_PUBLIC_IDP_ISSUER` |
| `NUXT_IDP_HEALTH_TIMEOUT_MS`            | Timeout for the identity provider reachability check at `/flame/api/health`. Keep it below 3500, the Auth.js request timeout                                                    | `3000`                            |
| `NUXT_PUBLIC_VICTORIA_LOGS_URL`         | URL of a VictoriaLogs instance. When set, a "VictoriaLogs" link appears in the user menu                                                                                        |                                   |
| `HTTP_PROXY`, `HTTPS_PROXY`, `NO_PROXY` | Outbound proxy for server-side requests to the identity provider and hub adapter                                                                                                |                                   |
| `NUXT_HOST`, `NUXT_PORT`                | Address and port the server listens on. The Docker images set `0.0.0.0` and `3000`                                                                                              |                                   |

## Setting a Secret

In order to add additional security to the generated JWTs, a random string needs to be generated to hash tokens,
sign/encrypt cookies, and to generate cryptographic keys. To quickly generate such a string, run the following command:

```bash
openssl rand -base64 32
```

## Docker

`prod.Dockerfile` builds the production image used by CI:

```bash
docker build -f prod.Dockerfile -t node-ui .
docker run --env-file .env -p 3000:3000 node-ui
```
