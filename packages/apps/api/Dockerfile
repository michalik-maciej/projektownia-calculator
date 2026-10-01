# syntax=docker/dockerfile:1

ARG NODE_VERSION=24.20
FROM node:${NODE_VERSION}-slim AS base

WORKDIR /app

ENV NODE_ENV=production

# Prisma needs OpenSSL
RUN apt-get update -y \
    && apt-get install -y --no-install-recommends openssl ca-certificates \
    && rm -rf /var/lib/apt/lists/*

# Enable pnpm
RUN corepack enable
RUN corepack prepare pnpm@9.0.0 --activate


# =================================
# 1️⃣ Dependencies (workspace install)
# =================================
FROM base AS deps

ENV NODE_ENV=development

COPY pnpm-lock.yaml pnpm-workspace.yaml package.json turbo.json tsconfig.base.json tsconfig.json ./

COPY packages ./packages

RUN pnpm install --frozen-lockfile

# =================================
# 2️⃣ Build stage
# =================================
FROM deps AS build

RUN pnpm turbo run build --filter=@projektownia-calculator/api

# =================================
# 3️⃣ Production image
# =================================
FROM base AS runner

WORKDIR /app

ENV NODE_ENV=production

# Baked in at build time so /api/health can report what is actually running
ARG COMMIT_SHA
ENV COMMIT_SHA=${COMMIT_SHA}

COPY --from=build /app .

# Install ONLY production deps for api and its workspace deps
RUN pnpm install --prod --filter=@projektownia-calculator/api

EXPOSE 3000

CMD ["node", "packages/apps/api/dist/bootstrap.js"]
