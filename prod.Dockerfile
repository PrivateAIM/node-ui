FROM node:23-alpine AS builder
LABEL maintainer="bruce.schultz@uk-koeln.de"

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

WORKDIR /app

COPY pnpm-lock.yaml package.json ./
COPY patches /app/patches

RUN pnpm install

COPY . .

RUN pnpm build

FROM node:23-alpine AS production

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
