FROM node:20-alpine AS base
LABEL maintainer="bruce.schultz@uk-koeln.de"

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

WORKDIR /app

COPY pnpm-lock.yaml package.json ./

# Remove once corepack bug fixed https://github.com/nodejs/corepack/issues/612#issuecomment-2629613697
ENV COREPACK_INTEGRITY_KEYS=0

RUN pnpm install

COPY . .

ENV NUXT_HOST=0.0.0.0
ENV NUXT_PORT=3000

EXPOSE 3000

CMD ["npm", "run", "dev"]
