# csskintone

A color-guessing game in the spirit of [toontone.app](https://toontone.app/) and
flagtone. You're shown an image where one element has been recolored to a random
tone, and you reproduce the element's **original** color with an HSB picker.

Images live in the `IMAGES` array in `main.js`; **Next** cycles through them. The
guessed element is the **red** part of each image (the AC/DC logo, the Anomaly
shy-guy, …).

## Run

No build step or dependencies — it's static HTML/CSS/JS. From the project folder:

```bash
npm run dev          # serves on http://localhost:5173 (no-cache dev server)
```

Then open http://localhost:5173.

> It must be served over `http://` (not opened as a `file://` path), because the
> recolor reads pixels off a `<canvas>`, which the browser blocks for local files.
> If you ever see a stale build in dev, hard-reload (Cmd+Shift+R).

## How it works

Only the target element changes color — the rest of the photo is left alone.

`main.js` draws the image to a canvas, then:

1. **`indexLogoPixels`** flags the pixels belonging to the AC/DC logo by red hue +
   a region box (`LOGO`), so skin, lips, and background are excluded. It also
   samples the logo's mean red — that red is the answer.
2. **`renderWithTone`** recolors those pixels by *shifting* each one's hue /
   saturation / brightness by the offset between your selection and the sampled
   red. Every pixel keeps its real texture, and when you pick the exact original
   red the shift is zero — so the logo looks identical to the original photo.

The picker is a ToonTone-style trio of vertical **Hue / Saturation / Brightness**
bars with a live preview; the result card scores your guess out of 10.

## Adding / editing images

Add an entry to the `IMAGES` array in `main.js`:

```js
{
  title: ["Anomaly", "YouTube PFP"], // shown as  left | right
  src: "anomaly.png",
  keyWhite: false,                   // true → drop a near-white background
  region: { x0: 0, x1: 1, y0: 0, y1: 1 }, // fraction box the red part lives in
}
```

- **Box stays fixed.** Images are letterboxed into a 4:3 box (`.canvas-wrap`),
  so any aspect ratio fits without changing the layout.
- **`keyWhite`** removes a white background at load time (used for the ohnePixel
  photo) so the subject sits on the dark panel.
- **`region`** limits red detection to where the target is, so unrelated red
  (skin, lips) is ignored. Use the full frame `{0,1,0,1}` when the red is unique.
- The red hue gate lives in `indexLogoPixels` if you ever target a non-red color.

## Files

- `index.html` — markup
- `styles.css` — dark styling, HSB picker + result card
- `main.js` — game loop, picker, canvas recolor, image list
- `ohneacdc.webp`, `anomaly.png` — the images
- `server.py` — no-cache static dev server
