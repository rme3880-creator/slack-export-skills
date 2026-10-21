# Magic 8 Ball

A single-page browser recreation of the classic Magic 8 Ball toy. Type a yes-or-no question, shake the ball, and get one of its 20 classic answers.

## Features

- Ask screen where you type your question before revealing the ball
- Click-to-shake animation on the ball
- 20 classic Magic 8 Ball responses, randomly selected
- Answer text auto-sizes to fit longer responses inside the ball's triangle window
- "Ask a New Question" flow to reset and start over

## Tech Stack

- HTML
- Vanilla JavaScript
- CSS

## Installation / Setup

No build step or dependencies required. Just clone and open the file:

```bash
git clone https://github.com/mbtester321-boop/magic-8-ball.git
cd magic-8-ball
open index.html
```

Or serve it locally with any static file server, e.g.:

```bash
npx serve .
```

## Usage

1. Open `index.html` in a browser.
2. Type a yes-or-no question and click **Ask the Ball** (or press Enter).
3. Click the ball to shake it and reveal an answer.
4. Click **Ask a New Question** to go back and ask something else.

## Project Structure

- `index.html` — page markup for the ask screen and ball screen
- `style.css` — styling for the ball, screens, and animations
- `script.js` — question handling, shake animation, and random answer selection
