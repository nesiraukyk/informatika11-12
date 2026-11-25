import {probe,effective,prefix,privateIP} from './engine.mjs';
import {HOSTS} from './devices.mjs';

// Goals use connectivity and recorded experimental results, never self-ratings.
export function evaluateGoal(mission,state,observations=[]){
 const checks=[],check=(label,passed)=>checks.push({label,passed:Boolean(passed)});
 const hosts=state.devices.filter(d=>HOSTS.includes(d.type)),pcs=hosts.filter(d=>['pc','laptop'].includes(d.type)),printers=hosts.filter(d=>d.type==='printer');
 const seen=predicate=>observations.some(o=>o.result&&predicate(o)),net=observations.filter(o=>o.kind==='network'&&o.result),runs=observations.filter(o=>o.kind==='packets'&&o.result).map(o=>o.result);
 const id=mission.id;
 if(id==='lan-print')check('Bent trys kompiuteriai pasiekia vieną spausdintuvą',printers.some(p=>pcs.filter(d=>probe(state,d.id,p.id).ok).length>=3));
 if(id==='internet-connect'){
  check('Išliko vietinis spausdinimas',printers.some(p=>pcs.some(d=>probe(state,d.id,p.id).ok)));
  check('Kompiuteris pasiekia išorinį IP ir svetainę',pcs.some(d=>probe(state,d.id,'internet').ok&&probe(state,d.id,'website').ok));
 }
 if(id==='provider-off'){
  check('Palygintas veikiantis ir nutrūkęs išorinis ryšys',net.some(a=>a.target==='internet'&&a.result.ok&&net.some(b=>b.source===a.source&&b.target==='internet'&&b.result.code==='wan')));
  check('Patikrinta išlikusi vietinė paslauga be interneto',net.some(o=>o.result.ok&&o.target!=='internet'&&o.target!=='website'&&o.outsideAvailable===false));
 }
 if(id==='hub-compare')check('Tarp tų pačių įrenginių palyginti komutatorius ir šakotuvas',net.some(a=>a.result.ok&&a.bridges?.includes('switch')&&!a.result.flood.length&&net.some(b=>b.source===a.source&&b.target===a.target&&b.result.ok&&b.bridges?.includes('hub')&&b.result.flood.length>0)));
 if(id==='router-two-lans')check('Skirtingi /24 LAN susisiekia abiem kryptimis per atskiras sąsajas',hosts.some(a=>hosts.some(b=>a!==b&&prefix(effective(state,a)?.ip)!==prefix(effective(state,b)?.ip)&&probe(state,a.id,b.id).routed&&probe(state,b.id,a.id).routed)));
 if(id==='wifi-bridge')check('Belaidis klientas per AP pasiekia laidinį spausdintuvą',hosts.filter(d=>['phone','laptop'].includes(d.type)).some(d=>printers.some(p=>{const r=probe(state,d.id,p.id);return r.ok&&state.links.some(e=>e.medium==='wifi'&&r.path.includes(e.a)&&r.path.includes(e.b))})));
 if(id==='partial-internet'){
  check('Dalis LAN klientų gali spausdinti, bet neturi interneto',pcs.some(a=>!probe(state,a.id,'internet').ok&&printers.some(p=>probe(state,a.id,p.id).ok)&&pcs.some(b=>b!==a&&probe(state,b.id,'internet').ok)));
  check('Atliktos ir palygintos abiejų klientų išorinio ryšio patikros',net.some(a=>a.target==='internet'&&a.result.ok&&net.some(b=>b.source!==a.source&&b.target==='internet'&&!b.result.ok)));
 }
 const comparable=(a,b)=>a.original===b.original&&a.original.length>6&&a.latency===b.latency&&a.drop===b.drop&&a.reorder===b.reorder&&a.routeA===b.routeA&&a.routeB===b.routeB;
 if(id==='packets-clean')check('Visa žinutė pristatyta be praradimo, eiliškumo ar kelių sutrikimų',runs.some(r=>r.ok&&r.drop===0&&!r.reorder&&!r.everBroken&&r.retries===0));
 if(id==='packets-loss')check('Ta pati prarasta dalis palyginta TCP ir UDP bandymuose',runs.some(a=>a.protocol==='TCP'&&a.ok&&a.retries>0&&a.drop>0&&a.injected&&runs.some(b=>b.protocol==='UDP'&&!b.ok&&b.lost>0&&b.injected&&comparable(a,b))));
 if(id==='packets-order')check('Palyginta netvarkinga atvykimo seka ir TCP / UDP išvestis',runs.some(a=>a.protocol==='TCP'&&a.ok&&a.reorder&&a.arrival[0]!==1&&a.drop===0&&runs.some(b=>b.protocol==='UDP'&&!b.ok&&b.lost===0&&b.arrival[0]!==1&&comparable(a,b))));
 if(id==='packets-route'){
  check('TCP pasiekė gavėją, kai vienas kelias neveikė',runs.some(r=>r.protocol==='TCP'&&r.ok&&r.everBroken&&r.routeA!==r.routeB));
  check('Patikrinta nesėkmė, kai neveikė abu keliai',runs.some(r=>r.protocol==='TCP'&&!r.ok&&!r.routeA&&!r.routeB&&r.lost>0));
 }
 if(id==='packets-delay')check('Ta pati žinutė palyginta keičiant tik vėlavimą',runs.some(a=>a.ok&&a.latency===2&&runs.some(b=>b.ok&&b.latency===8&&a.protocol===b.protocol&&a.original===b.original&&a.drop===b.drop&&a.reorder===b.reorder&&a.routeA===b.routeA&&a.routeB===b.routeB&&b.ticks>a.ticks)));
 if(id.startsWith('ip-')&&id!=='ip-private'){
  const failureCodes={'ip-duplicate':['duplicate'],'ip-subnet':['gateway','local'],'ip-gateway':['gateway'],'ip-dns':['dns'],'ip-dhcp':['dhcp']};
  check('Užfiksuotas pradinės konfigūracijos sutrikimas',seen(o=>o.kind==='ip'&&o.source==='a'&&failureCodes[id]?.includes(o.result.code)));
  check('Tiriamas kompiuteris dabar pasiekia visus keturis taikinius',['b','router','internet','website'].every(target=>probe(state,'a',target).ok));
  if(id==='ip-dhcp')check('Gauta automatinė DHCP nuoma',state.devices.find(d=>d.id==='a')?.config.mode==='dhcp'&&state.leases.a);
 }
 if(id==='ip-private'){
  check('Privatus adresas pasiekė išorinį IP su NAT',seen(o=>o.kind==='ip'&&o.target==='internet'&&o.result.ok&&o.nat&&privateIP(o.config?.ip)));
  check('Be NAT patikrintas nutrūkęs išorinis ir išlikęs vietinis ryšys',seen(o=>o.kind==='ip'&&o.target==='internet'&&o.result.code==='nat'&&!o.nat)&&seen(o=>o.kind==='ip'&&o.target==='b'&&o.result.ok&&!o.nat));
 }
 return {passed:checks.length>0&&checks.every(c=>c.passed),checks,tested:observations.length>0};
}
export function checkAnswer(q,answer){
 if(q.type==='open')return null;
 if(Array.isArray(q.answer))return Array.isArray(answer)&&answer.length===q.answer.length&&(q.type==='multi'?new Set(answer).size===answer.length&&answer.every(v=>q.answer.includes(v)):answer.every((v,i)=>v===q.answer[i]));
 return q.type==='short'?String(answer??'').trim()===String(q.answer):answer===q.answer;
}
export function quizResult(questions,answers){const scored=questions.filter(q=>q.type!=='open'),wrong=scored.filter(q=>!checkAnswer(q,answers[q.id])),needs=[...new Set(wrong.map(q=>q.skill))];return {correct:scored.length-wrong.length,total:scored.length,percent:scored.length?Math.round(100*(scored.length-wrong.length)/scored.length):0,wrong:wrong.map(q=>q.id),strengths:[...new Set(scored.map(q=>q.skill))].filter(s=>!needs.includes(s)),needs}}
export function recommendation(percent){return percent<50?'Grįžk prie pagrindinės teorijos ir pakartok eksperimentą.':percent<80?'Pakartok konkrečius klaidų paaiškinimus ir sustiprink nurodytus gebėjimus.':percent<100?'Pagrindą supranti gerai. Pataisyk likusią spragą ir išbandyk sudėtingesnį atvejį.':'Ši savikontrolė atlikta sėkmingai. Išbandyk kitą sprendimą ar sudėtingesnę situaciją.'}
