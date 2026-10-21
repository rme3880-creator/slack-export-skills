---
name: slack-export-rtf
description: Export a Slack conversation (channel or DM) to a .rtf file in the slackDownloadTemplate.rtf format, and download every file shared in it into dataExports/slack/<conversation name>/ in the project. Use when the user asks to export, download, archive or save a Slack conversation/channel/DM.
---

# Slack conversation → RTF export

Output: `<project root>/dataExports/slack/<conversation name>/<conversation name>.rtf` plus every file shared in the conversation, in that same folder.

## Steps

1. **Find the conversation.** `slack_list_user_channels` with `types="public_channel,private_channel,im,mpim"`. If the user didn't name one, pick the conversation with real messages (ignore ones that only have join/invite notices) or ask.

2. **Read all messages.** `slack_read_channel` (limit 100, follow `cursor` until no more pages). Results are newest-first; reverse to oldest-first. For any message with replies, also `slack_read_thread` and insert the replies after their parent.

3. **Header text.** Use the channel topic, else its purpose (`slack_search_channels` with the channel name as keyword returns them). For a DM use `Direct message with <name>`.

4. **Reactions with names.** The channel read only gives counts. For every message that has `Reactions:`, call `slack_get_reactions(channel_id, message_ts)` to get who reacted.

5. **Files.** For every `Files: name (ID: F…)`, call `slack_read_file(file_id)`:
   - Image/binary files: the result line `[Image: source: <path>]` (or similar) is the full original file saved on disk. Use that path as `source`. Verify its size matches the reported size.
   - Text files (content is returned inline): Write the content verbatim to the scratchpad directory under the original file name, and use that path as `source`.
   - A message link that points directly at a downloadable file (e.g. ends in `.pdf`, `.zip`, `.png`) can go in `files` with `url` instead of `source`. Ordinary web page links stay links only.

6. **Write the JSON** (UTF-8) to the scratchpad. Messages go oldest first. Copy `text` exactly as Slack returned it (raw mrkdwn: `*bold*`, `_italic_`, `~strike~`, `<url|label>`, `<@U…|name>`); the script converts it. Use the `datetime` exactly as Slack shows it, without the tz suffix.
   ```json
   {
     "conversationName": "nouveau-canal",
     "to": "#nouveau-canal",
     "header": "…",
     "outputRoot": "<absolute project root>\\dataExports\\slack",
     "messages": [
       { "from": "r me", "datetime": "2026-10-20 18:42:54", "text": "hi",
         "reactions": [ { "emoji": "eyes", "users": ["MBTest"] } ],
         "files": [ { "name": "image.png", "source": "C:\\…\\blob.png" } ] }
     ]
   }
   ```

7. **Run the script** (PowerShell 5.1, no other dependencies):
   ```
   powershell -NoProfile -ExecutionPolicy Bypass -File ".claude/skills/slack-export-rtf/export-slack.ps1" -JsonPath "<json path>"
   ```
   It creates the folder, copies/downloads the files (renaming duplicates such as `image (2).png`), and writes the RTF. Report the folder path and file list to the user.

## Format the script produces (from slackDownloadTemplate.rtf)

```
<To><#channel>//
<header><header text>//
<day><Tuesday, October 20th>//          (suffix in superscript, emitted on each new day)
<From><sender>//                         (only when the sender changes, or on a new day)
<Time><6:42PM>//
<Content
regular text ⓣ<<bold><italics>formatted> Ⓛ<[label]<https://url>> Ⓛ<https://url> ⓕ<file.png>>
>//
<reactions><<:eyes:><From><name><:grin:><From><name>>//   (only when there are reactions)
```
Tag order inside ⓣ is `<strikethrough><bold><italics>`. A formatted link is `ⓣ<<bold>Ⓛ<[label]<url>>>`.
