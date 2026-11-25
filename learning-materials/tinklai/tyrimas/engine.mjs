import {TYPES,HOSTS,deviceById,vertex} from './devices.mjs';
export const ipv4=value=>{const s=String(value??'').trim().split('.');return s.length===4&&s.every(x=>/^(0|[1-9]\d{0,2})$/.test(x)&&+x<256)?s.map(Number):null};
const hostIPv4=value=>{const n=ipv4(value);return n&&n[0]>0&&n[0]!==127&&n[0]<224&&n[3]>0&&n[3]<255};
export const prefix=ip=>ipv4(ip)?.slice(0,3).join('.')??null;
const sameNet=(a,b)=>prefix(a)!==null&&prefix(a)===prefix(b);
export const privateIP=ip=>{const n=ipv4(ip);return !!n&&(n[0]===10||(n[0]===172&&n[1]>=16&&n[1]<=31)||(n[0]===192&&n[1]===168))};
const failure=(code,message,extra={})=>({ok:false,code,message,path:[],flood:[],...extra});
export function linkProblem(state,e){
 const a=deviceById(state,e.a),b=deviceById(state,e.b);
 if(!a||!b||a===b)return 'Pasirinkite du skirtingus įrenginius.';
 if(!TYPES[a.type].ports.includes(e.ap)||!TYPES[b.type].ports.includes(e.bp))return 'Šis įrenginys neturi pasirinktos jungties.';
 if(e.medium==='wifi'){
  if(e.ap!=='wifi'||e.bp!=='wifi'||!([a.type,b.type].includes('ap'))||!([a.type,b.type].some(t=>['phone','laptop'].includes(t))))return 'Belaidė jungtis sieja prieigos tašką ir telefono arba nešiojamojo Wi-Fi sąsają.';
 }else if(e.medium!=='wire'||e.ap==='wifi'||e.bp==='wifi')return 'Kabeliui reikalingos dvi laidinės jungtys.';
 if((a.type==='isp'&&b.type!=='ont')||(b.type==='isp'&&a.type!=='ont'))return 'Šiame prieigos modelyje tiekėją pasiekia modemas / ONT.';
 if(state.links.some(l=>l.id!==e.id&&((l.a===e.a&&l.b===e.b&&l.ap===e.ap&&l.bp===e.bp)||(l.b===e.a&&l.a===e.b&&l.bp===e.ap&&l.ap===e.bp))))return 'Tokia jungtis jau yra.';
 for(const [id,p] of [[e.a,e.ap],[e.b,e.bp]])if((p!=='wifi'||deviceById(state,id).type!=='ap')&&state.links.some(l=>l.id!==e.id&&((l.a===id&&l.ap===p)||(l.b===id&&l.bp===p))))return 'Prievadas užimtas. Pasirinkite kitą arba pašalinkite seną jungtį. Wi-Fi klientas jungiasi prie vieno AP.';
 return null;
}
export function addLink(state,e){const problem=linkProblem(state,e);if(problem)return {ok:false,message:problem};state.links.push({...e,id:e.id||'e'+(++state.serial),on:true});return {ok:true,message:'Jungtis sukurta. Patikrinkite perdavimą.'}}
export function linkActive(state,e){
 const a=deviceById(state,e.a),b=deviceById(state,e.b);
 return !!a&&!!b&&e.on!==false&&a.on&&b.on&&!(state.services.provider===false&&[a.type,b.type].includes('isp'))&&
  (e.medium!=='wifi'||(a.config.ssid&&a.config.ssid===b.config.ssid));
}
export function graph(state){
 const g=new Map();const join=(a,b)=>{if(!g.has(a))g.set(a,new Set());if(!g.has(b))g.set(b,new Set());g.get(a).add(b);g.get(b).add(a)};
 for(const d of state.devices)if(d.on){const ports=TYPES[d.type].ports;for(const p of ports)g.set(vertex(d.id,p),new Set());if(TYPES[d.type].bridge)for(const p of ports.slice(1))join(vertex(d.id,ports[0]),vertex(d.id,p))}
 for(const e of state.links)if(linkActive(state,e))join(vertex(e.a,e.ap),vertex(e.b,e.bp));return g;
}
export function walk(g,start,end){if(!g.has(start)||!g.has(end))return null;const q=[[start]],seen=new Set([start]);while(q.length){const p=q.shift(),v=p[p.length-1];if(v===end)return p;for(const n of g.get(v)||[])if(!seen.has(n)){seen.add(n);q.push([...p,n])}}return null}
// A connected L2 cycle needs mechanisms such as STP, outside this teaching model.
export function hasLayer2Loop(g,start){const seen=new Set();function visit(v,parent){seen.add(v);for(const next of g.get(v)||[]){if(next===parent)continue;if(seen.has(next)||visit(next,v))return true}return false}return g.has(start)&&visit(start,null)}
const hostPorts=d=>TYPES[d.type].ports.filter(p=>p==='eth'||p==='wifi');
function hostPath(g,a,b){for(const x of hostPorts(a))for(const y of hostPorts(b)){const p=walk(g,vertex(a.id,x),vertex(b.id,y));if(p)return p}return null}
function toPort(g,d,id,port){for(const p of hostPorts(d)){const path=walk(g,vertex(d.id,p),vertex(id,port));if(path)return path}return null}
const devicePath=p=>p.map(v=>v.split(':')[0]).filter((v,i,a)=>i===0||v!==a[i-1]);
export function effective(state,d){return d.config.mode==='dhcp'?state.leases[d.id]||null:d.config}
function addressProblem(state,d,g){
 if(hostPorts(d).some(p=>hasLayer2Loop(g,vertex(d.id,p))))return failure('loop','Šiame LAN aptikta L2 jungčių kilpa. STP čia nemodeliuojamas, todėl rezultatas neprognozuojamas. Pašalink perteklinį kabelį arba tirti rinkis tinklą be kilpos.');
 const c=effective(state,d);if(!c)return failure('dhcp','Automatinio adreso dar nėra. Patikrinkite DHCP pasiekiamumą ir paprašykite nuomos.');
 if(!hostIPv4(c.ip))return failure('ip','Reikia galiniam LAN įrenginiui tinkamo IPv4: /24 paskutinis skaičius 1–254. 0.x, 127.x ir grupinio siuntimo adresai čia netinka.');
 if(c.mask!=='255.255.255.0')return failure('mask','Ši laboratorija modeliuoja /24 kaukę 255.255.255.0. Kita kaukė šiame modelyje nepalaikoma.');
 for(const other of state.devices){if(other.id===d.id||!other.on)continue;if(HOSTS.includes(other.type)&&effective(state,other)?.ip===c.ip&&hostPath(g,d,other))return failure('duplicate','Du to paties LAN įrenginiai naudoja tą patį IP. Gavėjas negali būti vienareikšmiškai nustatytas.');if(other.type==='router')for(const [port,ip] of Object.entries(other.interfaces))if(ip===c.ip&&toPort(g,d,other.id,port))return failure('duplicate','Įrenginio IP sutampa su pasiekiama maršrutizatoriaus sąsaja.')}
 return null;
}
function gateway(state,d,g){const c=effective(state,d);if(!hostIPv4(c?.gateway)||!sameNet(c.ip,c.gateway))return null;const matches=[];for(const r of state.devices.filter(n=>n.type==='router'&&n.on))for(const [port,ip] of Object.entries(r.interfaces))if(ip===c.gateway){const path=toPort(g,d,r.id,port);if(path)matches.push({r,port,path})}return matches.length===1?matches[0]:null}
function success(state,path,c,targetIP,extra={}){
 const ids=devicePath(path),flood=[];
 for(let i=1;i<ids.length-1;i++){const d=deviceById(state,ids[i]);if(d?.type==='hub')for(const e of state.links.filter(e=>linkActive(state,e)&&(e.a===d.id||e.b===d.id))){const id=e.a===d.id?e.b:e.a;if(id!==ids[i-1]&&id!==ids[i+1])flood.push([d.id,id])}}
 return {ok:true,code:'delivered',message:'Gavėjas pasiekiamas pagal dabartines jungtis ir nustatymus.',path:ids,flood,sourceIP:c.ip,targetIP,...extra};
}
export function probe(state,source,target){
 const src=deviceById(state,source),g=graph(state);if(!src||!HOSTS.includes(src.type))return failure('source','Pasirinkite siunčiantį kompiuterį, telefoną, spausdintuvą arba serverį.');
 if(!src.on)return failure('off','Siuntėjas išjungtas.');if(source===target)return failure('self','Pasirink kitą įrenginį: savo paties adresas nepatikrina ryšio kelio.');const bad=addressProblem(state,src,g);if(bad)return bad;const c=effective(state,src);
 if(target==='internet'||target==='website'){
  const gw=gateway(state,src,g);if(!gw)return failure('gateway','Vietinis ryšys gali veikti, bet tinkamai sukonfigūruotas šliuzas nepasiekiamas.');
  const provider=state.devices.find(d=>d.type==='isp'&&d.on),wan=provider&&walk(g,vertex(gw.r.id,'wan'),vertex(provider.id,'wan'));
  if(!wan||!sameNet(gw.r.interfaces.wan,'198.51.100.1'))return failure('wan','Šliuzas pasiekiamas, tačiau jo WAN kelias iki tiekėjo neveikia.',{path:devicePath(gw.path)});
  if(privateIP(c.ip)&&!gw.r.nat)return failure('nat','Privatus adresas viešajame tinkle tiesiogiai nemaršrutizuojamas; šiame IPv4 modelyje reikia veikiančio NAT.');
  if(target==='website'){
   const dns=ipv4(c.dns),dnsReachable=dns&&(c.dns===c.gateway||c.dns==='198.51.100.53');
   if(!state.services.dns||!dnsReachable)return failure('dns','Išorinis IP pasiekiamas, tačiau mokykla.example vardas neišspręstas. Patikrinkite DNS nustatymą ir paslaugą.',{path:devicePath([...gw.path,...wan])});
   if(!state.services.web)return failure('web','DNS grąžino IP, bet svetainės paslauga neatsako.');
  }
  return success(state,[...gw.path,...wan],c,'203.0.113.80',{message:target==='website'?'Mokykla.example atverta simuliacijoje.':'Dokumentacinis išorinis IP pasiekiamas simuliacijoje.',nat:privateIP(c.ip)});
 }
 const dst=deviceById(state,target);if(!dst||!dst.on)return failure('off','Gavėjas nerastas arba išjungtas.');
 if(dst.type==='router'){const entry=Object.entries(dst.interfaces).find(([p,ip])=>sameNet(c.ip,ip)&&toPort(g,src,dst.id,p));return entry?success(state,toPort(g,src,dst.id,entry[0]),c,entry[1]):failure('local','Maršrutizatoriaus sąsaja nepasiekiama šiame LAN.')}
 if(!HOSTS.includes(dst.type))return failure('target','Komutatoriaus ar šakotuvo paskirtį tirti galima siunčiant duomenis per jį galiniam įrenginiui.');
 const targetBad=addressProblem(state,dst,g);if(targetBad)return {...targetBad,message:'Gavėjas: '+targetBad.message};const dc=effective(state,dst),direct=hostPath(g,src,dst);
 if(sameNet(c.ip,dc.ip))return direct?success(state,direct,c,dc.ip):failure('local','Adresai priskirti tam pačiam /24, tačiau vietinis perdavimo kelias nutrūkęs.');
 const gw=gateway(state,src,g),back=gateway(state,dst,g);
 if(!gw||!back)return failure('gateway','Skirtingiems /24 tinklams reikia pasiekiamų šliuzų abiejuose galuose.');
 if(gw.r.id!==back.r.id||gw.port===back.port)return failure('route','Šiame modelyje nėra tinkamo tiesiogiai prijungtų /24 tinklų maršruto. Naudokite atskiras maršrutizatoriaus LAN sąsajas.');
 return success(state,[...gw.path,...[...back.path].reverse()],c,dc.ip,{routed:true});
}
export function renewDhcp(state,id){
 const d=deviceById(state,id);if(!d||!HOSTS.includes(d.type)||!d.on)return failure('off','Pasirinktas įrenginys neaktyvus.');const g=graph(state);
 for(const r of state.devices.filter(d=>d.on&&d.type==='router'&&d.dhcp))for(const p of ['lan1','lan2'])if(toPort(g,d,r.id,p)){
  const subnet=prefix(r.interfaces[p]);if(!subnet||!hostIPv4(r.interfaces[p]))continue;
  for(let n=100;n<200;n++){const ip=subnet+'.'+n,occupied=state.devices.some(other=>other.id!==id&&other.on&&((HOSTS.includes(other.type)&&effective(state,other)?.ip===ip&&hostPath(g,d,other))||(other.type==='router'&&Object.values(other.interfaces).includes(ip))));if(!occupied){state.leases[id]={ip,mask:'255.255.255.0',gateway:r.interfaces[p],dns:r.interfaces[p],server:r.id};return {ok:true,message:'DHCP nuoma gauta: '+ip}}}
 }
 return failure('dhcp',state.leases[id]?'Naujos nuomos gauti nepavyko. Ankstesnė mokomoji nuoma dar galioja.':'DHCP atsakymo nėra. Be nuomos automatinė konfigūracija nesuteikta.');
}
