// Run after starting preview-safe.mjs. This check only contacts fixed loopback URLs.
import assert from 'node:assert/strict';
const base='http://127.0.0.1:4179';
const studioAssets=['entry-routing.mjs','app.mjs','devices.mjs','engine.mjs','fixtures.mjs','missions.mjs','builder-missions.mjs','packet-missions.mjs','ip-missions.mjs','content-helpers.mjs','assessment.mjs','progress.mjs','restore.mjs','icons.mjs','animations.mjs','network-ui.mjs','packet-engine.mjs','packet-ui.mjs','ip-ui.mjs','learning-ui.mjs','theory-visuals.mjs','studio.css'];
const assets=['learning-materials/kompiuteriu-tinklai-atmintine.html','learning-materials/tinklai/tyrinejimas.html',...studioAssets.map(n=>'learning-materials/tinklai/tyrimas/'+n),'learning-materials/kompiuteriu-tinklai-teorija.html',...['module.css','module.js','core.js','content.js','activities.js'].map(n=>'learning-materials/tinklai/'+n)];
for(const resource of assets){
 const response=await fetch(base+'/'+resource);
 assert.equal(response.status,200,resource);
 assert.ok(response.headers.get('content-security-policy').includes("connect-src 'none'"));
}
for(const resource of ['supabase-config.js','app.js','.git/config','learning-materials/tinklai/medziaga.md','NGG_11kl_Kompiuteriu_tinklai_mokytojo_atsakymai.md']){
 const response=await fetch(base+'/'+resource);assert.equal(response.status,404,resource);
}
const landing=await fetch(base+'/',{redirect:'manual'});
assert.equal(landing.status,302);
assert.equal(landing.headers.get('location'),'/learning-materials/kompiuteriu-tinklai-teorija.html');
console.log('PASS: '+assets.length+' module assets, 5 blocked paths, landing redirect and isolation headers.');
