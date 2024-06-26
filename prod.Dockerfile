FROM node:20-alpine as builder
LABEL maintainer="bruce.schultz@uk-koeln.de"

WORKDIR /app

COPY yarn.lock package.json ./

RUN yarn install

COPY . .

RUN yarn generate

FROM nginx:stable-alpine as production
COPY --from=builder /app/dist /usr/share/nginx/html
COPY ./default.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
