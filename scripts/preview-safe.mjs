// Network module only. Never serves application config, student data, or teacher files.
import http from 'node:http';
import {readFile} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const page='learning-materials/kompiuteriu-tinklai-teorija.html';
const allowed=new Set([page,'learning-materials/kompiuteriu-tinklai-atmintine.html','learning-materials/and-or-not-teorija.html',...['module.css','module.js','core.js','content.js','activities.js'].map(n=>'learning-materials/tinklai/'+n)]);
const inquiryAssets=['entry-routing.mjs','devices.mjs','engine.mjs','missions.mjs','assessment.mjs','progress.mjs','icons.mjs','animations.mjs','network-ui.mjs','learning-ui.mjs','app.mjs','studio.css','fixtures.mjs','content-helpers.mjs','builder-missions.mjs','packet-missions.mjs','ip-missions.mjs','packet-engine.mjs','packet-ui.mjs','ip-ui.mjs','restore.mjs','theory-visuals.mjs'];
allowed.add('learning-materials/tinklai/tyrinejimas.html');
inquiryAssets.forEach(name=>allowed.add('learning-materials/tinklai/tyrimas/'+name));
const mime={'.html':'text/html','.js':'text/javascript','.mjs':'text/javascript','.css':'text/css'};
const server=http.createServer(async(req,res)=>{
 if(req.url==='/'){res.writeHead(302,{Location:'/'+page});res.end();return}
 let name;try{name=decodeURIComponent(new URL(req.url,'http://127.0.0.1').pathname).slice(1)||page}catch{res.writeHead(400);res.end('Invalid path');return}
 if(!allowed.has(name)){res.writeHead(404);res.end('Not available in this isolated module preview');return}
 try{const file=await readFile(path.join(root,name));res.writeHead(200,{'Content-Type':mime[path.extname(name)]+'; charset=utf-8','Cache-Control':'no-store','Content-Security-Policy':"default-src 'self'; connect-src 'none'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; object-src 'none'; base-uri 'none'; frame-src 'none'; form-action 'none'"});res.end(file)}catch{res.writeHead(500);res.end('Could not read preview resource')}
});
server.listen(4179,'127.0.0.1',()=>console.log('Isolated network module: http://127.0.0.1:4179/'+page));
process.on('SIGINT',()=>server.close(()=>process.exit(0)));
