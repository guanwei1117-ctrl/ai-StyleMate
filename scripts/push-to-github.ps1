# ============================================================
# 本地推送 5 个文件到 GitHub (HTTPS + GCM)
# 用法：在 d:\codebuddy\cleanfit 目录下 PowerShell 执行此脚本
# ============================================================

$ErrorActionPreference = 'Stop'

function Step($n, $msg) { Write-Host "`n[$n] $msg" -ForegroundColor Cyan }
function Ok($msg)      { Write-Host "    OK $msg" -ForegroundColor Green }
function Warn($msg)    { Write-Host "    ! $msg" -ForegroundColor Yellow }
function Die($msg)     { Write-Host "    FAIL $msg" -ForegroundColor Red; exit 1 }

# ---------- 1) 预演：工作区状态 ----------
Step "1/8" "预演：git status"
git status --short
$dirty = git status --short
if (-not $dirty) { Die "工作区已经干净，没有需要提交的文件" }

# ---------- 2) 预演：确认 5 个目标文件 ----------
Step "2/8" "确认 5 个目标文件存在"
$targets = @(
  ".github/workflows/deploy.yml",
  "scripts/deploy.sh",
  "scripts/fix-deploy-branch.sh",
  "services/api/src/app.module.ts",
  "services/api/src/main.ts"
)
foreach ($f in $targets) {
  if (-not (Test-Path $f)) { Die "找不到文件: $f" }
  Ok "存在: $f"
}

# ---------- 3) 防呆：远程 URL 必须是 HTTPS ----------
Step "3/8" "切换 remote 为 HTTPS（如果还是 SSH）"
$url = git remote get-url origin
if ($url -notmatch '^https://') {
  Warn "当前 remote 是 SSH: $url"
  Warn "GitHub 22 端口在本机被防火墙挡住，必须用 HTTPS"
  git remote set-url origin "https://github.com/guanwei1117-ctrl/ai-StyleMate.git"
  Ok "remote 已切到 HTTPS"
} else {
  Ok "remote 已是 HTTPS: $url"
}

# ---------- 4) 防呆：本地 HEAD 必须是 ai-stylemate ----------
Step "4/8" "确认当前分支是 ai-stylemate"
$br = git rev-parse --abbrev-ref HEAD
if ($br -ne "ai-stylemate") { Die "当前分支是 '$br'，不是 ai-stylemate。脚本只推 ai-stylemate" }
Ok "分支: $br"

# ---------- 5) 防呆：HEAD 之后没有需要 pull 的远端提交 ----------
Step "5/8" "检查远端是否领先"
$head = git rev-parse HEAD
$ahead = git rev-list --left-only --count HEAD...origin/ai-stylemate 2>$null
if ($LASTEXITCODE -ne 0) {
  Warn "本地还没设置 origin/ai-stylemate tracking（首次推送后会建立）"
} elseif ($ahead -gt 0) {
  Die "远端 origin/ai-stylemate 有 $ahead 个未拉取的 commit，先 git pull 合并再推"
} else {
  Ok "本地与远端同步"
}

# ---------- 6) add + commit ----------
Step "6/8" "git add 5 个文件"
git add .github/workflows/deploy.yml
git add scripts/deploy.sh
git add scripts/fix-deploy-branch.sh
git add services/api/src/app.module.ts
git add services/api/src/main.ts
git status --short
if (-not (git diff --cached --name-only)) { Die "git add 后没有 staged 文件，请检查" }
Ok "已 staged $(git diff --cached --name-only | Measure-Object -Line).Count 个文件"

Step "6b/8" "git commit"
$msg = @'
fix(deploy): 修复 deploy.sh 默认分支注释与代码不一致；补全 app.module 截断；删除密码打印；新增服务器侧修复脚本

- deploy.sh 注释对齐代码（默认分支 ai-stylemate，部署目录 /opt/stylemate）
- app.module.ts 末尾补全 controllers + export class AppModule（修复截断）
- main.ts 顶部删除打印 DB_PASSWORD 到日志的安全问题
- 新增 fix-deploy-branch.sh：服务器侧一次运行即可把旧 deploy.sh 默认 main 改成 ai-stylemate（绕开鸡生蛋）
- workflow deploy.yml 增加 git fetch + reset，让 GitHub Actions 也能自更新 deploy.sh
'@
git commit -m $msg
Ok "已 commit: $(git rev-parse --short HEAD)"

# ---------- 7) 推送 ----------
Step "7/8" "git push origin ai-stylemate"
git push origin ai-stylemate
if ($LASTEXITCODE -ne 0) { Die "push 失败，会卡到下面" }
Ok "已推送"

# ---------- 8) 校验 ----------
Step "8/8" "推送后验证"
$remoteHead = git rev-parse origin/ai-stylemate
$localHead = git rev-parse HEAD
if ($remoteHead -eq $localHead) {
  Ok "本地 HEAD == 远端 HEAD == $remoteHead"
  Write-Host "`n=========================================" -ForegroundColor Green
  Write-Host "  推送成功！commit: $localHead" -ForegroundColor Green
  Write-Host "=========================================" -ForegroundColor Green
} else {
  Die "本地 $localHead ≠ 远端 $remoteHead，请手动确认"
}

# ---------- 9) 给服务器侧的命令 ----------
Write-Host "`n`n================ 服务器侧命令 ================" -ForegroundColor Cyan
Write-Host "在服务器上（SSH 到服务器后）执行：" -ForegroundColor Yellow
Write-Host @'

# A. 一次性修复服务器上的旧 deploy.sh（如果服务器上 deploy.sh 默认还是 main）
#    这一步只需要执行一次，下次部署就可以跳过
bash /opt/stylemate/scripts/fix-deploy-branch.sh

# B. 用新版 deploy.sh 正式部署（拉代码 + build + 重启 + 健康检查）
cd /opt/stylemate
bash scripts/deploy.sh

# C. 部署后必须人工确认 5 件事
pm2 status                                    # 应该看到 stylemate-api 和 stylemate-web 都 status=online
curl -fsS http://127.0.0.1:4000/api/v1/health # 后端健康检查必须返回 ok
curl -fsI http://127.0.0.1:3000 | head -3     # 前端首页 HTTP 200
pm2 logs stylemate-api --lines 30 --nostream  # 后端日志无 ERROR
pm2 logs stylemate-web --lines 30 --nostream  # 前端日志无 ERROR
'@ -ForegroundColor White
