import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const source=fs.readFileSync(path.join(root,'learning-materials/tinklai/medziaga.md'),'utf8').replace(/\r/g,'');
const esc=s=>s.replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const inline=s=>esc(s).replace(/`([^`]+)`/g,'<code>$1</code>').replace(/\*\*([^*]+)\*\*/g,'<strong>$1</strong>');
function markdown(text){
 const lines=text.trim().split('\n');let html='',i=0;
 while(i<lines.length){
  const line=lines[i];if(!line.trim()){i++;continue}
  if(line.startsWith('```')){let code=[];i++;while(i<lines.length&&!lines[i].startsWith('```'))code.push(lines[i++]);i++;html+='<pre class="source-diagram" aria-label="Tipinio tinklo tekstinė schema">'+esc(code.join('\n'))+'</pre>';continue}
  if(line.startsWith('|')){const rows=[];while(i<lines.length&&lines[i].startsWith('|'))rows.push(lines[i++].split('|').slice(1,-1).map(s=>s.trim()));html+='<div class="table-scroll" tabindex="0" role="region" aria-label="Mokomosios medžiagos lentelė"><table><thead><tr>'+rows[0].map(c=>'<th scope="col">'+inline(c)+'</th>').join('')+'</tr></thead><tbody>'+rows.slice(2).map(row=>'<tr>'+row.map(c=>'<td>'+inline(c)+'</td>').join('')+'</tr>').join('')+'</tbody></table></div>';continue}
  if(line.startsWith('### ')){html+='<h3>'+inline(line.slice(4))+'</h3>';i++;continue}
  const paragraph=[];while(i<lines.length&&lines[i].trim()&&!lines[i].startsWith('|')&&!lines[i].startsWith('### ')&&!lines[i].startsWith('```'))paragraph.push(lines[i++]);html+='<p>'+inline(paragraph.join(' '))+'</p>';
 }
 return html;
}
const goals=[
 ['Atskirti LAN, WAN, internetą ir WWW.','Parinkti ryšio priemonę pagal situaciją.'],
 ['Atskirti komutatoriaus, maršrutizatoriaus ir prieigos taško funkcijas.','Paaiškinti vietinio ir išorinio ryšio kelią.'],
 ['Atskirti TCP ir IP paskirtis.','Atpažinti IP adreso klaidą bei dublikatą.'],
 ['Išskaidyti URL ir paaiškinti DNS vaidmenį.','Įvertinti HTTPS apsaugą ir jos ribas.'],
 ['Parinkti protokolą failams ir el. paštui.','Saugiai susieti belaidžius įrenginius.'],
 ['Perskaityti diagnostikos rezultatą.','Grįsti tikėtiną priežastį keliais požymiais.']
];
const terms=[['LAN','WAN','internetas','WWW','Ethernet','Wi-Fi','Bluetooth'],['modemas / ONT','komutatorius','maršrutizatorius','prieigos taškas','šakotuvas'],['protokolas','TCP','IP','privatus ir viešasis adresas','statinis ir dinaminis adresas'],['DNS','domenas','URL','HTTP','HTTPS'],['FTP / FTPS','SMTP','POP3','IMAP','Bluetooth susiejimas'],['diagnostika','vietinis ryšys','DNS paieška','tikėtina priežastis']];
const keys=['B','D','A','C','B','A','D','C','D','B','A','C','C','A','D','B','A','D','B','C','A','D','B','C'];
const explanations=[
 'LAN jungia įrenginius ribotoje teritorijoje, pavyzdžiui, viename kabinete.','Wi-Fi suteikia vietinį belaidį ryšį. Tiekėjo jungtis tuo metu gali neveikti.','WWW – žiniatinklio paslauga. Internetu taip pat veikia el. paštas ir kitos paslaugos.','Bluetooth tinka netoliese esančių įrenginių susiejimui.','Maršrutizatorius nukreipia IP paketus tarp skirtingų tinklų.','Komutatorius naudoja MAC adresų lentelę; šiame pavyzdyje gavėjo prievadas jau žinomas.','Prieigos taškas suteikia Wi-Fi įrenginiams ryšį su LAN.','Modemas arba ONT yra tiekėjo prieigos ir vartotojo įrangos sąsaja.','Vienas IPv4 skaičius negali viršyti 255.','192.168.0.0/16 yra privatus diapazonas.','DHCP gali suteikti IP, kaukę, šliuzą ir DNS serverio adresą.','TCP užtikrina patikimą baitų srautą ir eilės tvarką; IP adresuoja ir nukreipia paketus.','DNS susieja vardus su tinklo informacija; pats tinklalapio neperduoda.','Serverio vardas yra po schemos ir prieš kelią.','TLS saugo ryšį ir leidžia tikrinti serverio tapatybę, tačiau negarantuoja turinio sąžiningumo.','Kelias prasideda po serverio vardo; parametras prasideda po klaustuko.','SMTP naudojamas laiškams siųsti bei perduoti tarp pašto serverių.','IMAP sinchronizuoja serveryje laikomus laiškus ir aplankus.','FTPS – FTP su TLS; SFTP yra kitas protokolas.','Neprašytas susiejimas su nepažįstamu įrenginiu atmetamas.','ipconfig parodo Windows tinklo konfigūraciją.','nslookup leidžia tirti DNS vardų nustatymą.','ICMP atsakymai gali būti filtruojami, nors kitos paslaugos veikia.','IP pasiekiamumas ir nesėkmingas DNS rodo, kad pirmiausia verta tikrinti DNS nustatymus bei paslaugą.'
];
const lessons=[];const activities=[];
for(const match of source.matchAll(/^## ([1-6]) pamoka\. (.+)\n([\s\S]*?)(?=\n## |(?![\s\S]))/gm)){
 const number=Number(match[1]),body=match[3],theory=body.split('### Praktinės užduotys')[0];
 const reflection=body.match(/\*\*Pamokos refleksija:\*\* (.+)/)?.[1]||'';
 let theoryHtml=markdown(theory);
 // Keep every supplied explanation, with supplementary context available on demand.
 theoryHtml=theoryHtml.replace(/<p>Schema rodo atskiras funkcijas;[\s\S]*?<\/p>/,m=>'<details class="scope"><summary>Papildomai: jungtiniai įrenginiai ir MAC</summary>'+m+'</details>');
 theoryHtml=theoryHtml.replace(/<p>SMTP, POP3 ir IMAP gali veikti[\s\S]*?<\/p>/,m=>'<details class="scope"><summary>Papildomai: TLS ir SFTP skirtumai</summary>'+m+'</details>');
 if(number===6)theoryHtml='<p class="lesson-level">Praktinis taikymas. Komandos yra papildomos mokymosi priemonės, ne privalomas VBE komandų sąrašas.</p>'+theoryHtml;
 lessons.push({number,title:match[2],html:theoryHtml,goals:goals[number-1],terms:terms[number-1],reflection});
 for(const task of body.matchAll(/\*\*(\d\.\d)\. (.+?) \(3 tšk\.\)\.\*\* ([\s\S]*?)(?=\n\n|$)/g))activities.push({id:task[1],lesson:number,title:task[2],prompt:task[3].replace(/\n/g,' '),points:3});
}
const questions=[];
for(const m of source.matchAll(/^(\d+)\. (.+)$/gm)){
 const id=Number(m[1]);if(id<1||id>30)continue;
 if(id<=24){const q=m[2].match(/^(.+?) A\. (.+?); B\. (.+?); C\. (.+?); D\. (.+)\.$/);if(!q)throw Error('Cannot parse question '+id);questions.push({id,prompt:q[1],options:q.slice(2),correct:keys[id-1].charCodeAt(0)-65,lesson:Math.ceil(id/4),explanation:explanations[id-1],points:1})}
 else questions.push({id,prompt:m[2].replace(/^\(2 tšk\.\) /,''),lesson:id-24,points:2});
}
if(lessons.length!==6||activities.length!==18||questions.length!==30)throw Error(`Incomplete supplied content: ${lessons.length} lessons, ${activities.length} activities, ${questions.length} questions`);
fs.writeFileSync(path.join(root,'learning-materials/tinklai/content.js'),'/* Generated from the supplied student material; learning self-check only. */\nwindow.NGG_NETWORK_CONTENT='+JSON.stringify({version:1,lessons,activities,questions},null,2)+';\n');
const filename=path.join(root,'learning-materials/kompiuteriu-tinklai-atmintine.html');
if(fs.existsSync(filename)){
 const html=fs.readFileSync(filename,'utf8');
 const theory=lessons.map(l=>`<details class="lesson" id="pamoka-${l.number}"><summary><span class="lesson-number">0${l.number}</span><span><small>45 MIN. · ${l.number} PAMOKA</small><strong>${esc(l.title)}</strong></span><span class="plus" aria-hidden="true">+</span></summary><div class="lesson-body"><div class="goals"><h3>Šios pamokos tikslai</h3><ul>${l.goals.map(g=>'<li>'+esc(g)+'</li>').join('')}</ul></div>${l.html}<aside class="terms"><h3>Sąvokų atmintinė</h3><p>${l.terms.map(t=>'<strong>'+esc(t)+'</strong>').join(' · ')}</p></aside><div class="lesson-links"><a class="button" href="#praktika-${l.number}-1">Atlikti ${l.number}.1–${l.number}.3 užduotis <span aria-hidden="true">→</span></a>${[2,3,6].includes(l.number)?`<a class="button secondary" href="#lab-${l.number===2?'a':l.number===3?'b':'c'}">Į laboratoriją</a>`:''}</div><label class="reflection">Pamokos refleksija<span>${esc(l.reflection)}</span><textarea rows="3" placeholder="Paaiškinkite savo žodžiais…"></textarea></label></div></details>`).join('\n');
 if(html.includes('<!-- THEORY START -->'))fs.writeFileSync(filename,html.replace(/<!-- THEORY START -->[\s\S]*?<!-- THEORY END -->/,'<!-- THEORY START -->\n'+theory+'\n<!-- THEORY END -->'));
}
console.log('Generated: 6 complete lessons, 18 practice tasks, 30 self-check questions.');
