FROM node:20-alpine AS base
LABEL maintainer="bruce.schultz@uk-koeln.de"

WORKDIR /app

COPY yarn.lock package.json ./

RUN yarn install

COPY . .

EXPOSE 3000

CMD ["yarn", "run", "dev", "--host", "0.0.0.0"]
