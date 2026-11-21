import { FILM_OPTIONS } from './film.mjs?v=fde86c21ec6991c7';
import { getCamera } from './cameras.mjs?v=fde86c21ec6991c7';

/** Pure mechanical state machine; UI and camera hardware do not own this state. */
export function newCameraState(cameraId) {
  const camera = getCamera(cameraId);
  const filmId = FILM_OPTIONS[cameraId][0];
  if (cameraId === 'sx70') return { id: cameraId, filmId, ...camera.defaults, framesTaken: 0 };
  if (cameraId === 'apollo') return { id: cameraId, filmId, ...camera.defaults, framesTaken: 0, ready: true };
  return { id: cameraId, filmId, ...camera.defaults, framesTaken: 0, ready: true, remaining: cameraId === 'leica' ? 36 : 12 };
}

export function canExpose(s) {
  if (s.id === 'sx70') return s.open && s.loaded && s.remaining > 0;
  if (s.id === 'apollo') return s.magazine === 'loaded' && s.ready;
  return s.ready && s.remaining > 0;
}

export function cameraStatus(s) {
  if (s.id === 'sx70') return !s.open ? 'FOLDED' : !s.loaded ? 'INSERT FILM PACK' : `${s.remaining} FRAMES LEFT`;
  if (s.id === 'apollo') return s.magazine === 'loaded' ? 'MAGAZINE ENGAGED' : 'MAGAZINE REMOVED';
  return `${s.remaining} FRAMES LEFT · ${s.ready ? 'COCKED' : 'ADVANCE REQUIRED'}`;
}

export function updateCamera(s, action) {
  const next = { ...s };
  if (action.type === 'change-film') {
    if (!FILM_OPTIONS[s.id].includes(action.filmId)) throw new RangeError('Incompatible film.');
    if (s.filmId === action.filmId) return s;
    return { ...s, filmId: action.filmId, framesTaken: 0, ready: true,
      ...(s.id === 'apollo' ? {magazine: 'loaded'} : {remaining: s.id === 'leica' ? 36 : 12}) };
  }
  if (action.type === 'set') {
    if (!Object.hasOwn(next, action.key)) throw new RangeError(`Invalid control: ${action.key}`);
    next[action.key] = action.value;
    return next;
  }
  if (action.type === 'toggle-fold' && s.id === 'sx70') {
    next.open = !s.open;
    if (!next.open) next.compensation = '0';
    return next;
  }
  if (action.type === 'load' && s.id === 'sx70') {
    if (!s.open) throw new Error('Unfold the SX-70 before loading film.');
    next.loaded = true; next.remaining = 8;
    return next;
  }
  if (action.type === 'advance' && (s.id === 'leica' || s.id === 'rolleiflex')) {
    if (s.remaining > 0) next.ready = true;
    return next;
  }
  if (action.type === 'load' && (s.id === 'leica' || s.id === 'rolleiflex')) {
    next.remaining = s.id === 'leica' ? 36 : 12;
    next.framesTaken = 0; next.ready = true;
    return next;
  }
  if (action.type === 'expose') {
    if (!canExpose(s)) throw new Error('Camera is not ready to expose.');
    next.framesTaken += 1;
    if (s.id === 'sx70') next.remaining -= 1;
    else if (s.id === 'apollo') next.ready = true; // Electric film advance, simplified.
    else { next.remaining -= 1; next.ready = false; }
    return next;
  }
  throw new RangeError(`Action ${action.type} is not supported by ${s.id}.`);
}
