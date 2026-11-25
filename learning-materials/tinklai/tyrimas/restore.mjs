import {TYPES,createDevice,emptyNetwork} from './devices.mjs';
import {addLink} from './engine.mjs';
import {MISSIONS,initialNetwork} from './missions.mjs';
import {packetDefaults,startTransmission,splitMessage} from './packet-engine.mjs';
import {quizResult} from './assessment.mjs';
const object=v=>v&&typeof v==='object'&&!Array.isArray(v);
const str=(v,n=1600)=>typeof v==='string'?v.slice(0,n):'';
const number=(v,min,max,fallback=min)=>Number.isFinite(v)?Math.max(min,Math.min(max,v)):fallback;
const identifier=v=>typeof v==='string'&&/^[a-z][a-z0-9_-]{0,40}$/i.test(v);
function configuration(raw={}){return Object.fromEntries(['ip','mask','gateway','dns','ssid','server','mode'].map(k=>[k,str(raw[k],80)]))}

export function restoreNetwork(raw,mission){
 if(!object(raw)||!Array.isArray(raw.devices)||!Array.isArray(raw.links)||raw.devices.length>24||raw.links.length>128)return initialNetwork(mission.id);
 const s=emptyNetwork();s.serial=Math.floor(number(raw.serial,0,100000));
 for(const d of raw.devices){
  if(!object(d)||!Object.hasOwn(TYPES,d.type)||!identifier(d.id)||s.devices.some(v=>v.id===d.id))return initialNetwork(mission.id);
  s.devices.push(createDevice(d.type,d.id,s.devices.length,{label:str(d.label,22)||TYPES[d.type].name,x:number(d.x,75,885,110),y:number(d.y,60,530,100),on:d.on!==false,nat:d.nat!==false,dhcp:d.dhcp!==false,config:configuration(object(d.config)?d.config:{}),interfaces:Object.fromEntries(['lan1','lan2','wan'].map(p=>[p,str(d.interfaces?.[p],40)]))}));
 }
 for(const e of raw.links){if(!object(e)||!identifier(e.id))continue;const added=addLink(s,{id:e.id,a:e.a,b:e.b,ap:e.ap,bp:e.bp,medium:e.medium});if(added.ok)s.links.at(-1).on=e.on!==false}
 for(const d of s.devices)if(object(raw.leases?.[d.id]))s.leases[d.id]=configuration(raw.leases[d.id]);
 for(const key of ['provider','dns','web'])s.services[key]=raw.services?.[key]!==false;
 if(mission.lab==='ip'&&!Object.entries({a:'pc',b:'pc',router:'router',isp:'isp',printer:'printer',sw:'switch',ont:'ont'}).every(([id,type])=>s.devices.some(d=>d.id===id&&d.type===type)))return initialNetwork(mission.id);
 return s;
}
function restoreResult(v){
 if(!object(v)||typeof v.ok!=='boolean')return null;
 const r={ok:v.ok,message:str(v.message,800),code:str(v.code,30),path:Array.isArray(v.path)?v.path.filter(identifier).slice(0,50):[],flood:Array.isArray(v.flood)?v.flood.filter(e=>Array.isArray(e)&&e.length===2&&e.every(identifier)).slice(0,48):[]};
 for(const k of ['sourceIP','targetIP','protocol','original','output'])r[k]=str(v[k],120);
 for(const k of ['retries','lost','ticks','latency','drop'])r[k]=number(v[k],0,10000);
 for(const k of ['reorder','everBroken','injected','routeA','routeB','routed','nat'])r[k]=v[k]===true;
 r.arrival=Array.isArray(v.arrival)?v.arrival.filter(n=>Number.isInteger(n)&&n>=1&&n<=16).slice(0,16):[];return r;
}
function restorePacketConfig(raw,mission){const d=packetDefaults(mission.id);if(!object(raw))return d;return {message:str(raw.message,96)||d.message,protocol:raw.protocol==='UDP'?'UDP':'TCP',latency:[2,5,8].includes(raw.latency)?raw.latency:2,drop:Math.floor(number(raw.drop,0,16)),reorder:raw.reorder===true,a:raw.a!==false,b:raw.b!==false,speed:[.5,1,2].includes(raw.speed)?raw.speed:1}}
function restorePacketRun(raw,config){
 const fresh=startTransmission(config);if(!object(raw)||!Array.isArray(raw.packets)||!Array.isArray(raw.received)||!Array.isArray(raw.events)||!['paused','running','complete','empty'].includes(raw.status))return fresh;
 const expected=splitMessage(config.message);if(raw.packets.length!==expected.length)return fresh;
 for(let i=0;i<expected.length;i++){const p=raw.packets[i],e=expected[i];if(!object(p)||p.id!==e.id||p.text!==e.text||!['queued','flight','received','failed'].includes(p.status)||!Number.isInteger(p.attempts)||p.attempts<0||p.attempts>4||(p.status==='flight'&&(!Array.isArray(p.route)||!['a','b'].includes(p.route[1])||!Number.isFinite(p.arrival)||!Number.isFinite(p.sent))))return fresh}
 const run={...fresh,tick:Math.floor(number(raw.tick,0,10000)),status:raw.status==='running'?'paused':raw.status,packets:raw.packets.map((p,i)=>({...expected[i],status:p.status,attempts:p.attempts,due:number(p.due,0,10000),arrival:number(p.arrival,0,10000),sent:number(p.sent,0,10000),route:p.route?['sender',p.route[1],'receiver']:null})),events:raw.events.filter(object).slice(-80).map(e=>({tick:number(e.tick,0,10000),message:str(e.message,800)})),everBroken:raw.everBroken===true,injected:raw.injected===true,dropNext:raw.dropNext===true,recorded:raw.recorded===true};
 for(const p of raw.received){if(!object(p)||run.received.some(r=>r.id===p.id))continue;const e=expected.find(e=>e.id===p.id);if(e)run.received.push({...e,tick:number(p.tick,0,10000)})}
 run.output=config.protocol==='UDP'?run.received.map(p=>p.text).join(''):expected.slice(0,expected.findIndex(p=>!run.received.some(r=>r.id===p.id))<0?expected.length:expected.findIndex(p=>!run.received.some(r=>r.id===p.id))).map(p=>p.text).join('');
 run.result=restoreResult(raw.result);if(run.status==='complete'&&!run.result)return fresh;return run;
}
export function restoreProgress(raw){
 const data={version:1,current:MISSIONS.some(m=>m.id===raw.current)?raw.current:'lan-print',records:{}};
 for(const m of MISSIONS){const v=raw.records[m.id];if(!object(v))continue;
  const r={stage:Math.floor(number(v.stage,0,4)),network:restoreNetwork(v.network,m),hypothesis:str(v.hypothesis,1200),prediction:['yes','no','unsure'].includes(v.prediction)?v.prediction:'',conclusion:str(v.conclusion),observations:[],answers:{},self:{},hints:Math.floor(number(v.hints,0,3)),attempt:Math.floor(number(v.attempt,0,10000)),freeMode:v.freeMode===true};
  for(const q of m.questions){const a=v.answers?.[q.id];if(q.type==='open'||q.type==='short')r.answers[q.id]=str(a,1500);else if(['multi','match','order'].includes(q.type))r.answers[q.id]=Array.isArray(a)?a.filter(v=>typeof v==='number'||typeof v==='string').slice(0,10):[];else if(Number.isInteger(a))r.answers[q.id]=a}
  if(v.score)r.score=quizResult(m.questions,r.answers);
  m.skills.forEach((_,i)=>{if(['0','1','2'].includes(v.self?.[i]))r.self[i]=v.self[i]});
  for(const o of Array.isArray(v.observations)?v.observations.slice(-40):[]){if(!object(o)||!['network','packets','ip'].includes(o.kind))continue;const result=restoreResult(o.result);if(result)r.observations.push({kind:o.kind,title:str(o.title,120),source:str(o.source,40),target:str(o.target,40),time:str(o.time,30),result,config:configuration(o.config||{}),nat:o.nat===true,dhcp:o.dhcp===true,outsideAvailable:o.outsideAvailable===true,bridges:Array.isArray(o.bridges)?o.bridges.filter(t=>['hub','switch'].includes(t)):[]})}
  if(m.lab==='packets'){r.packetConfig=restorePacketConfig(v.packetConfig,m);r.packetRun=restorePacketRun(v.packetRun,r.packetConfig)}
  r.lastResult=restoreResult(v.lastResult);data.records[m.id]=r;
 }
 return data;
}
