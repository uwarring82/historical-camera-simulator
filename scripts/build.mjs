import { cp, mkdir, rm, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
const out='dist';
await rm(out,{recursive:true,force:true});await mkdir(out,{recursive:true});
for(const item of ['index.html','styles.css','src']) await cp(item,path.join(out,item),{recursive:true});
await cp('public',out,{recursive:true});
// A static site build, intentionally without runtime dependencies.
// Replace version string at build time in both app and SW when later adding a bundler.
const manifest=JSON.parse(await readFile(path.join(out,'manifest.webmanifest'),'utf8'));
if(!manifest.name) throw new Error('Invalid web manifest');
await writeFile(path.join(out,'BUILD_INFO.json'),JSON.stringify({version:'0.1.0',source:'static-es-modules',createdAt:new Date().toISOString()},null,2)+'\n');
console.log('Built static site in dist/');
