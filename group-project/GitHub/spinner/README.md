# Spinner (Prize Wheel)

A browser-based prize wheel. Add your own options, spin the wheel, and get a random winner.

## Features

- Add and remove custom options, each assigned a distinct color
- Canvas-drawn wheel that updates live as options are added or removed
- Spin button disabled until at least 2 options are added
- Animated spin with random extra rotations and landing jitter so results feel natural
- Winner banner announcing the selected option after the spin finishes

## Tech stack

- HTML
- CSS
- Vanilla JavaScript with the Canvas API (no dependencies)

## Installation / setup

No build step or dependencies required. Clone the repo and open `index.html` in a browser:

```bash
git clone https://github.com/mbtester321-boop/spinner.git
cd spinner
open index.html
```

## Usage

Type an option and click **Add** (or press Enter) to add it to the wheel. Once at least 2 options are added, click **Spin** to spin the wheel and reveal a winner.

## Project structure

- `index.html` — page markup: option input/list, wheel canvas, spin button and winner banner
- `style.css` — layout and visual styling for the wheel, list, and winner banner
- `script.js` — wheel rendering, option management, and spin/winner logic
