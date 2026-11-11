# Privacy, licensing and public preview checklist

## Privacy

- The application does not upload user images or implement analytics or location collection.
- Camera permission is requested only on user action.
- Photo imports remain in browser memory; exported files belong to the user.
- No image archive exists. **Export immediately after capture**; browser storage can be deleted.
- The PWA service worker caches only same-origin resources. It is not an image repository or backup.
- Avoid adding any remote analytics, fonts, image endpoints, or third-party scripts without separate review.

## Source rights

The project code and its original CSS, SVG demo scene and icons are MIT-licensed. Third-party references are **links only**. NASA media may have usage conditions; manufacturer trademarks and their publicity images are not licensed by this source repository. Camera names are used descriptively; no endorsement is implied.

A public preview must have a rights register for any added image, icon, film emulation LUT, manual diagram or manufacturer mark, with license, attribution, origin and hosting permissions. Keep historical reference data separate from original code when their redistribution rights differ.

## Public preview gate

- [ ] User agrees to public exposure of this repository/site.
- [ ] All bundled assets independently created or licensed.
- [ ] Rights and attribution for any added NASA/manufacturer imagery verified.
- [ ] Site deployed over HTTPS with no camera-image upload.
- [ ] Safari capture and export manually checked on iPhone.
- [ ] Source claims and model levels displayed accurately.
- [ ] Home Screen/offline/storage limitations explained.
