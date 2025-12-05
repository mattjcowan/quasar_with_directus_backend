# Build stage
FROM node:24.11.1-alpine AS build

WORKDIR /app

# Build arguments for client-side environment variables
# These get baked into the client bundle at build time
ARG SSR_API_URL=http://localhost:3000
ARG SESSION_COOKIE_NAME=web_session

# Set as environment variables for the build process
ENV SSR_API_URL=$SSR_API_URL
ENV SESSION_COOKIE_NAME=$SESSION_COOKIE_NAME

# Copy package files
COPY package*.json ./

# Install dependencies (skip postinstall scripts that need source files)
# Using npm install instead of npm ci to handle platform-specific optional deps
RUN npm install --ignore-scripts

# Copy source code
COPY . .

# Run quasar prepare and build for SSR
RUN npx quasar prepare && npx quasar build -m ssr

# Production stage
FROM node:24.11.1-alpine

WORKDIR /app

# Copy built SSR app from build stage
COPY --from=build /app/dist/ssr .

# Install production dependencies only
RUN npm install --omit=dev

EXPOSE 3000

CMD ["node", "index.js"]
