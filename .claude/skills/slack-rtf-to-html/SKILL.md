---
name: slack-rtf-to-html
description: Convert a Slack conversation .rtf exported by slack-export-rtf (slackDownloadTemplate.rtf format) into an .html file made of a single inline-styled <div> that looks like a Slack group chat (Group chat.png). Use when the user asks to turn an exported Slack .rtf into HTML, render/view/unpack a Slack export, or make it look like the Slack chat.
---

# Slack export .rtf → group-chat HTML

Reverses `slack-export-rtf`: reads the template markup in the .rtf and renders it as Slack-style HTML.

## Run

```
powershell -NoProfile -ExecutionPolicy Bypass -File "<repo>/.claude/skills/slack-rtf-to-html/rtf-to-html.ps1" -RtfPath "<file>.rtf" [-OutDir "<dir>"]
```

- `-OutDir` defaults to the current working directory. Output is `<rtf name>.html`.
- Shared files (ⓕ) are linked by path relative to the HTML, resolved against the .rtf's folder, so keep the export folder together. Images render inline. Other files render as file cards.
- To convert every export in a folder, run the command once per `*.rtf`.
- Then confirm the result. Report the output path and the message/member counts the script prints.

## What it reads (slackDownloadTemplate.rtf)

| Line | Rendered as |
|---|---|
| `<To><#name>//` | channel title `# name` + composer placeholder "Message #name" |
| `<header><text>//` | grey subtitle under the title |
| `<day><Tuesday, October 20th>//` | centered date pill divider |
| `<From><name>//` | avatar (initial, colored by name) + bold name. Later messages without a new `<From>` are grouped under it |
| `<Time><6:42PM>//` | grey timestamp next to the name (or in the gutter for grouped messages) |
| `<Content … >//` | message body: `ⓣ<<bold><italics><strikethrough>text>` → b/i/s, `Ⓛ<[label]<url>>` / `Ⓛ<url>` → link, `ⓕ<file>>` → attachment |
| `<reactions><<:eyes:><From><a><From><b>>//` | reaction chips with emoji + count. Hover title lists who reacted |

Member count = everyone who sent or reacted. Emoji shortcodes not in the script's map are shown as `:name:`.

The output is a single root `<div>` with inline styles only, no `<html>`, `<head>` or `<style>`. It is ASCII with HTML entities, so it can be pasted into any page.
