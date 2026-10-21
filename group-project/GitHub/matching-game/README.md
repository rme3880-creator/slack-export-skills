# Massimo's Great Matching Game

A memory-matching card game themed around 18 (mostly tongue-in-cheek) reasons Massimo should get an A. Flip tiles, find every matching pair, and collect each reason along the way.

## Features

- 36-tile board (18 matching pairs) shuffled into a new layout each game
- Click-to-flip tiles with a classic memory-match lock while two cards are being compared
- Mismatched pairs auto-flip back after a short delay
- Running match counter and a running list of "reasons found so far"
- Win banner once all 18 pairs are matched, with a **New Game** button to reshuffle and replay

## Tech Stack

- HTML
- Vanilla JavaScript
- CSS

## Installation / Setup

No build step or dependencies required. Just clone and open the file:

```bash
git clone https://github.com/mbtester321-boop/matching-game.git
cd matching-game
open index.html
```

Or serve it locally with any static file server, e.g.:

```bash
npx serve .
```

## Usage

1. Open `index.html` in a browser.
2. Click tiles two at a time to try to find matching pairs.
3. Matched pairs stay face up and their reason is added to the "Reasons I've found so far" list.
4. Click **New Game** at any time to reshuffle and start over.
5. Match all 18 pairs to trigger the win banner.

## Project Structure

- `index.html` — page markup for the board, toolbar, collected list, and win banner
- `style.css` — styling for the board, tiles, flip animation, and banner
- `script.js` — deck building/shuffling, tile flip logic, match detection, and win condition
