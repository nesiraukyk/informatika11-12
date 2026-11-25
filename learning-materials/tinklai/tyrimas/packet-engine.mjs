import {walk} from './engine.mjs';
export function packetDefaults(mission='packets-clean'){return {message:'Tinklai jungia žmones.',protocol:'TCP',latency:mission==='packets-delay'?8:2,drop:mission==='packets-loss'?2:0,reorder:mission==='packets-order',a:true,b:true,speed:1}}
export function splitMessage(message){const chars=Array.from(String(message)).slice(0,96),parts=[];let byte=0;for(let i=0;i<chars.length;i+=6){const text=chars.slice(i,i+6).join('');parts.push({id:parts.length+1,text,byte,bytes:new TextEncoder().encode(text).length});byte+=parts.at(-1).bytes}return parts}
export function packetRoute(config,preferred='a'){
 const g=new Map([['sender',new Set()],['a',new Set()],['b',new Set()],['receiver',new Set()]]);
 for(const key of [preferred,preferred==='a'?'b':'a'])if(config[key]){g.get('sender').add(key);g.get(key).add('receiver')}
 return walk(g,'sender','receiver');
}
export function startTransmission(config){
 const packets=splitMessage(config.message).map(p=>({...p,status:'queued',due:p.id-1,attempts:0,route:null}));
 return {config:{...config},packets,tick:0,status:packets.length?'paused':'empty',received:[],events:[],output:'',everBroken:!config.a||!config.b,injected:false,result:null};
}
const log=(run,message)=>{run.events.push({tick:run.tick,message});run.events=run.events.slice(-80)};
function failPacket(run,p,why){
 log(run,`${p.id} dalis: ${why}`);
 if(run.config.protocol==='TCP'&&p.attempts<4){p.status='queued';p.due=run.tick+Math.max(3,run.config.latency*2);log(run,`${p.id} daliai numatytas pakartotinis siuntimas.`)}else{p.status='failed';log(run,run.config.protocol==='UDP'?`${p.id} datagrama: UDP pats pakartotinai nesiųs.`:`${p.id} dalis: pasiekta šio mokomojo bandymo riba.`)}
}
export function deliverChunk(run,p){
 if(!run.received.some(x=>x.id===p.id)){run.received.push({id:p.id,text:p.text,tick:run.tick});log(run,`${p.id} dalis gauta.`)}
 p.status='received';
 if(run.config.protocol==='UDP')run.output=run.received.map(x=>x.text).join('');
 else{run.output='';for(const original of run.packets){const got=run.received.find(x=>x.id===original.id);if(!got)break;run.output+=got.text}}
}
export function setRoute(run,key,on){run.config[key]=Boolean(on);if(!on)run.everBroken=true;log(run,`Kelias ${key.toUpperCase()} ${on?'atkurtas':'nutrauktas'}.`)}
export function advancePacket(run){
 if(['complete','empty'].includes(run.status))return run;
 run.tick++;
 for(const p of run.packets.filter(p=>p.status==='flight')){
  if(!run.config[p.route[1]]){failPacket(run,p,'kelias nutrūko; duomenys nepasiekė gavėjo');continue}
  if(p.arrival<=run.tick){if((p.id===Number(run.config.drop)&&p.attempts===1)||run.dropNext){run.dropNext=false;run.injected=true;failPacket(run,p,'duomenys prarasti simuliacijoje')}else deliverChunk(run,p)}
 }
 for(const p of run.packets.filter(p=>p.status==='queued'&&p.due<=run.tick)){
  p.attempts++;const route=packetRoute(run.config,p.id%2?'a':'b');
  if(!route){failPacket(run,p,'nėra veikiančio IP maršruto');continue}
  p.route=route;p.sent=run.tick;p.arrival=run.tick+Number(run.config.latency)+(run.config.reorder&&p.id===1&&p.attempts===1?run.packets.length+3:0);p.status='flight';log(run,`${p.id} dalis siunčiama keliu ${route[1].toUpperCase()}${p.attempts>1?' pakartotinai':''}.`);
 }
 if(run.packets.every(p=>['received','failed'].includes(p.status))){
  run.status='complete';const ok=run.output===run.config.message;
  run.result={ok,message:ok?'Gavėjo programa gavo visą pradinę žinutę.':run.config.protocol==='UDP'?'UDP gavėjo išvestis skiriasi: pats UDP neatkuria trūkstamų dalių ar jų eiliškumo.':'TCP nepavyko užbaigti perdavimo per šio bandymo ribą.',protocol:run.config.protocol,original:run.config.message,output:run.output,retries:run.packets.reduce((n,p)=>n+Math.max(0,p.attempts-1),0),arrival:run.received.map(p=>p.id),lost:run.packets.filter(p=>p.status==='failed').length,ticks:run.tick,latency:run.config.latency,reorder:run.config.reorder,drop:Number(run.config.drop),everBroken:run.everBroken,injected:run.injected,routeA:run.config.a,routeB:run.config.b};log(run,run.result.message);
 }
 return run;
}
