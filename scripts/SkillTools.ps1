# Shared helpers for sync-skills.ps1 (~/.claude/hooks) and update-skills.ps1. Dot-source this file.
# Works in Windows PowerShell 5.1 and PowerShell 7.

# Content fingerprint of a skill folder: SHA-1 over each file's path and CRLF-normalized bytes.
# Ignores line endings and file modes, which the skills CLI and Windows checkouts change without real edits.
# Throws if any file can't be read, so a locked file never looks like an edit.
function Get-SkillFingerprint([string]$Dir) {
  $ErrorActionPreference = 'Stop'
  $sha = [Security.Cryptography.SHA1]::Create()
  $latin1 = [Text.Encoding]::GetEncoding(28591)  # maps bytes 1:1 to chars, so binary files survive the replace
  $root = (Resolve-Path -LiteralPath $Dir).Path.TrimEnd('\') + '\'
  $lines = Get-ChildItem -LiteralPath $Dir -Recurse -File -Force | ForEach-Object {
    $rel = $_.FullName.Substring($root.Length).Replace('\', '/')
    $text = $latin1.GetString([IO.File]::ReadAllBytes($_.FullName)).Replace("`r`n", "`n")
    $hash = -join ($sha.ComputeHash($latin1.GetBytes($text)) | ForEach-Object { $_.ToString('x2') })
    "$rel`t$hash"
  } | Sort-Object -CaseSensitive
  $all = [Text.Encoding]::UTF8.GetBytes(($lines -join "`n"))
  -join ($sha.ComputeHash($all) | ForEach-Object { $_.ToString('x2') })
}

# Baseline: { name: { fingerprint, lockHash } } for each gitignored external skill, recorded when it was installed or updated.
function Read-SkillBaseline([string]$Path) {
  $map = @{}
  if (Test-Path -LiteralPath $Path) {
    $json = Get-Content -LiteralPath $Path -Raw | ConvertFrom-Json
    foreach ($p in $json.PSObject.Properties) { $map[$p.Name] = $p.Value }
  }
  $map
}

function Write-SkillBaseline([string]$Path, [hashtable]$Map) {
  $ordered = [ordered]@{}
  foreach ($k in ($Map.Keys | Sort-Object)) { $ordered[$k] = $Map[$k] }
  [IO.File]::WriteAllText($Path, (($ordered | ConvertTo-Json -Depth 4) + "`n"), (New-Object Text.UTF8Encoding $false))
}
