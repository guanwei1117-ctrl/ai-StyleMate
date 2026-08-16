# ============================================================
# 查看当前公网分享状态与网址（支持 cpolar / cloudflared）
# 用法：.\check-public.ps1
# ============================================================

$root = Split-Path -Parent $MyInvocation.MyCommand.Path
$logDir = Join-Path $root '.tools\logs'

Write-Host ''
Write-Host '================ StyleMate 分享状态 ================' -ForegroundColor Cyan

$tunnelProcs = @()
foreach ($name in @('cpolar', 'cloudflared')) {
  $procs = Get-Process $name -ErrorAction SilentlyContinue
  if ($procs) { $tunnelProcs += $procs }
}
if ($tunnelProcs.Count -gt 0) {
  Write-Host "[✓] 隧道进程运行中（$($tunnelProcs.Count) 个）" -ForegroundColor Green
} else {
  Write-Host '[x] 隧道未运行 —— 运行 .\start-public.ps1 开始分享' -ForegroundColor Red
}

try {
  $r = Invoke-WebRequest -Uri 'http://localhost:3001' -TimeoutSec 3 -UseBasicParsing
  Write-Host '[✓] 分享用前端运行中 (localhost:3001)' -ForegroundColor Green
} catch {
  Write-Host '[x] 分享用前端未运行（3001）—— 运行 .\start-public.ps1' -ForegroundColor Red
}

try {
  $h = Invoke-WebRequest -Uri 'http://localhost:4000/api/v1/health' -TimeoutSec 3 -UseBasicParsing
  Write-Host '[✓] 后端 API 运行中 (localhost:4000)' -ForegroundColor Green
} catch {
  Write-Host '[x] 后端 API 未运行 —— 请运行 python start.py' -ForegroundColor Red
}

Write-Host ''
Write-Host '当前分享网址（发给朋友）：' -ForegroundColor Yellow
$patterns = @('https://[a-z0-9-]+\.cpolar\.top', 'https://[a-z0-9-]+\.cpolar\.cn', 'https://[a-z0-9-]+\.cpolar\.com\.cn', 'https://[a-z0-9-]+\.trycloudflare\.com')
if (Test-Path $logDir) {
  Get-ChildItem $logDir -Filter 'tunnel-*.log' | ForEach-Object {
    $m = $null
    foreach ($p in $patterns) {
      $hit = Select-String -Path $_.FullName -Pattern $p | Select-Object -Last 1
      if ($hit) { $m = $hit; break }
    }
    if ($m) {
      if ($_.Name -match '3001') {
        Write-Host "  页面（发这个）： $($m.Matches[0].Value)" -ForegroundColor Green
      } else {
        Write-Host "  API：$($m.Matches[0].Value)" -ForegroundColor DarkGray
      }
    }
  }
} else {
  Write-Host '  （无日志，尚未开始过分享）' -ForegroundColor DarkGray
}
Write-Host ''
Write-Host '  · 停止分享：.\stop-public.ps1' -ForegroundColor DarkGray
Write-Host '  · 重新分享：.\start-public.ps1（网址会变，需重新发给朋友）' -ForegroundColor DarkGray
Write-Host ''
