FROM node:lts-alpine3.11

WORKDIR /streaming

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 8082

