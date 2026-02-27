FROM node:22.6-alpine AS build

ARG VITE_BACKEND_URL
ENV VITE_BACKEND_URL=${VITE_BACKEND_URL}

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY ./ .

RUN npm run build

FROM nginx:1.25

RUN mkdir /app

COPY --from=build /app/dist /app

COPY deploy/remote/nginx.conf /etc/nginx/nginx.conf
