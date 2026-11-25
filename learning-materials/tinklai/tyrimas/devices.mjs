export const TYPES = {
 pc: {name:'Kompiuteris', en:'Desktop', ports:['eth']},
 laptop: {name:'Nešiojamasis', en:'Laptop', ports:['eth','wifi']},
 phone: {name:'Telefonas', en:'Phone', ports:['wifi']},
 printer: {name:'Spausdintuvas', en:'Printer', ports:['eth']},
 server: {name:'Serveris', en:'Server', ports:['eth']},
 switch: {name:'Komutatorius', en:'Switch', ports:Array.from({length:8},(_,i)=>'p'+(i+1)), bridge:true},
 hub: {name:'Šakotuvas', en:'Hub', ports:Array.from({length:8},(_,i)=>'p'+(i+1)), bridge:true},
 router: {name:'Maršrutizatorius', en:'Router', ports:['lan1','lan2','wan']},
 ont: {name:'Modemas / ONT', en:'ONT', ports:['lan','wan'], bridge:true},
 ap: {name:'Prieigos taškas', en:'Access point', ports:['eth','wifi'], bridge:true},
 isp: {name:'Tiekėjas', en:'ISP', ports:['wan']}
};
export const HOSTS=['pc','laptop','phone','printer','server'];
export function createDevice(type,id,index=0,extra={}) {
 if(!TYPES[type])throw Error('Nežinomas įrenginys');
 return {id,type,label:TYPES[type].name+' '+(index+1),x:110+(index%5)*175,y:100+Math.floor(index/5)*130,on:true,nat:true,dhcp:true,...extra,
  config:{mode:'static',ip:'192.168.10.'+(11+index),mask:'255.255.255.0',gateway:'192.168.10.1',dns:'192.168.10.1',ssid:'Mokykla',...extra.config},
  interfaces:{lan1:'192.168.10.1',lan2:'192.168.20.1',wan:'198.51.100.2',...extra.interfaces}};
}
export const clone = value=>JSON.parse(JSON.stringify(value));
export function emptyNetwork(){return {devices:[],links:[],leases:{},services:{provider:true,dns:true,web:true},serial:0}}
export function nextDevice(state,type){let id;do{id='d'+(++state.serial)}while(deviceById(state,id));const device=createDevice(type,id,state.devices.length);if(HOSTS.includes(type)){const used=new Set(state.devices.map(d=>(d.config.mode==='dhcp'?state.leases[d.id]:d.config)?.ip));let n=11;while(used.has('192.168.10.'+n))n++;device.config.ip='192.168.10.'+n}state.devices.push(device);return device}
export const deviceById=(state,id)=>state.devices.find(d=>d.id===id);
export const vertex=(id,port)=>id+':'+port;
export function freePort(state,id,wireless=false){const d=deviceById(state,id);return TYPES[d.type].ports.find(p=>(wireless?p==='wifi':p!=='wifi')&&(p==='wifi'||!state.links.some(e=>(e.a===id&&e.ap===p)||(e.b===id&&e.bp===p))))}
export function removeDevice(state,id){state.devices=state.devices.filter(d=>d.id!==id);state.links=state.links.filter(e=>e.a!==id&&e.b!==id);delete state.leases[id]}
