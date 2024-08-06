FROM node:20-alpine AS builder
LABEL maintainer="bruce.schultz@uk-koeln.de"

WORKDIR /app

COPY yarn.lock package.json ./

RUN yarn install

COPY . .

RUN yarn build

FROM node:20-alpine AS production

WORKDIR /app

COPY --from=builder /app/.output ./.output

ENV NODE_ENV=production
ENV NUXT_HOST=0.0.0.0
ENV NUXT_PORT=3000

EXPOSE $NUXT_PORT
CMD [ "node", ".output/server/index.mjs" ]
