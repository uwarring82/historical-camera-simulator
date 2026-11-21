// Anchors use the full source photograph, measured from its upper left. The two
// rails keep the labels operable even where adjacent rings are only millimetres apart.
// Slots run top-to-bottom on the left (0–2) and right (3–5).
const layouts = {
  apollo:{
    shutter:[.325,.44,0], aperture:[.358,.44,1], focus:[.392,.44,2],
    magazine:[.65,.30,3], release:[.405,.70,5,'front face, out of view']
  },
  leica:{
    advance:[.337,.217,0], release:[.263,.247,1], shutter:[.408,.220,3],
    focus:[.552,.469,4], aperture:[.632,.594,5]
  },
  rolleiflex:{
    advance:[.14,.53,0,'crank on far side'], shutter:[.18,.48,1],
    release:[.20,.78,2], aperture:[.395,.49,3], focus:[.70,.49,4]
  },
  sx70:{
    focus:[.249,.550,0], release:[.192,.605,1], load:[.353,.799,2],
    'toggle-fold':[.493,.191,3], compensation:[.511,.606,4]
  }
};
const ns = 'http://www.w3.org/2000/svg';
const table = document.getElementById('camera-table');
const photo = document.getElementById('body-image');
const drawing = document.getElementById('part-leaders');
let nodes = [], scheduled = 0;

function trace() {
  scheduled = 0;
  if (!photo.naturalWidth || !photo.complete) return;
  const box = table.getBoundingClientRect(), frame = photo.getBoundingClientRect();
  const scale = Math.min(frame.width/photo.naturalWidth,frame.height/photo.naturalHeight);
  const w = photo.naturalWidth*scale, h = photo.naturalHeight*scale;
  const x0 = frame.left-box.left+(frame.width-w)/2, y0 = frame.top-box.top+(frame.height-h)/2;
  for (const node of nodes) {
    const {control,anchor,line,dot} = node;
    if (!anchor) continue;
    const [x,y,slot] = anchor, r = control.getBoundingClientRect();
    const startX = (slot < 3 ? r.right : r.left)-box.left, startY = r.top-box.top+r.height/2;
    const endX = x0+x*w, endY = y0+y*h;
    node.x = endX;node.y = endY;
    line.setAttribute('points',`${startX},${startY} ${startX+(endX-startX)*.25},${startY} ${endX},${endY}`);
    dot.setAttribute('cx',endX);dot.setAttribute('cy',endY);
  }
}
function schedule() { if (!scheduled) scheduled=requestAnimationFrame(trace); }
new ResizeObserver(schedule).observe(table);
photo.addEventListener('load',schedule);

export function mountBodyControls(id, figure, folded) {
  if (photo.getAttribute('src') !== figure.src) photo.src = figure.src;
  photo.alt = figure.alt;
  const closedImage = folded && id === 'sx70' && figure.src.includes('folded');
  const layout = layouts[id];
  drawing.replaceChildren();
  nodes = [...table.querySelectorAll('[data-part]')].map(control=>{
    const name = control.dataset.part, anchor = layout[name];
    const slot = anchor[2];
    control.style.setProperty('--slot',slot%3);
    control.dataset.side = slot < 3 ? 'left' : 'right';
    if (anchor[3]) control.title = anchor[3];
    // A stowed shutter housing covers the lens and exposure controls.
    if (closedImage && name!=='toggle-fold') return {control};
    const target = closedImage ? [.59,.39,slot] : anchor;
    const group = document.createElementNS(ns,'g'), line = document.createElementNS(ns,'polyline'), dot = document.createElementNS(ns,'circle');
    group.dataset.partName = name;
    if (anchor[3]) group.setAttribute('class','obscured');
    dot.setAttribute('r','3.6');group.append(line,dot);drawing.append(group);
    function light(on) {group.classList.toggle('selected',on);}
    control.onpointerenter=()=>light(true);control.onpointerleave=()=>light(control.matches(':focus-within'));
    control.onfocusin=()=>light(true);control.onfocusout=()=>light(false);
    return {control,anchor:target,line,dot};
  });
  schedule();
}

// The same control can be operated at its photographed part or at the larger
// callout. Nearby lens rings share very little space on a phone.
let gesture = null;
table.addEventListener('pointerdown',event=>{
  if (event.button !== 0 || event.target.closest('[data-part]') || gesture) return;
  const rect=table.getBoundingClientRect(), x=event.clientX-rect.left, y=event.clientY-rect.top;
  let nearest, distance = 17;
  for (const node of nodes) {
    if (!node.anchor || node.anchor[3]) continue;
    const d=Math.hypot(x-node.x,y-node.y);
    if (d < distance) {nearest=node;distance=d;}
  }
  if (!nearest) return;
  const field=nearest.control.matches('button') ? nearest.control : nearest.control.querySelector('input,button');
  if (field.disabled) return;
  event.preventDefault();field.focus({preventScroll:true});
  gesture={pointer:event.pointerId,field,x:event.clientX,y:event.clientY,start:Number(field.value)};
  table.setPointerCapture(event.pointerId);
});
table.addEventListener('pointermove',event=>{
  if (gesture?.pointer!==event.pointerId || gesture.field.type!=='range') return;
  const {field,x,y,start}=gesture, dx=event.clientX-x, dy=y-event.clientY;
  const next=Math.max(Number(field.min),Math.min(Number(field.max),start+Math.round((Math.abs(dx)>=Math.abs(dy)?dx:dy)/12)));
  if (next!==Number(field.value)) {field.value=next;field.dispatchEvent(new Event('input',{bubbles:true}));}
});
table.addEventListener('pointerup',event=>{
  if (gesture?.pointer!==event.pointerId) return;
  const {field,x,y}=gesture;gesture=null;
  if (field.type==='button' && Math.hypot(event.clientX-x,event.clientY-y)<12) field.click();
});
table.addEventListener('lostpointercapture',()=>{gesture=null;});
