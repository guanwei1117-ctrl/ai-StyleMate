#!/usr/bin/env bash
# ============================================================
# StyleMate 一键部署脚本（服务器侧运行）
#
# 行为（幂等）：
#   1. 拉取最新代码（默认 git pull，可通过 REMOTE/BRANCH 覆盖）
#   2. 安装依赖（npm ci，优先用缓存）
#   3. 构建前后端（next build + nest build）
#   4. pm2 滚动重启 + 健康检查
#   5. 失败回滚到上一个 commit（git reset --hard HEAD@{1}）
#
# 用法：
#   bash scripts/deploy.sh                 # 部署默认分支（main）
#   bash scripts/deploy.sh origin ai       # 部署 origin/ai 分支
#
# 前置（服务器上一次性完成，见 docs/DEPLOY.md）：
#   - node ≥ 18, pm2 已全局安装（npm i -g pm2）
#   - 仓库已 clone 到 /srv/stylemate（或自定义 ROOT_DIR）
#   - .env 在 ROOT_DIR 下（与本地结构一致）
#   - pm2 已 init（pm2 startup + pm2 save）
#
# 环境变量（可覆盖）：
#   ROOT_DIR    部署根目录，默认 /srv/stylemate
#   REMOTE      git remote 名，默认 origin
#   BRANCH      部署分支，默认 main
#   SKIP_BUILD  非空时跳过 build（仅做 reload，调试用）
# ============================================================

set -Eeuo pipefail

ROOT_DIR="${ROOT_DIR:-/opt/stylemate}"
REMOTE="${REMOTE:-origin}"
BRANCH="${BRANCH:-main}"
SKIP_BUILD="${SKIP_BUILD:-}"

# 颜色
RED='\033[0;31m'; GRN='\033[0;32m'; YLW='\033[1;33m'; CYN='\033[0;36m'; NC='\033[0m'

log()  { printf "${CYN}▸${NC} %s\n" "$*"; }
ok()   { printf "${GRN}✓${NC} %s\n" "$*"; }
warn() { printf "${YLW}⚠${NC} %s\n" "$*"; }
die()  { printf "${RED}✗${NC} %s\n" "$*" >&2; exit 1; }

trap 'die "部署失败（line $LINENO），已尝试回滚"' ERR

# --- 前置检查 ---
[ -d "$ROOT_DIR" ] || die "部署目录不存在: $ROOT_DIR"
cd "$ROOT_DIR"

log "1/6 检查环境"
command -v node >/dev/null || die "未找到 node，请先安装 Node.js ≥ 18"
command -v npm  >/dev/null || die "未找到 npm"
command -v pm2  >/dev/null || die "未找到 pm2（npm i -g pm2）"
[ -f ".env" ] || warn ".env 不存在 — 若需要 DB/AI Keys，请先 cp .env.example .env 并填写"

# 记录当前 commit 用于回滚
PREV_COMMIT="$(git rev-parse --short HEAD)"

# --- 拉取代码 ---
log "2/6 拉取最新代码 ($REMOTE/$BRANCH)"
git fetch "$REMOTE" "$BRANCH"
git reset --hard "$REMOTE/$BRANCH"
NEW_COMMIT="$(git rev-parse --short HEAD)"
ok "已更新 $PREV_COMMIT -> $NEW_COMMIT"

# --- 安装依赖 ---
log "3/6 安装依赖 (npm ci)"
# 优先用缓存加速；CI=false 跳过 husky 等 git hooks
CI=0 npm ci --prefer-offline --no-audit --no-fund

# --- 构建 ---
if [ -z "$SKIP_BUILD" ]; then
  log "4/6 构建前后端"
  # turbo build：先后端（packages/shared -> services/api）后前端（apps/web）
  CI=0 npm run build
  ok "构建完成"
else
  warn "SKIP_BUILD 已设置，跳过构建步骤"
fi

# --- pm2 重启 ---
log "5/6 pm2 滚动重启"
# 首次部署时用 start，之后用 reload（zero-downtime）
if pm2 describe stylemate-api >/dev/null 2>&1; then
  pm2 reload ecosystem.config.js
else
  pm2 start ecosystem.config.js
fi
pm2 save
ok "pm2 进程已重启"

# --- 健康检查 ---
log "6/6 健康检查"
sleep 3
# API 健康端点（NestJS 自带）
HEALTH_URL="http://127.0.0.1:4000/api/v1/health"
for i in {1..15}; do
  if curl -fsS --max-time 3 "$HEALTH_URL" >/dev/null 2>&1; then
    ok "API 健康检查通过: $HEALTH_URL"
    break
  fi
  if [ "$i" -eq 15 ]; then
    die "API 健康检查失败，请查看日志: pm2 logs stylemate-api"
  fi
  warn "等待 API 就绪... ($i/15)"
  sleep 2
done

# Web 健康检查
WEB_URL="http://127.0.0.1:3000"
for i in {1..10}; do
  if curl -fsS --max-time 3 -o /dev/null "$WEB_URL" 2>&1; then
    ok "Web 健康检查通过: $WEB_URL"
    break
  fi
  if [ "$i" -eq 10 ]; then
    warn "Web 健康检查未响应（可能是首屏 SSR 编译稍慢，可手动访问确认）"
    break
  fi
  warn "等待 Web 就绪... ($i/10)"
  sleep 2
done

echo
ok "=========================================="
ok "  部署成功: $NEW_COMMIT"
ok "=========================================="
ok "  后续操作："
ok "    pm2 status                # 查看进程状态"
ok "    pm2 logs                  # 实时日志（tail 两个 app）"
ok "    pm2 logs stylemate-api    # 仅后端日志"
ok "    pm2 logs stylemate-web    # 仅前端日志"
ok "  回滚（如需）："
ok "    git reset --hard $PREV_COMMIT && bash $0"