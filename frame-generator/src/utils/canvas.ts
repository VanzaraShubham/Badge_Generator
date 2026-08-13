import { FrameData } from '../components/UploadArea';

/* ─────────────────────────────────────────────────────────────────
   HELPERS
───────────────────────────────────────────────────────────────── */
function loadImg(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload  = () => resolve(img);
    img.onerror = () => reject(new Error(`Failed to load: ${src}`));
    img.src = src;
  });
}

function fitText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number, y: number,
  maxW: number,
  basePx: number,
  font: string,
  weight = 'bold'
) {
  let s = basePx;
  ctx.font = `${weight} ${s}px ${font}`;
  while (ctx.measureText(text).width > maxW && s > 7) {
    s -= 1;
    ctx.font = `${weight} ${s}px ${font}`;
  }
  ctx.fillText(text, x, y);
}

/* ─────────────────────────────────────────────────────────────────
   EXACT PIXEL COORDINATE MAP (1024x1024 Template)
   Calculated by scanning the template image.
───────────────────────────────────────────────────────────────── */
const MAP = {
  oval: {
    cxR: 0.500,  // X=512
    cyR: 0.464,  // Y=475
    rxR: 0.127,  // Radius X=130
    ryR: 0.161,  // Radius Y=165
  },
  nameBar: {
    // Green binary pattern bar (top, "111" pattern)
    xR:  0.500,  // Center X
    yR:  0.712,  // Y position of green bar center (moved down significantly)
    wR:  0.361,  // Width=370
    hR:  0.039,  // Height=40
  },
  titleBar: {
    // Red bar (middle)
    xR:  0.500,  // Center X
    yR:  0.775,  // Y position of red bar center (moved down significantly)
    wR:  0.361,  // Width=370
    hR:  0.039,  // Height=40
  },
  roleBar: {
    // Cream bar (bottom)
    xR:  0.500,  // Center X
    yR:  0.838,  // Y position of cream bar center (moved down significantly)
    wR:  0.361,  // Width=370
    hR:  0.039,  // Height=40
  },
  footer: {
    xR:  0.100,
    yR:  0.920,  // Bottom cream area
    wR:  0.800,
    hR:  0.030,
  },
} as const;

function randomBuilderNum() {
  return String(Math.floor(Math.random() * 900) + 100);
}

/* ─────────────────────────────────────────────────────────────────
   MAIN EXPORT
───────────────────────────────────────────────────────────────── */
export const generateFrame = async (data: FrameData): Promise<string> => {
  const builderNum = randomBuilderNum();

  const [frameImg, userImg] = await Promise.all([
    loadImg('/hh_frame.jpg'),
    loadImg(data.imageSrc),
  ]);

  const S  = 2; // Supersample for crisp text
  const TW = frameImg.width  * S;
  const TH = frameImg.height * S;

  const canvas = document.createElement('canvas');
  canvas.width  = TW;
  canvas.height = TH;
  const ctx = canvas.getContext('2d')!;
  if (!ctx) throw new Error('Canvas 2D context unavailable');

  // Resolved pixel coords
  const cx = MAP.oval.cxR * TW;
  const cy = MAP.oval.cyR * TH;
  const rx = MAP.oval.rxR * TW;
  const ry = MAP.oval.ryR * TH;

  /* ════════════════════════════════════════════════════════════
     STEP 1 — Draw the user's photo FIRST, filling the oval
  ════════════════════════════════════════════════════════════ */
  ctx.save();
  ctx.beginPath();
  ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
  ctx.clip();

  // Draw user image scaled to "cover" the oval
  const scale = Math.max((rx * 2) / userImg.width, (ry * 2) / userImg.height);
  const uw = userImg.width  * scale;
  const uh = userImg.height * scale;
  ctx.drawImage(userImg, cx - uw / 2, cy - uh / 2, uw, uh);
  ctx.restore();

  /* ════════════════════════════════════════════════════════════
     STEP 2 — Draw the template with an EVEN-ODD hole!
     This draws the template everywhere EXCEPT inside the oval,
     meaning the gold decorative rings will sit perfectly on top
     of the user's photo edges.
  ════════════════════════════════════════════════════════════ */
  ctx.save();
  ctx.beginPath();
  ctx.rect(0, 0, TW, TH);                           // Full canvas
  ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);   // Subtract oval hole
  ctx.clip('evenodd');
  ctx.drawImage(frameImg, 0, 0, TW, TH);
  ctx.restore();

  /* ════════════════════════════════════════════════════════════
     STEP 3 — NAME on green binary bar (top, already in template)
  ════════════════════════════════════════════════════════════ */
  const {xR: nXR, yR: nYR, wR: nWR, hR: nHR} = MAP.nameBar;
  const ncx = nXR * TW, ncy = nYR * TH, nw = nWR * TW, nh = nHR * TH;

  ctx.fillStyle = '#FFFFFF';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  fitText(ctx, data.name.toUpperCase(), ncx, ncy, nw * 0.90, Math.round(nh * 0.60), '"Arial Black", Arial, sans-serif');

  /* ════════════════════════════════════════════════════════════
     STEP 4 — BUILDER TITLE on red bar (middle, already in template)
  ════════════════════════════════════════════════════════════ */
  const {xR: tXR, yR: tYR, wR: tWR, hR: tHR} = MAP.titleBar;
  const tcx = tXR * TW, tcy = tYR * TH, tw = tWR * TW, th = tHR * TH;

  ctx.fillStyle = '#FFFFFF';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  const titleText = data.title && data.title.trim() !== '' ? data.title.toUpperCase() : 'BUILDER';
  fitText(ctx, titleText, tcx, tcy, tw * 0.90, Math.round(th * 0.60), '"Arial Black", Arial, sans-serif');

  /* ════════════════════════════════════════════════════════════
     STEP 5 — ROLE on cream bar (bottom, already in template)
  ════════════════════════════════════════════════════════════ */
  const {xR: rXR, yR: rYR, wR: rWR, hR: rHR} = MAP.roleBar;
  const rcx = rXR * TW, rcy = rYR * TH, rw = rWR * TW, rh = rHR * TH;

  ctx.fillStyle = '#1B3A00';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  fitText(ctx, data.role.toUpperCase(), rcx, rcy, rw * 0.90, Math.round(rh * 0.60), '"Arial Black", Arial, sans-serif');

  /* ════════════════════════════════════════════════════════════
     STEP 6 — Personalised Builder ID in footer
  ════════════════════════════════════════════════════════════ */
  const {xR: fXR, yR: fYR, wR: fWR, hR: fHR} = MAP.footer;
  const fBx = fXR * TW, fBy = fYR * TH, fBw = fWR * TW, fBh = fHR * TH;

  // Repaint footer background (over the existing BUILDER ID)
  ctx.fillStyle = '#F4ECD8';
  ctx.fillRect(fBx, fBy - fBh / 2, fBw, fBh);

  // Personalised ID text
  const idText = `BUILDER ID: HHG-${builderNum}-2026  ·  28–31 OCT 2026`;
  ctx.fillStyle = '#2D4C1E';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  fitText(ctx, idText, TW / 2, fBy, fBw * 0.88, Math.round(16 * S), '"Arial Black", Arial, sans-serif', 'bold');

  return canvas.toDataURL('image/png', 1.0);
};
