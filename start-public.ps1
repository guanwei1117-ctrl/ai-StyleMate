# ============================================================
# StyleMate 一键公网分享脚本（支持 cpolar 国内隧道 / cloudflared）
#
# 首次使用：
#   1. 到 https://www.cpolar.com 注册免费账号，后台复制 authtoken
#   2. 在项目根目录建 .tools\tunnel-config.json：
#      { "provider": "cpolar", "authtoken": "你的token" }
#      （provider 也可写 "cloudflared"，则无需 token）
#
# 用法：在项目根目录运行  .\start-public.ps1
# ============================================================

$ErrorActionPreference = 'Stop'
$root = Split-Path -Parent $MyInvocation.MyCommand.Path
$tools = Join-Path $root '.tools'
$logDir = Join-Path $tools 'logs'
$pidFile = Join-Path $tools 'tunnel-pids.txt'
$configFile = Join-Path $tools 'tunnel-config.json'
$webPort = 3001

Write-Host ''
Write-Host '================ StyleMate 公网分享 ================' -ForegroundColor Cyan

# ---------- 1. 读取配置 / 定位二进制 ----------
$config = $null
if (Test-Path $configFile) {
  try { $config = Get-Content $configFile -Raw | ConvertFrom-Json } catch {}
}
$provider = $config.provider
if ($provider -ne 'cpolar' -and $provider -ne 'cloudflared') {
  $provider = 'cpolar'
  Write-Host '[i] 未配置隧道，默认使用 cpolar（可在 .tools\tunnel-config.json 指定 provider）' -ForegroundColor DarkGray
}

$tunnelExe = $null
if ($provider -eq 'cpolar') {
  $candidates = @(
    (Join-Path $tools 'cpolar-extract\cpolar\cpolar.exe'),
    (Join-Path $tools 'cpolar\cpolar.exe')
  )
  $cmd = Get-Command cpolar -ErrorAction SilentlyContinue
  if ($cmd) { $candidates = @($cmd.Source) + $candidates }
  foreach ($c in $candidates) { if (Test-Path $c) { $tunnelExe = $c; break } }
  if (-not $tunnelExe) {
    Write-Host '[x] 未找到 cpolar.exe。请重新下载：https://www.cpolar.com/download' -ForegroundColor Red
    exit 1
  }
  if (-not $config.authtoken) {
    Write-Host '[x] 缺少 authtoken。请：' -ForegroundColor Red
    Write-Host '   1. 注册 https://www.cpolar.com （免费版即可）'
    Write-Host '   2. 后台「验证」页复制 authtoken'
    Write-Host '   3. 在 .tools\tunnel-config.json 写入 {"provider":"cpolar","authtoken":"你的token"}'
    exit 1
  }
} else {
  $cmd = Get-Command cloudflared -ErrorAction SilentlyContinue
  if ($cmd) { $tunnelExe = $cmd.Source }
  elseif (Test-Path (Join-Path $tools 'cloudflared.exe')) { $tunnelExe = Join-Path $tools 'cloudflared.exe' }
  if (-not $tunnelExe) {
    Write-Host '[x] 未找到 cloudflared。' -ForegroundColor Red
    exit 1
  }
}
Write-Host "[i] 隧道类型: $provider | 程序: $tunnelExe"

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

# ---------- 3. 代理（仅 cloudflared 需要，cpolar 走国内直连） ----------
if ($provider -eq 'cloudflared') {
  try {
    $tcp = Test-NetConnection -ComputerName 127.0.0.1 -Port 7897 -WarningAction SilentlyContinue
    if ($tcp.TcpTestSucceeded) {
      $env:HTTP_PROXY = 'http://127.0.0.1:7897'
      $env:HTTPS_PROXY = 'http://127.0.0.1:7897'
      Write-Host '[i] 检测到本地代理，cloudflared 隧道将走代理' -ForegroundColor DarkGray
    }
  } catch {}
}

New-Item -ItemType Directory -Force -Path $logDir | Out-Null

# cpolar：先写入 authtoken（一次性配置）
if ($provider -eq 'cpolar') {
  & $tunnelExe authtoken $config.authtoken 2>&1 | Out-Null
}

function Start-TunnelProcess([string]$target) {
  $out = Join-Path $logDir ("tunnel-{0}-{1}.out.log" -f $provider, ($target -replace '\W', ''))
  $err = Join-Path $logDir ("tunnel-{0}-{1}.err.log" -f $provider, ($target -replace '\W', ''))
  Remove-Item $out, $err -ErrorAction SilentlyContinue
  if ($provider -eq 'cpolar') {
    $args = @('http', $target)
  } else {
    $args = @('tunnel', '--url', "http://localhost:$target", '--no-autoupdate')
  }
  return Start-Process -FilePath $tunnelExe -ArgumentList $args -RedirectStandardOutput $out -RedirectStandardError $err -WindowStyle Hidden -PassThru
}

function Wait-TunnelUrl([string]$target) {
  $out = Join-Path $logDir ("tunnel-{0}-{1}.out.log" -f $provider, ($target -replace '\W', ''))
  $err = Join-Path $logDir ("tunnel-{0}-{1}.err.log" -f $provider, ($target -replace '\W', ''))
  $patterns = @('https://[a-z0-9-]+\.cpolar\.top', 'https://[a-z0-9-]+\.cpolar\.cn', 'https://[a-z0-9-]+\.cpolar\.com\.cn', 'https://[a-z0-9-]+\.trycloudflare\.com')
  $deadline = (Get-Date).AddSeconds(90)
  while ((Get-Date) -lt $deadline) {
    Start-Sleep -Seconds 2
    foreach ($f in @($out, $err)) {
      if (Test-Path $f) {
        foreach ($p in $patterns) {
          $m = Select-String -Path $f -Pattern $p | Select-Object -First 1
          if ($m) { return $m.Matches[0].Value }
        }
      }
    }
  }
  return $null
}

# ---------- 4. API 隧道 ----------
Write-Host "[>] 正在为 API 建立公网隧道…" -ForegroundColor Yellow
$apiTunnel = Start-TunnelProcess '4000'
$apiUrl = Wait-TunnelUrl '4000'
if (-not $apiUrl) {
  Write-Host '[x] API 隧道建立失败。查看 .tools\logs 下对应日志。' -ForegroundColor Red
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
  Write-Host '[x] 前端 3001 未就绪，请查看日志：' -ForegroundColor Red
  Write-Host "    $webErr"
  exit 1
}
Write-Host '[✓] 前端已就绪 (localhost:3001)' -ForegroundColor Green

# ---------- 6. 页面隧道 ----------
Write-Host '[>] 正在为页面建立公网隧道…' -ForegroundColor Yellow
$webTunnel = Start-TunnelProcess "$webPort"
$webUrl = Wait-TunnelUrl "$webPort"
if (-not $webUrl) {
  Write-Host '[x] 页面隧道建立失败。查看 .tools\logs 下对应日志。' -ForegroundColor Red
  exit 1
}

# ---------- 7. 记录进程 ----------
"$($apiTunnel.Id)`n$($webProc.Id)`n$($webTunnel.Id)" | Set-Content -Path $pidFile

Write-Host ''
Write-Host '================ 分享完成 ================' -ForegroundColor Cyan
Write-Host ''
Write-Host '把下面这个网址发给朋友（微信里点开就能用）：' -ForegroundColor Yellow
Write-Host ''
Write-Host "    $webUrl" -ForegroundColor Green
Write-Host ''
Write-Host '说明：' -ForegroundColor DarkGray
Write-Host '  · 你电脑需要保持开机、本项目保持运行（python start.py 别关）'
Write-Host '  · 查看状态：.\check-public.ps1   停止分享：.\stop-public.ps1'
Write-Host '  · 隧道日志目录：.tools\logs'
Write-Host ''
