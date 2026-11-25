import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import {legacyTheoryDestination,theoryHref} from '../learning-materials/tinklai/tyrimas/entry-routing.mjs';
import {renderTheory} from '../learning-materials/tinklai/tyrimas/learning-ui.mjs';
import {MISSIONS} from '../learning-materials/tinklai/tyrimas/missions.mjs';
const root=new URL('../',import.meta.url);
const canonical='learning-materials/kompiuteriu-tinklai-teorija.html';
const reference='learning-materials/kompiuteriu-tinklai-atmintine.html';
const read=p=>readFileSync(new URL(p,root),'utf8');

test('Existing lesson URL opens the laboratory directly with local assets and a theory reference',()=>{
 for(const page of [canonical,'learning-materials/tinklai/tyrinejimas.html']){
  const html=read(page),url=new URL(page,root);
  assert.match(html,/id="lab-navigation"/);
  assert.match(html,/id="stage-content"/);
  assert.match(html,/connect-src 'none'/);
  assert.doesNotMatch(html,/http-equiv="refresh"/);
  for(const [,asset] of html.matchAll(/(?:src|href)="([^"#][^"]*)"/g)){
   const resolved=new URL(asset,url);
   assert.ok(existsSync(fileURLToPath(resolved)),page+': '+asset);
  }
  const back=html.match(/class="back-link" href="([^"]+)"/)[1];
  assert.equal(new URL(back,url).href,new URL(reference,root).href);
  assert.match(html,/Teorijos atmintinė/);
 }
});

test('All activity theory links reach their full lesson from either entry URL',()=>{
 const html=read(reference);
 for(const mission of MISSIONS){
  const container={innerHTML:''};renderTheory(container,{mission});
  const expected=theoryHref(mission.lesson);
  assert.ok(container.innerHTML.includes('href="'+expected+'"'));
  const destination=new URL(expected);
  assert.equal(destination.pathname,new URL(reference,root).pathname);
  assert.equal(destination.hash,'#pamoka-'+mission.lesson);
  assert.ok(html.includes('id="pamoka-'+mission.lesson+'"'));
 }
});

test('Old lesson, practice, laboratory and named bookmarks preserve their destination and origin',()=>{
 const fragments=['dns','tinklo-esme','iranga','paketai','ip','protokolai','sauga','diagnostika','veiklos','savikontrole','atmintine','ivadas','saltiniai','teorija','praktika','laboratorijos','pasitikrink','lab-a','lab-b','lab-c','klausimas-24'];
 for(let n=1;n<=6;n++){fragments.push('pamoka-'+n);for(let task=1;task<=3;task++)fragments.push('praktika-'+n+'-'+task)}
 for(const origin of ['https://ngg-informatika.lt','http://127.0.0.1:4179']){
  for(const hash of fragments){
   const result=new URL(legacyTheoryDestination(origin+'/'+canonical+'#'+hash));
   assert.equal(result.origin,origin);
   assert.equal(result.pathname,'/'+reference);
   assert.equal(result.hash,'#'+hash);
  }
 }
});

test('New activities, empty and malformed fragments stay in the laboratory',()=>{
 for(const fragment of ['',...MISSIONS.map(m=>m.id),'activity','%E0%A4%A','https://example.test','pamoka-99']){
  assert.equal(legacyTheoryDestination('https://ngg-informatika.lt/'+canonical+'#'+fragment),null);
 }
 assert.equal(legacyTheoryDestination('https://ngg-informatika.lt/'+reference+'#pamoka-1'),null);
 assert.equal(legacyTheoryDestination('https://ngg-informatika.lt/learning-materials/tinklai/tyrinejimas.html#dns'),null);
});

test('Reference returns to the primary laboratory and generator only rebuilds the reference',()=>{
 const html=read(reference);
 assert.match(html,/<title>Kompiuterių tinklų teorijos atmintinė/);
 assert.match(html,/href="kompiuteriu-tinklai-teorija.html">← Grįžti/);
 assert.doesNotMatch(html,/href="tinklai\/tyrinejimas.html/);
 const generator=read('scripts/build-network-content.mjs');
 assert.ok(generator.includes(reference));
 assert.ok(!generator.includes(canonical));
});
