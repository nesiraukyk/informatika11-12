import {fixtureFor} from './fixtures.mjs';
import {BUILDER_MISSIONS} from './builder-missions.mjs';
import {PACKET_MISSIONS} from './packet-missions.mjs';
import {IP_MISSIONS} from './ip-missions.mjs';
export const STAGES=['Suprask','Numatyk','Tyrinėk','Pasitikrink','Įsivertink'];
export const LEVELS=['Susipažįstu','Tyrinėju','Sprendžiu iššūkius'];
export const LABS=[{id:'builder',title:'Tinklo konstruktorius',short:'Sujunk ir išbandyk',number:'01'},{id:'packets',title:'Paketų kelionė',short:'Stebėk ir palygink',number:'02'},{id:'ip',title:'IP eksperimentai',short:'Keisk ir diagnozuok',number:'03'}];
const question=(id,prompt,options,answer,explanation,skill,extra={})=>({id,prompt,options,answer,explanation,skill,type:'single',...extra});
export const MISSIONS=[{
 id:'lan-print',lab:'builder',title:'Spausdintuvas trims kompiuteriams',level:0,
 problem:'Bibliotekoje yra trys kompiuteriai ir vienas tinklinis spausdintuvas. Tiekėjo ryšys dar neįvestas. Suprojektuok tinklą, kuriame visi trys galėtų spausdinti.',
 goal:'Bent trys kompiuteriai pasiekia tą patį spausdintuvą; išorinio ryšio nereikia.',
 theory:[{title:'Vietinis tinklas · LAN',text:'LAN jungia netolimus įrenginius. Vietinė paslauga, pavyzdžiui, failų perdavimas tarp dviejų kompiuterių, naudoja jų tarpusavio ryšį.'},{title:'Komutatorius · Switch',text:'Komutatorius perduoda Ethernet kadrus tarp savo prievadų. Žinodamas gavėjo MAC, individualų kadrą siunčia į gavėjo prievadą.'},{title:'Kelias ir adresas · Path & address',text:'Įjungti įrenginiai, veikiantis ryšio kelias ir tinkami adresai yra skirtingos sąlygos. Vien nupiešta linija jų visų negarantuoja.'}],
 prediction:'Ar tavo sukurtame tinkle kompiuteris pasieks spausdintuvą be tiekėjo ryšio?',
 hints:['Kuri paslauga šioje situacijoje yra vietinė?','Palygink galinio įrenginio vieną prievadą ir tinklo įrenginio prievadus.','Vienas galimas variantas: tris kompiuterius ir spausdintuvą prijungti prie komutatoriaus, naudoti unikalius vieno /24 adresus. Tinka ir kiti veikiantys LAN variantai.'],
 skills:['Atskirti vietinį ryšį nuo interneto','Parinkti LAN įrangą','Patikrinti veikiančią duomenų perdavimo grandinę'],lesson:1,
 questions:[
 question('lan-1','Kodėl tinkamai sujungto LAN spausdintuvas gali veikti be interneto?',['Duomenys lieka vietiniame tinkle','Visi spausdintuvai turi mobilųjį internetą','DNS pakeičia kabelį'],0,'Vietinis kelias iki spausdintuvo neina per tiekėją.','Atskirti vietinį ryšį nuo interneto'),
 question('lan-2','Kurios sąlygos svarbios šio modelio vietiniam perdavimui?',['Įrenginiai įjungti','Yra tinkamas jungčių kelias','Unikalūs suderinami IP adresai','Visada būtinas interneto tiekėjas'],[0,1,2],'Veikiantis LAN reikalauja aktyvių įrenginių, kelio ir tinkamos konfigūracijos.','Patikrinti veikiančią duomenų perdavimo grandinę',{type:'multi'}),
 question('lan-3','Nauja situacija: keturi kompiuteriai sujungti dviem tarpusavyje sujungtais komutatoriais. Ar toks LAN gali veikti?',['Taip, jei keliai ir nustatymai tinkami','Ne, leidžiamas tik vienas komutatorius','Tik su dviem interneto tiekėjais'],0,'Tinklo veikimą lemia ryšys ir taisyklės, o ne vienas autoriaus brėžinys.','Parinkti LAN įrangą',{transfer:true}),
 {id:'lan-4',type:'open',prompt:'Atjungus vieno kompiuterio kabelį, kiti vis dar spausdina. Paaiškink, kodėl, ir pasiūlyk vieną patikrą.',criteria:['Atskirtas vieno kompiuterio kelias nuo kitų LAN kelių.','Pasiūlyta tikrinti to kompiuterio kabelį, prievadą ar jungties būseną.'],skill:'Patikrinti veikiančią duomenų perdavimo grandinę'}
 ]
},...BUILDER_MISSIONS,...PACKET_MISSIONS,...IP_MISSIONS];
export function initialNetwork(id){return fixtureFor(id)}
