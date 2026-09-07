
const SETTINGS=window.SUPABASE_SETTINGS||{};
const configured=SETTINGS.url && SETTINGS.publishableKey &&
 !SETTINGS.url.includes('PAKEISKITE_') && !SETTINGS.publishableKey.includes('PAKEISKITE_');
const sb=configured?window.supabase.createClient(SETTINGS.url,SETTINGS.publishableKey):null;
const CFG=window.SITE_CONFIG,PRACTICE=window.PRACTICE_QUESTIONS||[],ASSESSMENT=window.ASSESSMENT_QUESTIONS||[];
const $=id=>document.getElementById(id),topicById=id=>CFG.topics.find(t=>t.id===id);
const esc=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
const shuffle=a=>{a=[...a];for(let i=a.length-1;i>0;i--){let j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a};
const fmtSec=s=>{s=Number(s||0);const h=Math.floor(s/3600),m=Math.floor((s%3600)/60);return h?`${h} val. ${m} min.`:`${m} min.`};
const fmtDate=d=>d?new Date(d).toLocaleString('lt-LT'):'–';
let me=null,profile=null,currentClass=null,activitySessionId=null,heartbeatTimer=null;
let quiz={topicId:null,classId:null,mode:null,items:[],index:0,answers:[],attemptId:null,startMs:0,last:null};

function show(name){document.querySelectorAll('.view').forEach(v=>v.classList.add('hidden'));$('view-'+name).classList.remove('hidden');window.scrollTo({top:0,behavior:'smooth'})}
function toast(x){$('toast').textContent=x;$('toast').classList.remove('hidden');clearTimeout(window.__toast);window.__toast=setTimeout(()=>$('toast').classList.add('hidden'),2500)}
function modal(html){$('modalContent').innerHTML=html;$('modal').classList.remove('hidden')}
function closeModal(){$('modal').classList.add('hidden')}
$('modalClose').onclick=closeModal;
$('modal').onclick=e=>{if(e.target===$('modal'))closeModal()};
function authMsg(text,error=false){$('authMessage').textContent=text;$('authMessage').className='formMessage '+(error?'error':'')}

function route(name){
 if(!me && !['auth','setup'].includes(name))return show('auth');
 if(name==='dashboard')return renderDashboard();
 if(name==='teacher')return profile?.role==='teacher'||profile?.role==='admin'?renderTeacher():renderStudent();
 if(name==='student')return renderStudent();
 if(name==='profile')return renderProfile();
 show(name);
}
document.querySelectorAll('[data-route]').forEach(b=>b.onclick=()=>route(b.dataset.route));

function setHeader(){
 $('appHeader').classList.toggle('hidden',!me);
 if(!profile)return;
 const isTeacher=['teacher','admin'].includes(profile.role);
 $('headerRole').textContent=profile.role==='teacher'?'Mokytojas':profile.role==='admin'?'Administratorius':'Mokinys';
 $('homeNav').classList.toggle('hidden',true);
 $('teacherNav').classList.toggle('hidden',!isTeacher);
 $('studentNav').classList.toggle('hidden',isTeacher);
}

$('themeToggle').onclick=()=>{const n=(document.documentElement.dataset.theme||'light')==='dark'?'light':'dark';document.documentElement.dataset.theme=n;localStorage.setItem('inf11v3_theme',n)};
$('logoutBtn').onclick=async()=>{stopHeartbeat();await sb.auth.signOut();me=null;profile=null;currentClass=null;setHeader();show('auth')};

$('tabLogin').onclick=()=>{$('tabLogin').classList.add('active');$('tabSignup').classList.remove('active');$('loginForm').classList.remove('hidden');$('signupForm').classList.add('hidden')};
$('tabSignup').onclick=()=>{$('tabSignup').classList.add('active');$('tabLogin').classList.remove('active');$('signupForm').classList.remove('hidden');$('loginForm').classList.add('hidden')};

$('loginForm').onsubmit=async e=>{
 e.preventDefault();authMsg('Jungiamasi...');
 const {error}=await sb.auth.signInWithPassword({email:$('loginEmail').value.trim(),password:$('loginPassword').value});
 if(error)return authMsg(error.message,true);
 authMsg('Prisijungta.');
};
$('signupForm').onsubmit=async e=>{
 e.preventDefault();authMsg('Kuriama paskyra...');
 const {data,error}=await sb.auth.signUp({
  email:$('signupEmail').value.trim(),password:$('signupPassword').value,
  options:{data:{full_name:$('signupName').value.trim()}}
 });
 if(error)return authMsg(error.message,true);
 authMsg(data.session?'Paskyra sukurta ir prisijungta.':'Paskyra sukurta. Patikrink el. paštą, jei įjungtas patvirtinimas.');
};

async function loadProfile(){
 const {data,error}=await sb.from('profiles').select('*').eq('id',me.id).single();
 if(error)throw error;profile=data;await sb.rpc('mark_login');setHeader();
}
async function startHeartbeat(classId=null){
 stopHeartbeat();
 const {data,error}=await sb.from('activity_sessions').insert({user_id:me.id,class_id:classId}).select('id').single();
 if(!error){activitySessionId=data.id;heartbeatTimer=setInterval(async()=>{if(document.visibilityState==='visible'&&activitySessionId)await sb.rpc('heartbeat_activity',{p_session_id:activitySessionId})},30000)}
}
function stopHeartbeat(){if(heartbeatTimer)clearInterval(heartbeatTimer);heartbeatTimer=null;activitySessionId=null}

async function renderDashboard(){
 if(profile.role==='teacher'||profile.role==='admin')return renderTeacher();
 return renderStudent();
}

/* ================= TEACHER ================= */
async function renderTeacher(){
 show('teacher');$('teacherContent').innerHTML='<div class="pageHero"><span class="kicker">MOKYTOJAS</span><h1>Kraunama...</h1></div>';
 const {data:classes,error}=await sb.from('classes').select('*').eq('teacher_id',me.id).order('created_at');
 if(error)return $('teacherContent').innerHTML=`<div class="notice">${esc(error.message)}</div>`;
 const classIds=classes.map(c=>c.id);
 let members=[],attempts=[],sessions=[];
 if(classIds.length){
  ({data:members}=await sb.from('class_members').select('class_id,student_id,joined_at').in('class_id',classIds));
  ({data:attempts}=await sb.from('practice_attempts').select('*').in('class_id',classIds));
  ({data:sessions}=await sb.from('activity_sessions').select('*').in('class_id',classIds));
 }
 members=members||[];attempts=attempts||[];sessions=sessions||[];
 const studentIds=[...new Set(members.map(m=>m.student_id))];
 let students=[];
 if(studentIds.length)({data:students}=await sb.from('profiles').select('id,full_name,last_login_at,last_seen_at').in('id',studentIds));
 students=students||[];
 const totalStudents=studentIds.length,totalAttempts=attempts.length,totalSeconds=sessions.reduce((n,s)=>n+(s.duration_seconds||0),0);
 $('teacherContent').innerHTML=`
 <div class="pageHero"><span class="kicker">MOKYTOJO SKYDELIS</span><h1>Sveiki, ${esc(profile.full_name||'mokytojau')}.</h1><p>Čia matote tik savo klases, savo mokinius, jų rezultatus ir pateiktus darbus.</p></div>
 <div class="dashboardGrid">
  <div class="metric"><strong>${classes.length}</strong><span>klasių</span></div>
  <div class="metric"><strong>${totalStudents}</strong><span>mokinių</span></div>
  <div class="metric"><strong>${totalAttempts}</strong><span>praktikos / testų bandymų</span></div>
  <div class="metric"><strong>${fmtSec(totalSeconds)}</strong><span>bendras aktyvus laikas</span></div>
 </div>
 <div class="contentGrid"><div class="panel">
  <div class="sectionTitle"><div class="grow"><span class="kicker">MANO KLASĖS</span><h2>Klasės</h2></div><button class="primary" id="newClassBtn">+ Nauja klasė</button></div>
  <div id="classList">${classes.length?classes.map(c=>{
    const cnt=new Set(members.filter(m=>m.class_id===c.id).map(m=>m.student_id)).size;
    return `<div class="classCard"><div class="grow"><h3>${esc(c.name)}</h3><span class="subtle">${cnt} mok. · kodas <b>${esc(c.join_code)}</b></span></div><button class="primary" data-class="${c.id}">Atidaryti</button></div>`
  }).join(''):'<div class="emptyState"><b>Dar neturite klasių.</b>Sukurkite pirmą klasę ir duokite mokiniams prisijungimo kodą.</div>'}</div>
 </div>
 <div class="stack">
  <div class="panel"><span class="kicker">GREITA SUVESTINĖ</span><h3>Naujausi mokiniai</h3>
   ${students.length?students.slice(0,7).map(s=>`<div class="studentRow"><div class="grow"><b>${esc(s.full_name||'Mokinys')}</b><div class="subtle">Paskutinį kartą: ${fmtDate(s.last_seen_at||s.last_login_at)}</div></div></div>`).join(''):'<div class="emptyState">Mokinių dar nėra.</div>'}
  </div>
  <div class="panel" id="teacherLibrary">
   <span class="kicker">MANO FAILAI</span><h3>Kraunama mokytojo biblioteka...</h3>
  </div>
 </div></div>`;
 $('newClassBtn').onclick=openNewClassModal;
 document.querySelectorAll('[data-class]').forEach(b=>b.onclick=()=>openTeacherClass(b.dataset.class));
 renderTeacherLibrary();
}


async function renderTeacherLibrary(){
 const host=$('teacherLibrary');if(!host)return;
 const {data:rows,error}=await sb.from('teacher_files').select('*').eq('owner_id',me.id).order('created_at',{ascending:false});
 if(error){
  host.innerHTML=`<span class="kicker">MANO FAILAI</span><h3>Mokytojo biblioteka</h3><div class="notice">${esc(error.message)}</div>`;
  return;
 }
 host.innerHTML=`<div class="sectionTitle"><div class="grow"><span class="kicker">MANO FAILAI</span><h3>Mokytojo biblioteka</h3></div><button class="primary" id="uploadTeacherFileBtn">+ Įkelti</button></div>
 <p class="muted">Privatūs tavo failai. Mokiniai jų nemato. Čia gali laikyti pamokų medžiagą, atsakymus, planus ar kitus mokytojo dokumentus.</p>
 ${(rows||[]).length?(rows||[]).map(r=>`<div class="resourceRow"><div class="grow"><b>${esc(r.title||r.original_name)}</b><div class="subtle">${esc(r.original_name)} · ${fmtDate(r.created_at)}</div></div><button class="smallBtn" data-teacher-download="${r.id}">Atsisiųsti</button><button class="smallBtn" data-teacher-delete="${r.id}">Ištrinti</button></div>`).join(''):'<div class="emptyState">Privačių failų dar nėra.</div>'}`;
 $('uploadTeacherFileBtn').onclick=openTeacherFileUploadModal;
 document.querySelectorAll('[data-teacher-download]').forEach(b=>b.onclick=()=>downloadTeacherFile(b.dataset.teacherDownload));
 document.querySelectorAll('[data-teacher-delete]').forEach(b=>b.onclick=()=>deleteTeacherFile(b.dataset.teacherDelete));
}

function openTeacherFileUploadModal(){
 modal(`<span class="kicker">MOKYTOJO BIBLIOTEKA</span><h2>Įkelti privatų failą</h2>
 <p class="muted">Šio failo mokiniai nematys.</p>
 <form id="teacherFileForm" class="formGroup">
  <label>Pavadinimas<input id="teacherFileTitle" placeholder="Pvz., Vektorinės grafikos pamokos planas"></label>
  <label>Failas<input class="fileInput" type="file" id="teacherFileInput" required></label>
  <button class="primary" type="submit" style="margin-top:14px">Įkelti</button>
 </form>`);
 $('teacherFileForm').onsubmit=async e=>{
  e.preventDefault();
  const f=$('teacherFileInput').files[0];if(!f)return;
  const title=$('teacherFileTitle').value.trim()||f.name;
  const safeName=f.name.replaceAll('/','_');
  const path=`${me.id}/${crypto.randomUUID()}_${safeName}`;
  toast('Įkeliamas failas...');
  const {error:upErr}=await sb.storage.from('teacher-library').upload(path,f);
  if(upErr)return toast(upErr.message);
  const {error}=await sb.from('teacher_files').insert({
   owner_id:me.id,title,storage_path:path,original_name:f.name,mime_type:f.type,size_bytes:f.size
  });
  if(error){
   await sb.storage.from('teacher-library').remove([path]);
   return toast(error.message);
  }
  closeModal();toast('Failas įkeltas.');renderTeacherLibrary();
 };
}

async function downloadTeacherFile(id){
 const {data:r,error}=await sb.from('teacher_files').select('*').eq('id',id).single();
 if(error)return toast(error.message);
 const {data,error:e}=await sb.storage.from('teacher-library').createSignedUrl(r.storage_path,60);
 if(e)return toast(e.message);
 window.open(data.signedUrl,'_blank');
}

async function deleteTeacherFile(id){
 if(!confirm('Ištrinti šį privatų failą?'))return;
 const {data:r,error}=await sb.from('teacher_files').select('*').eq('id',id).single();
 if(error)return toast(error.message);
 const {error:storageErr}=await sb.storage.from('teacher-library').remove([r.storage_path]);
 if(storageErr)return toast(storageErr.message);
 const {error:dbErr}=await sb.from('teacher_files').delete().eq('id',id);
 if(dbErr)return toast(dbErr.message);
 toast('Failas ištrintas.');renderTeacherLibrary();
}

function randomCode(){return Math.random().toString(36).slice(2,8).toUpperCase()}
function openNewClassModal(){
 modal(`<span class="kicker">NAUJA KLASĖ</span><h2>Sukurti klasę</h2>
 <form id="newClassForm" class="formGroup"><label>Klasės pavadinimas<input id="newClassName" placeholder="Pvz., III A" required></label>
 <label>Prisijungimo kodas<input id="newClassCode" value="${randomCode()}" required></label>
 <div class="actions" style="margin-top:14px"><button class="primary" type="submit">Sukurti</button></div></form>`);
 $('newClassForm').onsubmit=async e=>{
  e.preventDefault();
  const {error}=await sb.from('classes').insert({name:$('newClassName').value.trim(),teacher_id:me.id,join_code:$('newClassCode').value.trim().toUpperCase()});
  if(error)return toast(error.message);closeModal();toast('Klasė sukurta.');renderTeacher();
 };
}
async function openTeacherClass(classId){
 const {data:c,error}=await sb.from('classes').select('*').eq('id',classId).single();if(error)return toast(error.message);
 currentClass=c;await startHeartbeat(c.id);
 const {data:members}=await sb.from('class_members').select('student_id,joined_at').eq('class_id',c.id);
 const ids=(members||[]).map(x=>x.student_id);
 let students=[];if(ids.length)({data:students}=await sb.from('profiles').select('id,full_name,last_login_at,last_seen_at').in('id',ids));students=students||[];
 const {data:attempts}=await sb.from('practice_attempts').select('*').eq('class_id',c.id);
 const {data:sessions}=await sb.from('activity_sessions').select('*').eq('class_id',c.id);
 const {data:access}=await sb.from('topic_access').select('*').eq('class_id',c.id);
 $('teacherContent').innerHTML=`
 <div class="pageHero"><button class="back" id="backTeacher">← Mano klasės</button><div class="classHeader"><div class="grow"><span class="kicker">KLASĖ</span><h1>${esc(c.name)}</h1></div><div>Prisijungimo kodas <span class="joinCode">${esc(c.join_code)}</span></div></div></div>
 <div class="tabsRow actions" style="margin-bottom:14px">
  <button class="smallBtn primaryLike" data-tpanel="students">Mokiniai</button>
  <button class="smallBtn" data-tpanel="topics">Temos</button>
  <button class="smallBtn" data-tpanel="resources">Mokymosi failai</button>
  <button class="smallBtn" data-tpanel="assignments">Užduotys ir darbai</button>
 </div>
 <div id="teacherClassPanel"></div>`;
 $('backTeacher').onclick=renderTeacher;
 document.querySelectorAll('[data-tpanel]').forEach(b=>b.onclick=()=>{document.querySelectorAll('[data-tpanel]').forEach(x=>x.classList.remove('primaryLike'));b.classList.add('primaryLike');renderTeacherClassPanel(b.dataset.tpanel,c,students,members||[],attempts||[],sessions||[],access||[])});
 renderTeacherClassPanel('students',c,students,members||[],attempts||[],sessions||[],access||[]);
}
function renderTeacherClassPanel(panel,c,students,members,attempts,sessions,access){
 const host=$('teacherClassPanel');
 if(panel==='students'){
  const rows=students.map(s=>{
   const a=attempts.filter(x=>x.student_id===s.id),ss=sessions.filter(x=>x.user_id===s.id),secs=ss.reduce((n,x)=>n+(x.duration_seconds||0),0);
   const avg=a.length?Math.round(a.reduce((n,x)=>n+(x.score_percent||0),0)/a.length):0,best=a.length?Math.max(...a.map(x=>x.score_percent||0)):0;
   return `<tr><td><b>${esc(s.full_name||'Mokinys')}</b></td><td>${fmtDate(s.last_seen_at||s.last_login_at)}</td><td>${a.length}</td><td>${fmtSec(secs)}</td><td>${a.length?avg+'%':'–'}</td><td>${a.length?best+'%':'–'}</td><td><button class="smallBtn" data-student="${s.id}">Detaliau</button></td></tr>`
  }).join('');
  host.innerHTML=`<div class="panel"><div class="sectionTitle"><div class="grow"><span class="kicker">MOKINIAI</span><h2>${students.length} mok.</h2></div></div>
   ${students.length?`<div class="tableWrap"><table class="dataTable"><thead><tr><th>Mokinys</th><th>Paskutinis aktyvumas</th><th>Bandymų</th><th>Laikas</th><th>Vidurkis</th><th>Geriausias</th><th></th></tr></thead><tbody>${rows}</tbody></table></div>`:'<div class="emptyState"><b>Mokinių dar nėra.</b>Duokite mokiniams klasės kodą '+esc(c.join_code)+'.</div>'}</div>`;
  document.querySelectorAll('[data-student]').forEach(b=>b.onclick=()=>showStudentDetail(b.dataset.student,c.id,students,attempts,sessions));
 }
 if(panel==='topics'){
  host.innerHTML=`<div class="panel"><div class="sectionTitle"><div class="grow"><span class="kicker">PRIEIGA</span><h2>Temų ir atsiskaitymų atrakinimas</h2></div></div>
   ${CFG.topics.map(t=>{const a=access.find(x=>x.topic_id===t.id)||{};return `<div class="topicToggleRow"><div><b>${esc(t.title)}</b><div class="subtle">${t.code} · ${t.hours} val.</div></div>
    <label class="toggle"><input type="checkbox" data-access="${t.id}" data-field="is_open" ${a.is_open?'checked':''}> Tema</label>
    <label class="toggle"><input type="checkbox" data-access="${t.id}" data-field="practice_open" ${a.practice_open?'checked':''}> Praktika</label>
    <label class="toggle"><input type="checkbox" data-access="${t.id}" data-field="assessment_open" ${a.assessment_open?'checked':''}> Atsiskaitymas</label></div>`}).join('')}</div>`;
  document.querySelectorAll('[data-access]').forEach(ch=>ch.onchange=()=>updateTopicAccess(c.id,ch.dataset.access,ch.dataset.field,ch.checked));
 }
 if(panel==='resources')renderTeacherResources(c);
 if(panel==='assignments')renderTeacherAssignments(c);
}
async function updateTopicAccess(classId,topicId,field,value){
 const payload={[field]:value,updated_at:new Date().toISOString()};
 const {error}=await sb.from('topic_access').update(payload).eq('class_id',classId).eq('topic_id',topicId);
 toast(error?error.message:'Atnaujinta.');
}
function showStudentDetail(studentId,classId,students,attempts,sessions){
 const s=students.find(x=>x.id===studentId),a=attempts.filter(x=>x.student_id===studentId),secs=sessions.filter(x=>x.user_id===studentId).reduce((n,x)=>n+(x.duration_seconds||0),0);
 modal(`<span class="kicker">MOKINIO INFORMACIJA</span><h2>${esc(s?.full_name||'Mokinys')}</h2>
 <div class="dashboardGrid" style="grid-template-columns:repeat(3,1fr)"><div class="metric"><strong>${a.length}</strong><span>bandymų</span></div><div class="metric"><strong>${fmtSec(secs)}</strong><span>laikas</span></div><div class="metric"><strong>${a.length?Math.max(...a.map(x=>x.score_percent))+'%':'–'}</strong><span>geriausias</span></div></div>
 <h3>Bandymų istorija</h3>${a.length?a.sort((x,y)=>new Date(y.started_at)-new Date(x.started_at)).map(x=>`<div class="studentRow"><div class="grow"><b>${esc(topicById(x.topic_id)?.title||x.topic_id)}</b><div class="subtle">${fmtDate(x.started_at)} · ${x.mode==='assessment'?'Atsiskaitymas':'Praktika'} · ${fmtSec(x.duration_seconds)}</div></div><strong>${x.score_percent}%</strong></div>`).join(''):'<div class="emptyState">Bandymų dar nėra.</div>'}`);
}

async function renderTeacherResources(c){
 const {data:rows}=await sb.from('learning_resources').select('*').eq('class_id',c.id).order('created_at',{ascending:false});
 $('teacherClassPanel').innerHTML=`<div class="panel"><div class="sectionTitle"><div class="grow"><span class="kicker">MOKYMOSI FAILAI</span><h2>Failai mokiniams</h2></div><button class="primary" id="uploadResourceBtn">+ Įkelti failą</button></div>
 ${(rows||[]).length?(rows||[]).map(r=>`<div class="resourceRow"><div class="grow"><b>${esc(r.title)}</b><div class="subtle">${esc(topicById(r.topic_id)?.title||r.topic_id)} · ${esc(r.original_name)} · ${fmtDate(r.created_at)}</div></div><button class="smallBtn" data-download-resource="${r.id}">Atsisiųsti</button><button class="smallBtn" data-delete-resource="${r.id}">Trinti</button></div>`).join(''):'<div class="emptyState"><b>Failų dar nėra.</b>Įkelkite PDF, DOCX, PPTX, ZIP ar kitą medžiagą mokiniams.</div>'}</div>`;
 $('uploadResourceBtn').onclick=()=>resourceUploadModal(c);
 document.querySelectorAll('[data-download-resource]').forEach(b=>b.onclick=()=>downloadResource(b.dataset.downloadResource));
 document.querySelectorAll('[data-delete-resource]').forEach(b=>b.onclick=()=>deleteResource(b.dataset.deleteResource,c));
}
function resourceUploadModal(c){
 modal(`<span class="kicker">MOKYMOSI FAILAS</span><h2>Įkelti mokiniams</h2><form id="resourceForm" class="formGroup">
 <label>Tema<select id="resourceTopic">${CFG.topics.map(t=>`<option value="${t.id}">${esc(t.title)}</option>`).join('')}</select></label>
 <label>Pavadinimas<input id="resourceTitle" required placeholder="Pvz., Vektorinės grafikos teorija"></label>
 <label>Failas<input class="fileInput" type="file" id="resourceFile" required></label>
 <button class="primary" type="submit" style="margin-top:14px">Įkelti</button></form>`);
 $('resourceForm').onsubmit=async e=>{
  e.preventDefault();const f=$('resourceFile').files[0];if(!f)return;
  const topic=$('resourceTopic').value,path=`${c.id}/${topic}/${crypto.randomUUID()}_${f.name.replaceAll('/','_')}`;
  toast('Įkeliamas failas...');
  const {error:upErr}=await sb.storage.from('teacher-resources').upload(path,f);
  if(upErr)return toast(upErr.message);
  const {error}=await sb.from('learning_resources').insert({class_id:c.id,topic_id:topic,title:$('resourceTitle').value.trim(),storage_path:path,original_name:f.name,mime_type:f.type,size_bytes:f.size,uploaded_by:me.id});
  if(error){await sb.storage.from('teacher-resources').remove([path]);return toast(error.message)}
  closeModal();toast('Failas įkeltas.');renderTeacherResources(c);
 };
}
async function downloadResource(id){
 const {data:r,error}=await sb.from('learning_resources').select('*').eq('id',id).single();if(error)return toast(error.message);
 const {data,error:e}=await sb.storage.from('teacher-resources').createSignedUrl(r.storage_path,60);if(e)return toast(e.message);window.open(data.signedUrl,'_blank');
}
async function deleteResource(id,c){
 if(!confirm('Ištrinti failą?'))return;const {data:r}=await sb.from('learning_resources').select('*').eq('id',id).single();if(!r)return;
 await sb.storage.from('teacher-resources').remove([r.storage_path]);await sb.from('learning_resources').delete().eq('id',id);renderTeacherResources(c);
}
async function renderTeacherAssignments(c){
 const {data:rows}=await sb.from('assignments').select('*').eq('class_id',c.id).order('created_at',{ascending:false});
 $('teacherClassPanel').innerHTML=`<div class="panel"><div class="sectionTitle"><div class="grow"><span class="kicker">UŽDUOTYS</span><h2>Mokinių darbų pateikimas</h2></div><button class="primary" id="newAssignmentBtn">+ Nauja užduotis</button></div>
 ${(rows||[]).length?(rows||[]).map(a=>`<div class="assignmentRow"><div class="grow"><b>${esc(a.title)}</b><div class="subtle">${esc(topicById(a.topic_id)?.title||a.topic_id)} · ${a.is_open?'Atidaryta':'Uždaryta'} · terminas ${a.due_at?fmtDate(a.due_at):'nenustatytas'}</div></div><button class="smallBtn" data-assignment="${a.id}">Pateikti darbai</button></div>`).join(''):'<div class="emptyState"><b>Užduočių dar nėra.</b>Sukurkite užduotį, kad mokiniai galėtų įkelti savo darbus.</div>'}</div>`;
 $('newAssignmentBtn').onclick=()=>newAssignmentModal(c);
 document.querySelectorAll('[data-assignment]').forEach(b=>b.onclick=()=>showSubmissions(b.dataset.assignment,c));
}
function newAssignmentModal(c){
 modal(`<span class="kicker">NAUJA UŽDUOTIS</span><h2>Sukurti darbų pateikimą</h2><form id="assignmentForm" class="formGroup">
 <label>Tema<select id="aTopic">${CFG.topics.map(t=>`<option value="${t.id}">${esc(t.title)}</option>`).join('')}</select></label>
 <label>Pavadinimas<input id="aTitle" required></label>
 <label>Instrukcija<textarea id="aInstructions"></textarea></label>
 <label>Terminas<input type="datetime-local" id="aDue"></label>
 <button class="primary" type="submit" style="margin-top:14px">Sukurti</button></form>`);
 $('assignmentForm').onsubmit=async e=>{e.preventDefault();const due=$('aDue').value?new Date($('aDue').value).toISOString():null;
  const {error}=await sb.from('assignments').insert({class_id:c.id,topic_id:$('aTopic').value,title:$('aTitle').value.trim(),instructions:$('aInstructions').value.trim(),due_at:due,created_by:me.id});
  if(error)return toast(error.message);closeModal();toast('Užduotis sukurta.');renderTeacherAssignments(c);
 };
}
async function showSubmissions(assignmentId,c){
 const {data:a}=await sb.from('assignments').select('*').eq('id',assignmentId).single();
 const {data:subs}=await sb.from('submissions').select('*').eq('assignment_id',assignmentId).order('submitted_at',{ascending:false});
 const ids=[...new Set((subs||[]).map(s=>s.student_id))];let studs=[];if(ids.length)({data:studs}=await sb.from('profiles').select('id,full_name').in('id',ids));
 modal(`<span class="kicker">PATEIKTI DARBAI</span><h2>${esc(a?.title||'Užduotis')}</h2>
 ${(subs||[]).length?(subs||[]).map(s=>{const st=(studs||[]).find(x=>x.id===s.student_id);return `<div class="submissionRow"><div class="grow"><b>${esc(st?.full_name||'Mokinys')}</b><div class="subtle">${esc(s.original_name)} · ${fmtDate(s.submitted_at)}</div></div><button class="smallBtn" data-dsub="${s.id}">Atsisiųsti</button></div>`}).join(''):'<div class="emptyState">Darbų dar nepateikta.</div>'}`);
 document.querySelectorAll('[data-dsub]').forEach(b=>b.onclick=()=>downloadSubmission(b.dataset.dsub));
}
async function downloadSubmission(id){
 const {data:s,error}=await sb.from('submissions').select('*').eq('id',id).single();if(error)return toast(error.message);
 const {data,error:e}=await sb.storage.from('student-submissions').createSignedUrl(s.storage_path,60);if(e)return toast(e.message);window.open(data.signedUrl,'_blank');
}

/* ================= STUDENT ================= */
async function getStudentClass(){
 const {data:mem}=await sb.from('class_members').select('class_id,joined_at').eq('student_id',me.id).order('joined_at',{ascending:true});
 if(!mem?.length)return null;
 const {data:c}=await sb.from('classes').select('*').eq('id',mem[0].class_id).single();return c||null;
}
async function renderStudent(){
 show('student');$('studentContent').innerHTML='<div class="pageHero"><span class="kicker">MOKINYS</span><h1>Kraunama...</h1></div>';
 const c=await getStudentClass();currentClass=c;
 if(!c){stopHeartbeat();$('studentContent').innerHTML=`<div class="authShell"><div class="authCard"><span class="kicker">PRISIJUNGTI PRIE KLASĖS</span><h1>Sveiki, ${esc(profile.full_name||'mokiny')}!</h1><p>Įveskite mokytojo pateiktą klasės kodą.</p><form id="joinForm"><label>Klasės kodas<input id="joinCode" required placeholder="Pvz., A7K2QX"></label><button class="primary wide" type="submit">Prisijungti prie klasės</button></form></div></div>`;
  $('joinForm').onsubmit=async e=>{e.preventDefault();const {error}=await sb.rpc('join_class_by_code',{p_code:$('joinCode').value.trim()});if(error)return toast(error.message);toast('Prisijungta prie klasės.');renderStudent()};return;
 }
 await startHeartbeat(c.id);
 const {data:access}=await sb.from('topic_access').select('*').eq('class_id',c.id);
 const {data:attempts}=await sb.from('practice_attempts').select('*').eq('student_id',me.id).eq('class_id',c.id);
 const {data:sessions}=await sb.from('activity_sessions').select('*').eq('user_id',me.id).eq('class_id',c.id);
 const secs=(sessions||[]).reduce((n,x)=>n+(x.duration_seconds||0),0),best=(attempts||[]).length?Math.max(...attempts.map(x=>x.score_percent||0)):0;
 $('studentContent').innerHTML=`<div class="pageHero"><span class="kicker">${esc(c.name)}</span><h1>Sveiki, ${esc(profile.full_name||'mokiny')}.</h1><p>Pasirinkite atidarytą temą. Mokymosi failai ir užduočių pateikimas yra temos viduje.</p></div>
 <div class="dashboardGrid"><div class="metric"><strong>${(attempts||[]).length}</strong><span>bandymų</span></div><div class="metric"><strong>${(attempts||[]).length?best+'%':'–'}</strong><span>geriausias rezultatas</span></div><div class="metric"><strong>${fmtSec(secs)}</strong><span>aktyvus laikas</span></div><div class="metric"><strong>${fmtDate(profile.last_seen_at||profile.last_login_at)}</strong><span>paskutinis aktyvumas</span></div></div>
 <div class="sectionHead"><span class="kicker">TEMOS</span><h2>Mokymosi turinys</h2></div>
 <div class="studentTopics">${CFG.topics.map(t=>{const a=(access||[]).find(x=>x.topic_id===t.id)||{};return `<article class="topicStudentCard ${a.is_open?'':'locked'}"><span class="badge ${a.is_open?'ok':''}">${a.is_open?'ATIDARYTA':'🔒 UŽRAKINTA'}</span><div style="font-size:30px;margin-top:12px">${t.icon}</div><h3>${esc(t.title)}</h3><p>${t.code} · ${t.hours} val.</p><button class="${a.is_open?'primary':'ghost'}" data-stopic="${t.id}" ${a.is_open?'':'disabled'}>${a.is_open?'Atidaryti':'Užrakinta'}</button></article>`}).join('')}</div>`;
 document.querySelectorAll('[data-stopic]').forEach(b=>b.onclick=()=>openStudentTopic(b.dataset.stopic,c,access||[]));
}
async function openStudentTopic(topicId,c,access){
 const t=topicById(topicId),a=access.find(x=>x.topic_id===topicId);if(!a?.is_open)return toast('Tema užrakinta.');
 const {data:resources}=await sb.from('learning_resources').select('*').eq('class_id',c.id).eq('topic_id',topicId).order('created_at',{ascending:false});
 const {data:assignments}=await sb.from('assignments').select('*').eq('class_id',c.id).eq('topic_id',topicId).eq('is_open',true).order('created_at',{ascending:false});
 let existing=[];if(assignments?.length)({data:existing}=await sb.from('submissions').select('*').eq('student_id',me.id).in('assignment_id',assignments.map(x=>x.id)));
 $('topicContent').innerHTML=`<div class="pageHero"><button class="back" id="backStudent">← Mano klasė</button><span class="kicker">${t.code}</span><h1>${esc(t.title)}</h1><p>${esc(t.area)} · rekomenduojama ${t.hours} val.</p></div>
 <div class="contentGrid"><div class="stack">
  <div class="panel"><div class="sectionTitle"><div class="grow"><span class="kicker">PRAKTIKA</span><h2>Žinių treniruotė</h2></div><span class="badge ${a.practice_open?'ok':''}">${a.practice_open?'Atidaryta':'Užrakinta'}</span></div>
   <p class="muted"><b>Praktikuotis gali tiek kartų, kiek nori.</b> Kiekvieną kartą sistema iš didesnio klausimų banko atsitiktinai parenka 10 klausimų ir sumaišo atsakymų variantus, todėl bandymai nėra vienodi. Po kiekvieno atsakymo gausi paaiškinimą, o rezultatas ir atlikimo laikas bus išsaugoti tavo paskyroje.</p>
   <button class="primary" id="startPracticeTopic" ${a.practice_open?'':'disabled'}>Pradėti 10 klausimų praktiką</button>
  </div>
  <div class="panel"><div class="sectionTitle"><div class="grow"><span class="kicker">MOKYMOSI FAILAI</span><h2>Failai atsisiuntimui</h2></div></div>
   ${(resources||[]).length?(resources||[]).map(r=>`<div class="resourceRow"><div class="grow"><b>${esc(r.title)}</b><div class="subtle">${esc(r.original_name)}</div></div><button class="smallBtn" data-sresource="${r.id}">Atsisiųsti</button></div>`).join(''):'<div class="emptyState">Mokytojas šiai temai failų dar neįkėlė.</div>'}
  </div>
  <div class="panel"><div class="sectionTitle"><div class="grow"><span class="kicker">MANO DARBAI</span><h2>Užduočių pateikimas</h2></div></div>
   ${(assignments||[]).length?(assignments||[]).map(as=>{const sub=(existing||[]).find(s=>s.assignment_id===as.id);return `<div class="assignmentRow"><div class="grow"><b>${esc(as.title)}</b><div class="subtle">${esc(as.instructions||'')} ${as.due_at?' · iki '+fmtDate(as.due_at):''}</div></div>${sub?`<span class="badge ok">Pateikta ${fmtDate(sub.submitted_at)}</span>`:`<button class="primary" data-submit="${as.id}">Įkelti darbą</button>`}</div>`}).join(''):'<div class="emptyState">Atidarytų užduočių nėra.</div>'}
  </div>
 </div><div class="stack">
  <div class="panel"><span class="kicker">ATSISKAITYMAS</span><h3>Temos testas</h3>${a.assessment_open?`<span class="badge ok">Atidaryta</span><p class="muted">Atsiskaitymas šiuo metu atidarytas.</p><button class="primary" id="startAssessmentTopic">Pradėti atsiskaitymą</button>`:`<div class="lockedBox">🔒 Mokytojas atsiskaitymo dar neatidarė.</div>`}</div>
 </div></div>`;
 show('topic');$('backStudent').onclick=renderStudent;
 if(a.practice_open)$('startPracticeTopic').onclick=()=>startQuiz(topicId,c.id,'practice',10);
 if(a.assessment_open&&$('startAssessmentTopic'))$('startAssessmentTopic').onclick=()=>startQuiz(topicId,c.id,'assessment',CFG.assessmentQuestionCount);
 document.querySelectorAll('[data-sresource]').forEach(b=>b.onclick=()=>downloadResource(b.dataset.sresource));
 document.querySelectorAll('[data-submit]').forEach(b=>b.onclick=()=>submissionModal(b.dataset.submit,c));
}
function submissionModal(assignmentId,c){
 modal(`<span class="kicker">PATEIKTI DARBĄ</span><h2>Įkelti failą</h2><form id="submissionForm" class="formGroup"><label>Failas<input class="fileInput" type="file" id="submissionFile" required></label><button class="primary" type="submit" style="margin-top:14px">Pateikti</button></form>`);
 $('submissionForm').onsubmit=async e=>{e.preventDefault();const f=$('submissionFile').files[0];if(!f)return;
  const path=`${c.id}/${assignmentId}/${me.id}/${crypto.randomUUID()}_${f.name.replaceAll('/','_')}`;toast('Įkeliamas darbas...');
  const {error:upErr}=await sb.storage.from('student-submissions').upload(path,f);if(upErr)return toast(upErr.message);
  const {error}=await sb.from('submissions').insert({assignment_id:assignmentId,student_id:me.id,storage_path:path,original_name:f.name,mime_type:f.type,size_bytes:f.size});
  if(error){await sb.storage.from('student-submissions').remove([path]);return toast(error.message)}
  closeModal();toast('Darbas pateiktas.');renderStudent();
 };
}

/* ================= QUIZ + DB ================= */
async function startQuiz(topicId,classId,mode,count){
 const source=mode==='assessment'?ASSESSMENT:PRACTICE,pool=source.filter(q=>q.topic===topicId);
 if(!pool.length)return toast(mode==='assessment'?'Atsiskaitymo klausimų bankas dar neįkeltas.':'Klausimų bankas tuščias.');
 const n=Math.min(Number(count)||10,pool.length);
 const {data:attempt,error}=await sb.from('practice_attempts').insert({student_id:me.id,class_id:classId,topic_id:topicId,mode,total_questions:n}).select('id,started_at').single();
 if(error)return toast(error.message);
 quiz={topicId,classId,mode,items:shuffle(pool).slice(0,n).map(q=>({...q,shown:shuffle(q.options.map((text,original)=>({text,original})))})),index:0,answers:Array(n).fill(null),attemptId:attempt.id,startMs:Date.now(),last:null};
 $('quizMode').textContent=mode==='assessment'?'ATSISKAITYMAS':'PRAKTIKA';$('quizTitle').textContent=topicById(topicId).title;show('quiz');renderQ();
}
function renderQ(){
 const q=quiz.items[quiz.index];$('quizCounter').textContent=`${quiz.index+1}/${quiz.items.length}`;$('progressBar').style.width=`${quiz.index/quiz.items.length*100}%`;
 const live=quiz.items.slice(0,quiz.index).reduce((n,q,i)=>n+(quiz.answers[i]===q.correct),0);$('quizScoreLive').textContent=quiz.mode==='practice'?`Teisingai: ${live}`:'';
 $('questionCategory').textContent=q.category||'';$('questionDifficulty').textContent=q.difficulty||'';$('questionText').textContent=q.question;$('feedback').classList.add('hidden');$('nextQuestion').classList.add('hidden');
 $('answers').innerHTML=q.shown.map((o,i)=>`<button class="answer" data-v="${o.original}"><b>${String.fromCharCode(65+i)}.</b> ${esc(o.text)}</button>`).join('');
 document.querySelectorAll('.answer').forEach(b=>b.onclick=()=>chooseQ(Number(b.dataset.v)));
}
async function chooseQ(v){
 if(quiz.answers[quiz.index]!==null)return;const q=quiz.items[quiz.index],ok=v===q.correct;quiz.answers[quiz.index]=v;
 document.querySelectorAll('.answer').forEach(b=>{const x=Number(b.dataset.v);b.disabled=true;if(x===q.correct)b.classList.add('correct');if(x===v&&!ok)b.classList.add('wrong')});
 $('feedback').className='feedback';$('feedback').innerHTML=`<b>${ok?'✓ Teisingai':'✕ Neteisingai'}</b><br>${esc(q.explanation)}`;$('nextQuestion').textContent=quiz.index===quiz.items.length-1?'Baigti bandymą':'Kitas klausimas →';$('nextQuestion').classList.remove('hidden');
 await sb.from('attempt_answers').insert({attempt_id:quiz.attemptId,question_id:q.id,selected_index:v,correct_index:q.correct,is_correct:ok});
}
$('nextQuestion').onclick=()=>{if(quiz.index===quiz.items.length-1)finishQuiz();else{quiz.index++;renderQ()}};
$('quitQuiz').onclick=()=>{if(confirm('Baigti bandymą nebaigus?'))renderStudent()};
async function finishQuiz(){
 const total=quiz.items.length,correct=quiz.items.reduce((n,q,i)=>n+(quiz.answers[i]===q.correct?1:0),0),pct=Math.round(correct/total*100),seconds=Math.max(1,Math.round((Date.now()-quiz.startMs)/1000)),pass=quiz.mode==='assessment'?CFG.assessmentPassPercent:CFG.practicePassPercent;
 await sb.from('practice_attempts').update({completed_at:new Date().toISOString(),duration_seconds:seconds,correct_answers:correct,score_percent:pct}).eq('id',quiz.attemptId);
 quiz.last={...quiz,correct,total,pct,seconds,pass};
 $('resultPercent').textContent=pct+'%';$('scoreCircle').style.setProperty('--score',pct+'%');$('correctCount').textContent=correct;$('wrongCount').textContent=total-correct;$('resultGoal').textContent=pass+'%';
 $('resultTitle').textContent=pct>=pass?(pct===100?'Puiku – 100%!':'Tikslas pasiektas!'):'Dar pasipraktikuok';$('resultSubtitle').textContent=`Bandymo trukmė: ${fmtSec(seconds)}.`;$('errorsReview').classList.add('hidden');show('results');
}
$('retryQuiz').onclick=()=>{const r=quiz.last;if(r)startQuiz(r.topicId,r.classId,r.mode,r.items.length)};
$('reviewErrors').onclick=()=>{const r=quiz.last;if(!r)return;const bad=r.items.map((q,i)=>({q,a:r.answers[i]})).filter(x=>x.a!==x.q.correct);$('errorsReview').classList.remove('hidden');$('errorsReview').innerHTML=bad.length?`<span class="kicker">PERŽIŪRA</span><h2>Klaidos ir paaiškinimai</h2>`+bad.map((x,i)=>`<div class="errorItem"><b>${i+1}. ${esc(x.q.question)}</b><p>Tavo atsakymas: <b>${x.a===null?'neatsakyta':esc(x.q.options[x.a])}</b><br>Teisingas: <b>${esc(x.q.options[x.q.correct])}</b><br>${esc(x.q.explanation)}</p></div>`).join(''):`<h2>Be klaidų 🎉</h2>`};

/* ================= PROFILE ================= */
function renderProfile(){
 $('profileContent').innerHTML=`<div class="pageHero"><span class="kicker">PASKYRA</span><h1>${esc(profile.full_name||'Vartotojas')}</h1><p>Rolė: ${profile.role==='teacher'?'mokytojas':profile.role==='admin'?'administratorius':'mokinys'} · paskutinis prisijungimas ${fmtDate(profile.last_login_at)}</p></div>
 <div class="panel" style="max-width:600px"><h2>Paskyros duomenys</h2><div class="formGroup"><label>Vardas ir pavardė<input id="profileName" value="${esc(profile.full_name||'')}"></label><button class="primary" id="saveProfile" style="margin-top:14px">Išsaugoti</button></div></div>`;
 show('profile');$('saveProfile').onclick=async()=>{const name=$('profileName').value.trim();const {error}=await sb.from('profiles').update({full_name:name}).eq('id',me.id);if(error)return toast(error.message);profile.full_name=name;toast('Išsaugota.')};
}

/* ================= INIT ================= */
async function boot(){
 document.documentElement.dataset.theme=localStorage.getItem('inf11v3_theme')||'light';
 if(!configured){show('setup');return}
 const {data:{session}}=await sb.auth.getSession();
 if(session){me=session.user;await loadProfile();setHeader();route('dashboard')}else show('auth');
 sb.auth.onAuthStateChange(async(event,session)=>{
  if(session&&!me){me=session.user;await loadProfile();setHeader();route('dashboard')}
  if(!session){me=null;profile=null;setHeader();show('auth')}
 });
}
boot();
