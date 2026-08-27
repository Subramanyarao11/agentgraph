# Build context is the monorepo root (see render.yaml / `docker build -f apps/api/Dockerfile .`)
# because this workspace package depends on the two local packages/* packages.
FROM node:22-alpine
RUN corepack enable
WORKDIR /repo

COPY pnpm-workspace.yaml package.json pnpm-lock.yaml tsconfig.base.json turbo.json ./
COPY packages ./packages
COPY apps/api ./apps/api

RUN pnpm install --frozen-lockfile
RUN pnpm --filter @agentgraph/graph-schema build \
 && pnpm --filter @agentgraph/graph-client build \
 && pnpm --filter @agentgraph/api build

WORKDIR /repo/apps/api
ENV NODE_ENV=production
EXPOSE 3001
CMD ["node", "dist/main.js"]
