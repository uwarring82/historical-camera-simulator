import { filmFor } from './film.mjs';
import { getCamera } from './cameras.mjs';
export function photographMetadata(cameraId, state, settings, provenance) {
  const c = getCamera(cameraId);
  return {
    schemaVersion: 2,
    application: 'Camera Archive',
    createdAt: new Date().toISOString(),
    camera: { id: cameraId, name: c.name, year: c.year, nominalFocalMm: c.nominalFocalMm, frameMm: c.frameMm, frameHeightMm: c.frameHeightMm },
    film: { id: settings.filmId, ...filmFor(cameraId, settings.filmId) },
    simulation: {
      classification: 'C', rationale: 'Phenomenological film/color/grain; no calibrated photographic reconstruction',
      referenceRenderer: 'film-density-rectilinear-v0.4', settings: { ...settings },
      cameraState: { ...state }
    },
    acquisition: { ...provenance },
    rights: provenance.attribution ? 'Demo derivative. CC BY-SA 3.0. See acquisition.attribution.' : 'User retains responsibility for rights in imported images and exports.',
    privacy: 'Rendered locally. No network upload is performed by the application.'
  };
}

export function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = filename; a.style.display = 'none';
  document.body.append(a); a.click(); a.remove();
  // Delay revocation because Safari may require time to begin the download.
  setTimeout(() => URL.revokeObjectURL(url), 30000);
}
