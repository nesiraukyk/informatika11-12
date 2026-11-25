(function(root){
 'use strict';
 const nodes=[['isp','Tiekėjas'],['ont','Modemas / ONT'],['wan','Maršrutizatorius · WAN'],['lan','Maršrutizatorius · LAN'],['switch','Komutatorius'],['pc1','Kompiuteris A'],['pc2','Kompiuteris B'],['printer','Spausdintuvas'],['ap','Wi-Fi prieigos taškas'],['phone','Telefonas']].map(([id,label])=>({id,label}));
 const pair=(a,b)=>[a,b].sort().join(':');
 const required=[['isp','ont'],['ont','wan'],['lan','switch'],['lan','ap'],['switch','pc1'],['switch','pc2'],['switch','printer'],['ap','phone']].map(([a,b])=>({a,b,type:a==='ap'&&b==='phone'?'wifi':'wire'}));
 function edgeValid(e){return required.some(r=>pair(r.a,r.b)===pair(e.a,e.b)&&r.type===e.type)}
 function reachable(edges,from,to,ispOn=true){
  const allowed=edges.filter(edgeValid).filter(e=>ispOn||![e.a,e.b].includes('isp'));
  allowed.push({a:'wan',b:'lan'}); // The router forwards between its WAN and LAN interfaces.
  const seen=new Set([from]),queue=[from];
  while(queue.length){const here=queue.shift();if(here===to)return true;for(const e of allowed){const next=e.a===here?e.b:e.b===here?e.a:null;if(next&&!seen.has(next)){seen.add(next);queue.push(next)}}}
  return false;
 }
 function checkNetwork(edges,ispOn=true){
  const missing=required.filter(r=>!edges.some(e=>pair(e.a,e.b)===pair(r.a,r.b)&&e.type===r.type));
  const invalid=edges.filter(e=>!edgeValid(e));
  return {missing,invalid,complete:!missing.length&&!invalid.length,printer:reachable(edges,'pc1','printer',ispOn),internet:reachable(edges,'pc1','isp',ispOn),phone:reachable(edges,'phone','printer',ispOn)};
 }
 function parseIPv4(value){
  const pieces=String(value).trim().split('.');
  return pieces.length===4&&pieces.every(p=>/^(0|[1-9]\d{0,2})$/.test(p)&&Number(p)<=255)?pieces.map(Number):null;
 }
 function isPrivate(value){const n=parseIPv4(value);return !!n&&(n[0]===10||(n[0]===172&&n[1]>=16&&n[1]<=31)||(n[0]===192&&n[1]===168))}
 function validateC(value){
  const n=parseIPv4(value);if(!n)return {ok:false,message:'IPv4 sudaro keturi skaičiai nuo 0 iki 255. Nerašykite pradinių nulių.'};
  if(n.slice(0,3).join('.')!=='192.168.10')return {ok:false,message:'Šiame pavyzdyje pirmi trys skaičiai turi būti 192.168.10. Kaukė yra 255.255.255.0.'};
  if(n[3]===0||n[3]===255)return {ok:false,message:'Šio pavyzdžio įrenginio paskutinis skaičius turi būti nuo 1 iki 254. 0 ir 255 neskiriami įrenginiui.'};
  if(n[3]===1)return {ok:false,message:'192.168.10.1 užimtas numatytojo šliuzo. Pasirinkite kitą adresą.'};
  if([11,12,20].includes(n[3]))return {ok:false,message:'Šį adresą jau naudoja kitas įrenginys. Viename LAN IP adresai turi būti unikalūs.'};
  return {ok:true,message:'Tinkamas laisvas adresas. C priklauso tam pačiam mokomajam LAN ir nekonfliktuoja su kitais įrenginiais.'};
 }
 function dhcpAddress(){for(let n=1;n<255;n++){const ip='192.168.10.'+n;if(validateC(ip).ok)return ip}}
 const scenarios={
  cable:{title:'A · Ryšio neturi vienas kompiuteris',clue:'Kompiuteris A nepasiekia tinklo. Šalia esantis B veikia; A kabelio indikatorius nedega.',answer:'cable',why:'Požymiai rodo atjungtą A kabelį. Pirmiausia patikrinkite jungtį ir ryšio būseną. B veikimas neleidžia kaltinti viso tiekėjo tinklo.'},
  provider:{title:'B · Veikia spausdinimas, neveikia internetas',clue:'Visi LAN kompiuteriai spausdina vietiniu spausdintuvu. Maršrutizatoriaus WAN indikacija: tiekėjo jungtis atjungta.',answer:'provider',why:'LAN veikia, bet nėra tiekėjo jungties. Tikrinkite WAN indikaciją ir tiekėjo ryšį; vietinio spausdinimo kelias nenutrūkęs.'},
  dns:{title:'C · Adresas pasiekiamas, vardas nerandamas',clue:'Vietinis ryšys veikia. Palyginkite IP pasiekiamumą ir mokykla.example DNS paiešką.',answer:'dns',why:'IP adresai pasiekiami, o DNS paieška viršija laiką. Tikėtinas DNS nustatymų arba paslaugos sutrikimas; papildomai patikrinkite DNS serverį ir kitų vardų paiešką.'},
  website:{title:'D · Neatsidaro viena svetainė',clue:'Kitos svetainės atsidaro. Vien mokykla.example žiniatinklio paslauga neatsako. DNS paieška ir ICMP ryšys gali veikti.',answer:'website',why:'Tikėtina konkrečios svetainės ar jos pasiekimo problema. Tikrinkite URL, DNS ir svetainės paslaugos būseną. Sėkmingas ping neįrodo, kad HTTP paslauga veikia.'}
 };
 const commands=[['ipconfig','ipconfig /all'],['gateway','ping 192.168.10.1'],['external','ping 198.51.100.24'],['dns','nslookup mokykla.example'],['route','tracert 198.51.100.24']];
 function diagnostic(id,command){
  if(!scenarios[id]||!commands.some(c=>c[0]===command))throw Error('Nežinomas mokomasis scenarijus arba komanda.');
  const prefix='MOKOMOJI SIMULIACIJA · tik išgalvoti rezultatai\n> '+commands.find(c=>c[0]===command)[1]+'\n\n';let result='';
  if(command==='ipconfig')result=id==='cable'?'Ethernet adapter A\nMedia State . . . . . : Media disconnected':'Ethernet adapter A\nIPv4 Address . . . . : 192.168.10.15\nSubnet Mask  . . . . : 255.255.255.0\nDefault Gateway . . : 192.168.10.1\nDNS Servers  . . . . : 192.168.10.1\nDHCP Enabled . . . . : Yes';
  if(command==='gateway')result=id==='cable'?'PING: transmit failed. General failure.':'Reply from 192.168.10.1: bytes=32 time<1ms TTL=64\nPackets: Sent = 4, Received = 4, Lost = 0';
  if(command==='external')result=['cable','provider'].includes(id)?'Destination host unreachable.\nPackets: Sent = 4, Received = 0':'Reply from 198.51.100.24: bytes=32 time=18ms TTL=54\nPackets: Sent = 4, Received = 4, Lost = 0';
  if(command==='dns')result=id==='website'?'Server:  gateway.example\nAddress: 192.168.10.1\nName:    mokykla.example\nAddress: 198.51.100.24':'DNS request timed out.\nTimeout was 2 seconds.\nNo DNS answer received.';
  if(command==='route')result=id==='cable'?'Unable to reach the network.':id==='provider'?'1   <1 ms   192.168.10.1\n2   *       *       *     Request timed out.\nTiekėjo jungtis simuliacijoje atjungta.':'1   <1 ms   192.168.10.1\n2   *       *       *     Request timed out.\n3   18 ms   198.51.100.24\nTrace complete.\nNeatsakęs tarpinis mazgas nesutrukdė pasiekti tikslo.';
  return prefix+result;
 }
 function sequenceScore(values){
  const right=['D','B','F','C','A','E'];if(!Array.isArray(values)||values.length!==right.length)return 0;
  if(values.every((v,i)=>v===right[i]))return 2;
  for(let i=0;i<right.length-1;i++){const candidate=[...right];[candidate[i],candidate[i+1]]=[candidate[i+1],candidate[i]];if(values.every((v,j)=>v===candidate[j]))return 1}return 0;
 }
 function matches(actual,expected,caseSensitive=false){
  if(Array.isArray(expected))return Array.isArray(actual)&&actual.length===expected.length&&new Set(actual).size===actual.length&&actual.every(x=>expected.includes(x));
  const normalize=v=>caseSensitive?String(v??'').trim():String(v??'').trim().toLocaleLowerCase('lt');
  return normalize(actual)===normalize(expected);
 }
 function practiceCheck(spec,answers){return (spec.fields||[]).map((field,i)=>({label:field.label,ok:matches(answers[i],field.answer,field.caseSensitive),expected:Array.isArray(field.answer)?field.answer.join(', '):field.answer}))}
 function pick(questions,count=10,rng=Math.random){const list=questions.filter(q=>Array.isArray(q.options));for(let i=list.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[list[i],list[j]]=[list[j],list[i]]}return list.slice(0,count)}
 function score(questions,answers){const wrong=questions.filter(q=>!Number.isInteger(answers[q.id])||answers[q.id]!==q.correct);return {correct:questions.length-wrong.length,total:questions.length,percent:questions.length?Math.round(100*(questions.length-wrong.length)/questions.length):0,wrong,lessons:[...new Set(wrong.map(q=>q.lesson))].sort()}}
 const api={nodes,required,pair,edgeValid,reachable,checkNetwork,parseIPv4,isPrivate,validateC,dhcpAddress,scenarios,commands,diagnostic,sequenceScore,matches,practiceCheck,pick,score};
 if(typeof module==='object'&&module.exports)module.exports=api;else root.NGGNetworkCore=api;
})(typeof window==='object'?window:globalThis);
