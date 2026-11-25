import {emptyNetwork,createDevice} from './devices.mjs';
import {addLink} from './engine.mjs';
const join=(s,a,ap,b,bp,medium='wire')=>{const r=addLink(s,{a,ap,b,bp,medium});if(!r.ok)throw Error(r.message)};
export function lan(){const s=emptyNetwork();s.devices=[
 createDevice('pc','a',0,{label:'Klasės A kompiuteris',x:130,y:400,config:{ip:'192.168.10.11'}}),
 createDevice('pc','b',1,{label:'Klasės B kompiuteris',x:330,y:400,config:{ip:'192.168.10.12'}}),
 createDevice('pc','c',2,{label:'Bibliotekos kompiuteris',x:530,y:400,config:{ip:'192.168.10.13'}}),
 createDevice('printer','printer',3,{label:'Bendras spausdintuvas',x:760,y:400,config:{ip:'192.168.10.20'}}),
 createDevice('switch','sw',4,{label:'LAN komutatorius',x:450,y:230})];
 for(const [i,id] of ['a','b','c','printer'].entries())join(s,id,'eth','sw','p'+(i+1));s.serial=20;return s;
}
export function internet(){const s=lan();s.devices.push(createDevice('router','router',5,{label:'Mokomasis router',x:450,y:95}),createDevice('ont','ont',6,{label:'ONT',x:660,y:95}),createDevice('isp','isp',7,{label:'Interneto tiekėjas',x:870,y:95}));join(s,'sw','p5','router','lan1');join(s,'router','wan','ont','lan');join(s,'ont','wan','isp','wan');return s}
export function fixtureFor(id){
 if(id==='lan-print')return emptyNetwork();
 if(id==='internet-connect')return lan();
 if(id==='router-two-lans'){const s=lan();s.devices.push(createDevice('switch','sw2',5,{label:'Antro aukšto LAN',x:700,y:200}),createDevice('server','remote',6,{label:'Antro aukšto serveris',x:820,y:350,config:{ip:'192.168.20.10',gateway:'192.168.20.1'}}),createDevice('router','router',7,{label:'Dviejų LAN router',x:450,y:80}));join(s,'sw2','p1','remote','eth');return s}
 if(id==='wifi-bridge'){const s=lan();s.devices.push(createDevice('ap','ap',5,{label:'Wi-Fi prieiga',x:730,y:180,config:{ssid:'Biblioteka'}}),createDevice('phone','phone',6,{label:'Mokomasis telefonas',x:860,y:310,config:{ip:'192.168.10.30',ssid:'Mokykla'}}));join(s,'sw','p5','ap','eth');return s}
 const s=internet(),a=s.devices.find(d=>d.id==='a'),router=s.devices.find(d=>d.id==='router');
 if(id==='partial-internet')a.config.gateway='';
 if(id==='ip-duplicate')a.config.ip='192.168.10.12';
 if(id==='ip-subnet')a.config.ip='192.168.11.11';
 if(id==='ip-gateway')a.config.gateway='';
 if(id==='ip-dns')a.config.dns='192.0.2.99';
 if(id==='ip-dhcp'){a.config.mode='dhcp';router.dhcp=false}
 return s;
}
