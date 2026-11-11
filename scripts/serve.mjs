import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import path from 'node:path';
const root=path.resolve(process.env.SITE_ROOT || '.');
const port=Number(process.env.PORT||5173);
const types={'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'text/javascript; charset=utf-8','.mjs':'text/javascript; charset=utf-8','.json':'application/json','.webmanifest':'application/manifest+json','.svg':'image/svg+xml','.png':'image/png'};
createServer(async(req,res)=>{
  const url=new URL(req.url,'http://localhost');
  const route=decodeURIComponent(url.pathname);
  const filename=route==='/'?'index.html':route.slice(1);
  let file=path.resolve(root,filename);
  if(!file.startsWith(root+path.sep) && file!==path.join(root,'index.html')) {res.writeHead(403);res.end('Forbidden');return;}
  if(root===path.resolve('.') && (filename==='sw.js'||filename==='manifest.webmanifest'||filename==='demo-scene.svg'||filename==='demo-scene.png'||filename.startsWith('icons/'))) file=path.resolve(root,'public',filename);
  try { const info=await stat(file);if(!info.isFile())throw new Error('not a file');const body=await readFile(file);
    res.writeHead(200,{'Content-Type':types[path.extname(file)]||'application/octet-stream','Cache-Control':'no-store','X-Content-Type-Options':'nosniff'});res.end(body);
  } catch { res.writeHead(404,{'Content-Type':'text/plain'});res.end('Not Found'); }
}).listen(port,'0.0.0.0',()=>console.log(`Camera Archive: http://localhost:${port} (iPhone requires HTTPS deployment)`));
