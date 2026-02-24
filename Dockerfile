# Use the official Node.js image as the base image
FROM node:18-alpine AS base

# Set the working directory
WORKDIR /app

# Copy package.json and pnpm-lock.yaml for dependency installation
COPY package.json pnpm-lock.yaml ./

# Install dependencies using pnpm
RUN npm install -g pnpm && pnpm install --frozen-lockfile

# Copy the application source code
COPY src/ ./src/
COPY public/ ./public/

# Copy the .env file if it exists
COPY env.example .env

# Expose the port the application runs on
EXPOSE 3000

# Set environment variables
ENV NODE_ENV=production

# Start the application
CMD ["node", "src/server.js"]