import { FrameData } from '../components/UploadArea';

/* ─────────────────────────────────────────────────────────────────
   HELPERS
───────────────────────────────────────────────────────────────── */

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, w: number, h: number, r: number
) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

function loadImg(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const im = new Image();
    im.crossOrigin = 'anonymous';
    im.onload = () => resolve(im);
    im.onerror = () => reject(new Error(`Failed to load: ${src}`));
    im.src = src;
  });
}

/* ─────────────────────────────────────────────────────────────────
   COORDINATE MAP  (in 1024×1024 source template space)
   
   The generated template has:
     - Rainbow lanyard at top
     - Gold hook in center-top
     - Card body:    roughly x=245, y=310, w=535, h=680
     - Photo slot:   roughly x=370, y=460, w=265, h=280
     - Text region:  y=755 → y=960  (Name / Builder Title / Role)
───────────────────────────────────────────────────────────────── */

const MAP = {
  // Photo slot (inner grey area inside the teal frame)
  photo: { x: 412, y: 490, w: 200, h: 250, r: 8 },

  // Text region we repaint over (Name / Builder Title / Role area)
  textBlock: { x: 302, y: 755, w: 420, h: 175 },

  // Card bounds (for reference — the gold-bordered card)
  card: { x: 292, y: 340, w: 440, h: 620 },
};

/* ─────────────────────────────────────────────────────────────────
   MAIN EXPORT
   Only 3 fields: Name, Builder Title, Role — no extra info.
   Output at 2× for crisp text (2048×2048)
───────────────────────────────────────────────────────────────── */

export const generateFrame = async (data: FrameData): Promise<string> => {
  const [templateImg, userImg] = await Promise.all([
    loadImg('/id_card_template.png'),
    loadImg(data.imageSrc),
  ]);

  const S = 2;
  const TW = templateImg.width * S;
  const TH = templateImg.height * S;

  const canvas = document.createElement('canvas');
  canvas.width = TW;
  canvas.height = TH;
  const ctx = canvas.getContext('2d')!;
  if (!ctx) throw new Error('No canvas context');

  /* ── 1. Draw full template at 2× ─────────────────────────── */
  ctx.drawImage(templateImg, 0, 0, TW, TH);

  /* ── 1.5. Patch the ghost hook artifact in the template ── */
  ctx.save();
  ctx.filter = `blur(${8 * S}px)`;
  ctx.fillStyle = '#fcd979'; // warm sunset sky color
  ctx.beginPath();
  // The artifact is just below the golden hook in the sky
  ctx.ellipse(512 * S, 395 * S, 40 * S, 25 * S, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  /* ── 2. Draw user photo into the photo slot ─────────────── */
  const p = MAP.photo;
  const px = p.x * S, py = p.y * S, pw = p.w * S, ph = p.h * S, pr = p.r * S;

  ctx.save();
  roundRect(ctx, px, py, pw, ph, pr);
  ctx.clip();

  // Object-fit: cover
  const uScale = Math.max(pw / userImg.width, ph / userImg.height);
  const uw = userImg.width * uScale;
  const uh = userImg.height * uScale;
  ctx.drawImage(userImg, px + (pw - uw) / 2, py + (ph - uh) / 2, uw, uh);
  ctx.restore();

  /* ── 3. Repaint text region with card background ───────── */
  const tb = MAP.textBlock;
  const tbx = tb.x * S, tby = tb.y * S, tbw = tb.w * S, tbh = tb.h * S;

  // Sandy pearl gradient matching card bg
  const sandGrad = ctx.createLinearGradient(0, tby, 0, tby + tbh);
  sandGrad.addColorStop(0.0, '#f5eed8');
  sandGrad.addColorStop(0.5, '#f0e8cf');
  sandGrad.addColorStop(1.0, '#ece0c2');
  ctx.fillStyle = sandGrad;
  ctx.fillRect(tbx, tby, tbw, tbh);

  /* ── 4. Draw the 3 text fields ─────────────────────────── */
  const cx = TW / 2;
  ctx.textBaseline = 'middle';

  const labelFont = (size: number) => `bold ${size * S}px "Georgia", serif`;
  const valueFont = (size: number) => `bold ${size * S}px "Georgia", serif`;
  const labelCol = '#6b5a40';
  const valueCol = '#0f172a';
  const lineCol = 'rgba(15,23,42,0.35)';

  let y = tby + 45 * S;
  // Shift labels to the left to make room for long input values
  const labelX = cx - 50 * S;
  const valueX = cx - 35 * S;

  // ── Name ──
  ctx.textAlign = 'right';
  ctx.font = labelFont(18);
  ctx.fillStyle = labelCol;
  ctx.fillText('Name:', labelX, y);

  ctx.textAlign = 'left';
  ctx.font = valueFont(28);
  ctx.fillStyle = valueCol;
  ctx.fillText(data.name, valueX, y);

  // Underline
  const nm = ctx.measureText(data.name);
  const lineW = Math.max(nm.width + 10 * S, 180 * S);
  ctx.strokeStyle = lineCol;
  ctx.lineWidth = 1.5 * S;
  ctx.beginPath();
  ctx.moveTo(valueX, y + 20 * S);
  ctx.lineTo(valueX + lineW, y + 20 * S);
  ctx.stroke();

  // ── Builder Title ──
  y += 50 * S;
  ctx.textAlign = 'right';
  ctx.font = labelFont(18);
  ctx.fillStyle = labelCol;
  ctx.fillText('Builder Title:', labelX, y);

  ctx.textAlign = 'left';
  ctx.font = valueFont(24);
  ctx.fillStyle = '#1e3a5f';
  ctx.fillText(data.title, valueX, y);

  // Underline
  const tm = ctx.measureText(data.title);
  const tLineW = Math.max(tm.width + 10 * S, 180 * S);
  ctx.strokeStyle = lineCol;
  ctx.beginPath();
  ctx.moveTo(valueX, y + 18 * S);
  ctx.lineTo(valueX + tLineW, y + 18 * S);
  ctx.stroke();

  // ── Role ──
  y += 50 * S;
  ctx.textAlign = 'right';
  ctx.font = labelFont(18);
  ctx.fillStyle = labelCol;
  ctx.fillText('Role:', labelX, y);

  ctx.textAlign = 'left';
  ctx.font = `bold ${24 * S}px "Arial Black", "Arial", sans-serif`;
  ctx.fillStyle = '#1e3a5f';
  ctx.fillText(data.role, valueX, y);

  // Underline
  const rm = ctx.measureText(data.role);
  const rLineW = Math.max(rm.width + 10 * S, 180 * S);
  ctx.strokeStyle = lineCol;
  ctx.beginPath();
  ctx.moveTo(valueX, y + 18 * S);
  ctx.lineTo(valueX + rLineW, y + 18 * S);
  ctx.stroke();

  return canvas.toDataURL('image/png', 1.0);
};
