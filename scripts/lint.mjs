import { readdir, readFile } from 'node:fs/promises';
import { spawnSync } from 'node:child_process';
const checkDirs=['src','scripts','tests'];
let files=[];
for(const dir of checkDirs) {
  for(const item of await readdir(dir,{withFileTypes:true})) {
    if(item.isFile() && /\.(mjs|cjs)$/.test(item.name)) files.push(`${dir}/${item.name}`);
  }
}
files.push('public/sw.js');
for(const file of files) {
  const check=spawnSync(process.execPath,['--check',file],{stdio:'inherit'});
  if(check.status!==0) process.exit(1);
  const content=await readFile(file,'utf8');
  if(/\beval\s*\(/.test(content)) throw new Error(`Disallowed eval in ${file}`);
}
console.log(`Checked ${files.length} JavaScript files`);
