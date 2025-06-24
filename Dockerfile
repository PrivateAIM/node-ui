FROM node:20-alpine AS base
LABEL maintainer="bruce.schultz@uk-koeln.de"

RUN adduser -u 10000 -D hubadapter

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

WORKDIR /app

COPY pnpm-lock.yaml package.json ./
COPY patches /app/patches

# Remove once corepack bug fixed https://github.com/nodejs/corepack/issues/612#issuecomment-2629613697
ENV COREPACK_INTEGRITY_KEYS=0

RUN pnpm install

COPY . .

ENV NUXT_HOST=0.0.0.0
ENV NUXT_PORT=3000

RUN chown -R hubadapter:hubadapter /app

EXPOSE 3000

USER 10000:10000

CMD ["npm", "run", "dev"]
