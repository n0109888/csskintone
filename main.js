// CSSkinTone — base game.
// A ToonTone-style HSB picker: drag the three vertical bars (Hue / Saturation /
// Brightness) to recolor a target element and match its real color.

// Each round = one image. Add more here; the layout/box stays the same.
//   title    : ["left", "right"] shown as  left | right
//   keyWhite : drop a near-white background to transparent on load
//   region   : fraction-of-frame box the guessed element lives in (x0,x1,y0,y1)
//   hueRanges: which hues count as the guessed element (handles 0/360 wrap)
//   minS     : saturation floor (raise it to exclude muted colors like skin)
const FULL = { x0: 0, x1: 1, y0: 0, y1: 1 };
const RED = [[0, 22], [338, 360]];
const IMAGES = [
  {
    title: ["ohnePixel", "ACDC"],
    src: "ohneacdc.webp",
    keyWhite: true,
    region: { x0: 0.26, x1: 0.68, y0: 0.66, y1: 1.0 },
    hueRanges: RED,
    minS: 0.2,
  },
  {
    title: ["Anomaly", "YouTube PFP"],
    src: "anomaly.png",
    keyWhite: false,
    region: FULL,
    hueRanges: RED,
    minS: 0.2,
  },
  {
    title: ["Reason", "Paper"],
    src: "reason.png",
    keyWhite: false,
    region: FULL,
    hueRanges: [[0, 22], [345, 360]], // red/orange square
    minS: 0.3,
  },
  {
    title: ["Sparkles", "YouTube PFP"],
    src: "sparkles.png",
    keyWhite: false,
    region: FULL,
    hueRanges: [[34, 62]], // yellow circle (skin is too low-sat to match)
    minS: 0.45,
  },
  {
    title: ["LDLC", "Paper"],
    src: "ldlc.png",
    keyWhite: false,
    region: FULL,
    hueRanges: [[210, 262]], // dark/royal blue, NOT the cyan (~190°)
    minS: 0.35,
  },
  {
    title: ["mousesports", "Paper"],
    src: "mouse.png",
    keyWhite: false,
    region: FULL,
    hueRanges: [[325, 360], [0, 10]], // red/crimson mouse
    minS: 0.4,
  },
  {
    title: ["NIP", "Paper"],
    src: "nip.png",
    keyWhite: false,
    region: FULL,
    hueRanges: [[26, 52]], // tan/gold blades, NOT the dark brown sphere (~9°)
    minS: 0.12, // the tan is quite desaturated
    minV: 0.4,
  },
  {
    title: ["Vox", "Paper"],
    src: "vox.png",
    keyWhite: false,
    region: FULL,
    hueRanges: [[38, 58]], // yellow
    minS: 0.4,
  },
  {
    title: ["M9 Bayonet", "Emerald"],
    src: "m9.png",
    keyWhite: false,
    region: FULL,
    hueRanges: [[120, 170]], // emerald green blade (wood handle is ~29°)
    minS: 0.2,
    minV: 0.15,
  },
  {
    title: ["Crown", "Foil"],
    src: "crown.png",
    keyWhite: false,
    region: FULL,
    hueRanges: [[38, 66]], // gold/yellow crown
    minS: 0.3,
  },
  {
    title: ["MAC-10", "Heat"],
    src: "heat.png",
    keyWhite: false,
    region: FULL,
    hueRanges: [[12, 58]], // orange/yellow heat glow (gray body excluded by minS)
    minS: 0.5,
    minV: 0.4,
  },
  {
    title: ["M4A1-S", "Hot Rod"],
    src: "hotrod.png",
    keyWhite: false,
    region: FULL,
    hueRanges: RED, // bright red body (tan mag is too low-sat to match)
    minS: 0.45,
  },
  {
    title: ["AK-47", "Blue Laminate"],
    src: "bluelam.png",
    keyWhite: false,
    region: FULL,
    hueRanges: [[200, 250]], // blue laminate wood (brown grain excluded)
    minS: 0.4,
  },
  {
    title: ["Sport Gloves", "Vice"],
    src: "vice.png",
    keyWhite: false,
    region: FULL,
    hueRanges: [[300, 345]], // pink/magenta (NOT the teal accents ~185°)
    minS: 0.3,
  },
  {
    title: ["Five-SeveN", "Kami 909"],
    src: "kami.png",
    keyWhite: false,
    region: FULL,
    hueRanges: [[22, 62]], // cream/tan manga slide — very desaturated, so a low
    minS: 0.04,            // saturation floor is needed to catch the near-white
    minV: 0.5,            // paper; minV still drops the dark olive grip + lines
  },
  {
    title: ["AWP", "Gungnir"],
    src: "gungnir.webp",
    keyColor: [30, 41, 56], // navy backdrop (shares blue's hue, so must be keyed)
    region: FULL,
    hueRanges: [[185, 240]], // cyan/blue body (cream carved barrel is desaturated)
    minS: 0.3,
    minV: 0.3,
  },
  {
    title: ["AWP", "Longdog"],
    src: "longdog.webp",
    keyColor: [30, 41, 56],
    region: FULL,
    hueRanges: RED, // red accents on the white fur body
    minS: 0.4,
  },
  {
    title: ["AWP", "BOOM"],
    src: "boom.webp",
    keyColor: [30, 41, 56],
    region: FULL,
    hueRanges: [[6, 32]], // orange comic body
    minS: 0.4,
  },
  {
    title: ["AWP", "Containment Breach"],
    src: "contain.webp",
    keyColor: [30, 41, 56],
    region: FULL,
    hueRanges: [[58, 98]], // toxic lime/yellow-green
    minS: 0.4,
    minV: 0.25,
  },
  {
    title: ["AWP", "Asiimov"],
    src: "asiimov.webp",
    keyColor: [30, 41, 56],
    region: FULL,
    hueRanges: [[8, 34]], // orange accents on white/black
    minS: 0.45,
  },
];

const els = {
  canvas: document.getElementById("skin"),
  canvasOrig: document.getElementById("skin-original"),
  origFig: document.getElementById("orig-fig"),
  capGuess: document.getElementById("cap-guess"),
  title: document.getElementById("skin-title"),
  loading: document.getElementById("loading"),
  barHue: document.getElementById("bar-hue"),
  barSat: document.getElementById("bar-sat"),
  barVal: document.getElementById("bar-val"),
  hHue: document.getElementById("h-hue"),
  hSat: document.getElementById("h-sat"),
  hVal: document.getElementById("h-val"),
  preview: document.getElementById("preview"),
  picker: document.getElementById("picker"),
  check: document.getElementById("check"),
  result: document.getElementById("result"),
  rcTop: document.getElementById("rc-top"),
  rcScore: document.getElementById("rc-score"),
  rcMsg: document.getElementById("rc-msg"),
  rcBottom: document.getElementById("rc-bottom"),
  next: document.getElementById("next"),
  board: document.getElementById("board"),
  summary: document.getElementById("summary"),
  sumAvg: document.getElementById("sum-avg"),
  sumList: document.getElementById("sum-list"),
  playAgain: document.getElementById("play-again"),
};

const ctx = els.canvas.getContext("2d", { willReadFrequently: true });
const ctxOrig = els.canvasOrig.getContext("2d");

let currentIndex = 0;       // which image (IMAGES index) we're on
let playlist = [];          // shuffled image indices for this run
let pos = 0;                // position within the playlist
let results = [];           // one per guessed image: { title, css, score }

// Fisher–Yates shuffle of [0..n-1].
function shuffledOrder(n) {
  const a = Array.from({ length: n }, (_, i) => i);
  for (let i = n - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

let baseImage = null;       // ImageData of the original photo
let workImage = null;       // working copy we paint the recolor into
let logoIdx = null;         // Int32Array of byte offsets of logo pixels
let logoH = null;           // per-pixel original hue
let logoS = null;           // per-pixel original saturation
let logoV = null;           // per-pixel original value (brightness)
let originalColor = null;   // { h, s, v } sampled from the logo — the answer
let target = null;          // { h, s, v } to match
let guess = { h: 200, s: 0.6, v: 0.7 }; // current selection (s,v in 0..1)

const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));

// ---------- HSV <-> RGB ----------
function hsvToRgb(h, s, v) {
  const c = v * s;
  const hp = (h % 360) / 60;
  const x = c * (1 - Math.abs((hp % 2) - 1));
  let r = 0, g = 0, b = 0;
  if (hp < 1) { r = c; g = x; }
  else if (hp < 2) { r = x; g = c; }
  else if (hp < 3) { g = c; b = x; }
  else if (hp < 4) { g = x; b = c; }
  else if (hp < 5) { r = x; b = c; }
  else { r = c; b = x; }
  const m = v - c;
  return [
    Math.round((r + m) * 255),
    Math.round((g + m) * 255),
    Math.round((b + m) * 255),
  ];
}

function rgbToHsv(r, g, b) {
  r /= 255; g /= 255; b /= 255;
  const mx = Math.max(r, g, b), mn = Math.min(r, g, b), d = mx - mn;
  let h = 0;
  if (d) {
    if (mx === r) h = ((g - b) / d) % 6;
    else if (mx === g) h = (b - r) / d + 2;
    else h = (r - g) / d + 4;
    h *= 60;
    if (h < 0) h += 360;
  }
  const s = mx === 0 ? 0 : d / mx;
  return [h, s, mx];
}

const rgbCss = (rgb) => `rgb(${rgb[0]},${rgb[1]},${rgb[2]})`;
const formatHSB = (c) =>
  `H${Math.round(c.h)} S${Math.round(c.s * 100)} B${Math.round(c.v * 100)}`;
// Pick readable text (dark or white) for a given background color.
const textOn = (rgb) =>
  0.299 * rgb[0] + 0.587 * rgb[1] + 0.114 * rgb[2] > 150 ? "#15151f" : "#ffffff";

// Make a near-white background transparent (no white box behind the subject).
function keyOutWhite() {
  const img = ctx.getImageData(0, 0, els.canvas.width, els.canvas.height);
  const d = img.data;
  for (let i = 0; i < d.length; i += 4) {
    if (d[i] > 240 && d[i + 1] > 240 && d[i + 2] > 240) d[i + 3] = 0;
  }
  ctx.putImageData(img, 0, 0);
}

// Drop a solid-color background (e.g. the navy backdrop some renders ship with)
// to transparent. Keys every pixel within `tol` Euclidean distance of `color`,
// so the backdrop doesn't show as a box and can't be mistaken for skin pixels.
function keyOutColor([kr, kg, kb], tol) {
  const img = ctx.getImageData(0, 0, els.canvas.width, els.canvas.height);
  const d = img.data;
  const t2 = tol * tol;
  for (let i = 0; i < d.length; i += 4) {
    const dr = d[i] - kr, dg = d[i + 1] - kg, db = d[i + 2] - kb;
    if (dr * dr + dg * dg + db * db <= t2) d[i + 3] = 0;
  }
  ctx.putImageData(img, 0, 0);
}

const hueInRanges = (h, ranges) => ranges.some(([lo, hi]) => h >= lo && h <= hi);

// ---------- recolor core ----------
// Pick the target-colored pixels (hue in the image's ranges, restricted to its
// region box), remember their HSV, and sample the mean — that color is the
// answer the player must reproduce.
function indexLogoPixels(data, w, h, cfg) {
  const { region, hueRanges } = cfg;
  const minS = cfg.minS ?? 0.2;
  const minV = cfg.minV ?? 0.2;
  const idx = [];
  const baseH = [], baseS = [], baseV = [];
  // hue wraps at 0/360, so accumulate it in signed form (-180..180].
  let sumHsigned = 0, sumS = 0, sumV = 0;
  const x0 = region.x0 * w, x1 = region.x1 * w;
  const y0 = region.y0 * h, y1 = region.y1 * h;
  for (let p = 0; p < w * h; p++) {
    const x = p % w;
    const y = (p - x) / w;
    if (x < x0 || x > x1 || y < y0 || y > y1) continue;
    const i = p * 4;
    if (data[i + 3] < 20) continue;
    const [hh, s, v] = rgbToHsv(data[i], data[i + 1], data[i + 2]);
    // Capture the whole element — solid color plus lighter/darker shading —
    // so it recolors as one clean shape. Outlines and desaturated/black areas
    // are excluded by the saturation/brightness floors.
    const isTarget = hueInRanges(hh, hueRanges) && s >= minS && v >= minV;
    if (isTarget) {
      idx.push(i);
      baseH.push(hh); baseS.push(s); baseV.push(v);
      sumHsigned += hh > 180 ? hh - 360 : hh;
      sumS += s; sumV += v;
    }
  }
  logoIdx = Int32Array.from(idx);
  logoH = Float32Array.from(baseH);
  logoS = Float32Array.from(baseS);
  logoV = Float32Array.from(baseV);
  const n = idx.length || 1;
  let mh = sumHsigned / n;
  if (mh < 0) mh += 360;
  originalColor = { h: mh, s: sumS / n, v: sumV / n };
}

// Recolor by SHIFTING each logo pixel from the sampled red toward the chosen
// tone (offset in hue/sat/brightness). Every pixel keeps its real texture, and
// when the chosen tone equals the original red the shift is zero — so the logo
// looks exactly like the original.
function renderWithTone(t) {
  const data = workImage.data;
  const dh = t.h - originalColor.h;
  const ds = t.s - originalColor.s;
  const dv = t.v - originalColor.v;
  for (let k = 0; k < logoIdx.length; k++) {
    const i = logoIdx[k];
    let nh = logoH[k] + dh;
    nh = ((nh % 360) + 360) % 360;
    const ns = clamp(logoS[k] + ds, 0, 1);
    const nv = clamp(logoV[k] + dv, 0, 1);
    const [r, g, b] = hsvToRgb(nh, ns, nv);
    data[i] = r;
    data[i + 1] = g;
    data[i + 2] = b;
  }
  ctx.putImageData(workImage, 0, 0);
}

let rafPending = false;
function scheduleRecolor(t) {
  if (!logoIdx || rafPending) return;
  rafPending = true;
  requestAnimationFrame(() => {
    rafPending = false;
    renderWithTone(t);
  });
}

// ---------- picker UI ----------
function paintPickerUI() {
  const { h, s, v } = guess;
  // handle positions (top = 0 for hue, top = max for sat/val)
  els.hHue.style.top = `${(h / 360) * 100}%`;
  els.hSat.style.top = `${(1 - s) * 100}%`;
  els.hVal.style.top = `${(1 - v) * 100}%`;
  // sat & val bar gradients reflect the current selection
  els.barSat.style.background =
    `linear-gradient(to bottom, ${rgbCss(hsvToRgb(h, 1, v))}, ${rgbCss(hsvToRgb(h, 0, v))})`;
  els.barVal.style.background =
    `linear-gradient(to bottom, ${rgbCss(hsvToRgb(h, s, 1))}, ${rgbCss(hsvToRgb(h, s, 0))})`;
  els.preview.style.background = rgbCss(hsvToRgb(h, s, v));
  scheduleRecolor(guess);
}

function pctFromPointer(bar, clientY) {
  const r = bar.getBoundingClientRect();
  return clamp((clientY - r.top) / r.height, 0, 1);
}

let dragBar = null;
function applyDrag(clientY) {
  const pct = pctFromPointer(dragBar.el, clientY);
  if (dragBar.kind === "h") guess.h = pct * 360;
  else if (dragBar.kind === "s") guess.s = 1 - pct;
  else guess.v = 1 - pct;
  paintPickerUI();
}

function startDrag(kind, el) {
  return (e) => {
    e.preventDefault();
    dragBar = { kind, el };
    applyDrag(e.clientY);
  };
}

// ---------- game flow ----------
function randomStartTone(targetH) {
  // Vivid starting tone 90–270° away from the answer, so the element always
  // begins a visibly "wrong" color whatever the target hue is.
  const h = (targetH + 90 + Math.random() * 180) % 360;
  return { h, s: 0.5 + Math.random() * 0.4, v: 0.45 + Math.random() * 0.4 };
}

// Score out of 10. Hue is the dominant factor: if the shade is plainly the
// wrong color (e.g. green vs red) the score collapses, no matter how close the
// saturation/brightness are. Saturation and brightness then fine-tune it.
function scoreGuess(g, t) {
  let dh = Math.abs(g.h - t.h) % 360;
  if (dh > 180) dh = 360 - dh;          // circular hue distance, 0..180
  const hueDist = dh / 180;             // 0..1
  const satDist = Math.abs(g.s - t.s);  // 0..1
  const valDist = Math.abs(g.v - t.v);  // 0..1

  // Steep falloff on hue — being a different color tanks the score.
  const hueFactor = Math.pow(1 - hueDist, 1.6);
  const shadeFactor = (1 - 0.8 * satDist) * (1 - 0.7 * valDist);
  return clamp(10 * hueFactor * shadeFactor, 0, 10);
}

function scoreMessage(s) {
  if (s >= 9) return "Perfect!";
  if (s >= 7.5) return "So close!";
  if (s >= 5) return "Getting warm";
  if (s >= 3) return "Not the right color";
  return "Way off";
}

function startRound() {
  target = originalColor;
  guess = randomStartTone(originalColor.h);
  paintPickerUI();
  els.result.hidden = true;
  els.picker.hidden = false;
  els.origFig.hidden = true;
  els.capGuess.hidden = true;
}

function lockIn() {
  const s = scoreGuess(guess, target);

  const guessRgb = hsvToRgb(guess.h, guess.s, guess.v);
  const origRgb = hsvToRgb(target.h, target.s, target.v);

  // Record this image's result for the end-of-run summary.
  results[currentIndex] = {
    title: IMAGES[currentIndex].title,
    css: rgbCss(guessRgb),
    score: s,
  };

  els.rcScore.textContent = s.toFixed(2);
  els.rcMsg.textContent = scoreMessage(s);

  // Each half is filled with its own color, text flips for readability.
  els.rcTop.style.background = rgbCss(guessRgb);
  els.rcTop.style.color = textOn(guessRgb);
  els.rcBottom.style.background = rgbCss(origRgb);
  els.rcBottom.style.color = textOn(origRgb);

  // Reveal the real photo (true color) beneath the player's guessed recolor.
  // baseImage is the untouched original, so zero shift = the correct answer.
  els.canvasOrig.width = baseImage.width;
  els.canvasOrig.height = baseImage.height;
  ctxOrig.putImageData(baseImage, 0, 0);
  els.capGuess.hidden = false;
  els.origFig.hidden = false;

  els.picker.hidden = true;
  els.result.hidden = false;
}

// Next advances through the shuffled playlist, or shows the summary at the end.
function nextRound() {
  pos += 1;
  if (pos >= playlist.length) showSummary();
  else loadAndStart(playlist[pos]);
}

function showSummary() {
  const done = results.filter(Boolean);
  const avg = done.reduce((a, r) => a + r.score, 0) / done.length;
  els.sumAvg.textContent = avg.toFixed(2);
  els.sumList.innerHTML = done
    .map(
      (r) => `<li>
        <span class="sl-sw" style="background:${r.css}"></span>
        <span class="sl-name">${r.title[0]} <small>| ${r.title[1]}</small></span>
        <span class="sl-score">${r.score.toFixed(2)}</span>
      </li>`
    )
    .join("");
  els.title.textContent = "RESULTS";
  els.board.hidden = true;
  els.summary.hidden = false;
}

// Start a fresh run: new shuffle, nothing guessed yet.
function startRun() {
  results = [];
  playlist = shuffledOrder(IMAGES.length);
  pos = 0;
  els.summary.hidden = true;
  els.board.hidden = false;
  loadAndStart(playlist[0]);
}

// ---------- bootstrap ----------
function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`could not load ${src}`));
    img.src = src;
  });
}

function setTitle([a, b]) {
  els.title.innerHTML = `${a} <span class="sep">|</span> ${b}`;
}

let loadToken = 0;
async function loadAndStart(index) {
  const myToken = ++loadToken;
  currentIndex = index;
  const cfg = IMAGES[index];
  setTitle(cfg.title);
  els.loading.style.display = "";
  els.loading.textContent = "loading…";

  let img;
  try {
    img = await loadImage(cfg.src);
  } catch {
    els.loading.textContent = `couldn't load ${cfg.src}`;
    return;
  }
  if (myToken !== loadToken) return; // a newer load superseded this one

  els.canvas.width = img.naturalWidth;
  els.canvas.height = img.naturalHeight;
  ctx.clearRect(0, 0, els.canvas.width, els.canvas.height);
  ctx.drawImage(img, 0, 0);
  if (cfg.keyWhite) keyOutWhite();
  if (cfg.keyColor) keyOutColor(cfg.keyColor, cfg.keyTol ?? 26);

  baseImage = ctx.getImageData(0, 0, els.canvas.width, els.canvas.height);
  workImage = new ImageData(
    new Uint8ClampedArray(baseImage.data),
    baseImage.width,
    baseImage.height
  );
  indexLogoPixels(baseImage.data, els.canvas.width, els.canvas.height, cfg);

  els.loading.style.display = "none";
  startRound();
}

function wireEvents() {
  els.barHue.addEventListener("pointerdown", startDrag("h", els.barHue));
  els.barSat.addEventListener("pointerdown", startDrag("s", els.barSat));
  els.barVal.addEventListener("pointerdown", startDrag("v", els.barVal));
  window.addEventListener("pointermove", (e) => { if (dragBar) applyDrag(e.clientY); });
  window.addEventListener("pointerup", () => { dragBar = null; });

  els.check.addEventListener("click", lockIn);
  els.next.addEventListener("click", nextRound);
  els.playAgain.addEventListener("click", startRun);
}

function init() {
  wireEvents();
  paintPickerUI();
  startRun(); // shuffles; reload always starts a fresh random run
}

init();
