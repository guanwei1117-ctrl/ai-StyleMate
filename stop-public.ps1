# ============================================================
# 停止公网分享：关闭隧道与分享用前端进程
# 用法：.\stop-public.ps1
# ============================================================

$root = Split-Path -Parent $MyInvocation.MyCommand.Path
$pidFile = Join-Path $root '.tools\tunnel-pids.txt'

if (Test-Path $pidFile) {
  $pids = Get-Content $pidFile | Where-Object { $_ -match '^\d+$' }
  foreach ($pidValue in $pids) {
    try {
      # /T 连同子进程一起结束（cmd → node 等）
      & taskkill /PID $pidValue /T /F 2>$null | Out-Null
      Write-Host "[✓] 已停止进程 $pidValue"
    } catch {
      Write-Host "[i] 进程 $pidValue 已不存在"
    }
  }
  Remove-Item $pidFile -ErrorAction SilentlyContinue
} else {
  Write-Host '[i] 未找到运行记录（.tools\tunnel-pids.txt），尝试清理残留 cloudflared 进程…'
  Get-Process cloudflared -ErrorAction SilentlyContinue | ForEach-Object {
    & taskkill /PID $_.Id /T /F 2>$null | Out-Null
  }
}

Write-Host ''
Write-Host '[✓] 分享已停止。本地开发不受影响（3000 端口的前端仍在）。'
Write-Host '    下次分享：再次运行 .\start-public.ps1（网址会变化，需要重新发给朋友）。'
