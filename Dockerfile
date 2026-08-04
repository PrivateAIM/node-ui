FROM node:24-alpine AS base
LABEL maintainer="bruce.schultz@uk-koeln.de"

RUN adduser -u 10000 -D nodeui

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

WORKDIR /app

# for patchedDependencies
COPY pnpm-lock.yaml package.json pnpm-workspace.yaml ./
COPY patches /app/patches

RUN pnpm install --frozen-lockfile

COPY . .

# always from scratch
RUN rm -rf .nuxt

ENV NUXT_HOST=0.0.0.0
ENV NUXT_PORT=3000

RUN chown -R nodeui:nodeui /app

EXPOSE 3000

USER 10000:10000

CMD ["npm", "run", "dev"]
