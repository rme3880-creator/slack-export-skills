# Super Mass Gainer(tm) Raw Edition

A parody single-page "late 90s supplement website" built as an homage to early-web design clichés: marquees, table layouts, blinking text, a fake visitor counter, and over-the-top testimonials for a fictional "cupcake flavor" mass gainer supplement.

## Features

- Scrolling `<marquee>` banners at the top and bottom of the page
- Classic `<table>`-based three-column layout (sidebar / content / sidebar)
- Fake digital visitor counter that increments and persists via `localStorage`
- Looping countdown timer for a fake "limited time offer"
- Joke product testimonials, FAQ, and "contact the webmaster" sections
- Order button that cycles through a series of gag status messages on click
- "Best viewed in 800x600 Netscape Navigator 4.0" badge and other retro-web flourishes

## Tech Stack

- HTML (table-based layout, `<marquee>`)
- Vanilla JavaScript
- CSS

## Installation / Setup

No build step or dependencies required. Just clone and open the file:

```bash
git clone https://github.com/mbtester321-boop/super-mass-gainer.git
cd super-mass-gainer
open index.html
```

Or serve it locally with any static file server, e.g.:

```bash
npx serve .
```

## Usage

1. Open `index.html` in a browser.
2. Scroll through the joke product page — testimonials, FAQ, and order sections.
3. Click **ORDER NOW!!** to see the order button's gag status messages.
4. Watch the visitor counter and countdown timer update live.

## Project Structure

- `index.html` — full page markup (banner, sidebars, product/testimonial/FAQ/order/contact sections, footer)
- `style.css` — retro styling for the table layout, boxes, blinking/marquee effects, and badges
- `script.js` — visitor counter persistence, countdown timer, last-updated date, and order button gag
