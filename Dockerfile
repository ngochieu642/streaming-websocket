FROM node:12.16.1-buster-slim

WORKDIR /streaming

COPY package*.json ./

RUN apt-get update && \
    apt-get install ffmpeg -y && \
    npm install

COPY . .

EXPOSE 8082

