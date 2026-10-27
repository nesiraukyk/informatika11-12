/* NGG v5.45 – SECURE LINK. Integracija, mokytojo prieigos jungiklis ir mokinių pažanga.
   Pats šifravimas vykdomas izoliuotame iframe secure-link/index.html per Web Crypto API.
   Raktai NIEKADA nepersiunčiami į Supabase. */
(()=>{'use strict';
const TOPIC='kriptografija';
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const empty=()=>({proof:[false,false,false,false,false],quiz:null,answer:''});
function clean(value){
 const v=value&&typeof value==='object'?value:{};
 return {
  proof:Array.isArray(v.proof)&&v.proof.length===5?v.proof.map(x=>x===true):empty().proof,
  quiz:Number.isInteger(v.quiz)&&v.quiz>=0&&v.quiz<=2?v.quiz:null,
  answer:String(v.answer??'').slice(0,1600)
 };
}
async function available(sb,classId){
 const {data,error}=await sb.from('secure_link_settings').select('enabled').eq('class_id',classId).eq('topic_id',TOPIC).maybeSingle();
 if(error){console.warn('SECURE LINK prieiga:',error.message);return false}
 return data?.enabled===true;
}
async function mount({host,sb,classId,userId,preview=false,onBack}){
 if(!host||!sb||!classId)return;
 host.innerHTML='<div class="sl-state-panel">Tikrinama laboratorijos prieiga…</div>';
 const {data:topic}=await sb.from('class_topics').select('topic_id').eq('class_id',classId).eq('topic_id',TOPIC).eq('is_archived',false).maybeSingle();
 if(!topic){host.innerHTML='<div class="sl-state-panel">Šioje klasėje nėra kriptografijos temos.</div>';return}
 let existing=empty();
 if(!preview){
  const [{data:setting,error:settingsErr},{data:access,error:accessErr}]=await Promise.all([
   sb.from('secure_link_settings').select('enabled').eq('class_id',classId).eq('topic_id',TOPIC).maybeSingle(),
   sb.from('topic_access').select('is_open').eq('class_id',classId).eq('topic_id',TOPIC).maybeSingle()
  ]);
  if(settingsErr||accessErr||setting?.enabled!==true||access?.is_open!==true){host.innerHTML='<div class="sl-state-panel">Laboratorija šiai klasei neprieinama. Kreipkis į mokytoją.</div>';return}
  const {data,error}=await sb.from('secure_link_progress').select('proof,quiz,answer').eq('class_id',classId).eq('student_id',userId).eq('topic_id',TOPIC).maybeSingle();
  if(error){host.innerHTML='<div class="sl-state-panel">Nepavyko perskaityti pažangos: '+esc(error.message)+'</div>';return}
  existing=clean(data);
 }
 const bridge=crypto.randomUUID?crypto.randomUUID():String(Date.now())+'-'+String(Math.random());
 host.innerHTML=`<div class="sl-integrated-header"><div><h2>SECURE LINK · Ryšio laboratorija</h2><p>${preview?'Mokytojo demonstracija – mokinio rezultatai nesaugomi':'Eksperimentuok. Surink 5 saugumo bandymų įrodymus ir pateik išvadą.'}</p></div><button class="ghost" type="button" data-sl-back>← Grįžti į temą</button></div>
 <iframe class="sl-integration-frame" title="SECURE LINK – interaktyvi kriptografijos laboratorija" referrerpolicy="same-origin" loading="eager" allow="clipboard-write"></iframe>
 <div class="sl-state-panel sl-subtle" data-sl-status role="status">${preview?'Demonstracinis režimas.':'Išsaugota mokinio paskyroje, kai atliekami bandymai.'}</div>`;
 host.querySelector('[data-sl-back]').onclick=async()=>{clearTimeout(saveTimeout);if(!preview)await persist();onBack?.()};
 const frame=host.querySelector('iframe'), status=host.querySelector('[data-sl-status]');
 let closed=false,latest=existing,saveTimeout=null,saveQueue=Promise.resolve();
 const active=()=>host.isConnected && frame.isConnected && !closed && frame.contentWindow;
 async function checkAccess(){
  if(preview||!active())return;
  const [enabled,access]=await Promise.all([
   available(sb,classId),
   sb.from('topic_access').select('is_open').eq('class_id',classId).eq('topic_id',TOPIC).maybeSingle()
  ]);
  if(!enabled||access.data?.is_open!==true){closed=true;status.textContent='Mokytojas išjungė šią laboratoriją. Pažanga išlieka išsaugota.';frame.remove();}
 }
 async function persist(){
  if(!active()||preview)return;
  const payload=clean(latest);
  const {error}=await sb.from('secure_link_progress').upsert({class_id:classId,student_id:userId,topic_id:TOPIC,proof:payload.proof,quiz:payload.quiz,answer:payload.answer,updated_at:new Date().toISOString()},{onConflict:'class_id,student_id,topic_id'});
  if(!active())return;
  if(error){status.textContent='Nepavyko išsaugoti pažangos: '+error.message;status.style.color='#a74632';await checkAccess()}
  else{status.textContent='Pažanga išsaugota · '+new Date().toLocaleTimeString('lt-LT',{hour:'2-digit',minute:'2-digit'});status.style.color=''}
 }
 function listener(event){
  if(!active()||event.source!==frame.contentWindow||event.origin!==location.origin)return;
  const msg=event.data;
  if(!msg||msg.bridge!==bridge)return;
  if(msg.type==='secure-link-height'){
   const h=Number(msg.height);
   if(Number.isFinite(h)&&h>0)frame.style.height=Math.max(850,Math.min(6000,h))+'px';
  }else if(msg.type==='secure-link-ready'){
   frame.contentWindow.postMessage({type:'secure-link-restore',bridge,payload:existing},location.origin);
  }else if(msg.type==='secure-link-save'&&!preview){
   latest=clean(msg.payload);
   status.textContent='Išsaugoma…';
   clearTimeout(saveTimeout);
   saveTimeout=setTimeout(()=>{saveQueue=saveQueue.then(persist).catch(e=>console.warn('SECURE LINK:',e));},600);
  }
 }
 window.addEventListener('message',listener);
 // Išėjus į kitą ekraną ankstesnis iframe pašalinamas, o senas klausytojas negauna naujų pranešimų.
 frame.src='secure-link/index.html?embed=1&bridge='+encodeURIComponent(bridge);
 if(!preview){
  const watcher=setInterval(()=>{
   if(!active()){clearInterval(watcher);window.removeEventListener('message',listener);clearTimeout(saveTimeout);return}
   if(!document.hidden)checkAccess().catch(e=>console.warn('SECURE LINK prieiga:',e));
  },45000);
 }
}
async function mountTeacher({host,sb,c,students=[],openPreview}){
 if(!host||!sb||!c)return;
 host.innerHTML='<div class="sl-state-panel">Tikrinama SECURE LINK laboratorija…</div>';
 const [{data:cfg,error:err},{data:progress,error:pErr}]=await Promise.all([
  sb.from('secure_link_settings').select('enabled').eq('class_id',c.id).eq('topic_id',TOPIC).maybeSingle(),
  sb.from('secure_link_progress').select('student_id,proof,quiz,answer,updated_at').eq('class_id',c.id).eq('topic_id',TOPIC).order('updated_at',{ascending:false})
 ]);
 if(err){host.innerHTML='<div class="sl-state-panel">Prieigos valdymui pirmiausia paleisk SECURE LINK SQL failą. '+esc(err.message)+'</div>';return}
 const enabled=cfg?.enabled===true;
 const nameMap=Object.fromEntries(students.map(s=>[s.id||s.student_id,s.full_name||s.student_name||s.name||'Mokinys']));
 const complete=(progress||[]).filter(x=>Array.isArray(x.proof)&&x.proof.every(Boolean)&&x.quiz===2&&String(x.answer||'').trim().length>=80).length;
 host.innerHTML=`<div class="sl-state-panel sl-teacher-panel">
  <div class="sl-teacher-top"><div><div class="sl-subtle">11 KLASĖ · KRIPTOGRAFIJA</div><h3>SECURE LINK · Ryšio laboratorija</h3><p>Prieš įjungdamas mokiniams, išbandyk demonstracinį režimą.</p></div>
  <label class="sl-checkbox"><input type="checkbox" data-sl-enabled ${enabled?'checked':''}><span>Rodyti mokiniams</span></label></div>
  <div class="sl-teacher-actions"><button type="button" class="ghost" data-sl-preview>Atidaryti mokytojo peržiūrą ↗</button><span class="sl-subtle" data-sl-current>${enabled?'Mokiniams įjungta':'Mokiniams išjungta'} · ${(progress||[]).length} pradėjo · ${complete} baigė</span></div>
  <div data-sl-feedback role="status" class="sl-subtle" style="margin-top:8px"></div>
  ${pErr?`<p>Nepavyko įkelti progreso: ${esc(pErr.message)}</p>`:''}
  ${(progress||[]).length?`<details class="sl-teacher-students"><summary>Mokinių progresas (${progress.length})</summary>
   ${progress.map(r=>`<div class="sl-student-row"><b>${esc(nameMap[r.student_id]||'Mokinys')}</b><span>${Array.isArray(r.proof)?r.proof.filter(Boolean).length:0}/5 bandymų · ${r.quiz===2?'sprendimas pagrįstas':'sprendimas nepatvirtintas'}</span></div>${r.answer?`<div class="sl-subtle" style="padding:0 8px 11px">${esc(r.answer)}</div>`:''}`).join('')}</details>`:''}</div>`;
 host.querySelector('[data-sl-preview]').onclick=()=>openPreview?.();
 const checkbox=host.querySelector('[data-sl-enabled]');
 checkbox.onchange=async()=>{
  checkbox.disabled=true;
  const wanted=checkbox.checked;
  const {error}=await sb.from('secure_link_settings').upsert({class_id:c.id,topic_id:TOPIC,enabled:wanted,updated_at:new Date().toISOString()},{onConflict:'class_id'});
  if(error){checkbox.checked=!wanted;host.querySelector('[data-sl-feedback]').textContent='Nepavyko pakeisti prieigos: '+error.message}
  else {host.querySelector('[data-sl-current]').textContent=wanted?'Mokiniams įjungta':'Mokiniams išjungta';host.querySelector('[data-sl-feedback]').textContent=wanted?'Laboratorija dabar rodoma mokinių kriptografijos temoje.':'Laboratorija paslėpta mokiniams.'}
  checkbox.disabled=false;
 };
}
window.SecureLink=Object.freeze({TOPIC,mount,mountTeacher,available});
})();
