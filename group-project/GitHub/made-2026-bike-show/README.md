# MADE 2026 — Handmade Bicycle Show

A static fan website for the (fictionalised) **MADE 2026** handmade bicycle
show in Portland, Oregon: a landing page plus ten linked pages profiling an
editors' "top 10 bikes of the show". Built as a web-design exercise with
plain HTML, one external stylesheet, one external script, and original
vector artwork — no frameworks, no build step.

## 🔗 View the live website

### **https://mbertinie.github.io/made-2026-bike-show/**

Hosted on GitHub Pages straight from the `main` branch. Start on the landing
page, then open any of the ten bikes; on a bike page you can also press the
**←** / **→** arrow keys to move through the list.

## Run it locally

Clone the repo, then either open `index.html` directly, or (recommended, so
the cross-page transitions behave exactly right) serve the folder:

```bash
git clone https://github.com/mbertinie/made-2026-bike-show.git
cd made-2026-bike-show
python3 -m http.server 8000
# then visit http://localhost:8000
```

## Structure

```
made-2026-bike-show/
├── index.html              landing page
├── bikes/
│   └── bike-01.html … bike-10.html    one page per bike
├── css/styles.css          single external stylesheet
├── js/main.js              single external script
├── images/                 original SVG artwork (see below)
└── README.md
```

## Features

- Sticky header, animated-underline nav, scroll-progress bar
- Full-bleed animated hero with parallax
- Reveal-on-scroll, animated stat counters, a builder-name marquee
- **Cross-page transition:** clicking through to a bike page plays a
  full-screen "MADE" wipe
- Bike pages: prev / next paging plus ← / → arrow-key navigation
- Fully responsive (hamburger menu under 860px)
- Respects `prefers-reduced-motion`

## About the images

Everything in `images/` is **original vector illustration** created for this
site — a side profile of each of the ten bikes, the Zidell Yards sunset hero
scene, the show floor, the bike valet, a lugged-joint detail, and the logo.
No photographs are used, so there are no licensing concerns.

To swap in real photos, drop `.jpg` / `.webp` files into `images/` and update
the matching `<img src="…">` in `index.html` and `bikes/*.html`.

## Colour theme

Defined as CSS custom properties at the top of `css/styles.css`:
orange `#d1611f`, browns `#4a3327` / `#2b1d15`, greys `#8f8a80` / `#e4ddce`,
black `#16130f`, on warm paper `#f2ece1`.

## Note

Unofficial, non-commercial fan project / web-design exercise. Builder names,
models, specs, prices and quotes are used editorially and are illustrative —
not official announcements from MADE or any manufacturer.
