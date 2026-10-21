<#
.SYNOPSIS
  Builds a slackDownloadTemplate-style .rtf from a conversation JSON and gathers its files.

.DESCRIPTION
  Input JSON (UTF-8):
  {
    "conversationName": "nouveau-canal",          # folder + rtf file name
    "to": "#nouveau-canal",                        # <To> value
    "header": "channel topic / purpose",           # <header> value
    "outputRoot": "C:\\path\\to\\working\\dir",    # folder is created here
    "messages": [                                  # oldest first
      {
        "from": "r me",
        "datetime": "2026-10-20 18:42:54",         # as Slack reports it (workspace tz)
        "text": "raw Slack mrkdwn",
        "reactions": [ { "emoji": "eyes", "users": ["MBTest"] } ],
        "files": [ { "name": "image.png", "source": "C:\\local\\copy.png" } ]   # or "url": "https://..."
      }
    ]
  }
#>
param([Parameter(Mandatory = $true)][string]$JsonPath)

$ErrorActionPreference = 'Stop'
$data = [IO.File]::ReadAllText($JsonPath, [Text.Encoding]::UTF8) | ConvertFrom-Json

# ---------- RTF helpers ----------
$Markers = @{ [char]0x24E3 = $true; [char]0x24D5 = $true; [char]0x24C1 = $true }   # ⓣ ⓕ Ⓛ

function ConvertTo-Rtf([string]$s) {
    $sb = New-Object Text.StringBuilder
    foreach ($ch in $s.ToCharArray()) {
        $code = [int]$ch
        if ($ch -eq '\' -or $ch -eq '{' -or $ch -eq '}') { [void]$sb.Append('\').Append($ch) }
        elseif ($ch -eq "`n") { [void]$sb.Append("\par`r`n") }
        elseif ($ch -eq "`r") { }
        elseif ($Markers.ContainsKey($ch)) { [void]$sb.Append("{\f1 \u$($code)?}") }
        elseif ($code -gt 127) {
            if ($code -gt 32767) { $code -= 65536 }
            [void]$sb.Append("\u$($code)?")
        }
        else { [void]$sb.Append($ch) }
    }
    $sb.ToString()
}

function Get-DaySuffix([int]$d) {
    if ($d -ge 11 -and $d -le 13) { return 'th' }
    switch ($d % 10) { 1 { 'st' } 2 { 'nd' } 3 { 'rd' } default { 'th' } }
}

# ---------- Slack mrkdwn -> template markup ----------
function Convert-SlackEntities([string]$s) {
    $s.Replace('&lt;', '<').Replace('&gt;', '>').Replace('&amp;', '&')
}

# Splits mrkdwn into segments: @{ text; bold; italic; strike; url; label }
function Get-Segments([string]$text) {
    $segs = New-Object Collections.ArrayList
    $state = @{ bold = $false; italic = $false; strike = $false }
    $buf = New-Object Text.StringBuilder
    $flush = {
        if ($buf.Length -gt 0) {
            [void]$segs.Add(@{ text = $buf.ToString(); bold = $state.bold; italic = $state.italic; strike = $state.strike; url = $null })
            [void]$buf.Clear()
        }
    }
    $map = @{ '*' = 'bold'; '_' = 'italic'; '~' = 'strike' }
    $i = 0
    while ($i -lt $text.Length) {
        $c = $text[$i]
        if ($c -eq '<') {
            $end = $text.IndexOf('>', $i)
            if ($end -gt $i) {
                $inner = $text.Substring($i + 1, $end - $i - 1)
                $parts = $inner.Split('|', 2)
                $target = $parts[0]
                $label = if ($parts.Count -gt 1) { $parts[1] } else { $null }
                if ($target.StartsWith('@')) { [void]$buf.Append('@' + $(if ($label) { $label } else { $target.Substring(1) })) }
                elseif ($target.StartsWith('#')) { [void]$buf.Append('#' + $(if ($label) { $label } else { $target.Substring(1) })) }
                elseif ($target.StartsWith('!')) { [void]$buf.Append('@' + $(if ($label) { $label } else { $target.Substring(1).Split('^')[0] })) }
                else {
                    & $flush
                    [void]$segs.Add(@{ text = ''; bold = $state.bold; italic = $state.italic; strike = $state.strike
                            url = (Convert-SlackEntities $target); label = $(if ($label) { Convert-SlackEntities $label }) })
                }
                $i = $end + 1
                continue
            }
        }
        if ($map.ContainsKey([string]$c)) {
            $key = $map[[string]$c]
            $prev = if ($i -gt 0) { $text[$i - 1] } else { ' ' }
            $next = if ($i + 1 -lt $text.Length) { $text[$i + 1] } else { ' ' }
            $opening = (-not $state[$key]) -and ($prev -match '[\s\*_~(]' -or $i -eq 0) -and ($next -notmatch '\s') -and
                       ($text.IndexOf($c, $i + 1) -gt $i + 1) -and ($text.IndexOf("`n", $i) -lt 0 -or $text.IndexOf($c, $i + 1) -lt $text.IndexOf("`n", $i))
            $closing = $state[$key] -and ($prev -notmatch '\s')
            if ($opening -or $closing) {
                & $flush
                $state[$key] = -not $state[$key]
                $i++
                continue
            }
        }
        [void]$buf.Append($c)
        $i++
    }
    & $flush
    foreach ($s in $segs) { $s.text = Convert-SlackEntities $s.text }
    , $segs
}

function Get-Markup($seg) {
    $core = if ($seg.url) {
        if ($seg.label) { "$([char]0x24C1)<[$($seg.label)]<$($seg.url)>>" } else { "$([char]0x24C1)<$($seg.url)>" }
    } else { $seg.text }
    $tags = ''
    if ($seg.strike) { $tags += '<strikethrough>' }
    if ($seg.bold) { $tags += '<bold>' }
    if ($seg.italic) { $tags += '<italics>' }
    if ($tags) { "$([char]0x24E3)<$tags$core>" } else { $core }
}

function Convert-Message([string]$text) {
    $out = ''
    foreach ($seg in (Get-Segments $text)) {
        # formatting markers do not span lines: split formatted text on newlines
        if (-not $seg.url -and ($seg.bold -or $seg.italic -or $seg.strike) -and $seg.text.Contains("`n")) {
            $lines = $seg.text.Split("`n")
            for ($k = 0; $k -lt $lines.Count; $k++) {
                if ($k -gt 0) { $out += "`n" }
                if ($lines[$k].Trim()) { $copy = $seg.Clone(); $copy.text = $lines[$k]; $out += Get-Markup $copy } else { $out += $lines[$k] }
            }
        } else { $out += Get-Markup $seg }
    }
    $out
}

# ---------- Output folder + files ----------
$safeName = ($data.conversationName -replace '[\\/:*?"<>|]', '_').Trim()
$root = if ($data.outputRoot) { $data.outputRoot } else { (Get-Location).Path }
$folder = Join-Path $root $safeName
New-Item -ItemType Directory -Force -Path $folder | Out-Null

$usedNames = @{}
function Save-SlackFile($f) {
    $base = [IO.Path]::GetFileNameWithoutExtension($f.name)
    $ext = [IO.Path]::GetExtension($f.name)
    $name = ($f.name -replace '[\\/:*?"<>|]', '_')
    $n = 2
    while ($usedNames.ContainsKey($name.ToLower())) { $name = "$base ($n)$ext"; $n++ }
    $usedNames[$name.ToLower()] = $true
    $dest = Join-Path $folder $name
    try {
        if ($f.source) { Copy-Item -LiteralPath $f.source -Destination $dest -Force }
        elseif ($f.url) { Invoke-WebRequest -Uri $f.url -OutFile $dest -UseBasicParsing }
        else { Write-Warning "No source for file $($f.name)" }
    } catch { Write-Warning "Could not save $($f.name): $_" }
    $name
}

# ---------- Build lines ----------
$L = New-Object Collections.ArrayList   # each entry is already-RTF text for one paragraph
function Add-Line([string]$plain) { [void]$L.Add((ConvertTo-Rtf $plain)) }

Add-Line "<To><$($data.to)>//"
Add-Line "<header><$($data.header)>//"

$culture = [Globalization.CultureInfo]::GetCultureInfo('en-US')
$lastDay = $null; $lastFrom = $null
foreach ($m in $data.messages) {
    $dt = [datetime]::ParseExact($m.datetime, 'yyyy-MM-dd HH:mm:ss', $culture)
    $day = $dt.ToString('yyyy-MM-dd')
    if ($day -ne $lastDay) {
        $dayText = ConvertTo-Rtf "<day><$($dt.ToString('dddd, MMMM d', $culture))"
        [void]$L.Add("$dayText{\super $(Get-DaySuffix $dt.Day)}>//")
        $lastDay = $day; $lastFrom = $null
    }
    if ($m.from -ne $lastFrom) { Add-Line "<From><$($m.from)>//"; $lastFrom = $m.from }
    Add-Line "<Time><$($dt.ToString('h:mmtt', $culture))>//"

    $content = Convert-Message ([string]$m.text)
    foreach ($f in @($m.files)) {
        if ($f) { $content += "$([char]0x24D5)<$(Save-SlackFile $f)>>" }
    }
    [void]$L.Add((ConvertTo-Rtf "<Content`n$content`n>//"))

    $reactions = @($m.reactions | Where-Object { $_ })
    if ($reactions.Count -gt 0) {
        $r = '<reactions><'
        foreach ($rx in $reactions) {
            $r += "<:$($rx.emoji):>"
            foreach ($u in @($rx.users)) { $r += "<From><$u>" }
        }
        Add-Line "$r>//"
    }
}

$header = '{\rtf1\ansi\ansicpg1252\deff0\uc1{\fonttbl{\f0\fswiss\fcharset0 Helvetica;}{\f1\fnil\fcharset0 Segoe UI Symbol;}}' +
          "`r`n\paperw12240\paperh15840\margl1440\margr1440\margt1417\margb1417`r`n\pard\plain\ql\f0\fs24`r`n"
$rtf = $header + ($L -join "\par`r`n") + "\par`r`n}"
$rtfPath = Join-Path $folder "$safeName.rtf"
[IO.File]::WriteAllText($rtfPath, $rtf, [Text.Encoding]::ASCII)
Write-Output "RTF:    $rtfPath"
Write-Output "Folder: $folder"
Get-ChildItem -LiteralPath $folder | ForEach-Object { Write-Output ("  {0,-30} {1,10:N0} bytes" -f $_.Name, $_.Length) }
