param(
  [string]$Destination = 'C:\Users\thoma\.cache\codex-runtimes\codex-primary-runtime\dependencies\python',
  [string]$ArchivePath = ''
)

$ErrorActionPreference = 'Stop'
if (-not $IsWindows) { throw 'The frozen research runtime requires Windows.' }
$runtimeSource = Join-Path $PSScriptRoot '../tools/research-python'
$manifest = Get-Content -LiteralPath (Join-Path $runtimeSource 'runtime.json') -Raw | ConvertFrom-Json
$launcher = Join-Path $runtimeSource 'python.exe'
if ((Get-FileHash -LiteralPath $launcher -Algorithm SHA256).Hash.ToLowerInvariant() -ne $manifest.executableSha256) {
  throw 'The retained research Python executable hash differs.'
}
$Destination = [System.IO.Path]::GetFullPath($Destination)
if (Test-Path -LiteralPath $Destination) { throw "Refusing to overwrite an existing runtime: $Destination" }
if (-not $ArchivePath) {
  $ArchivePath = Join-Path ([System.IO.Path]::GetTempPath()) ('chess-review-python-' + [guid]::NewGuid() + '.tar.gz')
  Invoke-WebRequest -Uri $manifest.archiveUrl -OutFile $ArchivePath
}
if ((Get-FileHash -LiteralPath $ArchivePath -Algorithm SHA256).Hash.ToLowerInvariant() -ne $manifest.archiveSha256) {
  throw 'The pinned Python archive hash differs.'
}

New-Item -ItemType Directory -Path $Destination | Out-Null
tar -xzf $ArchivePath --strip-components 1 -C $Destination
if ($LASTEXITCODE -ne 0) { throw 'Could not extract the pinned Python runtime.' }
# Preserve the signed executable identity recorded in the original observations.
# The matching upstream archive supplies the DLLs and standard library.
$executable = Join-Path $Destination 'python.exe'
Copy-Item -LiteralPath $launcher -Destination $executable
if ((Get-FileHash -LiteralPath $executable -Algorithm SHA256).Hash.ToLowerInvariant() -ne $manifest.executableSha256) {
  throw 'The installed research Python executable hash differs.'
}
$actualVersion = & $executable -c 'import sys; print(sys.version)'
if ($LASTEXITCODE -ne 0 -or $actualVersion -ne $manifest.version) { throw 'The research Python build differs.' }
Write-Output "Verified research Python: $actualVersion"
