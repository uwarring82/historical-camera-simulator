const handbook = 'https://www.ibiblio.org/apollo/ApolloProjectOnline/Documents/CD42-A_SL-997%201973-06.pdf';
const nasaMedia = 'https://www.nasa.gov/nasa-brand-center/images-and-media/';

export default {
  storyTitle: 'Photographing a rock before moving it',
  story: 'At Taurus–Littrow in December 1972, the place a rock came from mattered as much as the specimen in the bag. Gene Cernan and geologist Jack Schmitt photographed sample sites before disturbing them. At Station 6 they worked around a boulder that had rolled down the North Massif. Cernan’s panorama preserved the relationship between the broken blocks, the valley and his partner. The same 60 mm camera also made a very different composition on their first excursion, with Earth just above the American flag.',
  technical: [
    {title:'A camera aimed with the chest',text:'The lunar module carried two 70 mm data cameras with 60 mm lenses. A dovetail bracket fixed each camera to the suit’s chest control unit. The astronaut turned his torso to compose. Marks on top of the lens barrel indicated its horizontal field, which NASA specified as 46.9°. The studio’s Historical setting lets you try this without a digital finder.'},
    {title:'Three rings under a gloved hand',text:'Starting at the camera body and moving toward the front glass, the three tabbed rings set focus, aperture and shutter speed. The Apollo 17 version of the Biogon had full stops from f/5.6 to f/16 and repeatable focus positions at 7, 11 and 74 feet. Its Compur leaf shutter offered timed exposures from one second to 1/500 second plus bulb. The handle trigger pressed the release on the lower front of the body. Releasing it started the motor to advance the film and cock the shutter.'},
    {title:'Why the crosses stay put',text:'Light passed through a 4 mm glass plate immediately before reaching the film. Lines engraved on its rear surface produced 25 dark crosses at 10 mm intervals on the image. The grid gave analysts known film-plane coordinates for comparing frames and checking deformation. Determining a rock’s dimensions also requires information about distance, scale or a second viewpoint.'},
    {title:'Following an exposure back to the film',text:'The rear magazine detached at the top latch. NASA’s frame index connects a picture number to its magazine, film stock, lens and activity. The flag photograph below belongs to magazine B (134). The boulder photograph belongs to magazine E (140). Both are individual 60 mm exposures on SO-368 color reversal film.'}
  ],
  figures: [
    {
      role:'body',src:'./collection/apollo-body.webp',alt:'Side view of a silver Hasselblad Data Camera with the black lens facing left and a removable magazine on the right.',
      title:'The lunar camera in profile',caption:'An exhibition example of the 500 EL Data Camera at the Zeiss stand, Photokina 2008. The side view separates the lens rings, motor housing and detachable film magazine. The display record gives no flight serial number.',
      credit:'Aljawad, 2008. Crop and levels by Soerfm. Resized and converted to WebP.',source:'https://commons.wikimedia.org/wiki/File:Moon_Camera.jpg',
      license:'CC BY-SA 3.0',licenseUrl:'https://creativecommons.org/licenses/by-sa/3.0/'
    },
    {
      role:'context',src:'./collection/apollo-flag.webp',alt:'Harrison Schmitt stands beside the flag on the Moon, with a small blue Earth visible above the flag.',
      title:'Earth above the flag',caption:'AS17-134-20384. During the first Apollo 17 surface excursion, Cernan brought Schmitt, the flag and the distant Earth into one square frame. NASA’s photographic index identifies the 60 mm lens and magazine B.',
      credit:'NASA / Eugene A. Cernan. Resized and converted to WebP.',source:'https://images.nasa.gov/details/AS17-134-20384',
      license:'NASA media usage guidelines',licenseUrl:nasaMedia
    },
    {
      role:'exposure',src:'./collection/apollo-boulder.webp',alt:'A spacesuited geologist at the left edge of a large fractured lunar boulder, with the valley floor beyond.',
      title:'Station 6, frame 21496',caption:'AS17-140-21496. Cernan’s individual exposure from magazine E places Schmitt beside the Station 6 boulder during the third moonwalk. The neighboring frames overlap to form a panorama. Look for the fine réseau crosses against the lighter terrain.',
      credit:'NASA / Eugene A. Cernan. Resized and converted to WebP.',source:'https://images.nasa.gov/details/as17-140-21496',
      license:'NASA media usage guidelines',licenseUrl:nasaMedia
    }
  ],
  reading:[
    {label:'NASA flight equipment handbook · body, release and film plane',url:handbook+'#page=123'},
    {label:'NASA flight equipment handbook · 60 mm lens and control rings',url:handbook+'#page=135'},
    {label:'Apollo 17 mission press kit · photographic equipment, p. 79',url:'https://apollojournals.org/alsj/a17/A17_PressKit.pdf'},
    {label:'Apollo 17 Hasselblad frame index · film, lens and activity',url:'https://apollojournals.org/alsj/a17/a17.photidx.pdf'},
    {label:'NASA · explore Station 6 from orbit and on the ground',url:'https://svs.gsfc.nasa.gov/4302/'},
    {label:'Zeiss · 60 mm Biogon optical performance',url:'https://apollojournals.org/alsj/Biogon5.6_60mm_ZEISS.pdf'}
  ]
};
