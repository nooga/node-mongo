# syntax=docker/dockerfile:1
FROM node:18-alpine

WORKDIR /app

# Install dependencies (using the lockfile) before copying the full source tree for better layer caching.
COPY package.json pnpm-lock.yaml ./
RUN corepack enable \
  && corepack prepare pnpm@8.10.0 --activate \
  && pnpm install --frozen-lockfile --prod

# Copy application sources
COPY src/ ./src/
COPY public/ ./public/

ENV NODE_ENV=production
ENV PORT=3000

# Use the non-root 'node' user provided by the base image
USER node

EXPOSE 3000
CMD ["node", "src/server.js"]
