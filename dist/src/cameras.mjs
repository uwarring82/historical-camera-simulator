/** Camera specifications are prototype configuration, not proof of historical calibration. */
const timedShutters = ['1 s','1/2 s','1/4 s','1/8 s','1/15 s','1/30 s','1/60 s','1/125 s','1/250 s','1/500 s'];
export const CAMERAS = Object.freeze({
  apollo: {
    id: 'apollo', year: 1972, short: 'Apollo 17', name: 'Apollo 17 Hasselblad',
    subtitle: 'Lunar Surface Data Camera',
    description: 'Modified 500 EL, nominal Zeiss Biogon 60 mm, 53 × 53 mm negative. Near-blind historical aiming; réseau recorded at the film plane.',
    mechanicalEvidence: 'A', renderingEvidence: 'C', category: 'scientific',
    frameMm: 53, frameHeightMm: 53, nominalFocalMm: 60,
    apertureOptions: ['f/5.6', 'f/8', 'f/11', 'f/16', 'f/22'], shutterOptions: timedShutters,
    defaults: { aperture: 'f/5.6', shutter: '1/125 s', focus: '∞', magazine: 'loaded' },
    references: ['zeiss-biogon', 'alsj-reseau', 'nasa-apollo17']
  },
  sx70: {
    id: 'sx70', year: 1972, short: 'SX-70', name: 'Polaroid SX-70',
    subtitle: 'Original folding instant camera',
    description: 'Fold-open SLR, manual focus, automatic exposure and instant-film development. Exposure programme remains uncalibrated.',
    mechanicalEvidence: 'A', renderingEvidence: 'C', category: 'instant',
    frameMm: 79, frameHeightMm: 77, nominalFocalMm: 116,
    defaults: { open: false, loaded: false, remaining: 0, focus: '2 m', compensation: '0' },
    references: ['polaroid-sx70']
  },
  leica: {
    id: 'leica', year: 1959, short: 'Leica M1', name: 'Leica M1',
    subtitle: '35 mm mechanical photography',
    description: 'Manual film advance, 35/50 mm parallax-adjusted bright-line frames and scale focusing without a coupled rangefinder.',
    mechanicalEvidence: 'A', renderingEvidence: 'C', category: '35mm',
    frameMm: 36, frameHeightMm: 24, nominalFocalMm: 50,
    apertureOptions: ['f/2.8', 'f/4', 'f/5.6', 'f/8', 'f/11', 'f/16'],
    shutterOptions: [...timedShutters, '1/1000 s'],
    defaults: { aperture: 'f/5.6', shutter: '1/125 s', focus: '3 m' },
    references: ['leica-m1']
  },
  rolleiflex: {
    id: 'rolleiflex', year: 1960, short: 'Rolleiflex', name: 'Rolleiflex 2.8F',
    subtitle: 'Twin-lens medium format',
    description: 'Waist-level reversed viewfinder, two optical axes, focus-linked parallax correction, and 12 square frames per roll.',
    mechanicalEvidence: 'A', renderingEvidence: 'C', category: '6x6',
    frameMm: 56, frameHeightMm: 56, nominalFocalMm: 80,
    apertureOptions: ['f/2.8', 'f/4', 'f/5.6', 'f/8', 'f/11', 'f/16'],
    shutterOptions: timedShutters,
    defaults: { aperture: 'f/5.6', shutter: '1/125 s', focus: '3 m' },
    references: ['rolleiflex-28f']
  }
});
export const CAMERA_ORDER = ['apollo', 'sx70', 'leica', 'rolleiflex'];
export function getCamera(id) {
  const camera = CAMERAS[id];
  if (!camera) throw new RangeError(`Unknown camera: ${id}`);
  return camera;
}
