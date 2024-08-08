FROM node:20-alpine AS base
LABEL maintainer="bruce.schultz@uk-koeln.de"

WORKDIR /app

COPY yarn.lock package.json ./

RUN yarn install

COPY . .

ENV NUXT_HOST=0.0.0.0
ENV NUXT_PORT=3000

EXPOSE 3000

CMD ["npm", "run", "dev"]
