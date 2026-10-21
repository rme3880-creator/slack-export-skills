# Paperclip Counter

A simple drag-and-drop browser toy: drag paperclips one at a time from a scattered pile into a bag, and watch the counter go up.

## Features

- A pile of 25 randomly scattered, randomly rotated paperclips
- Native HTML5 drag-and-drop from the pile into the bag
- Live counter of how many paperclips have been bagged
- Mini paperclip icons accumulate inside the bag as you drop more in
- **Reset** button to respawn a fresh pile and clear the bag

## Tech Stack

- HTML
- Vanilla JavaScript (HTML5 Drag and Drop API)
- CSS

## Installation / Setup

No build step or dependencies required. Just clone and open the file:

```bash
git clone https://github.com/mbtester321-boop/paperclip-counter.git
cd paperclip-counter
open index.html
```

Or serve it locally with any static file server, e.g.:

```bash
npx serve .
```

## Usage

1. Open `index.html` in a browser.
2. Drag a paperclip from **The Pile** and drop it onto **The Bag**.
3. Watch the "Paperclips in bag" counter increase with each drop.
4. Click **Reset** to clear the bag and spawn a new pile.

## Project Structure

- `index.html` — page markup for the pile, bag, and toolbar
- `style.css` — styling for the pile, bag, paperclip pieces, and drag states
- `script.js` — pile spawning, drag-and-drop handling, and counter logic
