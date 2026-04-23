# 暘 & 庭瑋 の 婚約締結之日

Pixel art / retro RPG-styled wedding registration invitation for Wei & Yang (2026/05/20).

## Files

- `index.html` — HTML structure (includes inline SVG envelope illustration)
- `style.css` — all styles
- `main.js` — envelope open animation + RSVP form submission
- `test.py` — test script for the Google Forms submission endpoint

## Development

Open `index.html` directly in a browser, or serve locally:

```bash
python3 -m http.server 8000
```

## RSVP

Guest responses are submitted silently to Google Forms via a background POST (`formResponse` endpoint). No redirect — guests stay on the page and see the success screen immediately.

To test the submission endpoint:

```bash
python3 test.py
```

This creates 3 test entries — delete them from the Google Forms responses sheet afterwards.
