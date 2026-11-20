const { test, expect } = require('@playwright/test');
const { createServer } = require('node:http');
const { readFile } = require('node:fs/promises');
const path = require('node:path');
test('entrance introduces the collection and links the selected instrument to the studio', async({page}) => {
 await page.goto('/');
 await expect(page.getByRole('heading', {level:1})).toContainText('Old cameras.');
 await expect(page.locator('.collection-card')).toHaveCount(4);
 await page.getByRole('button', {name:'SX-70', exact:true}).click();
 await expect(page.locator('#hero-camera-name')).toHaveText('Polaroid SX-70');
 await page.getByLabel('Explore the Polaroid SX-70').click();
 await expect(page.getByRole('heading', {level:1})).toContainText('moment appear');
 await page.getByRole('link', {name:'Open SX-70 in the studio'}).click();
 await expect(page.locator('#active-camera-name')).toHaveText('Polaroid SX-70');
 await expect(page.locator('#shutter')).toBeDisabled();
});
test('aperture demonstration responds to keyboard input', async({page}) => {
 await page.goto('/');
 const slider = page.locator('#aperture-demo');
 await slider.focus(); await slider.press('End');
 await expect(page.locator('#aperture-demo-value')).toHaveText('f/16');
 await expect(slider).toHaveAttribute('aria-valuetext','f/16');
 await expect(page.locator('#aperture-demo-info')).toContainText('½ the light');
});
test('four cameras selectable, default Apollo exposes demo',async({page})=>{
 await page.goto('/studio.html');
 await expect(page.locator('.camera-option')).toHaveCount(4);
 await expect(page.locator('#active-camera-name')).toHaveText('Apollo 17 Hasselblad');
 await page.locator('#shutter').click();
 await expect(page.locator('#photo-canvas')).toBeVisible();
 await expect(page.locator('#export')).toBeEnabled();
});
test('SX-70 cannot expose until unfolded and loaded',async({page})=>{
 await page.goto('/studio.html');
 await page.locator('.camera-option[data-camera="sx70"]').click();
 await expect(page.locator('#shutter')).toBeDisabled();
 await page.getByRole('button',{name:'Unfold camera'}).click();
 await page.getByRole('button',{name:'Insert 8-frame pack'}).click();
 await expect(page.locator('#shutter')).toBeEnabled();
 await page.locator('#shutter').click();
 await expect(page.locator('#mechanical-status')).toContainText('7 FRAMES LEFT');
 await expect(page.locator('#shutter')).toBeEnabled();
});
test('dials update exposure and magazine latch controls readiness', async({page}) => {
 await page.goto('/studio.html');
 const dial = page.getByRole('slider',{name:'Lens aperture',exact:true});
 await dial.focus(); await dial.press('ArrowRight');
 await expect(dial).toHaveAttribute('aria-valuetext','f/8');
 await expect(page.locator('[data-control="aperture"] .dial-value')).toContainText('8');
 await expect(page.locator('#shutter-hint')).toHaveAttribute('data-ev','-1.67');
 const latch = page.getByRole('button',{name:'Film magazine loaded'});
 await latch.click(); await expect(page.locator('#shutter')).toBeDisabled();
 await expect(latch).toHaveAttribute('aria-pressed','false');
 await latch.click(); await expect(page.locator('#shutter')).toBeEnabled();
 await page.locator('#shutter').click();
 await expect(page.locator('#shutter-hint')).toContainText('f/8');
});
test('mechanical cameras need film advance between exposures', async({page}) => {
 for (const camera of ['leica','rolleiflex']) {
  await page.goto(`/studio.html?camera=${camera}`);
  await expect(page.locator(`[data-camera="${camera}"].camera-option`)).toHaveAttribute('aria-pressed','true');
  await page.locator('#shutter').click();
  await expect(page.locator('#shutter')).toBeDisabled();
  await page.getByRole('button',{name:'Advance film',exact:true}).click();
  await expect(page.locator('#shutter')).toBeEnabled();
 }
});
test('every field guide chapter renders without script errors', async({page}) => {
 const errors = []; page.on('pageerror',error=>errors.push(error.message));
 for (const chapter of ['history','light','exposure','seeing','about','apollo','sx70','leica','rolleiflex']) {
  await page.goto(`/learn.html?chapter=${chapter}`);
  await expect(page.locator('article h1')).toBeVisible();
  await expect(page.locator('.article-exercise')).toBeAttached();
  if (['apollo','sx70','leica','rolleiflex'].includes(chapter)) await expect(page.locator('.spec-table')).toBeVisible();
 }
 expect(errors).toEqual([]);
});
test('pages fit their viewport and provide readable navigation', async({page}, testInfo) => {
 for (const url of ['/','/studio.html','/learn.html?chapter=apollo']) {
  await page.goto(url);
  await expect(page.locator('main')).toBeVisible();
  expect(await page.evaluate(()=>document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.screenshot({path:testInfo.outputPath(url==='/'?'entrance.png':url.includes('studio')?'studio.png':'guide.png'),fullPage:true});
  if (url==='/') await page.screenshot({path:testInfo.outputPath('entrance-top.png')});
 }
});
test('the cached field guide opens an unvisited chapter after its origin stops', async({page}) => {
 // A real origin outage avoids WebKit's known offline-emulation fault:
 // https://github.com/microsoft/playwright/issues/42775
 const root = process.cwd();
 const types = {'.html':'text/html','.css':'text/css','.mjs':'text/javascript','.js':'text/javascript','.svg':'image/svg+xml','.png':'image/png','.jpg':'image/jpeg','.webmanifest':'application/manifest+json'};
 const server = createServer(async(req,res)=>{
  const file = new URL(req.url,'http://localhost').pathname.slice(1) || 'index.html';
  const relative = /^(sw\.js|manifest\.webmanifest|demo-scene\.|icons\/)/.test(file) ? path.join('public',file) : file;
  const target = path.resolve(root,relative);
  if (!target.startsWith(root+path.sep)) {res.writeHead(403).end();return;}
  try { const body = await readFile(target); res.writeHead(200,{'Content-Type':types[path.extname(target)] || 'application/octet-stream'}).end(body); }
  catch { res.writeHead(404).end(); }
 });
 await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
 const origin = `http://127.0.0.1:${server.address().port}`;
 try {
  await page.goto(origin);
  await page.evaluate(()=>navigator.serviceWorker.ready);
  await page.waitForFunction(()=>Boolean(navigator.serviceWorker.controller));
  await new Promise(resolve=>{server.close(resolve);server.closeAllConnections();});
  await page.goto(`${origin}/learn.html?chapter=seeing`);
  await expect(page.locator('article h1')).toContainText('The way you look');
 } finally { if (server.listening) {server.close();server.closeAllConnections();} }
});

test('an exposed frame retains its metadata while the live finder stays available', async({page})=>{
 await page.goto('/studio.html?camera=leica');
 await page.getByLabel('Film stock').selectOption('trix400');
 await page.getByRole('button',{name:'Expose photograph'}).click();
 await expect(page.locator('#proof')).toBeVisible();
 await page.getByLabel('Film stock').selectOption('tmax100');
 await page.getByRole('button',{name:'Last frame'}).click();
 await expect(page.locator('#print-settings')).toContainText('TRI-X 400');
 await expect(page.locator('#print-image')).toBeVisible();
 await page.getByRole('button',{name:'Inspect at 100%'}).click();
 await expect(page.locator('#zoom-print')).toHaveAttribute('aria-pressed','true');
 await page.getByRole('button',{name:'Close',exact:true}).click();
 await page.getByRole('button',{name:'Rolleiflex 2.8F'}).click();
 await expect(page.locator('#media-stage')).toHaveAttribute('data-finder','rolleiflex');
});

test('all studio controls fit one viewport in portrait, landscape and on a laptop', async({page})=>{
 for(const [width,height] of [[320,568],[375,667],[390,844],[667,375],[844,390],[1024,768],[1280,720]]) {
  await page.setViewportSize({width,height});
  await page.goto('/studio.html');
  for(const name of ['Apollo 17 Hasselblad','Polaroid SX-70','Leica M1','Rolleiflex 2.8F']) {
   await page.getByRole('button',{name,exact:true}).click();
   await page.getByLabel('Rendering',{exact:true}).selectOption('creative');
   const dims=await page.evaluate(()=>[document.documentElement.scrollWidth,document.querySelector('#workbench').getBoundingClientRect().bottom]);
   expect(dims[0],name+' width '+width).toBeLessThanOrEqual(width);
   expect(dims[1],name+' height '+height).toBeLessThanOrEqual(height+1);
  }
 }
});

test('a device feed continues in the finder after release and stops when switching to the demo', async({page,browserName})=>{
 test.skip(browserName!=='chromium','The fixture uses a canvas MediaStream.');
 await page.addInitScript(()=>{
  const canvas=document.createElement('canvas');canvas.width=160;canvas.height=120;
  const ctx=canvas.getContext('2d');let color='red';
  const paint=()=>{ctx.fillStyle=color;ctx.fillRect(0,0,160,120);};
  window.setFixtureColor=value=>{color=value;paint();};
  const timer=setInterval(paint,50);paint();
  Object.defineProperty(navigator,'mediaDevices',{configurable:true,value:{
   getUserMedia:async()=>{const stream=canvas.captureStream(10);window.fixtureTrack=stream.getVideoTracks()[0];return stream;},
   enumerateDevices:async()=>[]
  }});
  Object.defineProperty(window,'ImageCapture',{configurable:true,value:undefined});
  window.addEventListener('pagehide',()=>clearInterval(timer));
 });
 await page.goto('/studio.html?camera=leica');
 await page.getByLabel('Finder',{exact:true}).selectOption('historical');
 await page.getByRole('button',{name:'Camera',exact:true}).click();
 await expect(page.locator('#viewport-label')).toContainText('Live');
 await page.getByRole('button',{name:'Expose photograph'}).click();
 await expect(page.locator('#export')).toBeEnabled();
 await page.evaluate(()=>window.setFixtureColor('blue'));
 await expect.poll(()=>page.locator('#proof').evaluate(canvas=>{
  const px=canvas.getContext('2d').getImageData(12,12,1,1).data;return px[2]>px[0];
 })).toBe(true);
 await page.getByRole('button',{name:'Demo',exact:true}).click();
 expect(await page.evaluate(()=>window.fixtureTrack.readyState)).toBe('ended');
});
