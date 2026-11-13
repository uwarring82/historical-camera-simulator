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
 await page.locator('[data-camera="sx70"]').click();
 await expect(page.locator('#shutter')).toBeDisabled();
 await page.getByRole('button',{name:'Unfold camera'}).click();
 await page.getByRole('button',{name:'Insert 10-frame pack'}).click();
 await expect(page.locator('#shutter')).toBeEnabled();
 await page.locator('#shutter').click();
 await expect(page.locator('#mechanical-status')).toContainText('DEVELOPING');
 await expect(page.locator('#shutter')).toBeDisabled();
 await page.getByRole('button',{name:'Complete development',exact:true}).click();
 await expect(page.locator('#shutter')).toBeEnabled();
});
test('dials update exposure and magazine latch controls readiness', async({page}) => {
 await page.goto('/studio.html');
 const dial = page.getByRole('slider',{name:'Lens aperture',exact:true});
 await dial.focus(); await dial.press('End');
 await expect(dial).toHaveAttribute('aria-valuetext','f/8');
 await expect(page.locator('[data-control="aperture"] .dial-value')).toContainText('8');
 await expect(page.locator('#shutter-hint')).toHaveAttribute('data-ev','-1.03');
 const latch = page.getByRole('button',{name:'Film magazine loaded'});
 await latch.click(); await expect(page.locator('#shutter')).toBeDisabled();
 await expect(latch).toHaveAttribute('aria-pressed','false');
 await latch.click(); await expect(page.locator('#shutter')).toBeEnabled();
 await page.locator('#shutter').click();
 await expect(page.locator('#feedback')).toContainText('f/8');
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
 const types = {'.html':'text/html','.css':'text/css','.mjs':'text/javascript','.js':'text/javascript','.svg':'image/svg+xml','.png':'image/png','.webmanifest':'application/manifest+json'};
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
