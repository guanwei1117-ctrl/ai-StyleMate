# ============ Build Stage ============
FROM node:20-alpine AS builder

WORKDIR /app

# 安装构建依赖
RUN apk add --no-cache python3 make g++

# 复制 monorepo 配置
COPY package.json package-lock.json turbo.json tsconfig.base.json ./
COPY services/api/package.json services/api/
COPY packages/shared/package.json packages/shared/

# 安装依赖
RUN npm ci

# 复制源码
COPY services/api/ services/api/
COPY packages/shared/ packages/shared/

# 构建
RUN npm run build --workspace=@stylemate/api

# ============ Production Stage ============
FROM node:20-alpine AS runner

WORKDIR /app

# 安装运行时依赖（含 sharp 等原生模块）
RUN apk add --no-cache tini curl

# 复制编译产物
COPY --from=builder /app/services/api/dist ./dist
COPY --from=builder /app/services/api/package.json ./
COPY --from=builder /app/node_modules ./node_modules

# 健康检查
HEALTHCHECK --interval=30s --timeout=5s --start-period=30s --retries=3 \
  CMD curl -f http://localhost:4000/api/v1 || exit 1

EXPOSE 4000

ENTRYPOINT ["/sbin/tini", "--"]
CMD ["node", "dist/main"]