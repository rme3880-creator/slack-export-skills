# Coin Toss

A simple browser-based coin flip app. Click a button to flip an animated 3D coin and see whether it lands on heads or tails.

## Features

- Animated 3D coin flip with a bounce and spin effect
- Random heads/tails result on each flip
- Button disables during the flip animation to prevent overlapping flips
- Clean, responsive single-screen layout with a dark gradient background

## Tech stack

- HTML
- CSS (3D transforms, keyframe animation)
- Vanilla JavaScript (no dependencies)

## Installation / setup

No build step or dependencies required. Clone the repo and open `index.html` in a browser:

```bash
git clone https://github.com/mbtester321-boop/coin-toss.git
cd coin-toss
open index.html
```

## Usage

Click the **Flip Coin** button. The coin spins for about a second and settles on "Heads!" or "Tails!".

## Project structure

- `index.html` — page markup and coin structure
- `style.css` — coin styling, 3D flip animation, layout and button styles
- `script.js` — flip logic: randomizes the result and drives the animation
