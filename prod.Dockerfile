FROM node:24-alpine AS builder
LABEL maintainer="bruce.schultz@uk-koeln.de"

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

WORKDIR /app

# for patchedDependencies
COPY pnpm-lock.yaml package.json pnpm-workspace.yaml ./
COPY patches /app/patches

RUN pnpm install --frozen-lockfile

COPY . .

# always build from scratch
RUN rm -rf .nuxt && pnpm build

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
