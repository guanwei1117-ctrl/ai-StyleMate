# ============================================================
# StyleMate 一键公网分享脚本（cloudflared 快速隧道）
#
# 用法：在项目根目录运行  .\start-public.ps1
# 前提：项目已能本地运行（python start.py 或手动启动前后端）
#       若本地有代理（默认探测 127.0.0.1:7897），隧道自动走代理
#
# 脚本会：
#   1. 检查 API (4000) 是否已启动
#   2. 开一条 cloudflared 隧道映射 API → 得到公网 API 地址
#   3. 在 3001 端口启动一个独立的前端 dev 实例（注入公网 API 地址，
#      不影响你原本跑在 3000 的本地开发服务）
#   4. 开第二条隧道映射 3001 → 得到页面公网地址
#   5. 打印两个网址，把页面网址发给朋友即可
# ============================================================

$ErrorActionPreference = 'Stop'
$root = Split-Path -Parent $MyInvocation.MyCommand.Path
$tools = Join-Path $root '.tools'
$logDir = Join-Path $tools 'logs'
$pidFile = Join-Path $tools 'tunnel-pids.txt'
$webPort = 3001

Write-Host ''
Write-Host '================ StyleMate 公网分享 ================' -ForegroundColor Cyan

# ---------- 1. 找 cloudflared ----------
$cloudflared = $null
$cmd = Get-Command cloudflared -ErrorAction SilentlyContinue
if ($cmd) { $cloudflared = $cmd.Source }
elseif (Test-Path (Join-Path $tools 'cloudflared.exe')) { $cloudflared = Join-Path $tools 'cloudflared.exe' }
if (-not $cloudflared) {
  Write-Host '[x] 未找到 cloudflared。请先安装：winget install Cloudflare.cloudflared' -ForegroundColor Red
  exit 1
}
Write-Host "[i] cloudflared: $cloudflared"

# ---------- 2. 检查 API ----------
$apiOk = $false
try {
  $health = Invoke-WebRequest -Uri 'http://localhost:4000/api/v1/health' -TimeoutSec 3 -UseBasicParsing
  $apiOk = $health.StatusCode -eq 200
} catch { $apiOk = $false }
if (-not $apiOk) {
  Write-Host '[x] 后端 API 未启动（localhost:4000）。请先另开一个窗口运行 python start.py' -ForegroundColor Red
  exit 1
}
Write-Host '[i] API 已就绪 (localhost:4000)'

# ---------- 3. 本地代理探测 ----------
$proxy = $null
try {
  $tcp = Test-NetConnection -ComputerName 127.0.0.1 -Port 7897 -WarningAction SilentlyContinue
  if ($tcp.TcpTestSucceeded) {
    $env:HTTP_PROXY = 'http://127.0.0.1:7897'
    $env:HTTPS_PROXY = 'http://127.0.0.1:7897'
    $proxy = $env:HTTPS_PROXY
    Write-Host '[i] 检测到本地代理 127.0.0.1:7897，隧道将走代理' -ForegroundColor DarkGray
  }
} catch {}

New-Item -ItemType Directory -Force -Path $logDir | Out-Null

# ---------- 4. 启动 API 隧道 ----------
Write-Host '[>] 正在为 API 建立公网隧道…' -ForegroundColor Yellow
$apiOut = Join-Path $logDir 'tunnel-api.out.log'
$apiErr = Join-Path $logDir 'tunnel-api.err.log'
Remove-Item $apiOut, $apiErr -ErrorAction SilentlyContinue
$apiTunnel = Start-Process -FilePath $cloudflared -ArgumentList @('tunnel','--url','http://localhost:4000','--no-autoupdate') -RedirectStandardOutput $apiOut -RedirectStandardError $apiErr -WindowStyle Hidden -PassThru

$apiUrl = $null
$deadline = (Get-Date).AddSeconds(90)
while ((Get-Date) -lt $deadline -and -not $apiUrl) {
  Start-Sleep -Seconds 2
  foreach ($f in @($apiOut, $apiErr)) {
    if (Test-Path $f) {
      $m = Select-String -Path $f -Pattern 'https://[a-z0-9-]+\.trycloudflare\.com' | Select-Object -First 1
      if ($m) { $apiUrl = $m.Matches[0].Value }
    }
  }
}
if (-not $apiUrl) {
  Write-Host '[x] API 隧道建立失败（网络问题？）。请查看日志：' -ForegroundColor Red
  Write-Host "    $apiErr"
  exit 1
}
Write-Host "[✓] API 公网地址: $apiUrl" -ForegroundColor Green

# ---------- 5. 启动独立前端 (3001) ----------
Write-Host "[>] 正在 3001 端口启动分享用前端…" -ForegroundColor Yellow
$webOut = Join-Path $logDir 'web-share.out.log'
$webErr = Join-Path $logDir 'web-share.err.log'
Remove-Item $webOut, $webErr -ErrorAction SilentlyContinue
$env:NEXT_PUBLIC_API_URL = "$apiUrl/api/v1"
$webCmd = "/c cd /d `"$root\apps\web`" && npx next dev -p $webPort"
$webProc = Start-Process -FilePath 'cmd.exe' -ArgumentList $webCmd -RedirectStandardOutput $webOut -RedirectStandardError $webErr -WindowStyle Hidden -PassThru

$webReady = $false
$deadline = (Get-Date).AddSeconds(120)
while ((Get-Date) -lt $deadline -and -not $webReady) {
  Start-Sleep -Seconds 3
  try {
    $r = Invoke-WebRequest -Uri "http://localhost:$webPort" -TimeoutSec 3 -UseBasicParsing
    $webReady = $r.StatusCode -eq 200
  } catch {}
}
if (-not $webReady) {
  Write-Host '[x] 前端 3001 未在预期时间内就绪，请查看日志：' -ForegroundColor Red
  Write-Host "    $webErr"
  exit 1
}
Write-Host '[✓] 前端已就绪 (localhost:3001)' -ForegroundColor Green

# ---------- 6. 启动页面隧道 ----------
Write-Host '[>] 正在为页面建立公网隧道…' -ForegroundColor Yellow
$webOut = Join-Path $logDir 'tunnel-web.out.log'
$webErr = Join-Path $logDir 'tunnel-web.err.log'
Remove-Item $webOut, $webErr -ErrorAction SilentlyContinue
$webTunnel = Start-Process -FilePath $cloudflared -ArgumentList @('tunnel','--url',"http://localhost:$webPort",'--no-autoupdate') -RedirectStandardOutput $webOut -RedirectStandardError $webErr -WindowStyle Hidden -PassThru

$webUrl = $null
$deadline = (Get-Date).AddSeconds(90)
while ((Get-Date) -lt $deadline -and -not $webUrl) {
  Start-Sleep -Seconds 2
  foreach ($f in @($webOut, $webErr)) {
    if (Test-Path $f) {
      $m = Select-String -Path $f -Pattern 'https://[a-z0-9-]+\.trycloudflare\.com' | Select-Object -First 1
      if ($m) { $webUrl = $m.Matches[0].Value }
    }
  }
}
if (-not $webUrl) {
  Write-Host '[x] 页面隧道建立失败，请查看日志：' -ForegroundColor Red
  Write-Host "    $webErr"
  exit 1
}

# ---------- 7. 记录进程 ----------
"$($apiTunnel.Id)`n$($webProc.Id)`n$($webTunnel.Id)" | Set-Content -Path $pidFile

Write-Host ''
Write-Host '================ 分享完成 ================' -ForegroundColor Cyan
Write-Host ''
Write-Host '把下面这个网址发给朋友（手机/电脑浏览器直接打开）：' -ForegroundColor Yellow
Write-Host ''
Write-Host "    $webUrl" -ForegroundColor Green
Write-Host ''
Write-Host '说明：' -ForegroundColor DarkGray
Write-Host '  · 你电脑需要保持开机、本项目保持运行（python start.py 别关）'
Write-Host '  · 停止分享：运行  .\stop-public.ps1'
Write-Host '  · 隧道日志目录：.tools\logs（网络异常时可查看）'
Write-Host ''
