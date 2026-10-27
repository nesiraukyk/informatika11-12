/* SECURE LINK v5.51 – papildomos interaktyvios laboratorijos.
   Veikia iframe srcdoc ir atskirame secure-link.html, nieko nekeičia pagrindinės penkių bandymų logikos.
   Kriptografinius eksperimentus atlieka tik naršyklės Web Crypto API. */
(()=>{'use strict';
const base=document.querySelector('.evidencebar');
if(!base||document.getElementById('slAdvanced'))return;
const css=`
#slAdvanced{max-width:1740px;margin:12px auto 30px;padding:0 clamp(18px,3vw,46px);font-family:var(--font,system-ui);color:#192c2b}
#slAdvanced *{box-sizing:border-box}
#slAdvanced .xl-head{display:flex;gap:14px;justify-content:space-between;align-items:center;flex-wrap:wrap;border-top:3px solid #182e2c;padding:24px 0 15px}
#slAdvanced h2{font-size:clamp(24px,3vw,32px);margin:5px 0 4px;line-height:1.15;letter-spacing:-.02em}
#slAdvanced h3{font-size:clamp(18px,2.1vw,23px);line-height:1.2;margin:0}
#slAdvanced p{line-height:1.6;font-size:14px;color:#4a5c59;margin:7px 0 12px}
#slAdvanced .xl-kicker{font:800 11px/1.4 var(--mono,monospace);color:#187366;letter-spacing:1px}
#slAdvanced .xl-progress{font:800 11px var(--mono,monospace);border:1px solid #b7c8c1;background:#eaf4ef;padding:9px 13px;border-radius:3px;white-space:nowrap}
#slAdvanced .xl-lab{display:grid;grid-template-columns:1.02fr 1fr;gap:0;border:1px solid #ced7d1;background:white;margin:14px 0 26px;box-shadow:5px 5px 0 rgba(42,68,57,.045)}
#slAdvanced .xl-heading{grid-column:1/-1;background:#f3f7f4;border-bottom:1px solid #d5ded7;padding:17px 21px;display:flex;align-items:center;gap:13px;justify-content:space-between}
#slAdvanced .xl-num{font:900 25px var(--mono,monospace);color:#147361;flex-shrink:0}
#slAdvanced .xl-block{padding:21px;min-width:0}
#slAdvanced .xl-block+ .xl-block{border-left:1px solid #d6e0d8;background:#fafbf8}
#slAdvanced .xl-label{display:block;font:800 10px var(--mono,monospace);letter-spacing:.7px;margin:13px 0 8px;color:#42665b}
#slAdvanced .xl-action{display:inline-flex;align-items:center;justify-content:center;gap:6px;min-height:40px;padding:9px 13px;border:1px solid #294b43;background:#182c2c;color:#e9ffb7;font-size:13px;font-weight:800;text-align:center;cursor:pointer;margin:4px 6px 4px 0;border-radius:3px;transition:background .17s}
#slAdvanced .xl-action:hover:not(:disabled),#slAdvanced .xl-action:focus-visible{background:#285a50;outline:2px solid #75b4a5;outline-offset:2px}
#slAdvanced .xl-action:disabled{opacity:.45;cursor:not-allowed}
#slAdvanced .xl-action.alt{background:#fff;color:#284941;border-color:#b5c8be}
#slAdvanced .xl-action.alt:hover:not(:disabled){background:#e1f2e7}
#slAdvanced .xl-action.danger{background:#822e32;border-color:#822e32;color:#fff}
#slAdvanced .xl-action.danger:hover:not(:disabled){background:#ab3638}
#slAdvanced .xl-code{font:12px/1.6 var(--mono,monospace);background:#172827;color:#d8f5be;border-radius:3px;padding:12px;white-space:pre-wrap;overflow-wrap:anywhere;min-height:46px;max-height:155px;overflow:auto}
#slAdvanced .xl-pair{display:grid;grid-template-columns:1fr 1fr;gap:9px;margin:9px 0}
#slAdvanced .xl-choice{min-width:0;padding:13px;text-align:left;border:1px solid #cfdbd3;background:#fff;font:700 13px var(--font,system-ui);line-height:1.55;cursor:pointer;border-radius:4px}
#slAdvanced .xl-choice:hover{border-color:#1e8b72;background:#e8f3e9}
#slAdvanced .xl-choice strong{display:block;letter-spacing:.1px;color:#182f2b}
#slAdvanced .xl-choice small{display:block;color:#526960;font:11px/1.55 var(--mono,monospace);overflow-wrap:anywhere}
#slAdvanced .xl-status{padding:13px;border-left:4px solid #879f95;background:#eff3ef;color:#23453c;font-size:13px;line-height:1.65;margin:14px 0 0;white-space:pre-line;min-height:52px}
#slAdvanced .xl-status.good{border-color:#1b846a;background:#e4f5e9;color:#1c614f}
#slAdvanced .xl-status.bad{border-color:#c44c43;background:#fff0ec;color:#853a35}
#slAdvanced .xl-pulse{animation:xlflash 1.1s ease-out}
@keyframes xlflash{0%{box-shadow:0 0 0 5px #e4e7a0;transform:translateY(-2px)}100%{box-shadow:none;transform:none}}
#slAdvanced .xl-txt{font:14px/1.5 var(--font,system-ui);background:#fff;border:1px solid #b7c9bf;border-radius:3px;padding:11px;width:100%;resize:vertical;min-height:73px}
#slAdvanced .xl-step{display:flex;gap:12px;align-items:flex-start;padding:11px 0;border-bottom:1px dashed #ccd8d0}
#slAdvanced .xl-step:last-child{border:0}
#slAdvanced .xl-step .dot{display:grid;place-items:center;flex:0 0 30px;height:30px;border-radius:50%;font:800 12px var(--mono,monospace);border:1px solid #abc3b6;background:#f1f7f2;color:#296a58}
#slAdvanced .xl-step.done .dot{background:#14735f;color:#fff}
#slAdvanced .xl-step b{display:block;font-size:13px;margin-bottom:3px}
#slAdvanced .xl-step span{color:#587067;font-size:12px;line-height:1.5}
#slAdvanced .xl-tip{padding:11px 13px;border:1px solid #d8dfd6;background:#f6f7f2;color:#486356;font-size:12px;line-height:1.6;margin-top:12px}
#slAdvanced .xl-new{display:inline-flex;font:800 11px var(--mono,monospace);border-radius:2px;background:#ebf3e7;color:#236c51;padding:5px 7px}
#slAdvanced .xl-error{font-size:13px;color:#8e3d36;margin-top:10px}
#slAdvanced .xl-completion{font-weight:850;font-size:11px;white-space:nowrap;color:#58746a}
#slAdvanced .xl-completion.done{color:#187759}
@media(max-width:790px){#slAdvanced .xl-lab{grid-template-columns:1fr}#slAdvanced .xl-block+.xl-block{border-left:0;border-top:1px solid #d6e0d8}#slAdvanced .xl-heading{padding:15px}}
@media(max-width:480px){#slAdvanced .xl-pair{grid-template-columns:1fr}#slAdvanced .xl-block{padding:14px}}
@media(prefers-reduced-motion:reduce){#slAdvanced .xl-pulse{animation:none}}
`;
const style=document.createElement('style');style.textContent=css;document.head.appendChild(style);
const section=document.createElement('section');section.id='slAdvanced';section.setAttribute('aria-label','Papildomi saugaus ryšio eksperimentai');
section.innerHTML=`
<header class="xl-head"><div><span class="xl-kicker">TOLIAU / SAUGAUS RYŠIO KONSTRAVIMAS</span><h2>Tavo sistema dar turi spragų</h2><p>Jau matei, kaip slėpti žinutę. Dabar patikrink <b>kam priklauso raktas</b>, <b>kas pasirašė pranešimą</b> ir <b>kaip saugiai išsiųsti didelį dokumentą</b>.</p></div><span class="xl-progress" id="xlProgress">0 / 3 papildomi bandymai</span></header>
<article class="xl-lab" id="xlTrust"><header class="xl-heading"><div><span class="xl-kicker">EKSPERIMENTAS 06 · TAPATYBĖ</span><h3>Ar tai tikrai Beno viešasis raktas?</h3></div><span class="xl-completion" data-complete="trust">NEATLIKTA</span></header>
<div class="xl-block"><p><b>Situacija:</b> Agnė nori užšifruoti AES raktą Beno viešuoju RSA raktu. Užpuolikas bando vietoje jo pateikti savo viešąjį raktą. Abu raktai veikia, bet vienu jų naudotis nesaugu.</p><button class="xl-action" id="xlGenKeys" type="button">1. Gauti abu viešuosius raktus</button><span class="xl-label">BENO PATVIRTINTAS ATSPAUDAS (GAUTAS KITU PATIKIMU KANALU)</span><div class="xl-code" id="xlTrustedPrint">Paspausk „Gauti raktus“.</div><div class="xl-pair" id="xlChoices"></div><div class="xl-tip">Palygink <b>raktų pirštų atspaudus</b>. Vien užrašo „Beno raktas“ nepakanka – užpuolikas gali jį suklastoti. Tai mokomasis patikros modelis; tikrose sistemose naudojama patikima sertifikatų infrastruktūra.</div></div>
<div class="xl-block"><span class="xl-label">PATIKRINIMAS TINKLE</span><p>Pasirink raktą ir spausk „Siųsti“. Programa tikrai užšifruos AES raktą pasirinktu RSA viešuoju raktu ir patikrins, kas geba jį atkurti.</p><button class="xl-action" id="xlSendChosen" type="button" disabled>2. Siųsti pasirinktu raktu</button><div class="xl-status" id="xlTrustResult" role="status">Laukiama rakto patikros.</div><div class="xl-label">KĄ TURĖTUM SUPRASTI?</div><p>RSA užtikrina, kad paketą gali iššifruoti konkretaus viešojo rakto privatusis raktas. <b>Bet be rakto savininko patikros nežinai, ar tas privatusis raktas priklauso Benui.</b></p></div></article>
<article class="xl-lab" id="xlSignature"><header class="xl-heading"><div><span class="xl-kicker">EKSPERIMENTAS 07 · AUTENTIŠKUMAS</span><h3>Ar kas nors pakeitė pasirašytą žinutę?</h3></div><span class="xl-completion" data-complete="signature">NEATLIKTA</span></header>
<div class="xl-block"><p><b>Situacija:</b> mokyklos komanda siunčia projekto patvirtinimą. Turinio paslėpti nebūtina, tačiau reikia patikrinti, ar jį pasirašė atitinkamo privataus rakto turėtojas ir ar tekstas nepasikeitė.</p><label for="xlSignText" class="xl-label">TEKSTAS, KURĮ PASIRAŠYS AGNĖ</label><textarea class="xl-txt" id="xlSignText">Patvirtinu mokyklos projekto pristatymą penktadienį.</textarea><button type="button" class="xl-action" id="xlSign">1. Sukurti skaitmeninį parašą</button><div class="xl-label">RSA-PSS PARAŠAS (SANTRAUKA EKRANE)</div><div class="xl-code" id="xlSignBytes">Dar nepasirašyta.</div></div>
<div class="xl-block"><p>Patikrink originalų pasirašytą tekstą. Tuomet pakeisk vieną raidę – turi pamatyti, kodėl tas pats parašas nebegalioja.</p><button type="button" class="xl-action alt" id="xlCheckSign" disabled>2. Patikrinti parašą</button><button type="button" class="xl-action danger" id="xlModifySign" disabled>3. Pakeisti teksto simbolį</button><button type="button" class="xl-action alt" id="xlCheckChanged" disabled>4. Tikrinti pakeistą tekstą</button><div class="xl-status" id="xlSignResult" role="status">Pirmiausia sukurk parašą.</div><div class="xl-tip">Skaitmeninis parašas <b>nešifruoja</b> žinutės ir neslepia jos nuo pašalinių. Jis įrodo, kad tikrinamas tekstas atitinka parašą ir raktą. Kas yra rakto savininkas, vis tiek reikia patikrinti.</div></div></article>
<article class="xl-lab" id="xlHybrid"><header class="xl-heading"><div><span class="xl-kicker">EKSPERIMENTAS 08 · HIBRIDINIS ŠIFRAVIMAS</span><h3>Sudėk saugaus perdavimo sistemą</h3></div><span class="xl-completion" data-complete="hybrid">NEATLIKTA</span></header>
<div class="xl-block"><p><b>Užduotis:</b> užšifruok dokumentą AES-GCM, o AES raktą apsaugok Beno viešuoju RSA-OAEP raktu. Tai vadinama <b>hibridiniu šifravimu</b>.</p><label class="xl-label" for="xlDocument">PROJEKTO DOKUMENTAS</label><textarea id="xlDocument" class="xl-txt">Mokyklos projektas: biudžetas patvirtintas, pristatymas gruodžio 5 d. Reikia išsaugoti dokumento konfidencialumą.</textarea><button type="button" class="xl-action" id="xlMakeHybrid">1. Sukurti raktus</button><button type="button" class="xl-action alt" id="xlEncryptHybrid" disabled>2. Užšifruoti dokumentą (AES)</button><button type="button" class="xl-action alt" id="xlWrapHybrid" disabled>3. Apsaugoti AES raktą (RSA)</button><button type="button" class="xl-action" id="xlDeliverHybrid" disabled>4. Išsiųsti ir atkurti</button><button type="button" class="xl-action danger" id="xlBreakHybrid" disabled>5. Pakeisti paketą</button><div class="xl-status" id="xlHybridResult" role="status">Darbą pradėk nuo raktų sukūrimo.</div></div>
<div class="xl-block"><span class="xl-label">TAVO KONSTRUOJAMAS PROTOKOLAS</span><div class="xl-step" id="xlStep0"><div class="dot">1</div><div><b>Gavėjo RSA raktai ir naujas AES raktas</b><span>Gavėjui perduodamas tik viešasis RSA raktas, o privatus lieka jam.</span></div></div><div class="xl-step" id="xlStep1"><div class="dot">2</div><div><b>Dokumentas → AES-GCM paketas</b><span>Žinutė paslepiama ir apsaugoma nuo pakeitimų.</span></div></div><div class="xl-step" id="xlStep2"><div class="dot">3</div><div><b>AES raktas → RSA-OAEP paketas</b><span>Slaptas AES raktas užšifruojamas gavėjo viešuoju raktu.</span></div></div><div class="xl-step" id="xlStep3"><div class="dot">4</div><div><b>Benas atkuria AES raktą ir dokumentą</b><span>Naudojamas Beno privatus RSA raktas, tada AES.</span></div></div><div class="xl-step" id="xlStep4"><div class="dot">5</div><div><b>Pakeisto paketo atmetimas</b><span>Tamper test: pakitęs šifruotas paketas neturi būti priimtas.</span></div></div><div class="xl-label">PERDUODAMO PAKETO DALIŲ PERŽIŪRA</div><div class="xl-code" id="xlPacketDetails">Pradėk konstravimą.</div><div class="xl-tip">Ši schema tikra kriptografinė demonstracija, tačiau <b>tai nėra tikras TLS protokolas</b>. Didelį dokumentą šifruojame AES, o RSA naudojame nedideliam AES raktui apsaugoti.</div></div></article>
`;
base.insertAdjacentElement('afterend',section);
const $=id=>document.getElementById(id),e=new TextEncoder(),d=new TextDecoder();
const defaults=()=>({trust:false,signature:false,hybrid:false});
let finished=defaults(),trustPair=null,attackerPair=null,trustFp='',attackerFp='',choice=null,checked={attacker:false,ben:false};
let signer=null,signature=null,originalText='',signedVerified=false,changedVerified=false;
let pair=null,aes=null,iv=null,cipher=null,wrapped=null,hybridText='',hybridStage=0;
const embedded=!!window.SECURE_LINK_CONTEXT?.embed||new URLSearchParams(location.search).get('embed')==='1';
const bridge=window.SECURE_LINK_CONTEXT?.bridge||new URLSearchParams(location.search).get('bridge')||'';
const safeWord=(word)=>String(word||'').slice(0,220);
const b64=bytes=>btoa(String.fromCharCode(...bytes));
const hexdump=bytes=>[...bytes].map(b=>b.toString(16).padStart(2,'0')).join('').toUpperCase();
function stateStatus(id,message,type=''){const el=$(id);el.textContent=message;el.className='xl-status'+(type?' '+type:'');el.classList.remove('xl-pulse');void el.offsetWidth;el.classList.add('xl-pulse');}
function save(){const payload={trust:!!finished.trust,signature:!!finished.signature,hybrid:!!finished.hybrid};if(embedded)window.parent.postMessage({type:'secure-link-extra-save',bridge,payload},window.SECURE_LINK_CONTEXT?.origin||location.origin);else{try{localStorage.setItem('securelink_extra_v551',JSON.stringify(payload));}catch{}}}
function repaint(){const count=Object.values(finished).filter(Boolean).length;$('xlProgress').textContent=count+' / 3 papildomi bandymai';for(const k of Object.keys(finished)){const el=section.querySelector('[data-complete="'+k+'"]');el.textContent=finished[k]?'✓ ATLIKTA':'NEATLIKTA';el.classList.toggle('done',finished[k]);}}
function done(key){if(finished[key])return;finished[key]=true;repaint();save();}
function err(id,error){stateStatus(id,'Nepavyko: '+safeWord(error?.message||error)+'. Patikrink, ar svetainė atidaryta per HTTPS.','bad');}
function needsCrypto(id){if(!globalThis.crypto?.subtle){stateStatus(id,'Šiam tikram kriptografiniam bandymui reikalingas HTTPS (arba localhost).','bad');return false}return true}
async function fingerprint(pub){const spki=new Uint8Array(await crypto.subtle.exportKey('spki',pub));return hexdump(new Uint8Array(await crypto.subtle.digest('SHA-256',spki)));}
async function genRSA(){return crypto.subtle.generateKey({name:'RSA-OAEP',modulusLength:2048,publicExponent:new Uint8Array([1,0,1]),hash:'SHA-256'},false,['encrypt','decrypt']);}
async function wrapEncrypt(pub,text){const key=await crypto.subtle.generateKey({name:'AES-GCM',length:256},true,['encrypt','decrypt']);const raw=new Uint8Array(await crypto.subtle.exportKey('raw',key));const iv=crypto.getRandomValues(new Uint8Array(12));const content=new Uint8Array(await crypto.subtle.encrypt({name:'AES-GCM',iv},key,e.encode(text)));const w=new Uint8Array(await crypto.subtle.encrypt({name:'RSA-OAEP'},pub,raw));return {iv,content,w};}
function click(id,fn){$(id).addEventListener('click',()=>Promise.resolve(fn()).catch(ex=>err(id.startsWith('xlSign')||id==='xlCheckSign'||id==='xlModifySign'||id==='xlCheckChanged'?'xlSignResult':id.startsWith('xl')&&id.includes('Hybrid')?'xlHybridResult':'xlTrustResult',ex)));}
click('xlGenKeys',async()=>{if(!needsCrypto('xlTrustResult'))return;const b=$('xlGenKeys');b.disabled=true;stateStatus('xlTrustResult','Generuojami du nepriklausomi RSA-2048 raktų rinkiniai…');try{[trustPair,attackerPair]=await Promise.all([genRSA(),genRSA()]);[trustFp,attackerFp]=await Promise.all([fingerprint(trustPair.publicKey),fingerprint(attackerPair.publicKey)]);$('xlTrustedPrint').textContent=trustFp.match(/.{1,8}/g).join(' ');const options=[{type:'ben',fp:trustFp},{type:'attacker',fp:attackerFp}];if(crypto.getRandomValues(new Uint8Array(1))[0]%2)options.reverse();$('xlChoices').innerHTML='';options.forEach((o,i)=>{const btn=document.createElement('button');btn.className='xl-choice';btn.type='button';btn.innerHTML='<strong>Raktas '+(i+1)+' → Pasirinkti</strong><small></small>';btn.querySelector('small').textContent=o.fp.match(/.{1,8}/g).join(' ');btn.onclick=()=>{choice=o.type;section.querySelectorAll('.xl-choice').forEach(x=>x.style.borderColor='#cfdbd3');btn.style.borderColor='#0a8a69';stateStatus('xlTrustResult',o.type==='ben'?'Rinktis teisinga: raktų atspaudai sutampa. Dabar pabandyk perduoti paketą.':'Įspėjimas: šio rakto atspaudas NEATITINKA patikimo Beno atspaudo. Tai gali būti užpuoliko raktas. Atlik bandymą ir pamatyk pasekmę.',o.type==='ben'?'good':'bad');};$('xlChoices').appendChild(btn)});$('xlSendChosen').disabled=false;stateStatus('xlTrustResult','Du viešieji raktai gauti. Palygink jų atspaudus su Beno patvirtintu įrašu.','good');}catch(ex){err('xlTrustResult',ex)}finally{b.disabled=false}});
click('xlSendChosen',async()=>{
 if(!trustPair||!attackerPair||!needsCrypto('xlTrustResult'))return;
 if(!choice){stateStatus('xlTrustResult','Pirmiausia pasirink vieną iš dviejų viešųjų raktų ir palygink jo atspaudą su patikimu Beno atspaudu.','bad');return;}
 const recipient=choice==='ben'?trustPair:attackerPair;
 const packet=await wrapEncrypt(recipient.publicKey,'Mokyklos konfidencialus projektas');
 if(choice==='attacker'){
  const attackerRaw=await crypto.subtle.decrypt({name:'RSA-OAEP'},attackerPair.privateKey,packet.w);
  const attackerKey=await crypto.subtle.importKey('raw',attackerRaw,{name:'AES-GCM'},false,['decrypt']);
  const stolen=d.decode(await crypto.subtle.decrypt({name:'AES-GCM',iv:packet.iv},attackerKey,packet.content));
  checked.attacker=true;
  stateStatus('xlTrustResult','PERIMTA! Užpuolikas savo privačiuoju RSA raktu atkūrė AES raktą ir perskaitė: „'+stolen+'“.\nKodėl? Agnė pasirinko nepatikrintą, užpuolikui priklausantį viešąjį raktą. Patikrink atspaudus ir išbandyk kitą variantą.','bad');
 }else{
  const benign=await crypto.subtle.decrypt({name:'RSA-OAEP'},trustPair.privateKey,packet.w);
  const beneKey=await crypto.subtle.importKey('raw',benign,{name:'AES-GCM'},false,['decrypt']);
  const text=d.decode(await crypto.subtle.decrypt({name:'AES-GCM',iv:packet.iv},beneKey,packet.content));
  let attackerFailed=false;
  try{await crypto.subtle.decrypt({name:'RSA-OAEP'},attackerPair.privateKey,packet.w);}catch{attackerFailed=true;}
  if(!attackerFailed)throw Error('Netikėta: užpuolikas iššifravo svetimą raktą.');
  checked.ben=true;
  stateStatus('xlTrustResult','SĖKMĖ! Benas atkūrė AES raktą ir pranešimą: „'+text+'“. Užpuoliko privatusis raktas jo neatkūrė.\nKodėl? Patikrinus viešojo rakto atspaudą, naudojamas tinkamo gavėjo raktas. Dabar išbandyk kitą variantą.','good');
 }
 if(checked.attacker&&checked.ben)done('trust');
});
click('xlSign',async()=>{if(!needsCrypto('xlSignResult'))return;originalText=$('xlSignText').value.trim();if(originalText.length<15){stateStatus('xlSignResult','Įrašyk ne trumpesnį nei 15 simbolių tekstą.','bad');return;}const b=$('xlSign');b.disabled=true;stateStatus('xlSignResult','Kuriama atskira RSA-PSS pasirašymo raktų pora…');try{signer=await crypto.subtle.generateKey({name:'RSA-PSS',modulusLength:2048,publicExponent:new Uint8Array([1,0,1]),hash:'SHA-256'},false,['sign','verify']);signature=new Uint8Array(await crypto.subtle.sign({name:'RSA-PSS',saltLength:32},signer.privateKey,e.encode(originalText)));$('xlSignBytes').textContent=b64(signature).slice(0,150)+'…';$('xlCheckSign').disabled=false;$('xlModifySign').disabled=false;$('xlCheckChanged').disabled=true;signedVerified=false;changedVerified=false;stateStatus('xlSignResult','Parašas sukurtas privataus pasirašymo rakto pagalba. Dabar spausk „Patikrinti parašą“.','good');}finally{b.disabled=false}});
click('xlCheckSign',async()=>{if(!signature)return;const ok=await crypto.subtle.verify({name:'RSA-PSS',saltLength:32},signer.publicKey,signature,e.encode($('xlSignText').value));signedVerified=ok;stateStatus('xlSignResult',ok?'PATVIRTINTA: parašas atitinka nepakitusį tekstą ir viešąjį raktą. Parašas slepia duomenis? Ne. Jis tikrinamas viešuoju raktu.':'ATMESTA: tekstas pakeistas po pasirašymo. Netinkamas turinys nebeatitinka parašo.',ok?'good':'bad');if(ok&&changedVerified)done('signature');});
click('xlModifySign',()=>{if(!signature)return;const current=$('xlSignText').value;$('xlSignText').value=current+' (PATAISYTA)';$('xlCheckChanged').disabled=false;stateStatus('xlSignResult','Vienu veiksmu pakeistas pasirašytas tekstas. Atkreipk dėmesį: tas pats parašas dabar bus tikrinamas naujam turiniui.','bad');});
click('xlCheckChanged',async()=>{if(!signature)return;const text=$('xlSignText').value;const ok=await crypto.subtle.verify({name:'RSA-PSS',saltLength:32},signer.publicKey,signature,e.encode(text));changedVerified=!ok&&text!==originalText;stateStatus('xlSignResult',changedVerified?'PAKEITIMAS APTIKTAS: skaitmeninis parašas nebegalioja, nes pakeistas tekstas.\nKodėl? Parašas matematiškai susietas su konkrečiu pasirašytu turiniu.':'Parašas vis dar galioja – pakeisk tekstą ir bandyk iš naujo.',changedVerified?'good':'bad');if(changedVerified&&signedVerified)done('signature');});
function hybridStep(n){hybridStage=n;for(let i=0;i<5;i++)$('xlStep'+i).classList.toggle('done',i<n);$('xlEncryptHybrid').disabled=n<1;$('xlWrapHybrid').disabled=n<2;$('xlDeliverHybrid').disabled=n<3;$('xlBreakHybrid').disabled=n<4;}
click('xlMakeHybrid',async()=>{if(!needsCrypto('xlHybridResult'))return;const txt=$('xlDocument').value.trim();if(txt.length<20){stateStatus('xlHybridResult','Dokumente turi būti bent 20 simbolių.','bad');return}pair=await genRSA();aes=await crypto.subtle.generateKey({name:'AES-GCM',length:256},true,['encrypt','decrypt']);hybridText=txt;iv=null;cipher=null;wrapped=null;hybridStep(1);$('xlPacketDetails').textContent='RSA-2048 raktai sugeneruoti; AES-256 raktas – tik naršyklės atmintyje.';stateStatus('xlHybridResult','1/5: Benas turi RSA raktų porą, o Agnė – vienkartinį AES raktą. Kas toliau? Užšifruok dokumentą.','good');});
click('xlEncryptHybrid',async()=>{if(!aes)return;if(hybridStage!==1){stateStatus('xlHybridResult','Dokumentas jau užšifruotas. Toliau apsaugok AES raktą RSA algoritmu.');return;}iv=crypto.getRandomValues(new Uint8Array(12));cipher=new Uint8Array(await crypto.subtle.encrypt({name:'AES-GCM',iv},aes,e.encode(hybridText)));hybridStep(2);$('xlPacketDetails').textContent='IV (viešas): '+b64(iv)+'\nAES-GCM paketas: '+b64(cipher).slice(0,110)+'…';stateStatus('xlHybridResult','2/5: Dokumentas užšifruotas AES-GCM; IV išsaugotas prie paketo. Dabar saugiai perduok AES raktą.','good');});
click('xlWrapHybrid',async()=>{if(!pair||!aes||hybridStage!==2)return;const raw=await crypto.subtle.exportKey('raw',aes);wrapped=new Uint8Array(await crypto.subtle.encrypt({name:'RSA-OAEP'},pair.publicKey,raw));hybridStep(3);$('xlPacketDetails').textContent+='\nRSA užšifruotas AES raktas: '+b64(wrapped).slice(0,100)+'…';stateStatus('xlHybridResult','3/5: AES raktas užšifruotas Beno viešuoju RSA raktu. Dabar galima perduoti du paketus ir IV.','good');});
click('xlDeliverHybrid',async()=>{if(hybridStage!==3||!wrapped)return;const raw=await crypto.subtle.decrypt({name:'RSA-OAEP'},pair.privateKey,wrapped);const key=await crypto.subtle.importKey('raw',raw,{name:'AES-GCM'},false,['decrypt']);const plaintext=d.decode(await crypto.subtle.decrypt({name:'AES-GCM',iv},key,cipher));if(plaintext!==hybridText)throw Error('Atgautas tekstas neatitinka pradinio dokumento.');hybridStep(4);stateStatus('xlHybridResult','4/5: Benas savo privačiuoju RSA raktu atkūrė AES raktą ir sėkmingai iššifravo dokumentą.\nGautas tekstas: „'+plaintext.slice(0,170)+'“.','good');});
click('xlBreakHybrid',async()=>{if(hybridStage!==4||!cipher)return;const bad=cipher.slice();bad[0]^=1;let rejected=false;try{await crypto.subtle.decrypt({name:'AES-GCM',iv},aes,bad);}catch{rejected=true;}if(!rejected){stateStatus('xlHybridResult','Netikėta: pakeistas paketas priimtas.','bad');return;}hybridStep(5);done('hybrid');stateStatus('xlHybridResult','5/5: PUOLIMO BANDYMAS ATMESTAS. Pakeitus užšifruoto dokumento baitą, AES-GCM nepriėmė paketo.\nIšvada: hibridinis šifravimas derina AES efektyvumą su RSA rakto perdavimu.','good');});
if(!embedded){try{const v=JSON.parse(localStorage.getItem('securelink_extra_v551')||'null');if(v&&typeof v==='object'){for(const k of Object.keys(finished))finished[k]=v[k]===true}}catch{}}
else window.addEventListener('message',ev=>{if(ev.origin!==(window.SECURE_LINK_CONTEXT?.origin||location.origin)||ev.source!==window.parent)return;const m=ev.data;if(m?.type!=='secure-link-restore'||m?.bridge!==bridge)return;const extra=m.payload?.extra;if(extra&&typeof extra==='object'){for(const k of Object.keys(finished))finished[k]=extra[k]===true;repaint()}},false);
repaint();
})();