import { createHash } from 'node:crypto';
import { cp, mkdir, readFile, readdir, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';

const out = 'dist';
const pages = ['index.html', 'studio.html', 'learn.html'];
const styles = ['styles.css', 'studio.css'];
await rm(out, {recursive: true, force: true});
await mkdir(out, {recursive: true});
await cp('public', out, {recursive: true});
await cp('src', path.join(out, 'src'), {recursive: true});

const modules = (await readdir('src', {recursive: true})).filter(name => name.endsWith('.mjs')).sort()
  .map(name => path.join('src', name));
const hash = createHash('sha256');
for (const name of [...pages, ...styles, ...modules, 'public/sw.js']) {
  hash.update(name).update('\0').update(await readFile(name)).update('\0');
}
const revision = hash.digest('hex').slice(0, 16);

// A page and its entire module graph must share the same browser-cache identity.
for (const name of pages) {
  const page = await readFile(name, 'utf8');
  const versioned = page.replace(/((?:src|href)="\.\/[^"]+\.(?:mjs|css))"/g, '$1?v=' + revision + '"');
  await writeFile(path.join(out, name), versioned);
}
for (const name of modules) {
  const code = await readFile(name, 'utf8');
  const versioned = code.replace(/((?:from\s+|import\s*)['"]\.[^'"\n]+\.mjs)(['"])/g, '$1?v=' + revision + '$2');
  await writeFile(path.join(out, name), versioned);
}
for (const name of styles) await cp(name, path.join(out, name));
const worker = await readFile('public/sw.js', 'utf8');
await writeFile(path.join(out, 'sw.js'), worker.replace("const REVISION = '';", "const REVISION = '" + revision + "';"));

const manifest = JSON.parse(await readFile(path.join(out, 'manifest.webmanifest'), 'utf8'));
if (!manifest.name) throw new Error('Invalid web manifest');
const {version} = JSON.parse(await readFile('package.json', 'utf8'));
await writeFile(path.join(out, 'BUILD_INFO.json'), JSON.stringify({
  version, source: 'static-es-modules', revision, createdAt: new Date().toISOString()
}, null, 2) + '\n');
console.log('Built static site in dist/ (' + revision + ')');
