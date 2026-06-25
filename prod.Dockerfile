FROM node:24-alpine AS builder
LABEL maintainer="bruce.schultz@uk-koeln.de"

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

WORKDIR /app

# pnpm-workspace.yaml carries patchedDependencies and allowBuilds (pnpm v11+);
# without it, patches are silently skipped and build scripts are not run.
COPY pnpm-lock.yaml package.json pnpm-workspace.yaml ./
COPY patches /app/patches

# Remove once corepack bug fixed https://github.com/nodejs/corepack/issues/612#issuecomment-2629613697
ENV COREPACK_INTEGRITY_KEYS=0

RUN pnpm install --frozen-lockfile

COPY . .

RUN pnpm build

FROM node:24-alpine AS production
RUN apk add --no-cache curl
RUN adduser -u 10000 -D nodeui

WORKDIR /app

COPY --from=builder /app/.output ./.output

ENV NODE_ENV=production
ENV NUXT_HOST=0.0.0.0
ENV NUXT_PORT=3000

RUN chown -R nodeui:nodeui /app

EXPOSE $NUXT_PORT

USER 10000:10000

CMD [ "node", ".output/server/index.mjs" ]
