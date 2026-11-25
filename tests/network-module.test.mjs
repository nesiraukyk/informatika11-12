import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync, existsSync} from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {createRequire} from 'node:module';
import vm from 'node:vm';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
// Git may check text out with CRLF on Windows; compare the same theory across platforms.
const read=name=>readFileSync(path.join(root,name),'utf8').replace(/\r\n/g,'\n');
const require=createRequire(import.meta.url);
const C=require('../learning-materials/tinklai/core.js');
const context=vm.createContext({window:{}});
for(const file of ['content.js','activities.js'])vm.runInContext(read('learning-materials/tinklai/'+file),context);
const plain=value=>JSON.parse(JSON.stringify(value));
const bank=plain(context.window.NGG_NETWORK_CONTENT);
const specs=plain(context.window.NGG_NETWORK_ACTIVITIES);
const open=plain(context.window.NGG_NETWORK_OPEN_CRITERIA);
const full=C.required.map(edge=>({...edge}));

test('All six lessons, 18 activities and 30 supplied questions survive conversion',()=>{
 assert.equal(bank.lessons.length,6);assert.equal(bank.activities.length,18);assert.equal(bank.questions.length,30);
 assert.equal(bank.questions.filter(q=>q.options).length,24);
 assert.equal(bank.questions.filter(q=>!q.options).length,6);
 assert.equal(bank.activities.reduce((n,a)=>n+a.points,0),54);
 assert.equal(bank.questions.reduce((n,q)=>n+q.points,0),36);
 for(const l of bank.lessons){assert.ok(l.html.length>600);assert.ok(l.reflection);assert.ok(l.goals.length>=2);assert.ok(l.terms.length>=4)}
 const source=read('learning-materials/tinklai/medziaga.md').replace(/\r/g,'');
 for(const activity of bank.activities){assert.ok(source.includes(activity.title));assert.ok(source.includes(activity.prompt));assert.equal(specs[activity.id].criteria.length,3)}
 for(const q of bank.questions){assert.ok(source.includes(q.prompt),`Question ${q.id} missing from source`);if(q.options)for(const option of q.options)assert.ok(source.includes(option));else assert.equal(open[q.id].length,2)}
});

test('24 self-check answers match the supplied teacher key, including balanced distribution',()=>{
 const expected='B D A C B A D C D B A C C A D B A D B C A D B C'.split(' ');
 assert.deepEqual(bank.questions.slice(0,24).map(q=>String.fromCharCode(65+q.correct)),expected);
 for(const letter of ['A','B','C','D'])assert.equal(expected.filter(x=>x===letter).length,6);
});

test('A complete LAN works; disconnecting the provider preserves local printing',()=>{
 const on=C.checkNetwork(full);assert.equal(on.complete,true);assert.equal(on.internet,true);assert.equal(on.printer,true);assert.equal(on.phone,true);
 const off=C.checkNetwork(full,false);assert.equal(off.internet,false);assert.equal(off.printer,true);assert.equal(off.phone,true);assert.equal(off.complete,true);
 assert.equal(C.reachable(full,'pc1','pc2',false),true);
 assert.deepEqual(C.required,full,'The model must not mutate the reference topology');
});

test('Every missing cable or Wi-Fi edge is detected; link orientation is irrelevant',()=>{
 for(let i=0;i<full.length;i++){const result=C.checkNetwork(full.filter((_,j)=>i!==j));assert.equal(result.complete,false);assert.equal(result.missing.length,1)}
 assert.equal(C.checkNetwork(full.map(e=>({a:e.b,b:e.a,type:e.type}))).complete,true);
 assert.equal(C.checkNetwork([]).printer,false);assert.equal(C.checkNetwork([]).internet,false);
});

test('Wrong interface, wrong medium and unknown connections never create a valid route',()=>{
 for(const e of [{a:'isp',b:'lan',type:'wire'},{a:'ap',b:'phone',type:'wire'},{a:'switch',b:'pc1',type:'wifi'},{a:'pc1',b:'pc1',type:'wire'},{a:'unknown',b:'printer',type:'wire'}]){
  assert.equal(C.edgeValid(e),false);assert.equal(C.checkNetwork([e]).complete,false);assert.equal(C.checkNetwork([e]).invalid.length,1);
 }
 const cut=full.filter(e=>e.b!=='printer');cut.push({a:'pc1',b:'printer',type:'wifi'});
 assert.equal(C.checkNetwork(cut).printer,false);
});

test('IPv4 syntax rejects malformed, ambiguous and out-of-range input',()=>{
 for(const ip of ['0.0.0.0','255.255.255.255','192.168.10.13',' 10.0.0.1 '])assert.ok(C.parseIPv4(ip),ip);
 for(const ip of ['','192.168.256.1','192.168.-1.1','192.168.1','1.2.3.4.5','01.2.3.4','1.2.3.4x','1.2. 3.4','1e2.0.0.1','2001:db8::10','1.2.3.4\n5'])assert.equal(C.parseIPv4(ip),null,ip);
});

test('Private address ranges have correct boundaries; documentation addresses are not private',()=>{
 for(const ip of ['10.0.0.0','10.255.255.255','172.16.0.0','172.31.255.255','192.168.0.0','192.168.255.255'])assert.equal(C.isPrivate(ip),true,ip);
 for(const ip of ['9.255.255.255','11.0.0.0','172.15.255.255','172.32.0.0','192.169.0.0','198.51.100.24','203.0.113.9','192.168.256.1'])assert.equal(C.isPrivate(ip),false,ip);
});

test('C must be a unique LAN host, never the gateway, network or broadcast address',()=>{
 for(const suffix of [0,1,11,12,20,255,256])assert.equal(C.validateC('192.168.10.'+suffix).ok,false,String(suffix));
 for(const ip of ['192.168.11.13','10.0.0.13','192.168.10.013','bad'])assert.equal(C.validateC(ip).ok,false,ip);
 for(const suffix of [2,13,19,21,254])assert.equal(C.validateC('192.168.10.'+suffix).ok,true,String(suffix));
 assert.equal(C.validateC(C.dhcpAddress()).ok,true);assert.notEqual(C.dhcpAddress(),'192.168.10.12');
});

test('All four diagnostic scenarios support all five commands without real network access',()=>{
 for(const id of ['cable','provider','dns','website'])for(const [cmd,label] of C.commands){const out=C.diagnostic(id,cmd);assert.ok(out.startsWith('MOKOMOJI SIMULIACIJA'));assert.ok(out.includes(label));assert.ok(out.length>100)}
 assert.throws(()=>C.diagnostic('actual-network','ipconfig'));
 assert.throws(()=>C.diagnostic('dns','arbitrary shell command'));
 assert.match(C.diagnostic('cable','ipconfig'),/disconnected/);
 assert.match(C.diagnostic('provider','gateway'),/Received = 4/);
 assert.match(C.diagnostic('provider','external'),/Received = 0/);
 assert.match(C.diagnostic('dns','external'),/Received = 4/);
 assert.match(C.diagnostic('dns','dns'),/timed out/);
 assert.match(C.diagnostic('website','dns'),/Name:    mokykla.example/);
 assert.match(C.diagnostic('website','external'),/Received = 4/);
 assert.match(C.diagnostic('website','route'),/\*[\s\S]*Trace complete/);
});

// Independent expected choices, transcribed from the supplied teaching material.
const examples={
 '1.1':['LAN','WAN','Internetas'],'1.2':['Ethernet','Bluetooth','4G/5G'],
 '1.3':['Komutatorius','Komutatorius','Komutatorius','Komutatorius','Komutatorius','Taip','Taip'],
 '2.1':['Komutatorius','Maršrutizatorius','Prieigos taškas'],'2.3':[['D','B','C'],'B'],
 '3.1':['192.168.256.1',['192.168.10.12','10.0.0.8','172.20.5.4'],'Taip'],
 '3.2':['B ir C','192.168.10.13'],'3.3':['2','Pakartotinai siųsti trūkstamą dalį','1–2–3'],
 '4.1':['HTTPS','BIBLIOTEKA.EXAMPLE','/katalogas/knygos','id=42','aprasymas'],'4.3':['B'],
 '5.1':['SMTP','IMAP4','FTPS'],'5.2':['SMTP','SMTP','IMAP'],
 '5.3':['Atmesti užklausą','Netęsti ir patikrinti adresą / pranešti atsakingam asmeniui','Tinkamai sukonfigūruotas FTPS'],
 '6.1':['192.168.10.15','192.168.10.1','Privatus'],
 '6.2':['Šliuzas atsako į ICMP','DNS nustatymai arba paslauga','DNS konfigūraciją ir nslookup']
};
for(const [id,answers] of Object.entries(examples))test(`Practice ${id}: correct and wrong objective answers`,()=>{
 const result=C.practiceCheck(specs[id],answers);assert.equal(result.length,answers.length);assert.ok(result.every(r=>r.ok));
 assert.ok(C.practiceCheck(specs[id],answers.map(a=>Array.isArray(a)?[]:'incorrect')).every(r=>!r.ok));
 for(const field of specs[id].fields){if(field.options){const expected=Array.isArray(field.answer)?field.answer:[field.answer];for(const value of expected)assert.ok(field.options.includes(value))}}
});

test('Open practice 2.2 and 6.3 use three semantic criteria, never exact-string scoring',()=>{
 for(const id of ['2.2','6.3']){assert.equal(C.practiceCheck(specs[id],['any wording']).length,0);assert.equal(specs[id].criteria.length,3);assert.ok(specs[id].explain);assert.ok(specs[id].lab)}
});

test('URL scheme and host ignore case; path, query and fragment preserve it',()=>{
 const wrong=['https','biblioteka.example','/Katalogas/knygos','ID=42','Aprasymas'];
 assert.deepEqual(C.practiceCheck(specs['4.1'],wrong).map(r=>r.ok),[true,true,false,false,false]);
 assert.equal(C.matches(['B','B','C'],['B','C','D']),false);
 assert.equal(C.matches(['D','C','B'],['B','C','D']),true);
});

test('Practice 4.2 awards 2 for full order, 1 only for one adjacent swap, otherwise 0',()=>{
 const right=['D','B','F','C','A','E'];assert.equal(C.sequenceScore(right),2);
 for(let i=0;i<5;i++){const a=[...right];[a[i],a[i+1]]=[a[i+1],a[i]];assert.equal(C.sequenceScore(a),1)}
 for(const a of [[],['D','B','F'],['D','B','F','C','A','A'],['E','B','F','C','A','D'],['B','D','C','F','A','E']])assert.equal(C.sequenceScore(a),0);
});

test('Random quizzes contain ten distinct closed questions and do not mutate the bank',()=>{
 const before=JSON.stringify(bank.questions),picked=C.pick(bank.questions,10,()=>0.37);
 assert.equal(picked.length,10);assert.equal(new Set(picked.map(q=>q.id)).size,10);assert.ok(picked.every(q=>q.options));
 assert.equal(JSON.stringify(bank.questions),before);assert.equal(C.pick(bank.questions,24).length,24);
 assert.equal(C.pick([],10).length,0);
});

test('Quiz score handles perfect, zero, partial and unanswered attempts',()=>{
 const questions=bank.questions.slice(0,10),answers=Object.fromEntries(questions.map(q=>[q.id,q.correct]));
 assert.deepEqual(C.score(questions,answers),{correct:10,total:10,percent:100,wrong:[],lessons:[]});
 assert.equal(C.score(questions,{}).percent,0);
 delete answers[1];answers[5]=(questions[4].correct+1)%4;
 const partial=C.score(questions,answers);assert.equal(partial.correct,8);assert.equal(partial.percent,80);assert.deepEqual(partial.lessons,[1,2]);
 assert.equal(C.score([],{}).percent,0);
 assert.equal(C.score([questions[0]],{1:String(questions[0].correct)}).correct,0);
});

test('Theory reference retains complete theory, local assets and network isolation',()=>{
 const html=read('learning-materials/kompiuteriu-tinklai-atmintine.html');
 assert.match(html,/<html lang="lt">/);assert.match(html,/connect-src 'none'/);
 const ids=[...html.matchAll(/\bid="([^"]+)"/g)].map(m=>m[1]);assert.equal(new Set(ids).size,ids.length);
 for(const l of bank.lessons){assert.ok(html.includes(l.html));assert.ok(ids.includes('pamoka-'+l.number))}
 for(const section of ['teorija','praktika','laboratorijos','pasitikrink','lab-a','lab-b','lab-c'])assert.ok(ids.includes(section));
 for(const m of html.matchAll(/(?:src|href)="(tinklai\/[^"?#]+)(?:[?#][^" ]*)?"/g))assert.ok(existsSync(path.join(root,'learning-materials',m[1])));
 const active=read('learning-materials/tinklai/module.js')+read('learning-materials/tinklai/core.js');
 assert.doesNotMatch(active,/\b(fetch|XMLHttpRequest|WebSocket|RTCPeerConnection|eval)\s*\(/);
 assert.doesNotMatch(active,/localStorage|sessionStorage|supabase|service_role|child_process/);
 assert.doesNotMatch(html,/mokytojo_atsakymai|supabase|app\.js|config\.js/);
 assert.equal(html.includes('\uFFFD'),false);assert.equal(active.includes('\uFFFD'),false);
});
