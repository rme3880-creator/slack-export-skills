<#
.SYNOPSIS
  Converts a slackDownloadTemplate-style .rtf (made by slack-export-rtf) into a single <div> HTML file
  styled like a Slack group chat.

.PARAMETER RtfPath   The exported .rtf (its shared files are expected next to it).
.PARAMETER OutDir    Where to write <name>.html. Defaults to the current directory.
#>
param(
    [Parameter(Mandatory = $true)][string]$RtfPath,
    [string]$OutDir = (Get-Location).Path
)

$ErrorActionPreference = 'Stop'
$RtfPath = (Resolve-Path -LiteralPath $RtfPath).Path
$OutDir = (New-Item -ItemType Directory -Force -Path $OutDir).FullName

# ---------- RTF -> plain text (shared read so it works while Word has it open) ----------
Add-Type -AssemblyName System.Windows.Forms
$fs = [IO.File]::Open($RtfPath, 'Open', 'Read', 'ReadWrite')
$sr = New-Object IO.StreamReader($fs, [Text.Encoding]::GetEncoding(1252))
$rtfText = $sr.ReadToEnd(); $sr.Close()
$rtb = New-Object System.Windows.Forms.RichTextBox
$rtb.Rtf = $rtfText
$text = $rtb.Text.Replace("`r", '')

$T = [char]0x24E3   # ⓣ formatted text
$F = [char]0x24D5   # ⓕ file
$L = [char]0x24C1   # Ⓛ link

# ---------- helpers ----------
function ConvertTo-Html([string]$s) {
    $sb = New-Object Text.StringBuilder
    for ($i = 0; $i -lt $s.Length; $i++) {
        $c = $s[$i]
        if ([char]::IsHighSurrogate($c) -and $i + 1 -lt $s.Length) {
            [void]$sb.Append('&#x{0:X};' -f [char]::ConvertToUtf32($c, $s[$i + 1])); $i++
        }
        elseif ($c -eq '&') { [void]$sb.Append('&amp;') }
        elseif ($c -eq '<') { [void]$sb.Append('&lt;') }
        elseif ($c -eq '>') { [void]$sb.Append('&gt;') }
        elseif ($c -eq '"') { [void]$sb.Append('&quot;') }
        elseif ([int]$c -gt 127) { [void]$sb.Append('&#x{0:X};' -f [int]$c) }
        else { [void]$sb.Append($c) }
    }
    $sb.ToString()
}

# Slack shortcode -> code points (unknown codes fall back to :name:)
$Emoji = @{
    '+1' = '1F44D'; 'thumbsup' = '1F44D'; '-1' = '1F44E'; 'thumbsdown' = '1F44E'; 'eyes' = '1F440'; 'grin' = '1F601'
    'grinning' = '1F600'; 'smile' = '1F604'; 'smiley' = '1F603'; 'joy' = '1F602'; 'rofl' = '1F923'; 'laughing' = '1F606'
    'wink' = '1F609'; 'blush' = '1F60A'; 'heart_eyes' = '1F60D'; 'thinking_face' = '1F914'; 'sweat_smile' = '1F605'
    'slightly_smiling_face' = '1F642'; 'upside_down_face' = '1F643'; 'neutral_face' = '1F610'; 'cry' = '1F622'
    'sob' = '1F62D'; 'scream' = '1F631'; 'open_mouth' = '1F62E'; 'sunglasses' = '1F60E'; 'pensive' = '1F614'
    'raised_hands' = '1F64C'; 'clap' = '1F44F'; 'pray' = '1F64F'; 'wave' = '1F44B'; 'ok_hand' = '1F44C'; 'muscle' = '1F4AA'
    'point_up' = '261D'; 'point_right' = '1F449'; 'v' = '270C'; 'handshake' = '1F91D'; 'raised_hand' = '270B'
    'heart' = '2764,FE0F'; 'blue_heart' = '1F499'; 'green_heart' = '1F49A'; 'purple_heart' = '1F49C'; 'broken_heart' = '1F494'
    'fire' = '1F525'; 'tada' = '1F389'; 'confetti_ball' = '1F38A'; 'rocket' = '1F680'; 'star' = '2B50'; 'sparkles' = '2728'
    '100' = '1F4AF'; 'white_check_mark' = '2705'; 'heavy_check_mark' = '2714,FE0F'; 'x' = '274C'; 'warning' = '26A0,FE0F'
    'question' = '2753'; 'exclamation' = '2757'; 'bulb' = '1F4A1'; 'memo' = '1F4DD'; 'pushpin' = '1F4CC'; 'calendar' = '1F4C5'
    'chart_with_upwards_trend' = '1F4C8'; 'moneybag' = '1F4B0'; 'house' = '1F3E0'; 'coffee' = '2615'; 'pizza' = '1F355'
    'beers' = '1F37B'; 'trophy' = '1F3C6'; 'zap' = '26A1'; 'sunny' = '2600,FE0F'; 'rainbow' = '1F308'; 'skull' = '1F480'
    'see_no_evil' = '1F648'; 'shrug' = '1F937'; 'facepalm' = '1F926'; 'party_popper' = '1F389'; 'partying_face' = '1F973'
    'hugging_face' = '1F917'; 'smirk' = '1F60F'; 'relieved' = '1F60C'; 'astonished' = '1F632'; 'money_mouth_face' = '1F911'
    'speech_balloon' = '1F4AC'; 'link' = '1F517'; 'paperclip' = '1F4CE'; 'lock' = '1F512'; 'key' = '1F511'; 'bell' = '1F514'
    'books' = '1F4DA'; 'rotating_light' = '1F6A8'; 'seedling' = '1F331'; 'taco' = '1F32E'; 'microphone' = '1F3A4'
}
function Get-EmojiHtml([string]$name) {
    $n = $name.Split(':')[0]
    if ($Emoji.ContainsKey($n)) { ($Emoji[$n].Split(',') | ForEach-Object { "&#x$_;" }) -join '' }
    else { ConvertTo-Html ":$($name):" }
}
function Convert-Shortcodes([string]$html) {
    [regex]::Replace($html, ':([a-z0-9_+\-]+):', { param($m) if ($Emoji.ContainsKey($m.Groups[1].Value)) { Get-EmojiHtml $m.Groups[1].Value } else { $m.Value } })
}

$AvatarColors = @('#1264A3', '#2D7A4F', '#B8541C', '#6B3FA0', '#B3245C', '#0B7A86', '#7A5C12', '#4A5BC4')
function Get-AvatarColor([string]$name) {
    $h = 0; foreach ($c in $name.ToCharArray()) { $h = ($h * 31 + [int]$c) % 100003 }
    $AvatarColors[$h % $AvatarColors.Count]
}

$rtfDir = Split-Path -Parent $RtfPath
function Get-FileHref([string]$name) {
    $from = New-Object Uri(($OutDir.TrimEnd('\') + '\'))
    $to = New-Object Uri((Join-Path $rtfDir $name))
    [Uri]::UnescapeDataString($from.MakeRelativeUri($to).ToString())
}

# ---------- content markup parser (ⓣ / Ⓛ / ⓕ) ----------
$script:src = ''; $script:pos = 0; $script:files = $null
function Read-Seq([bool]$nested) {
    $out = New-Object Text.StringBuilder
    while ($script:pos -lt $script:src.Length) {
        $c = $script:src[$script:pos]
        $next = if ($script:pos + 1 -lt $script:src.Length) { $script:src[$script:pos + 1] } else { '' }
        if ($nested -and $c -eq '>') { $script:pos++; return $out.ToString() }
        if ($c -eq $T -and $next -eq '<') {
            $script:pos += 2
            $tags = @()
            while ($true) {
                $rest = $script:src.Substring($script:pos)
                $m = [regex]::Match($rest, '^<(bold|italics|strikethrough)>')
                if (-not $m.Success) { break }
                $tags += $m.Groups[1].Value; $script:pos += $m.Length
            }
            $inner = Read-Seq $true
            foreach ($tag in $tags) {
                $inner = switch ($tag) { 'bold' { "<b>$inner</b>" } 'italics' { "<i>$inner</i>" } 'strikethrough' { "<s>$inner</s>" } }
            }
            [void]$out.Append($inner); continue
        }
        if ($c -eq $L -and $next -eq '<') {
            $script:pos += 2
            $label = $null
            if ($script:src[$script:pos] -eq '[') {
                $close = $script:src.IndexOf(']<', $script:pos)
                $label = $script:src.Substring($script:pos + 1, $close - $script:pos - 1)
                $script:pos = $close + 2
                $end = $script:src.IndexOf('>', $script:pos)
                $url = $script:src.Substring($script:pos, $end - $script:pos)
                $script:pos = $end + 2          # url '>' + link '>'
            } else {
                $end = $script:src.IndexOf('>', $script:pos)
                $url = $script:src.Substring($script:pos, $end - $script:pos)
                $script:pos = $end + 1
            }
            $shown = if ($label) { $label } else { $url }
            [void]$out.Append("<a href=`"$(ConvertTo-Html $url)`" style=`"color:#1264A3; text-decoration:none;`">$(ConvertTo-Html $shown)</a>")
            continue
        }
        if ($c -eq $F -and $next -eq '<') {
            $script:pos += 2
            $end = $script:src.IndexOf('>', $script:pos)
            [void]$script:files.Add($script:src.Substring($script:pos, $end - $script:pos))
            $script:pos = $end + 1
            if ($script:pos -lt $script:src.Length -and $script:src[$script:pos] -eq '>') { $script:pos++ }
            continue
        }
        if ($c -eq "`n") { [void]$out.Append('<br>') }
        elseif ([char]::IsHighSurrogate($c) -and $next) { [void]$out.Append((ConvertTo-Html "$c$next")); $script:pos++ }
        else { [void]$out.Append((ConvertTo-Html ([string]$c))) }
        $script:pos++
    }
    $out.ToString()
}
function Convert-Content([string]$s) {
    $script:src = $s; $script:pos = 0; $script:files = New-Object Collections.ArrayList
    $html = Convert-Shortcodes (Read-Seq $false)
    $html = [regex]::Replace($html, '(^|<br>)\s*(<br>|$)', '$1$2').Trim()
    $html = [regex]::Replace($html, '^(<br>)+|(<br>)+$', '')
    @{ html = $html; files = @($script:files) }
}

# ---------- parse the template lines ----------
$to = ''; $header = ''; $day = ''; $from = ''; $time = ''
$messages = New-Object Collections.ArrayList
$lines = $text.Split("`n")
for ($i = 0; $i -lt $lines.Count; $i++) {
    $line = $lines[$i]
    if ($line -match '^<To><(.*)>//\s*$') { $to = $Matches[1] }
    elseif ($line -match '^<header><(.*)>//\s*$') { $header = $Matches[1] }
    elseif ($line -match '^<day><(.*)>//\s*$') { $day = $Matches[1] }
    elseif ($line -match '^<From><(.*?)\s*>//\s*$') { $from = $Matches[1] }
    elseif ($line -match '^<Time><(.*)>//\s*$') { $time = $Matches[1] }
    elseif ($line -match '^<Content') {
        $body = New-Object Collections.ArrayList
        $first = $line.Substring(8)
        if ($first) { [void]$body.Add($first) }
        $i++
        while ($i -lt $lines.Count -and $lines[$i] -notmatch '^>//\s*$') { [void]$body.Add($lines[$i]); $i++ }
        $parsed = Convert-Content ($body -join "`n")
        [void]$messages.Add(@{ day = $day; from = $from; time = $time; html = $parsed.html; files = $parsed.files; reactions = @() })
    }
    elseif ($line -match '^<reactions><(.*)>//\s*$' -and $messages.Count -gt 0) {
        $rx = @()
        foreach ($m in [regex]::Matches($Matches[1], '<:([^>]+?):>((?:<From><[^>]*>)*)')) {
            $users = @([regex]::Matches($m.Groups[2].Value, '<From><([^>]*?)\s*>') | ForEach-Object { $_.Groups[1].Value })
            $rx += @{ emoji = $m.Groups[1].Value; users = $users }
        }
        $messages[$messages.Count - 1].reactions = $rx
    }
}

# ---------- render ----------
$font = "font-family:Lato, 'Helvetica Neue', Helvetica, 'Segoe UI', Arial, sans-serif;"
$imageExt = @('.png', '.jpg', '.jpeg', '.gif', '.webp', '.bmp', '.svg')
$people = New-Object Collections.Generic.HashSet[string]
foreach ($m in $messages) { [void]$people.Add($m.from); foreach ($r in $m.reactions) { foreach ($u in $r.users) { [void]$people.Add($u) } } }

$channel = $to.TrimStart('#')
$isChannel = $to.StartsWith('#')
$sb = New-Object Text.StringBuilder
[void]$sb.Append(@"
<div style="$font background:#ffffff; color:#1D1C1D; border:1px solid #DDDDDD; border-radius:8px; max-width:760px; margin:0 auto; box-sizing:border-box; overflow:hidden;">
  <div style="display:flex; align-items:center; justify-content:space-between; gap:12px; padding:16px 20px; border-bottom:1px solid #DDDDDD;">
    <div style="min-width:0;">
      <div style="font-size:18px; font-weight:900;">$(if ($isChannel) { '<span style="color:#616061; font-weight:700;">#</span> ' })$(ConvertTo-Html $channel)</div>
$(if ($header) { "      <div style=`"font-size:13px; color:#616061; margin-top:4px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;`" title=`"$(ConvertTo-Html $header)`">$(Convert-Shortcodes (ConvertTo-Html $header))</div>`n" })    </div>
    <div style="font-size:13px; color:#616061; white-space:nowrap;">$($people.Count) members</div>
  </div>
  <div style="padding:8px 20px 16px;">
"@)

$lastDay = $null; $lastFrom = $null
foreach ($m in $messages) {
    if ($m.day -ne $lastDay) {
        [void]$sb.Append(@"
    <div style="display:flex; align-items:center; margin:16px 0 8px;">
      <div style="flex:1; height:1px; background:#DDDDDD;"></div>
      <div style="font-size:13px; font-weight:700; border:1px solid #DDDDDD; border-radius:24px; padding:4px 14px; background:#ffffff;">$(ConvertTo-Html $m.day)</div>
      <div style="flex:1; height:1px; background:#DDDDDD;"></div>
    </div>

"@)
        $lastDay = $m.day; $lastFrom = $null
    }
    $grouped = ($m.from -eq $lastFrom)
    $lastFrom = $m.from
    $initial = if ($m.from) { ConvertTo-Html $m.from.Substring(0, 1).ToUpper() } else { '?' }

    if ($grouped) {
        [void]$sb.Append("    <div style=`"display:flex; gap:10px; padding:2px 0;`">`n      <div style=`"width:36px; flex-shrink:0; font-size:10px; color:#ABABAD; text-align:right; padding-top:4px;`">$(ConvertTo-Html $m.time)</div>`n      <div style=`"min-width:0; flex:1;`">`n")
    } else {
        [void]$sb.Append(@"
    <div style="display:flex; gap:10px; padding:8px 0 2px;">
      <div style="width:36px; height:36px; flex-shrink:0; border-radius:50%; background:$(Get-AvatarColor $m.from); color:#ffffff; font-weight:900; font-size:17px; display:flex; align-items:center; justify-content:center;">$initial</div>
      <div style="min-width:0; flex:1;">
        <div><span style="font-size:15px; font-weight:900;">$(ConvertTo-Html $m.from)</span> <span style="font-size:12px; color:#616061; margin-left:4px;">$(ConvertTo-Html $m.time)</span></div>

"@)
    }
    if ($m.html) { [void]$sb.Append("        <div style=`"font-size:15px; line-height:1.46; overflow-wrap:anywhere;`">$($m.html)</div>`n") }

    foreach ($f in $m.files) {
        $href = ConvertTo-Html (Get-FileHref $f)
        $ext = [IO.Path]::GetExtension($f).ToLower()
        if ($imageExt -contains $ext) {
            [void]$sb.Append("        <a href=`"$href`" style=`"display:block; margin-top:6px;`"><img src=`"$href`" alt=`"$(ConvertTo-Html $f)`" style=`"display:block; max-width:min(360px, 100%); max-height:360px; border-radius:8px; border:1px solid #DDDDDD;`"></a>`n")
        } else {
            $label = if ($ext) { ConvertTo-Html $ext.TrimStart('.').ToUpper() } else { 'FILE' }
            [void]$sb.Append(@"
        <a href="$href" style="display:flex; align-items:center; gap:10px; margin-top:6px; max-width:360px; padding:10px 12px; border:1px solid #DDDDDD; border-radius:8px; color:#1D1C1D; text-decoration:none;">
          <span style="width:36px; height:36px; flex-shrink:0; border-radius:6px; background:#1264A3; color:#ffffff; font-size:10px; font-weight:900; display:flex; align-items:center; justify-content:center;">$label</span>
          <span style="min-width:0;"><span style="display:block; font-size:15px; font-weight:700; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">$(ConvertTo-Html $f)</span><span style="display:block; font-size:12px; color:#616061;">$label file</span></span>
        </a>

"@)
        }
    }

    if ($m.reactions.Count -gt 0) {
        [void]$sb.Append("        <div style=`"display:flex; flex-wrap:wrap; gap:6px; margin-top:6px;`">`n")
        foreach ($r in $m.reactions) {
            $who = ConvertTo-Html (($r.users -join ', ') + " reacted with :$($r.emoji):")
            [void]$sb.Append("          <span title=`"$who`" style=`"display:inline-flex; align-items:center; gap:6px; padding:2px 10px; border:1px solid #DDDDDD; border-radius:14px; background:#F8F8F8; font-size:13px; line-height:20px;`"><span style=`"font-size:15px;`">$(Get-EmojiHtml $r.emoji)</span><span>$([Math]::Max(1, $r.users.Count))</span></span>`n")
        }
        [void]$sb.Append("        </div>`n")
    }
    [void]$sb.Append("      </div>`n    </div>`n")
}

$placeholder = if ($isChannel) { "Message #$channel" } else { "Message $channel" }
[void]$sb.Append(@"
  </div>
  <div style="padding:0 20px 20px;">
    <div style="border:1px solid #BBBBBB; border-radius:8px; padding:12px 14px; font-size:15px; color:#868686;">$(ConvertTo-Html $placeholder)</div>
  </div>
</div>
"@)

$outPath = Join-Path $OutDir ([IO.Path]::GetFileNameWithoutExtension($RtfPath) + '.html')
[IO.File]::WriteAllText($outPath, $sb.ToString(), [Text.Encoding]::ASCII)
Write-Output "HTML: $outPath  ($($messages.Count) messages, $($people.Count) members)"
