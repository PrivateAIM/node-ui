FROM node:20-alpine as builder
LABEL maintainer="bruce.schultz@uk-koeln.de"

WORKDIR /app

ENV NODE_ENV=production

COPY yarn.lock package.json ./

RUN yarn install

COPY . .

RUN yarn build

FROM node:20-alpine as production

WORKDIR /app

COPY --from=builder /app/.output ./.output

ENV NUXT_HOST=0.0.0.0
ENV NUXT_PORT=3000

EXPOSE $NUXT_PORT
CMD [ "node", ".output/server/index.mjs" ]
