FROM node:20-alpine as base
LABEL maintainer="bruce.schultz@uk-koeln.de"

WORKDIR /app

COPY yarn.lock package.json ./

RUN yarn install

COPY . .

EXPOSE 3000

ARG NUXT_OIDC_PROVIDERS_KEYCLOAK_BASE_URL
ENV NUXT_OIDC_PROVIDERS_KEYCLOAK_BASE_URL=${NUXT_OIDC_PROVIDERS_KEYCLOAK_BASE_URL}

CMD ["yarn", "run", "dev", "--host", "0.0.0.0"]
