# Updates external skills without losing local edits.
#   powershell -ExecutionPolicy Bypass -File ~/.agents/scripts/update-skills.ps1
# 1. Runs `npx skills update -g -y` (skipped if an update already ran and is still uncommitted).
# 2. For each external skill tracked in git (= has local edits) whose upstream version changed, three-way merges
#    base (old upstream, fetched by its locked tree hash) + mine (HEAD) + theirs (new upstream) with `git merge-file`.
# 3. Commits when everything merged cleanly; otherwise leaves conflict markers (<<<<<<<) for you to resolve.
$ErrorActionPreference = 'Stop'
$repo = Split-Path -Parent $PSScriptRoot
. (Join-Path $PSScriptRoot 'SkillTools.ps1')
$lockPath = Join-Path $repo '.skill-lock.json'
function Invoke-RepoGit { git.exe -C $repo @args; if ($LASTEXITCODE) { throw "git $args failed" } }

# Run the sync hook first: it un-ignores and commits any external skill edited since it last ran, so the update can't overwrite edits git never saw.
$hook = Join-Path $env:USERPROFILE '.claude\hooks\sync-skills.ps1'
if (Test-Path $hook) { '' | powershell -NoProfile -ExecutionPolicy Bypass -File $hook | Write-Host }

$headLock = (Invoke-RepoGit show HEAD:.skill-lock.json) -join "`n" | ConvertFrom-Json
$dirty = @(git -C $repo status --porcelain)
if ($dirty) {
  # Merge-only mode: allowed only when the leftovers are an update the hook held back (lock file + overwritten edited skills).
  $lockNow = Get-Content $lockPath -Raw | ConvertFrom-Json
  $other = $dirty | Where-Object {
    $p = $_.Substring(3).Trim('"')
    if ($p -in '.skill-lock.json', '.skill-baseline.json') { return $false }
    if ($p -match '^skills/([^/]+)/') { $n = $Matches[1]; return $headLock.skills.$n.skillFolderHash -eq $lockNow.skills.$n.skillFolderHash }
    $true
  }
  if (-not ($dirty -match '\.skill-lock\.json') -or $other) {
    throw "~/.agents has uncommitted changes. Commit them first so nothing can be lost:`n$($dirty -join "`n")"
  }
  Write-Host "An update already ran (lock file changed since the last commit); merging only."
} else {
  Push-Location $env:USERPROFILE
  $ErrorActionPreference = 'Continue'  # PowerShell 5.1 turns native stderr into errors under 'Stop'
  try { npx -y skills@latest update -g -y } finally { Pop-Location; $ErrorActionPreference = 'Stop' }
  if ($LASTEXITCODE) { throw "npx skills update failed" }
}
$lock = Get-Content $lockPath -Raw | ConvertFrom-Json

$work = Join-Path (Convert-Path ([IO.Path]::GetTempPath())) ("skill-merge-" + [guid]::NewGuid().ToString('N').Substring(0, 8))
New-Item -ItemType Directory $work | Out-Null
$utf8 = New-Object Text.UTF8Encoding $false
$clones = @{}
$conflicts = @()
$merged = @()

# Text files are compared and merged with LF endings; files with NUL bytes are treated as binary.
function Read-Normalized([string]$Path) {
  $bytes = [IO.File]::ReadAllBytes($Path)
  if ($bytes -contains 0) { return $null }
  $utf8.GetString($bytes).Replace("`r`n", "`n")
}
function Expand-Tree([string]$GitDir, [string]$Treeish, [string]$Dest, [string]$Sub) {
  $ErrorActionPreference = 'Continue'
  New-Item -ItemType Directory -Force $Dest | Out-Null
  $tar = Join-Path $work 'x.tar'
  $paths = @($Sub | Where-Object { $_ })
  git --git-dir $GitDir archive -o $tar $Treeish @paths 2>$null
  if ($LASTEXITCODE) { return $false }
  tar -xf $tar -C $Dest 2>$null  # upstream symlinks may fail to extract on Windows; the files that matter still land
  Remove-Item $tar
  $true
}

foreach ($name in $lock.skills.PSObject.Properties.Name) {
  if (-not (git -C $repo ls-files -- "skills/$name")) { continue }  # unmodified: the plain update is all it needs
  $old = $headLock.skills.$name.skillFolderHash
  $new = $lock.skills.$name.skillFolderHash
  if (-not $old -or $old -eq $new) { continue }
  Write-Host "Merging your edits into the new upstream '$name'..."

  $url = $lock.skills.$name.sourceUrl
  if (-not $clones[$url]) {
    $dir = Join-Path $work ("up" + $clones.Count)
    git clone -q --bare --filter=blob:none $url $dir
    if ($LASTEXITCODE) { throw "could not clone $url" }
    $clones[$url] = $dir
  }
  $base = Join-Path $work "$name-base"; $mine = Join-Path $work "$name-mine"; $theirs = Join-Path (Join-Path $repo 'skills') $name
  if (-not (Expand-Tree $clones[$url] $old $base '')) {
    Write-Warning "old upstream version of '$name' not found; merging without a base (every difference becomes a conflict)"
  }
  Expand-Tree (Join-Path $repo '.git') 'HEAD' $mine "skills/$name" | Out-Null
  $mine = Join-Path $mine "skills\$name"

  $files = @($base, $mine, $theirs) | ForEach-Object {
    if (Test-Path $_) {
      $root = Convert-Path -LiteralPath $_
      Get-ChildItem -LiteralPath $root -Recurse -File | ForEach-Object { $_.FullName.Substring($root.Length + 1) } }
  } | Sort-Object -Unique
  $out = Join-Path $work "$name-out"
  foreach ($rel in $files) {
    $b = Join-Path $base $rel; $m = Join-Path $mine $rel; $t = Join-Path $theirs $rel; $o = Join-Path $out $rel
    $hasB = Test-Path -LiteralPath $b; $hasM = Test-Path -LiteralPath $m; $hasT = Test-Path -LiteralPath $t
    New-Item -ItemType Directory -Force (Split-Path $o) | Out-Null
    if ($hasM -and $hasT) {
      $mText = Read-Normalized $m; $tText = Read-Normalized $t
      $bText = if ($hasB) { Read-Normalized $b } else { '' }
      if ($null -eq $mText -or $null -eq $tText) {
        # Binary: keep mine unless only upstream changed it.
        $src = if ($hasB -and (Get-FileHash $m).Hash -eq (Get-FileHash $b).Hash) { $t } else { $m }
        Copy-Item -LiteralPath $src $o
        continue
      }
      $fm = "$o.mine"; $fb = "$o.base"; $ft = "$o.theirs"
      [IO.File]::WriteAllText($fm, $mText, $utf8); [IO.File]::WriteAllText($fb, $bText, $utf8); [IO.File]::WriteAllText($ft, $tText, $utf8)
      git merge-file -L mine -L base -L upstream $fm $fb $ft
      if ($LASTEXITCODE -gt 127 -or $LASTEXITCODE -lt 0) { throw "git merge-file failed on $name/$rel" }
      if ($LASTEXITCODE -gt 0) { $conflicts += "skills/$name/$($rel.Replace('\', '/'))" }
      Move-Item -Force $fm $o; Remove-Item $fb, $ft
    } elseif ($hasM) {
      # Upstream deleted it: drop it if I never changed it, else keep my copy.
      $same = $hasB -and $(if ($null -eq (Read-Normalized $m)) { (Get-FileHash $m).Hash -eq (Get-FileHash $b).Hash } else { (Read-Normalized $m) -eq (Read-Normalized $b) })
      if (-not $same) { Copy-Item -LiteralPath $m $o }
    } elseif ($hasT -and -not $hasB) {
      Copy-Item -LiteralPath $t $o  # new upstream file
    }  # else: I deleted it, so it stays deleted (even if upstream changed it)
  }
  New-Item -ItemType Directory -Force $out | Out-Null
  Remove-Item -Recurse -Force $theirs
  Copy-Item -Recurse $out $theirs
  $merged += $name
}

Remove-Item -Recurse -Force $work
if (-not $merged) { Write-Host "No edited external skill had an upstream change." }
if ($conflicts) {
  Write-Host "`nConflicts to resolve (look for <<<<<<< mine / >>>>>>> upstream):"
  $conflicts | ForEach-Object { Write-Host "  $_" }
  Write-Host "Then run: git -C ~/.agents add -A; git -C ~/.agents commit"
  exit 1
}
Invoke-RepoGit add -A
if (git -C $repo diff --cached --name-only) {
  $msg = [char]::ConvertFromUtf32(0x2B06) + [char]0xFE0F + " chore: update external skills"
  if ($merged) { $msg += "`n`nMerged local edits into: " + ($merged -join ', ') }
  $msgFile = Join-Path ([IO.Path]::GetTempPath()) 'update-skills-msg.txt'
  [IO.File]::WriteAllText($msgFile, "$msg`n", $utf8)
  Invoke-RepoGit commit -q -F $msgFile
  Remove-Item $msgFile
  Invoke-RepoGit log --oneline -1 --stat
} else { Write-Host "Everything was already up to date." }
