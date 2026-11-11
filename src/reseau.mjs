/** Apollo réseau: physical shadow at the film plane, never part of lens distortion. */
export function reseauGeometry(width, height, formatMm = 53) {
  if (!(width > 0 && height > 0 && formatMm > 0)) throw new RangeError('Positive image and film dimensions required');
  const crosses = [];
  for (let j = -2; j <= 2; j++) {
    for (let i = -2; i <= 2; i++) {
      crosses.push({
        x: width * (0.5 + i * 10 / formatMm),
        y: height * (0.5 + j * 10 / formatMm),
        armPxX: width * (i === 0 && j === 0 ? 2 : 1) / formatMm,
        armPxY: height * (i === 0 && j === 0 ? 2 : 1) / formatMm,
        widthPx: Math.max(0, width * .02 / formatMm),
        heightPx: Math.max(0, height * .02 / formatMm),
        center: i === 0 && j === 0
      });
    }
  }
  return crosses;
}

function overlap(a0, a1, b0, b1) { return Math.max(0, Math.min(a1, b1) - Math.max(a0, b0)); }
/** Subpixel area coverage; arms extend 1mm (2mm central) in each direction. */
export function reseauCoverage(x, y, cross) {
  const hx = overlap(x, x + 1, cross.x - cross.armPxX, cross.x + cross.armPxX);
  const hy = overlap(y, y + 1, cross.y - cross.heightPx / 2, cross.y + cross.heightPx / 2);
  const vx = overlap(x, x + 1, cross.x - cross.widthPx / 2, cross.x + cross.widthPx / 2);
  const vy = overlap(y, y + 1, cross.y - cross.armPxY, cross.y + cross.armPxY);
  const intersection = overlap(x, x + 1, cross.x - cross.widthPx / 2, cross.x + cross.widthPx / 2) * overlap(y, y + 1, cross.y - cross.heightPx / 2, cross.y + cross.heightPx / 2);
  return Math.min(1, hx * hy + vx * vy - intersection);
}
export function stampReseau(pixels, width, height) {
  const crosses = reseauGeometry(width, height);
  for (const cross of crosses) {
    const x0 = Math.max(0, Math.floor(cross.x - cross.armPxX - 1));
    const x1 = Math.min(width, Math.ceil(cross.x + cross.armPxX + 1));
    const y0 = Math.max(0, Math.floor(cross.y - cross.armPxY - 1));
    const y1 = Math.min(height, Math.ceil(cross.y + cross.armPxY + 1));
    for (let y = y0; y < y1; y++) for (let x = x0; x < x1; x++) {
      const coverage = reseauCoverage(x, y, cross);
      if (coverage <= 0) continue;
      const offset = (y * width + x) * 4;
      for (let k = 0; k < 3; k++) pixels[offset + k] = Math.floor(pixels[offset + k] * (1 - coverage));
    }
  }
  return pixels;
}
