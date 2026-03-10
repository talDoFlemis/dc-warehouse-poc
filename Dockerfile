# ---- Build stage ----
FROM node:22-alpine AS build

RUN corepack enable

WORKDIR /app

# Install dependencies (only backend)
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

# Copy backend source
COPY tsconfig.json tsconfig.build.json nest-cli.json ./
COPY src/ src/

RUN pnpm build

# ---- Production stage ----
FROM node:22-alpine

RUN corepack enable

WORKDIR /app

COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile --prod

# drizzle-kit is needed for migrations at runtime
RUN pnpm add drizzle-kit dotenv

# Copy compiled output
COPY --from=build /app/dist/ dist/

# Copy migration SQL files and drizzle config (needed for drizzle-kit migrate)
COPY src/database/migrations/ src/database/migrations/
COPY drizzle.config.ts ./

ENV NODE_ENV=production

EXPOSE 3000

# Run migrations then start the server
CMD ["sh", "-c", "npx drizzle-kit migrate && node dist/main.js"]
