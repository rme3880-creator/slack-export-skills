# Don't Touch The Walls

A single-page browser game where you guide your mouse cursor along a narrow glowing path from **START** to **FINISH** without touching the walls. One slip off the path and it's game over.

## Features

- Canvas-drawn maze path with a marked finish zone
- Real-time pixel-color collision detection — straying off the green path triggers an instant loss
- "Jumpscare" sound effect (via the Web Audio API) when you hit a wall
- Win/lose popups with a retry button to reset and play again
- Leaving the canvas area while playing also counts as touching a wall

## Tech Stack

- HTML5 Canvas
- Vanilla JavaScript
- CSS

## Installation / Setup

No build step or dependencies required. Just clone and open the file:

```bash
git clone https://github.com/mbtester321-boop/maze-game.git
cd maze-game
open index.html
```

Or serve it locally with any static file server, e.g.:

```bash
npx serve .
```

## Usage

1. Open `index.html` in a browser.
2. Click **START**.
3. Move your mouse along the glowing green path from the top-left starting point to the red **END** marker, without letting the cursor leave the path.
4. If you touch a wall, a popup appears — click **Try Again** to retry.
5. If you reach the finish, a win popup appears — click **Play Again** to replay.

## Project Structure

- `index.html` — page markup, popups, and canvas element
- `style.css` — styling for the page, canvas stage, and popups
- `script.js` — maze rendering, mouse tracking, collision detection, and game state logic
