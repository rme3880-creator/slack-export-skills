# Random Number Generator

A browser-based random number generator. Enter a min and max, hit generate, and get a random whole number in that range along with a joke based on its last digit.

## Features

- Generates a random integer between a user-specified min and max (order-independent — min/max are swapped automatically if entered backwards)
- Pairs each result with a joke keyed to the result's last digit
- Rejects decimal input with a full-screen "siren" warning overlay, dismissible by clicking it
- Shows an inline error message for non-numeric input

## Tech stack

- HTML
- CSS
- Vanilla JavaScript (no dependencies)

## Installation / setup

No build step or dependencies required. Clone the repo and open `index.html` in a browser:

```bash
git clone https://github.com/mbtester321-boop/random-number-generator.git
cd random-number-generator
open index.html
```

## Usage

Enter whole numbers in the **Min** and **Max** fields and click **Generate** to get a random number in that range plus a joke. Decimal values trigger a warning overlay instead of a result.

## Project structure

- `index.html` — page markup: range inputs, generate button, output and siren overlay
- `style.css` — layout and styling, including the alarm/siren state
- `script.js` — input validation, random number generation, and joke selection logic
