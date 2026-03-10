# ---- Build stage ----
FROM node:22-alpine AS build

RUN corepack enable

WORKDIR /app

# Install dependencies
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

# Copy source and build
COPY . .
RUN pnpm build

# ---- Production stage ----
FROM cgr.dev/chainguard/nginx:latest-dev

# Copy nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy built assets (includes vite-envs.sh)
COPY --from=build /app/dist/ /usr/share/nginx/html/

WORKDIR /usr/share/nginx/html

EXPOSE 8080

# vite-envs.sh injects env vars into index.html at container startup,
# then we start nginx in foreground
ENTRYPOINT ["sh", "-c", "sh ./vite-envs.sh && nginx -c /etc/nginx/nginx.conf -g 'daemon off;'"]
