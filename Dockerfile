FROM node:23-slim AS base

RUN apt-get update && apt-get install -y \
  python3 \
  make \
  g++ \
  git \
  && rm -rf /var/lib/apt/lists/*

ENV ELIZAOS_TELEMETRY_DISABLED=true
ENV DO_NOT_TRACK=1

WORKDIR /app

COPY package.json ./
RUN npm install --ignore-scripts
RUN cd node_modules/bun && node install.js

COPY . .

RUN mkdir -p /app/data

EXPOSE 3000
ENV NODE_ENV=production
ENV SERVER_PORT=3000

CMD ["npm", "start"]
