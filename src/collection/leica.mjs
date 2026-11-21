const catalogue = 'https://www.pacificrimcamera.com/rl/03496/03496.pdf';
const bailey = 'https://digital.library.adelaide.edu.au/server/api/core/bitstreams/8da0ada2-53d7-4243-a0e2-ed9abe2f4202/content';
const harris = 'https://demstedpprodaue12.blob.core.windows.net/mesac-public/resources/files/4354862/RB7900095.pdf';
const tarrant = 'https://emulsive.org/reviews/camera-reviews/leica-camera-reviews/shooting-the-leica-m1-from-1960s-british-holiday-camps-to-the-streets-of-21st-century-england';

export default {
  storyTitle: 'From the specimen slide to the seaside',
  story: 'In 1968, botanist Alan Bailey described attaching a Leica M1 to a Leitz Laborlux microscope to record the cellular structure of Australian brown algae. That same year John Tarrant began photographing holidaymakers for Butlin’s at Skegness with an M1 supplied by the camp. He recalls presetting his 35 mm lens to ten feet and exposing Ilford FP4 at 1/125 second and f/8 in daylight. One photographer found focus at the microscope, the other by knowing where to stand.',
  technical: [
    {title:'Two frames in the window', text:'The M1’s bright lines show the fields of 35 mm and 50 mm lenses together. The smaller rectangle gives the 50 mm composition and leaves room to see a person approaching it. On the original body the lines move as the lens is focused to compensate for the offset between finder and lens.'},
    {title:'One stroke, two operations', text:'Viewed from behind, the shutter-speed dial, release and winding lever sit toward the right end of the top plate. The photographer’s thumb advances the film by one frame and tensions the focal-plane shutter in the same stroke. A double-exposure lock blocks the next release until winding is complete. Aperture and subject distance are set on the lens.'},
    {title:'A different way to find focus', text:'For ordinary photography the M1’s window supplies a view for framing, while the photographer sets distance by scale. A Visoflex mirror housing fits between the body and a suitable lens. Its mirror redirects the taking image to a focusing screen. Pressing the housing’s lever lifts the mirror before it trips the camera shutter. At close distances, being able to inspect the actual image plane is especially valuable.'}
  ],
  figures: [
    {role:'body', src:'./collection/leica-body.webp', alt:'Front three-quarter view of a silver Leica M1 with a black covering, a 50 mm Elmar and a rectangular finder window.',
      title:'Leica M1 with a 50 mm Elmar', caption:'The small M1 plate occupies the position of a rangefinder window on related M bodies. On the barrel, the front ring sets aperture and the scale nearer the camera sets distance.',
      credit:'pjt56, 2010. Resized and converted to WebP.', source:'https://commons.wikimedia.org/wiki/File:Leica_M1.jpg', license:'CC BY 3.0', licenseUrl:'https://creativecommons.org/licenses/by/3.0/'},
    {role:'exposure', src:'./collection/leica-exposure.webp', alt:'Two black-and-white microscope photographs show oval fossil spores with dark, uneven walls and pale centres, labelled 1 and 2.',
      title:'Fossil spores on Adox KB14 film', caption:'Wayne K. Harris recorded these two Laevigatosporites major specimens with an M1 attached to a Leitz Laborlux microscope. He developed the negatives in Adox E10 and printed them on Kodak papers. The scan preserves the contrast of the reproduced research plate.',
      credit:'Wayne K. Harris, Geological Survey of South Australia, 1970. Plate 1, figures 1–2, cropped and converted to WebP.', source:harris+'#page=257', license:'CC BY 4.0', licenseUrl:'https://creativecommons.org/licenses/by/4.0/'},
    {role:'context', src:'./collection/leica-skegness.webp', alt:'A red telephone box, shops and the distant clock tower on Lumley Road in Skegness in 1967.',
      title:'Skegness, 1967', caption:'Ben Brooksbank recorded the resort a year before Tarrant started working at the nearby holiday camp. This view establishes the place and period. Brooksbank’s camera is unspecified.',
      credit:'© Ben Brooksbank, Geograph Britain and Ireland. Converted to WebP.', source:'https://www.geograph.org.uk/photo/3394378', license:'CC BY-SA 2.0', licenseUrl:'https://creativecommons.org/licenses/by-sa/2.0/'},
    {role:'context', src:'./collection/leica-context.webp', alt:'A separate black Visoflex II mirror housing with viewing prism and a release arm projecting to the side.',
      title:'The Visoflex II mirror housing', caption:'The arm reaches back to the camera’s release. A photographer looking into the prism can inspect the image formed by a compatible lens before raising the mirror to expose the film.',
      credit:'Rei Shinozuka, 2005. Converted to WebP.', source:'https://commons.wikimedia.org/wiki/File:VisoII-600.jpg', license:'CC BY-SA 3.0', licenseUrl:'https://creativecommons.org/licenses/by-sa/3.0/'}
  ],
  exposureNote:'Bailey’s figure 12 pairs a section through the body of Bactrophora filum with a detail carrying a 50 µm scale bar. His methods identify the microscope, the M1 and two panchromatic films. Tarrant’s field photographs give a second point of comparison, including a 50 mm Elmar frame on Ilford FP4 Plus at 1/60 second and f/2.8.',
  exposureLinks:[
    {label:'Wayne K. Harris · Original plate of fossil spores, plate 1 (PDF)', url:harris+'#page=257'},
    {label:'Alan Bailey · Bactrophora filum, figure 12, thesis p. 54 (PDF)', url:bailey+'#page=61'},
    {label:'John Tarrant · M1 street photographs and Visoflex close-ups', url:tarrant},
    {label:'Michael Khan · A patch of early morning fog in the forest, M1 with a 21 mm Super-Angulon on Portra 160', url:'https://www.flickr.com/photos/goforlaunch/51620744471/'}
  ],
  reading:[
    {label:'Wayne K. Harris · Microscope, camera, film and darkroom method, report p. 10 (PDF)', url:harris+'#page=17'},
    {label:'Ernst Leitz · 1961 dealer catalogue, M1 specification and Visoflex II (PDF)', url:catalogue},
    {label:'Ernst Leitz · Visoflex II operating instructions (French, PDF)', url:'https://www.summilux.net/documents/VisoflexII-notice-1959.pdf'},
    {label:'Alan Bailey · 1968 thesis on southern Australian brown algae', url:'https://digital.library.adelaide.edu.au/items/7d278793-b444-4d4a-8334-92ac354d86ed'}
  ]
};
