# ============================================================
# 打部署包：把项目代码（不含依赖/构建产物/本地工具）压成 zip
# 用法：.\deploy\make-bundle.ps1
# 产物：stylemate-deploy.zip（用 scp/WinSCP 传到服务器 /opt 解压即可）
# ============================================================

$root = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)
$out = Join-Path $root 'stylemate-deploy.zip'

$excludeDirs = @(
  'node_modules', '.next', '.next-dev', 'dist', '.turbo',
  '.tools', 'tmp', '.git', '.netlify', 'out', 'coverage',
  '__pycache__'
)

Write-Host "打包项目：$root" -ForegroundColor Cyan
Write-Host "排除目录：$($excludeDirs -join ', ')" -ForegroundColor DarkGray

Remove-Item $out -ErrorAction SilentlyContinue

$tempDir = Join-Path $env:TEMP ('stylemate-bundle-' + [guid]::NewGuid().ToString('N'))
New-Item -ItemType Directory -Path $tempDir | Out-Null

# 复制项目文件（排除大目录）
$items = Get-ChildItem $root -Force | Where-Object { $excludeDirs -notcontains $_.Name }
foreach ($item in $items) {
  Copy-Item $item.FullName -Destination (Join-Path $tempDir $item.Name) -Recurse -Force
}

# 压缩
Compress-Archive -Path (Join-Path $tempDir '*') -DestinationPath $out -Force
Remove-Item $tempDir -Recurse -Force

$sizeMB = [Math]::Round((Get-Item $out).Length / 1MB, 1)
Write-Host ''
Write-Host "[✓] 打包完成：$out （$sizeMB MB）" -ForegroundColor Green
Write-Host '    上传到服务器：scp stylemate-deploy.zip root@服务器IP:/opt/'
Write-Host '    服务器解压：  cd /opt && unzip stylemate-deploy.zip -d stylemate'
Write-Host ''
