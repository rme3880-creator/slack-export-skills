# Slack export skills

Part of a group project on connecting Claude Code to third-party services through official MCP servers. This repo covers **Slack**: downloading Slack conversations to local files with a repeatable Claude Code skill, and viewing them offline as Slack-style web pages.

All data comes from a test Slack workspace ("fiction") made for this assignment. All names and content are fictional.

## What's here

| Path | What it is |
|---|---|
| `dataExports/slack/` | 10 Slack conversations downloaded through the official Slack MCP server, one folder per conversation |
| `.claude/skills/slack-export-rtf/` | Skill: downloads a Slack conversation and saves it as `.rtf` plus all shared files |
| `.claude/skills/slack-rtf-to-html/` | Skill: turns an exported `.rtf` into a Slack-style `.html` page |
| `slackDownloadTemplate.rtf` | The storage format spec the export follows |
| `Group chat.png` | The visual reference for the HTML pages |

## Storage format

Each conversation folder in `dataExports/slack/<conversation>/` contains:

- `<conversation>.rtf`: the conversation, one line per field, following `slackDownloadTemplate.rtf`:
  - `<To>` and `<header>`: channel name and topic
  - `<day>`: date divider
  - `<From>`: sender, printed when the sender changes or a new day starts
  - `<Time>` and `<Content>`: each message, with these markers inside the content:
    - `ⓣ<<bold><italics><strikethrough>text>`: formatted text
    - `Ⓛ<[label]<url>>`: link
    - `ⓕ<file>>`: attached file
  - `<reactions>`: emoji and who reacted
- Every file shared in the conversation, under its original name (duplicates become `name (2).ext`)
- `<conversation>.html`: the same conversation rendered as a Slack-style page

## How to view a conversation

Open any `dataExports/slack/<conversation>/<conversation>.html` in a web browser. Keep the folder together so images and file links work.

## How to download new conversations

With the Slack MCP connected in Claude Code, ask: *"Export the Slack channel #name using the slack-export-rtf skill"*. To rebuild a page: *"Convert dataExports/slack/name/name.rtf to HTML with slack-rtf-to-html"*.

The scripts are Windows PowerShell 5.1 and need no other installs. No tokens, passwords or API keys are stored in this repo.
