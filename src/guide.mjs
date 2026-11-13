/** Editorial content is kept separate from the simulation's provisional configuration. */
export const SOURCES = {
  nasa: ['NASA · Astronaut still photography during Apollo', 'https://www.nasa.gov/history/astronaut-still-photography-during-apollo/'],
  biogon: ['ZEISS · Biogon 5.6/60 technical data (PDF, NASA archive)', 'https://www.nasa.gov/wp-content/uploads/static/history/alsj/Biogon5.6_60mm_ZEISS.pdf'],
  polaroid: ['Polaroid · SX-70 series cameras', 'https://support.polaroid.com/hc/en-us/articles/115012463268-Polaroid-SX-70-series-cameras'],
  leica: ['Leitz · 1961 dealer catalogue (PDF, archived by Pacific Rim Camera)', 'https://www.pacificrimcamera.com/rl/03496/03496.pdf'],
  rollei: ['Deutsches Kameramuseum · Rolleiflex 2.8F', 'https://kameramuseum.de/objekte/rollei-rolleiflex-28-f/'],
  cave: ['French Ministry of Culture · Lascaux, Chauvet, Cosquer', 'https://www.culture.gouv.fr/actualites/Lascaux-Chauvet-Cosquer-comment-ces-decouvertes-ont-change-notre-regard-sur-la-prehistoire'],
  obscura: ['National Gallery · Camera obscura', 'https://www.nationalgallery.org.uk/paintings/glossary/camera-obscura'],
  niepce: ['Harry Ransom Center · The Niépce Heliograph', 'https://www.hrc.utexas.edu/niepce-heliograph/'],
  kodak: ['Kodak · Historical milestones', 'https://www.kodak.com/en/company/page/milestones/'],
  exposure: ['Nikon · The basics of exposure', 'https://www.nikonusa.com/learn-and-explore/c/tips-and-techniques/a-basic-look-at-the-basics-of-exposure'],
  aperture: ['Nikon · Understanding maximum aperture', 'https://www.nikonusa.com/learn-and-explore/c/tips-and-techniques/understanding-maximum-aperture'],
  focus: ['Canon · Depth of field', 'https://files.canon-europe.com/files/webcontent/rf-lens-world/knowledge/depth-of-field/index.html']
};
export const CAMERA_STORIES = {
  apollo: {
    label: 'Beyond the familiar', format: '70 mm film · Lunar data camera', tagline: 'Made for a world beyond our own.',
    intro: 'An electric Hasselblad adapted for lunar exploration. Its little crosses made extraordinary photographs useful scientific records.',
    title: 'A different world. A different kind of camera.',
    standfirst: 'The Apollo lunar camera turned an act of looking into an act of measurement. Explore our Apollo 17-inspired instrument.',
    sections: [
      ['Designed for the journey', 'NASA adapted the Hasselblad 500 EL for the lunar environment. The data camera used a special 60 mm ZEISS Biogon lens and a glass réseau plate near the film. Conventional materials and lubricants needed special consideration in a vacuum.'],
      ['The crosses have a purpose', 'The réseau marks provide reference positions across a photograph. They belong at the film plane: in this app, they are drawn into the captured image rather than placed over the live view as decoration.'],
      ['Learn to aim differently', 'Our historical mode replaces the convenient digital view with an approximate aiming guide. Set the aperture, shutter time, and distance scale before making an exposure. Electric film advance keeps this virtual camera ready for the next frame.']
    ],
    specs: [['Design family','Modified Hasselblad 500 EL'],['Mission context','Apollo 17 · 1972'],['Nominal lens','ZEISS Biogon 60 mm f/5.6'],['Configured image area','53 × 53 mm'],['Characteristic feature','Film-plane réseau marks']],
    exercise: 'Compare f/5.6 and f/8 at the same shutter time in historical mode. Then make a frame and look for the réseau crosses in the result.',
    limitation: 'This is an Apollo-inspired operational model. Aiming, exposure, film response, and optical effects are simplified; the result is not a calibrated reconstruction of lunar photography.',
    sources: ['nasa','biogon']
  },
  sx70: {
    label: 'A little everyday magic', format: 'Integral instant film · Folding SLR', tagline: 'A darkroom, folded into your day.',
    intro: 'Unfold it, focus, and make a picture. The SX-70 brings the camera and the idea of an instant print together.',
    title: 'A whole new way to watch a moment appear.',
    standfirst: 'Introduced in 1972, the original SX-70 made a folding single-lens reflex camera part of the instant-photography experience.',
    sections: [
      ['An instrument that unfolds', 'The original SX-70 combines a folding body with through-the-lens viewing and manual focus. Its chrome-and-brown-leather form is one of the familiar versions of this design. Later Sonar versions added autofocus.'],
      ['A different kind of control', 'Instead of separate manual aperture and shutter controls, this model invites you to focus and use the lighten/darken compensation control. It is a different relationship with exposure: guide the camera rather than set every parameter.'],
      ['Try the sequence', 'Unfold the virtual camera, insert a ten-frame pack, and set your focus. After exposure, complete the development step to prepare the next frame. The current prototype uses a manual step rather than a chemical development clock.']
    ],
    specs: [['Original introduction','1972'],['Viewing system','Single-lens reflex'],['Focus','Manual, original model'],['Film family','SX-70 integral instant film'],['Studio operation','Fold, load, focus, expose, develop']],
    exercise: 'Unfold and load the camera. Make two frames with different lighten/darken settings, completing the virtual development step between exposures.',
    limitation: 'Automatic exposure is not calibrated to the original camera. Color is interpretative; development is a workflow step, not a simulation of instant-film chemistry. Pack capacity is a prototype choice.',
    sources: ['polaroid']
  },
  leica: {
    label: 'The essentials, beautifully mechanical', format: '35 mm film · Viewfinder camera', tagline: 'Small instrument. Deliberate decisions.',
    intro: 'A stripped-back M camera with a bright viewfinder and no coupled rangefinder. Distance is a decision you make.',
    title: 'Less between you and the photograph.',
    standfirst: 'The Leica M1 arrived in 1959. Its pared-back design makes the distinction between composing and focusing especially clear.',
    sections: [
      ['A viewfinder, not a rangefinder', 'The contemporary Leitz catalogue describes permanently visible 35 mm and 50 mm bright-line frames with parallax compensation. Unlike the M2, the M1 has no built-in rangefinder system. Looking through the finder does not measure focus distance.'],
      ['Estimate. Set. Observe.', 'In the studio, choose a distance on the lens scale, then set aperture and shutter time. A smaller aperture increases the range of distances that can appear acceptably sharp. Our focus preview uses a simplified flat-ground scene assumption.'],
      ['One frame at a time', 'After exposing, advance the virtual film to cock the shutter. This small ritual encourages a pause between pictures. The prototype provides a 36-frame virtual roll and a selected set of shutter and aperture settings.']
    ],
    specs: [['Introduced','1959'],['Film format','35 mm'],['Finder','35 / 50 mm bright-line frames'],['Focusing method','Scale focus; no coupled rangefinder'],['Studio lens configuration','Nominal 50 mm']],
    exercise: 'Choose 1 m, then infinity, and observe the demo preview. Make a frame, advance the film, and compare another focus setting.',
    limitation: 'The studio uses a square output crop inside a wider preview. The finder and parallax behavior are partial representations. The monochrome profile is generic, not a measured Leica lens or film response.',
    sources: ['leica']
  },
  rolleiflex: {
    label: 'Slow down. Look down.', format: '120 roll film · Twin-lens reflex', tagline: 'Two lenses. One considered frame.',
    intro: 'A waist-level view and a square negative invite a slower rhythm. One lens helps you see; the other makes the photograph.',
    title: 'A square frame. A fresh way of looking.',
    standfirst: 'The Rolleiflex 2.8F belongs to the classic twin-lens reflex tradition. Our collection places it in its early-1960s context.',
    sections: [
      ['Two optical paths', 'The upper lens supplies the viewing image; the lower taking lens exposes the film. The 2.8F features an 80 mm f/2.8 taking lens and a coupled exposure meter. The museum reference documents an example from the early 1960–1966 production period.'],
      ['The world, reversed', 'The studio mirrors the live or demo view horizontally to suggest the waist-level experience. Move your attention across the frame and notice how that reversal changes your sense of composition. The final photograph is shown in its normal orientation.'],
      ['A measured rhythm', 'Set aperture, shutter time, and focus, then expose. Advance the film before the next frame. Our virtual roll gives you twelve square exposures, with a deliberate manual action between each one.']
    ],
    specs: [['Collection date','c. 1960 · early production context'],['Type','Twin-lens reflex'],['Film','120 roll film · 12 square frames'],['Taking lens','Nominal 80 mm f/2.8'],['Configured image area','56 × 56 mm']],
    exercise: 'Frame the demo using the reversed finder. Expose and compare the result with the preview. Then advance the film and try again.',
    limitation: 'Ground glass, parallax, metering, and focus are only partly represented. No measured 80 mm lens response or medium-format film emulsion is simulated.',
    sources: ['rollei']
  }
};
export const CHAPTERS = {
  history: {
    category: 'The story of image-making', kicker: 'The long view', title: 'A very old desire.<br />An ever-changing medium.',
    standfirst: 'This is a story about keeping what we see: a cultural thread from handmade marks to recorded light, rather than a single, straight line of invention.',
    sections: [
      {id:'drawing', title:'First, a mark on a surface.', text:'Prehistoric artists used rock surfaces and pigments to create images that endure. Cave paintings are handmade representations, not photographs. Their place in this story is the human wish to make an experience visible to someone else.', sources:['cave']},
      {id:'obscura', title:'Then, light draws its own image.', text:'In a camera obscura, light enters a dark enclosure through a small opening or lens and projects a view of the outside world. From the seventeenth century onward, some artists used such devices to help compose and trace images. Projection existed before a practical way to preserve it.', sources:['obscura']},
      {id:'photography', title:'The 1820s: a view that stays.', text:'Niépce found a way to preserve a camera image on a light-sensitive surface. The Harry Ransom Center dates its surviving heliograph to 1827. Photography joined optics to a recording process: the image was no longer only something to trace by hand.', sources:['niepce']},
      {id:'film', title:'1888: photography becomes more portable.', text:'Kodak put its original camera on the market in 1888, helping bring image-making to a broader public. Roll-film workflows separated making a picture from the work of processing it. Later instruments would explore different sizes, viewing systems, and degrees of automation.', sources:['kodak']},
      {id:'collection', title:'1959–1972: four different answers.', text:'The M1 asks you to estimate distance. The Rolleiflex offers a reversed, waist-level square view. In 1972, the SX-70 and Apollo lunar cameras served strikingly different needs: an instant picture in everyday life, and a scientific record far from Earth. Explore each instrument for its specific history.', sources:['leica','rollei','polaroid','nasa']},
      {id:'digital', title:'1975 onward: light becomes data.', text:'Kodak dates its first digital camera prototype to 1975: a black-and-white, 10,000-pixel device. Digital cameras record light as electrical signals that are encoded as image data. Modern devices add substantial processing. This archive starts with one of those digital images and applies an educational interpretation of an older workflow.', sources:['kodak']}
    ], exercise:'Choose an instrument from the collection. Ask two questions: how does it let you see, and how does it record what you saw?', next:'light'
  },
  light: {
    category:'The principles', kicker:'01 / Light & aperture', title:'A small opening.<br />A world of difference.',
    standfirst:'The aperture is the opening in a lens. Adjusting its size changes how much light reaches the recording surface.',
    sections:[
      {title:'Why a smaller number means a bigger opening',text:'The f-number is the focal length divided by the entrance-pupil diameter. At a fixed focal length, f/2.8 describes a larger opening than f/8. The familiar full-stop sequence—2.8, 4, 5.6, 8, 11, 16—roughly halves the light with each step upward.',sources:['aperture']},
      {title:'Light and depth belong together',text:'Aperture also affects depth of field: the range that appears acceptably sharp. With other conditions held constant, a smaller opening generally gives more depth of field. Subject distance, focal length, and how the finished image is viewed also matter.',sources:['focus']},
      {title:'Put the idea to work',text:'Try the Leica or Rolleiflex. Hold shutter time steady and move from f/5.6 to f/8. The exposure model reduces brightness; the focus preview also changes. Both operation modes use the same illustrative exposure model.'}
    ], exercise:'Visit the entrance’s aperture demonstration, then compare f/5.6 and f/8 in the studio. One full stop halves the admitted light at a fixed shutter time.',next:'exposure'
  },
  exposure: {
    category:'The principles', kicker:'02 / Time & exposure',title:'Every photograph<br />takes a little time.',
    standfirst:'A shutter controls duration. Aperture controls the opening. Together, they determine the light exposure at the film or sensor.',
    sections:[
      {title:'A fraction of a second changes the story',text:'A short exposure can freeze motion; a longer one can record movement as blur. Changing from 1/125 s to 1/250 s halves the exposure time. At the same aperture and scene brightness, that also halves the light recorded.',sources:['exposure']},
      {title:'A balancing act',text:'Opening one full aperture stop can balance halving the shutter time. Film ISO describes a film’s sensitivity; digital ISO changes how the captured signal is handled and represented. ISO itself does not open the lens or extend the exposure.',sources:['exposure']},
      {title:'What the studio demonstrates',text:'Both operation modes let the selected aperture and time affect the brightness model. Assisted operation keeps a digital aiming view available for the Apollo camera. The source is already a digital image: moving a virtual shutter dial cannot recreate motion that the source never recorded.'}
    ],exercise:'In historical mode, compare f/5.6 at 1/250 s with f/8 at 1/125 s. These are approximately equivalent light exposures. Our model is illustrative, not a calibrated light meter.',next:'seeing'
  },
  seeing: {
    category:'The principles',kicker:'03 / Focus & framing',title:'The way you look<br />changes what you make.',
    standfirst:'A camera offers both a recording system and a way to look. Those two views are not always the same.',
    sections:[
      {title:'Focus chooses a distance',text:'Focusing adjusts the lens so a chosen subject distance is sharply imaged. Depth of field extends acceptable sharpness around that distance. In this prototype, distance-based blur assumes a flat ground plane; it cannot infer the actual depth of objects in an imported photograph.',sources:['focus']},
      {title:'One lens, two lenses, or a separate window',text:'The SX-70 is a single-lens reflex: the taking lens also supplies the view. The Rolleiflex uses a separate viewing lens. The Leica M1 has a separate bright-line finder without a coupled rangefinder. The Apollo-inspired historical view supplies only an approximate aiming guide.',sources:['polaroid','rollei','leica','nasa']},
      {title:'The crop is part of the picture',text:'This prototype exports square images for all four instruments, even though real 35 mm cameras ordinarily make rectangular frames. A finder is a way of composing, not a promise that this simulation reproduces every original camera geometry.'}
    ],exercise:'Switch between the M1 and Rolleiflex before making a frame. Notice the reversed Rolleiflex preview, then compare it with its normally oriented result.',next:'about'
  },
  about: {
    category:'About the experiment',kicker:'A curious, hands-on archive',title:'Understand the instrument.<br />Explore the possibilities.',
    standfirst:'Camera Archive is an educational prototype. It combines historical control workflows with an openly interpretative image renderer.',
    sections:[
      {title:'Start with what you have',text:'Use the included synthetic landscape, import a photograph, or start your device’s camera. A live camera requires a secure browser context and your permission. The site asks for that permission only when you press Start camera.'},
      {title:'Two ways to operate',text:'Historical mode gives the Apollo camera a simplified aiming guide. Assisted mode keeps its digital preview available. Both modes use the same illustrative brightness model. Both retain the mechanical preparation steps: unfolding, loading, developing, or advancing as appropriate.'},
      {title:'Evidence and interpretation',text:'Level A means historically documented; Level B means quantitatively calibrated within a stated domain; Level C means an approximation. The collection’s mechanical evidence labels are targets. Current film color, monochrome conversion, and grain are Level C. No camera here has a calibrated end-to-end optical and film model.'},
      {title:'What the renderer can—and cannot—teach',text:'Aperture, shutter, and focus can change the illustrative output. Focus assumes flat-ground depth, grain is independent pixel noise, and instant development is a manual step. Output is a square crop capped at 1600 pixels. Original film chemistry, measured lens response, real shutter motion blur, and DNG decoding are outside this version.'},
      {title:'Your images stay with you',text:'Capture, import, and rendering happen in your browser. The app has no image upload endpoint, account system, or analytics. Photos are kept in memory, not saved automatically. Export each photograph you want to keep; the browser may offer a share sheet or PNG and metadata downloads.'},
      {title:'A note on the objects',text:'The instrument portraits are original schematic illustrations, not product photographs or exact replicas. Camera and manufacturer names identify historical subjects; they do not imply endorsement. External reading opens third-party sites with their own privacy practices.'}
    ],exercise:'Start with assisted operation and the demo scene. Once the controls feel familiar, explore historical operation and read the camera’s field guide.',next:'history'
  }
};
