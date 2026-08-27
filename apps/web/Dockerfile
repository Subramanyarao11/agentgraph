# Build context is the monorepo root (see render.yaml / `docker build -f apps/web/Dockerfile .`).
FROM node:22-alpine
RUN corepack enable
WORKDIR /repo

COPY pnpm-workspace.yaml package.json pnpm-lock.yaml tsconfig.base.json turbo.json ./
COPY packages ./packages
COPY apps/web ./apps/web

RUN pnpm install --frozen-lockfile

# Vite inlines import.meta.env.VITE_API_URL at build time, not runtime, so
# it has to arrive as a build arg rather than a plain container env var.
ARG VITE_API_URL
ENV VITE_API_URL=${VITE_API_URL}

RUN pnpm --filter @agentgraph/graph-schema build \
 && pnpm --filter @agentgraph/web build

WORKDIR /repo/apps/web
ENV NODE_ENV=production
EXPOSE 3000
CMD ["node", ".output/server/index.mjs"]
