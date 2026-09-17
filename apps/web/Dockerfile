# ============================================
# StyleMate 前端 Dockerfile（Next.js 14 Standalone）
# 多阶段构建：deps → build → runner
#
# 构建：  docker build -t stylemate-web:latest -f apps/web/Dockerfile .
# 运行：  docker run -d --name stylemate-web -p 3000:3000 \
#           -e NEXT_PUBLIC_API_URL=https://api.example.com/api/v1 \
#           stylemate-web:latest
# ============================================

# ============ Stage 1: 依赖 ============
FROM node:20-alpine AS deps
WORKDIR /app

# sharp / 图像处理类原生模块的构建依赖
RUN apk add --no-cache python3 make g++ libc6-compat

# 复制 monorepo 清单
COPY package.json package-lock.json turbo.json tsconfig.base.json ./
COPY apps/web/package.json apps/web/
COPY packages/shared/package.json packages/shared/
COPY services/api/package.json services/api/

# 仅装前端 + shared 依赖（services/api 在另一个 Dockerfile）
RUN npm ci --include=dev --workspace=@stylemate/web --workspace=@stylemate/shared

# ============ Stage 2: 构建 ============
FROM node:20-alpine AS builder
WORKDIR /app
RUN apk add --no-cache python3 make g++ libc6-compat

# 复用 deps 阶段的 node_modules
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/apps/web/node_modules ./apps/web/node_modules
COPY --from=deps /app/packages ./packages
COPY . .

# 构建 shared 包（apps/web 依赖其产物）
RUN npm run build --workspace=@stylemate/shared

ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production
WORKDIR /app/apps/web
RUN npx next build

# ============ Stage 3: 运行（standalone 输出） ============
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

# 非 root 运行
RUN addgroup --system --gid 1001 nodejs \
 && adduser --system --uid 1001 nextjs

# 复制 standalone 输出（已包含 server.js + 必要 node_modules）
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/.next/static ./apps/web/.next/static
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/public ./apps/web/public

USER nextjs
EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=30s --retries=3 \
  CMD wget -q --spider http://localhost:3000 || exit 1

CMD ["node", "apps/web/server.js"]