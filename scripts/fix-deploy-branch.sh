#!/bin/bash
# ============================================================
# 服务器侧「强制同步 deploy.sh」修复脚本
# 在 /opt/stylemate 下执行一次即可，之后 deploy.sh 就是新版
# 原理：直接 sed 改 BRANCH 默认值，绕开「deploy.sh 必须先 reset 拿到新版」的鸡生蛋问题
# ============================================================

set -e

DEPLOY_SH="/opt/stylemate/scripts/deploy.sh"

echo "▸ 1/4 检查 deploy.sh 当前内容"
grep "^BRANCH=" "$DEPLOY_SH" || { echo "✗ 找不到 BRANCH 行，deploy.sh 可能不是新版结构"; exit 1; }

echo
echo "▸ 2/4 sed 改默认值（兼容旧版 deploy.sh：main → ai-stylemate）"
sed -i.bak 's|BRANCH="${BRANCH:-main}"|BRANCH="${BRANCH:-ai-stylemate}"|' "$DEPLOY_SH"
grep "^BRANCH=" "$DEPLOY_SH"

echo
echo "▸ 3/4 从 GitHub fetch 最新 ai-stylemate 分支"
cd /opt/stylemate
git fetch origin ai-stylemate 2>&1 | tail -3

echo
echo "▸ 4/4 验证 ai-stylemate 远程分支存在 + 看 HEAD commit"
git log origin/ai-stylemate --oneline -3 2>&1 || {
  echo "✗ origin/ai-stylemate 不存在或没 commit"
  echo "  → 本地必须先 push: git push -u origin ai-stylemate"
  exit 1
}

echo
echo "==========================================="
echo "  修复完成！"
echo "==========================================="
echo "  下一步："
echo "    cd /opt/stylemate"
echo "    git reset --hard origin/ai-stylemate   # 拉所有新代码"
echo "    bash scripts/deploy.sh                  # 用新版 deploy.sh 部署"
echo "==========================================="