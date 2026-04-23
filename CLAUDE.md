# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development

No build system. Open `index.html` directly in a browser, or serve locally:

```bash
python3 -m http.server 8000
```

Test the RSVP Google Forms submission endpoint (creates 3 real entries — delete them from the sheet after):

```bash
python3 test.py
```

## Architecture

Single-page HTML/CSS/JS wedding invitation for Wei & Yang (2026/05/20). No dependencies, no framework.

**Two scenes** toggled by JavaScript, not routing:
- **Envelope scene** (`#envelopeScene`) — landing page with a canvas-based "catch the bouquet" mini-game. Winning (or clicking Skip) calls `openEnv()`, which hides the envelope and reveals the card.
- **Card scene** (`#cardScene`) — invitation details and RSVP form.

**RSVP flow** (`main.js`): `doRSVP()` → `validateForm()` → `fetch()` POST to Google Forms with `mode: 'no-cors'` (response is opaque; success is assumed on `.then()`). Field IDs and the form URL are in the `FORM` constant at the top of `main.js`. The one-way submit guard `rsvpSubmitted` prevents duplicate submissions.

**Mini-game** (`main.js`): Canvas game loop via `requestAnimationFrame`. Player (pixel bride) moves left/right via keyboard (`←→` / `A D`) or touch (tap left/right half of canvas). `_gCleanup` removes all event listeners when the game ends.

**Illustration image**: Currently stored as a base64-encoded `data:` URI inline in `index.html` at the `<img class="illust-img">` tag inside `<!-- ILLUSTRATION -->`. To replace it, either re-encode the new image to base64 or switch to a relative `src` path pointing to the PNG file.

**Styling**: All in `style.css`. Uses CSS custom properties defined in `:root` for the pixel-art color palette (pink, sky, green, cream, dark). `image-rendering: pixelated` is set globally. Fonts: `Press Start 2P` (pixel headers), `DotGothic16` (section headers), `Noto Sans TC` (body/CJK text).
