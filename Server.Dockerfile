FROM node:12.16.1-buster-slim

WORKDIR /server

COPY ./server/package*.json ./

RUN apt-get update && \
    apt-get install ffmpeg -y && \
    apt-get install procps -y && \
    npm install

COPY . .

EXPOSE 8082

