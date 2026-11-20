// Speed is an exposure input. RMS density variation and its spatial scale are separate inputs.
// Kodak's numbers describe a 48 µm measuring aperture at net density 1.0. Correlation
// lengths below are explicit rendering assumptions, not measured silver-crystal diameters.
const stock = (name, iso, color, rms48, correlationUm, measured = false) =>
  Object.freeze({name, iso, color, rms48, correlationUm, measured});

export const FILMS = Object.freeze({
  so368: stock('Ektachrome MS SO-368', 64, 'reversal', 0.012, 8),
  plusx: stock('Plus-X 3401', 100, 'bw', 0.012, 9),
  sx160: stock('SX-70 Color', 160, 'instant', 0.016, 15),
  tmax100: stock('T-MAX 100', 100, 'bw', 0.008, 6, true),
  tmax400: stock('T-MAX 400', 400, 'bw', 0.010, 9, true),
  trix400: stock('TRI-X 400', 400, 'bw', 0.017, 14, true)
});
const bw = ['tmax100', 'tmax400', 'trix400'];
export const FILM_OPTIONS = {apollo: ['so368', 'plusx'], sx70: ['sx160'], leica: bw, rolleiflex: bw};
export function filmFor(cameraId, id) {
  const options = FILM_OPTIONS[cameraId];
  return FILMS[options.includes(id) ? id : options[0]];
}
export function filmSpeedLabel(id, film) {
  return (id === 'plusx' ? 'EI ' : 'ISO ') + film.iso;
}

// Approximate an output pixel and Kodak's circular aperture by Gaussians with
// the same second moments. For a Gaussian-correlated 2-D density field, spatial
// averaging reduces its RMS by l / sqrt(l² + 2s²).
export function grainFootprint(film, frameWidthMm, pixels) {
  const pitchUm = 1000 * frameWidthMm / pixels;
  const length2 = film.correlationUm ** 2;
  const integrated = length2 + pitchUm ** 2 / 6;
  return {
    sigmaDensity: film.rms48 * Math.sqrt((length2 + 2 * 12 ** 2) / integrated),
    // Adjacent-pixel correlation after sampling, used to construct a separable field.
    neighborCorrelation: Math.exp(-(pitchUm ** 2) / (2 * integrated))
  };
}

// MA(1) per axis, fitted to the first spatial lag. This compact field is used at
// camera-scale output (≤1600 px), not to extrapolate microscopic morphology.
export function densityNoise(film, frameWidthMm, width, random) {
  const {sigmaDensity, neighborCorrelation} = grainFootprint(film, frameWidthMm, width);
  const corr = Math.min(0.499, neighborCorrelation);
  const weight = 2 * corr / (1 + Math.sqrt(1 - 4 * corr ** 2));
  const amplitude = sigmaDensity / (1 + weight ** 2);
  const draw = () => (random() / 4294967296 - 0.5) * Math.sqrt(12);
  const previous = new Float32Array(width);
  let left = draw();
  for (let i = 0; i < width; i++) {
    const next = draw();
    previous[i] = next + weight * left;
    left = next;
  }
  return x => {
    if (x === 0) left = draw();
    const next = draw(), horizontal = next + weight * left;
    const result = amplitude * (horizontal + weight * previous[x]);
    previous[x] = horizontal;
    left = next;
    return result;
  };
}
