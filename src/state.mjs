import { getCamera } from './cameras.mjs';

/** Pure mechanical state machine; UI and camera hardware do not own this state. */
export function newCameraState(cameraId) {
  const camera = getCamera(cameraId);
  if (cameraId === 'sx70') return { id: cameraId, ...camera.defaults, framesTaken: 0, developing: false };
  if (cameraId === 'apollo') return { id: cameraId, ...camera.defaults, framesTaken: 0, ready: true };
  return { id: cameraId, ...camera.defaults, framesTaken: 0, ready: true, remaining: cameraId === 'leica' ? 36 : 12 };
}

export function canExpose(s) {
  if (s.id === 'sx70') return s.open && s.loaded && s.remaining > 0 && !s.developing;
  if (s.id === 'apollo') return s.magazine === 'loaded' && s.ready;
  return s.ready && s.remaining > 0;
}

export function cameraStatus(s) {
  if (s.id === 'sx70') return !s.open ? 'FOLDED' : !s.loaded ? 'INSERT FILM PACK' : s.developing ? 'DEVELOPING' : `${s.remaining} FRAMES LEFT`;
  if (s.id === 'apollo') return s.magazine === 'loaded' ? `FRAME ${String(s.framesTaken + 1).padStart(4, '0')}` : 'MAGAZINE REMOVED';
  return `${s.remaining} FRAMES LEFT · ${s.ready ? 'COCKED' : 'ADVANCE REQUIRED'}`;
}

export function updateCamera(s, action) {
  const next = { ...s };
  if (action.type === 'set') {
    if (!Object.hasOwn(next, action.key)) throw new RangeError(`Invalid control: ${action.key}`);
    next[action.key] = action.value;
    return next;
  }
  if (action.type === 'toggle-fold' && s.id === 'sx70') {
    next.open = !s.open;
    return next;
  }
  if (action.type === 'load' && s.id === 'sx70') {
    if (!s.open) throw new Error('Unfold the SX-70 before loading film.');
    next.loaded = true; next.remaining = 10; next.developing = false;
    return next;
  }
  if (action.type === 'developed' && s.id === 'sx70') {
    next.developing = false;
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
    if (s.id === 'sx70') { next.remaining -= 1; next.developing = true; }
    else if (s.id === 'apollo') next.ready = true; // Electric film advance, simplified.
    else { next.remaining -= 1; next.ready = false; }
    return next;
  }
  throw new RangeError(`Action ${action.type} is not supported by ${s.id}.`);
}
