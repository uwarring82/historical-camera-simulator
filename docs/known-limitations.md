# Model and device limits

- Film speed and three B&W RMS granularity values have published anchors. The model assumes spatial correlation lengths, a common display shoulder, proxy color matrices and radial falloff. See the [film model](film-model.md) for numeric inputs and validation scope.
- The browser supplies a developed image. Phone tone mapping, existing noise and clipped highlights cannot be recovered. The app models relative exposures and prints up to 1600 pixels wide.
- Historical optical finders, nominal lenses and the centered film gates are schematic. Geometric parallax, lens MTF, effective device field of view and distortion have no physical calibration.
- The panorama is treated as distant. Camera and imported images have no depth map. A flat-ground depth heuristic controls defocus.
- The SX-70 uses a proxy meter, modern film speed and pack capacity. Prints appear immediately. The leaf-shutter programme, motion blur, long-exposure reciprocity and chemical development are outside the model.
- Inputs use their original frame only. Hardware camera capture, iOS share sheets, installation and alternative device lenses require testing on physical devices. DNG decoding depends on the browser.
- The session retains only the last exposed frame. A new exposure replaces it. A PNG and a separate metadata file are available.
