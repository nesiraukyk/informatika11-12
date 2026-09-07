
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

 // Mokinys turi vieną aiškią pradžios nuorodą, kuri visada atidaro jo klasę.
 $('homeNav').classList.toggle('hidden',isTeacher);
 $('homeNav').dataset.route='student';
 $('teacherNav').classList.toggle('hidden',!isTeacher);
 $('teacherNav').textContent=profile.role==='admin'?'Administratoriaus skydelis':'Mokytojo skydelis';
 $('studentNav').classList.add('hidden');

 // Logotipas taip pat grąžina į tinkamą pagrindinį ekraną.
 if($('brandHome'))$('brandHome').dataset.route=isTeacher?'teacher':'student';
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
 show('teacher');$('teacherContent').innerHTML='<div class="pageHero"><span class="kicker">VALDYMAS</span><h1>Kraunama...</h1></div>';
 const isAdmin=profile.role==='admin';
 let classQuery=sb.from('classes').select('*').order('created_at');
 if(!isAdmin)classQuery=classQuery.eq('teacher_id',me.id);
 const {data:classes,error}=await classQuery;
 if(error)return $('teacherContent').innerHTML=`<div class="notice">${esc(error.message)}</div>`;
 const classIds=(classes||[]).map(c=>c.id);
 let members=[],attempts=[],sessions=[],directSubs=[],assignments=[],assignmentSubs=[];
 if(classIds.length){
  ({data:members}=await sb.from('class_members').select('class_id,student_id,joined_at').in('class_id',classIds));
  ({data:attempts}=await sb.from('practice_attempts').select('*').in('class_id',classIds));
  ({data:sessions}=await sb.from('activity_sessions').select('*').in('class_id',classIds));
  ({data:directSubs}=await sb.from('direct_submissions').select('*').in('class_id',classIds).order('submitted_at',{ascending:false}));
  ({data:assignments}=await sb.from('assignments').select('id,class_id,title').in('class_id',classIds));
  const assignmentIds=(assignments||[]).map(a=>a.id);
  if(assignmentIds.length)({data:assignmentSubs}=await sb.from('submissions').select('*').in('assignment_id',assignmentIds).order('submitted_at',{ascending:false}));
 }
 members=members||[];attempts=attempts||[];sessions=sessions||[];directSubs=directSubs||[];assignments=assignments||[];assignmentSubs=assignmentSubs||[];
 const studentIds=[...new Set(members.map(m=>m.student_id))];
 let students=[];
 if(studentIds.length)({data:students}=await sb.from('profiles').select('id,full_name,last_login_at,last_seen_at,created_at').in('id',studentIds));
 students=students||[];
 const totalStudents=studentIds.length,totalAttempts=attempts.length,totalSeconds=sessions.filter(s=>studentIds.includes(s.user_id)).reduce((n,s)=>n+(s.duration_seconds||0),0);
 const totalSubmissions=directSubs.length+assignmentSubs.length;

 // Sujungiame naujausius savarankiškus ir konkrečių užduočių failus.
 const allSubmitted=[
  ...directSubs.map(s=>({id:s.id,kind:'direct',student_id:s.student_id,class_id:s.class_id,name:s.original_name,title:s.title,at:s.submitted_at})),
  ...assignmentSubs.map(s=>{const a=assignments.find(x=>x.id===s.assignment_id);return {id:s.id,kind:'assignment',student_id:s.student_id,class_id:a?.class_id,name:s.original_name,title:a?.title||'Užduotis',at:s.submitted_at}})
 ].sort((a,b)=>new Date(b.at)-new Date(a.at));

 let teachers=[];
 if(isAdmin&&classes?.length){
  const tids=[...new Set(classes.map(c=>c.teacher_id))];
  if(tids.length)({data:teachers}=await sb.from('profiles').select('id,full_name').in('id',tids));
  teachers=teachers||[];
 }

 $('teacherContent').innerHTML=`
 <div class="pageHero"><span class="kicker">${isAdmin?'ADMINISTRATORIAUS SKYDELIS':'MOKYTOJO SKYDELIS'}</span><h1>Sveiki, ${esc(profile.full_name||'mokytojau')}.</h1><p>${isAdmin?'Matote visas platformos klases ir jų mokymosi statistiką.':'Čia matote tik savo klases, savo mokinius, jų rezultatus ir pateiktus darbus.'}</p></div>
 <div class="dashboardGrid">
  <div class="metric"><strong>${classes?.length||0}</strong><span>klasių</span></div>
  <div class="metric"><strong>${totalStudents}</strong><span>mokinių</span></div>
  <div class="metric"><strong>${totalAttempts}</strong><span>praktikos / testų bandymų</span></div>
  <div class="metric"><strong>${totalSubmissions}</strong><span>pateiktų failų</span></div>
  <div class="metric"><strong>${fmtSec(totalSeconds)}</strong><span>bendras aktyvus laikas</span></div>
 </div>
 <div class="contentGrid"><div class="panel">
  <div class="sectionTitle"><div class="grow"><span class="kicker">${isAdmin?'VISOS KLASĖS':'MANO KLASĖS'}</span><h2>Klasės</h2></div>${isAdmin?'':'<button class="primary" id="newClassBtn">+ Nauja klasė</button>'}</div>
  <div id="classList">${classes?.length?classes.map(c=>{
    const cnt=new Set(members.filter(m=>m.class_id===c.id).map(m=>m.student_id)).size;
    const teacher=teachers.find(t=>t.id===c.teacher_id);
    return `<div class="classCard"><div class="grow"><h3>${esc(c.name)}</h3><span class="subtle">${cnt} mok. · kodas <b>${esc(c.join_code)}</b>${isAdmin?` · mokytojas <b>${esc(teacher?.full_name||'–')}</b>`:''}</span></div><button class="primary" data-class="${c.id}">Atidaryti</button></div>`
  }).join(''):'<div class="emptyState"><b>Klasių dar nėra.</b></div>'}</div>
 </div>
 <div class="stack">
  <div class="panel"><span class="kicker">NAUJAUSI DARBAI</span><h3>Pateikti mokinių failai</h3>
   ${allSubmitted.length?allSubmitted.slice(0,7).map(x=>{const st=students.find(s=>s.id===x.student_id),cl=classes.find(c=>c.id===x.class_id);return `<div class="studentRow"><div class="grow"><b>${esc(st?.full_name||'Mokinys')} · ${esc(x.title||x.name)}</b><div class="subtle">${esc(cl?.name||'Klasė')} · ${esc(x.name)} · ${fmtDate(x.at)}</div></div><button class="smallBtn" ${x.kind==='direct'?`data-latest-direct="${x.id}"`:`data-latest-assignment="${x.id}"`}>Atsisiųsti</button></div>`}).join(''):'<div class="emptyState">Pateiktų darbų dar nėra.</div>'}
  </div>
  ${isAdmin?'':`<div class="panel" id="teacherLibrary"><span class="kicker">MANO FAILAI</span><h3>Kraunama mokytojo biblioteka...</h3></div>`}
 </div></div>`;
 if(!isAdmin&&$('newClassBtn'))$('newClassBtn').onclick=openNewClassModal;
 document.querySelectorAll('[data-class]').forEach(b=>b.onclick=()=>openTeacherClass(b.dataset.class));
 document.querySelectorAll('[data-latest-direct]').forEach(b=>b.onclick=()=>downloadDirectSubmission(b.dataset.latestDirect));
 document.querySelectorAll('[data-latest-assignment]').forEach(b=>b.onclick=()=>downloadSubmission(b.dataset.latestAssignment));
 if(!isAdmin)renderTeacherLibrary();
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
 currentClass=c;await startHeartbeat(null);
 const [
  {data:members},
  {data:attempts},
  {data:sessions},
  {data:access},
  {data:direct},
  {data:classAssignments}
 ]=await Promise.all([
  sb.from('class_members').select('student_id,joined_at').eq('class_id',c.id),
  sb.from('practice_attempts').select('*').eq('class_id',c.id),
  sb.from('activity_sessions').select('*').eq('class_id',c.id),
  sb.from('topic_access').select('*').eq('class_id',c.id),
  sb.from('direct_submissions').select('id').eq('class_id',c.id),
  sb.from('assignments').select('id').eq('class_id',c.id)
 ]);
 const ids=(members||[]).map(x=>x.student_id);
 let students=[];if(ids.length)({data:students}=await sb.from('profiles').select('id,full_name,last_login_at,last_seen_at,created_at').in('id',ids));students=students||[];
 let assignmentSubs=[];
 const aIds=(classAssignments||[]).map(a=>a.id);
 if(aIds.length)({data:assignmentSubs}=await sb.from('submissions').select('id').in('assignment_id',aIds));
 const submissionCount=(direct||[]).length+(assignmentSubs||[]).length;

 $('teacherContent').innerHTML=`
 <div class="pageHero"><button class="back" id="backTeacher">← ${profile.role==='admin'?'Visos klasės':'Mano klasės'}</button><div class="classHeader"><div class="grow"><span class="kicker">KLASĖ</span><h1>${esc(c.name)}</h1></div><div class="classHeaderActions"><div>Prisijungimo kodas <span class="joinCode">${esc(c.join_code)}</span></div><button class="ghost" id="studentPreviewBtn">👁 Mokinio vaizdas</button></div></div></div>
 <div class="tabsRow actions" style="margin-bottom:14px">
  <button class="smallBtn primaryLike" data-tpanel="students">Mokiniai</button>
  <button class="smallBtn" data-tpanel="topics">Temos</button>
  <button class="smallBtn" data-tpanel="resources">Mokymosi failai</button>
  <button class="smallBtn" data-tpanel="assignments">Užduotys ir darbai${submissionCount?` <span class="inlineCount">${submissionCount}</span>`:''}</button>
 </div>
 <div id="teacherClassPanel"></div>`;
 $('backTeacher').onclick=renderTeacher;
 $('studentPreviewBtn').onclick=()=>renderTeacherStudentPreview(c);
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
  document.querySelectorAll('[data-student]').forEach(b=>b.onclick=()=>showStudentDetail(b.dataset.student,c.id));
 }
 if(panel==='topics'){
  host.innerHTML=`<div class="panel"><div class="sectionTitle"><div class="grow"><span class="kicker">PRIEIGA</span><h2>Temų ir atsiskaitymų atrakinimas</h2></div><button class="ghost" id="previewTopicsBtn">👁 Peržiūrėti kaip mokiniui</button></div>
   ${CFG.topics.map(t=>{const a=access.find(x=>x.topic_id===t.id)||{};return `<div class="topicToggleRow"><div class="grow"><b>${esc(t.title)}</b><div class="subtle">${t.code} · ${t.hours} val.</div></div>
    <button class="smallBtn" data-topic-posts="${t.id}">Pranešimai / nuorodos</button>
    <label class="toggle"><input type="checkbox" data-access="${t.id}" data-field="is_open" ${a.is_open?'checked':''}> Tema</label>
    <label class="toggle"><input type="checkbox" data-access="${t.id}" data-field="practice_open" ${a.practice_open?'checked':''}> Praktika</label>
    <label class="toggle"><input type="checkbox" data-access="${t.id}" data-field="assessment_open" ${a.assessment_open?'checked':''}> Atsiskaitymas</label></div>`}).join('')}</div>`;
  document.querySelectorAll('[data-access]').forEach(ch=>ch.onchange=()=>updateTopicAccess(c.id,ch.dataset.access,ch.dataset.field,ch.checked));
  document.querySelectorAll('[data-topic-posts]').forEach(b=>b.onclick=()=>renderTeacherTopicPosts(c,b.dataset.topicPosts,access));
  $('previewTopicsBtn').onclick=()=>renderTeacherStudentPreview(c);
 }
 if(panel==='resources')renderTeacherResources(c);
 if(panel==='assignments')renderTeacherAssignments(c);
}


function normalizeHttpUrl(value){
 const raw=(value||'').trim();
 if(!raw)return '';
 try{
  const u=new URL(raw);
  if(!['http:','https:'].includes(u.protocol))return null;
  return u.href;
 }catch{
  return null;
 }
}


async function renderTeacherTopicPosts(c,topicId,access){
 const host=$('teacherClassPanel');
 if(!host)return;
 const t=topicById(topicId);
 host.innerHTML=`<div class="panel"><span class="kicker">TEMOS PRANEŠIMAI</span><h2>Kraunama...</h2></div>`;

 const {data:rows,error}=await sb.from('class_posts')
   .select('*')
   .eq('class_id',c.id)
   .eq('topic_id',topicId)
   .order('created_at',{ascending:false});

 if(error){
  host.innerHTML=`<div class="panel"><button class="back" id="backToTopicsPosts">← Grįžti į temas</button><span class="kicker">TEMOS PRANEŠIMAI</span><h2>${esc(t?.title||topicId)}</h2><div class="notice">${esc(error.message)}</div></div>`;
  if($('backToTopicsPosts'))$('backToTopicsPosts').onclick=()=>renderTeacherClassPanel('topics',c,[],[],[],[],access);
  return;
 }

 host.innerHTML=`<div class="panel">
  <div class="sectionTitle">
   <div class="grow"><button class="back" id="backToTopicsPosts">← Grįžti į temas</button><span class="kicker">TEMOS PRANEŠIMAI</span><h2>${esc(t?.title||topicId)}</h2></div>
   <button class="primary" id="newTopicPostBtn">+ Naujas pranešimas</button>
  </div>
  <p class="muted">Šie pranešimai ir nuorodos bus rodomi tik šioje temoje, todėl nesimaišys su kitų temų medžiaga.</p>
  ${(rows||[]).length?(rows||[]).map(p=>`
   <div class="classPost teacherPost">
    <div class="grow">
     <div class="postMeta">${fmtDate(p.created_at)}</div>
     <h3>${esc(p.title)}</h3>
     ${p.body?`<p>${esc(p.body)}</p>`:''}
     ${p.url?`<a class="postLink" href="${esc(p.url)}" target="_blank" rel="noopener noreferrer">Atidaryti nuorodą ↗</a>`:''}
    </div>
    <button class="smallBtn dangerSoft" data-delete-topic-post="${p.id}">Ištrinti</button>
   </div>`).join(''):'<div class="emptyState"><b>Šiai temai pranešimų dar nėra.</b>Gali pridėti komentarą, instrukciją arba nuorodą.</div>'}
 </div>`;

 $('backToTopicsPosts').onclick=()=>renderTeacherClassPanel('topics',c,[],[],[],[],access);
 $('newTopicPostBtn').onclick=()=>openTopicPostModal(c,topicId,access);
 document.querySelectorAll('[data-delete-topic-post]').forEach(b=>b.onclick=()=>deleteTopicPost(b.dataset.deleteTopicPost,c,topicId,access));
}

function openTopicPostModal(c,topicId,access){
 const t=topicById(topicId);
 modal(`<span class="kicker">NAUJAS TEMOS PRANEŠIMAS</span><h2>${esc(t?.title||topicId)}</h2>
 <p class="muted">Gali įrašyti tik pranešimą, tik nuorodą arba abu.</p>
 <form id="topicPostForm" class="formGroup">
  <label>Pavadinimas<input id="topicPostTitle" required maxlength="120" placeholder="Pvz., Inkscape mokomoji medžiaga"></label>
  <label>Pranešimas<textarea id="topicPostBody" rows="4" maxlength="1500" placeholder="Pvz., Peržiūrėkite šį vaizdo įrašą prieš kitą pamoką."></textarea></label>
  <label>Nuoroda <span class="subtle">(nebūtina)</span><input id="topicPostUrl" type="url" placeholder="https://..."></label>
  <button class="primary" type="submit" style="margin-top:14px">Paskelbti temoje</button>
 </form>`);

 $('topicPostForm').onsubmit=async e=>{
  e.preventDefault();
  const title=$('topicPostTitle').value.trim();
  const body=$('topicPostBody').value.trim();
  const rawUrl=$('topicPostUrl').value.trim();
  const url=normalizeHttpUrl(rawUrl);

  if(!title)return toast('Įrašyk pavadinimą.');
  if(!body&&!rawUrl)return toast('Įrašyk pranešimą arba pridėk nuorodą.');
  if(rawUrl&&url===null)return toast('Nuoroda turi prasidėti http:// arba https://');

  const {error}=await sb.from('class_posts').insert({
   class_id:c.id,
   topic_id:topicId,
   author_id:me.id,
   title,
   body:body||null,
   url:url||null
  });
  if(error)return toast(error.message);

  closeModal();
  toast('Pranešimas paskelbtas temoje.');
  renderTeacherTopicPosts(c,topicId,access);
 };
}

async function deleteTopicPost(id,c,topicId,access){
 if(!confirm('Ar tikrai ištrinti šį temos pranešimą? Mokiniai jo nebematys.'))return;
 const {error}=await sb.from('class_posts').delete().eq('id',id);
 if(error)return toast(error.message);
 toast('Pranešimas ištrintas.');
 renderTeacherTopicPosts(c,topicId,access);
}


async function updateTopicAccess(classId,topicId,field,value){
 const payload={[field]:value,updated_at:new Date().toISOString()};
 const {error}=await sb.from('topic_access').update(payload).eq('class_id',classId).eq('topic_id',topicId);
 toast(error?error.message:'Atnaujinta.');
}
async function showStudentDetail(studentId,classId){
 modal(`<span class="kicker">MOKINIO INFORMACIJA</span><h2>Kraunama...</h2>`);
 const [
  {data:s,error:profileErr},
  {data:a},
  {data:ss},
  {data:logins},
  {data:direct},
  {data:assignments}
 ]=await Promise.all([
  sb.from('profiles').select('id,full_name,last_login_at,last_seen_at,created_at').eq('id',studentId).single(),
  sb.from('practice_attempts').select('*').eq('student_id',studentId).eq('class_id',classId).order('started_at',{ascending:false}),
  sb.from('activity_sessions').select('*').eq('user_id',studentId).eq('class_id',classId).order('started_at',{ascending:false}),
  sb.from('login_events').select('*').eq('user_id',studentId).order('logged_in_at',{ascending:false}).limit(30),
  sb.from('direct_submissions').select('*').eq('student_id',studentId).eq('class_id',classId),
  sb.from('assignments').select('id').eq('class_id',classId)
 ]);
 if(profileErr)return modal(`<div class="notice">${esc(profileErr.message)}</div>`);
 let assignedSubs=[];
 const assignmentIds=(assignments||[]).map(x=>x.id);
 if(assignmentIds.length)({data:assignedSubs}=await sb.from('submissions').select('*').eq('student_id',studentId).in('assignment_id',assignmentIds));

 const attempts=a||[],sessions=ss||[],loginRows=logins||[];
 const secs=sessions.reduce((n,x)=>n+(x.duration_seconds||0),0);
 const avgScore=attempts.length?Math.round(attempts.reduce((n,x)=>n+(x.score_percent||0),0)/attempts.length):0;
 const best=attempts.length?Math.max(...attempts.map(x=>x.score_percent||0)):0;
 const totalQ=attempts.reduce((n,x)=>n+(x.total_questions||0),0);
 const correctQ=attempts.reduce((n,x)=>n+(x.correct_answers||0),0);
 const avgSession=sessions.length?Math.round(secs/sessions.length):0;
 const avgAttempt=attempts.length?Math.round(attempts.reduce((n,x)=>n+(x.duration_seconds||0),0)/attempts.length):0;
 const practiceCount=attempts.filter(x=>x.mode==='practice').length;
 const assessmentCount=attempts.filter(x=>x.mode==='assessment').length;
 const fileCount=(direct||[]).length+(assignedSubs||[]).length;

 modal(`<span class="kicker">${profile.role==='admin'?'ADMINISTRATORIUS · ':''}MOKINIO INFORMACIJA</span><h2>${esc(s?.full_name||'Mokinys')}</h2>
 <p class="muted">Paskyra sukurta ${fmtDate(s?.created_at)} · paskutinis prisijungimas ${fmtDate(s?.last_login_at)} · paskutinis aktyvumas ${fmtDate(s?.last_seen_at)}</p>

 <div class="detailMetrics">
  <div class="metric"><strong>${attempts.length}</strong><span>bandymų</span></div>
  <div class="metric"><strong>${avgScore||'–'}${attempts.length?'%':''}</strong><span>rezultatų vidurkis</span></div>
  <div class="metric"><strong>${attempts.length?best+'%':'–'}</strong><span>geriausias rezultatas</span></div>
  <div class="metric"><strong>${fmtSec(secs)}</strong><span>aktyvus laikas</span></div>
  <div class="metric"><strong>${sessions.length}</strong><span>aktyvumo sesijų</span></div>
  <div class="metric"><strong>${fmtSec(avgSession)}</strong><span>vid. sesijos trukmė</span></div>
  <div class="metric"><strong>${fileCount}</strong><span>pateiktų failų</span></div>
  <div class="metric"><strong>${totalQ?Math.round(correctQ/totalQ*100)+'%':'–'}</strong><span>teisingų atsakymų</span></div>
 </div>

 <div class="detailColumns">
  <div>
   <h3>Bandymų istorija</h3>
   <div class="subtle">Praktika: ${practiceCount} · atsiskaitymai: ${assessmentCount} · vid. bandymo trukmė: ${fmtSec(avgAttempt)}</div>
   ${attempts.length?attempts.slice(0,30).map(x=>`<div class="studentRow"><div class="grow"><b>${esc(topicById(x.topic_id)?.title||x.topic_id)}</b><div class="subtle">${fmtDate(x.started_at)} · ${x.mode==='assessment'?'Atsiskaitymas':'Praktika'} · ${x.correct_answers||0}/${x.total_questions||0} teisingai · ${fmtSec(x.duration_seconds)}</div></div><strong>${x.score_percent}%</strong></div>`).join(''):'<div class="emptyState">Bandymų dar nėra.</div>'}
  </div>
  <div>
   <h3>Prisijungimų istorija</h3>
   <p class="subtle">Istorija kaupiama nuo v3.3 įdiegimo.</p>
   ${loginRows.length?loginRows.map(x=>`<div class="historyRow"><b>${fmtDate(x.logged_in_at)}</b></div>`).join(''):'<div class="emptyState">Naujų prisijungimų dar neužfiksuota.</div>'}
   <h3 style="margin-top:22px">Aktyvumo sesijos</h3>
   ${sessions.length?sessions.slice(0,20).map(x=>`<div class="historyRow"><div><b>${fmtDate(x.started_at)}</b><div class="subtle">Paskutinis aktyvumas ${fmtDate(x.last_seen_at)}</div></div><strong>${fmtSec(x.duration_seconds)}</strong></div>`).join(''):'<div class="emptyState">Sesijų dar nėra.</div>'}
  </div>
 </div>`);
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
 const [{data:rows,error:assignErr},{data:direct,error:directErr}]=await Promise.all([
  sb.from('assignments').select('*').eq('class_id',c.id).order('created_at',{ascending:false}),
  sb.from('direct_submissions').select('*').eq('class_id',c.id).order('submitted_at',{ascending:false})
 ]);
 if(assignErr)return toast(assignErr.message);
 if(directErr)return toast(directErr.message);

 const ids=[...new Set((direct||[]).map(s=>s.student_id))];
 let studs=[];if(ids.length)({data:studs}=await sb.from('profiles').select('id,full_name').in('id',ids));

 // Suskaičiuojame pateiktus failus prie mokytojo sukurtų užduočių.
 let assignmentSubs=[];
 const aIds=(rows||[]).map(a=>a.id);
 if(aIds.length)({data:assignmentSubs}=await sb.from('submissions').select('id,assignment_id').in('assignment_id',aIds));
 const countFor=id=>(assignmentSubs||[]).filter(s=>s.assignment_id===id).length;

 $('teacherClassPanel').innerHTML=`
 <div class="stack">
  <div class="panel"><div class="sectionTitle"><div class="grow"><span class="kicker">UŽDUOTYS</span><h2>Mokytojo sukurtos užduotys</h2></div><button class="primary" id="newAssignmentBtn">+ Nauja užduotis</button></div>
   <p class="muted">Čia gali sukurti konkrečią užduotį su instrukcija ir terminu. Mokinys prie vienos užduoties gali pateikti kelis failus.</p>
   ${(rows||[]).length?(rows||[]).map(a=>`<div class="assignmentRow"><div class="grow"><b>${esc(a.title)}</b><div class="subtle">${esc(topicById(a.topic_id)?.title||a.topic_id)} · ${a.is_open?'Atidaryta':'Uždaryta'} · terminas ${a.due_at?fmtDate(a.due_at):'nenustatytas'}</div></div><span class="badge ${countFor(a.id)?'ok':''}">${countFor(a.id)} fail.</span><button class="smallBtn" data-assignment="${a.id}">Pateikti darbai</button></div>`).join(''):'<div class="emptyState"><b>Užduočių dar nėra.</b>Jei reikia, sukurk konkrečią užduotį.</div>'}
  </div>

  <div class="panel"><div class="sectionTitle"><div class="grow"><span class="kicker">MOKINIŲ FAILAI</span><h2>Mokinių savarankiškai pateikti darbai</h2></div><span class="badge ${direct?.length?'ok':''}">${(direct||[]).length}</span></div>
   <p class="muted">Čia iškart matysi mokinių savarankiškai įkeltus darbus. Gali juos atsisiųsti arba ištrinti. Trinant visada bus paprašyta patvirtinti veiksmą.</p>
   ${(direct||[]).length?(direct||[]).map(s=>{const st=(studs||[]).find(x=>x.id===s.student_id);return `<div class="submissionRow"><div class="grow"><b>${esc(st?.full_name||'Mokinys')} · ${esc(s.title||s.original_name)}</b><div class="subtle">${esc(topicById(s.topic_id)?.title||s.topic_id)} · ${esc(s.original_name)} · ${fmtDate(s.submitted_at)}</div></div><button class="smallBtn" data-ddirect="${s.id}">Atsisiųsti</button><button class="smallBtn dangerMini" data-del-direct="${s.id}">Ištrinti</button></div>`}).join(''):'<div class="emptyState">Mokiniai savarankiškų darbų dar neįkėlė.</div>'}
  </div>
 </div>`;

 $('newAssignmentBtn').onclick=()=>newAssignmentModal(c);
 document.querySelectorAll('[data-assignment]').forEach(b=>b.onclick=()=>showSubmissions(b.dataset.assignment,c));
 document.querySelectorAll('[data-ddirect]').forEach(b=>b.onclick=()=>downloadDirectSubmission(b.dataset.ddirect));
 document.querySelectorAll('[data-del-direct]').forEach(b=>b.onclick=()=>deleteDirectSubmission(b.dataset.delDirect,c,'teacher'));
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
 <p class="muted">${(subs||[]).length} pateiktų failų. Ištrinant failą bus prašoma papildomo patvirtinimo.</p>
 ${(subs||[]).length?(subs||[]).map(s=>{const st=(studs||[]).find(x=>x.id===s.student_id);return `<div class="submissionRow"><div class="grow"><b>${esc(st?.full_name||'Mokinys')}</b><div class="subtle">${esc(s.original_name)} · ${fmtDate(s.submitted_at)}</div></div><button class="smallBtn" data-dsub="${s.id}">Atsisiųsti</button><button class="smallBtn dangerMini" data-del-sub="${s.id}">Ištrinti</button></div>`}).join(''):'<div class="emptyState">Darbų dar nepateikta.</div>'}`);
 document.querySelectorAll('[data-dsub]').forEach(b=>b.onclick=()=>downloadSubmission(b.dataset.dsub));
 document.querySelectorAll('[data-del-sub]').forEach(b=>b.onclick=()=>deleteAssignmentSubmission(b.dataset.delSub,c,assignmentId,'teacher'));
}
async function downloadSubmission(id){
 const {data:s,error}=await sb.from('submissions').select('*').eq('id',id).single();if(error)return toast(error.message);
 const {data,error:e}=await sb.storage.from('student-submissions').createSignedUrl(s.storage_path,60);if(e)return toast(e.message);window.open(data.signedUrl,'_blank');
}
async function downloadDirectSubmission(id){
 const {data:s,error}=await sb.from('direct_submissions').select('*').eq('id',id).single();if(error)return toast(error.message);
 const {data,error:e}=await sb.storage.from('student-submissions').createSignedUrl(s.storage_path,60);if(e)return toast(e.message);window.open(data.signedUrl,'_blank');
}
async function deleteDirectSubmission(id,c,who='student'){
 const {data:s,error}=await sb.from('direct_submissions').select('*').eq('id',id).single();if(error)return toast(error.message);
 const msg=who==='teacher'
  ?`Ar tikrai ištrinti mokinio failą „${s.original_name}“? Šio veiksmo atšaukti nepavyks.`
  :`Ar tikrai ištrinti savo failą „${s.original_name}“? Šio veiksmo atšaukti nepavyks.`;
 if(!confirm(msg))return;
 const {error:storageErr}=await sb.storage.from('student-submissions').remove([s.storage_path]);
 if(storageErr)return toast(storageErr.message);
 const {error:dbErr}=await sb.from('direct_submissions').delete().eq('id',id);
 if(dbErr)return toast(dbErr.message);
 toast('Failas ištrintas.');
 if(who==='teacher')renderTeacherAssignments(c);else renderStudent();
}
async function deleteAssignmentSubmission(id,c,assignmentId,who='student',topicId=null,access=null){
 const {data:s,error}=await sb.from('submissions').select('*').eq('id',id).single();if(error)return toast(error.message);
 const msg=who==='teacher'
  ?`Ar tikrai ištrinti mokinio failą „${s.original_name}“? Šio veiksmo atšaukti nepavyks.`
  :`Ar tikrai ištrinti savo failą „${s.original_name}“? Šio veiksmo atšaukti nepavyks.`;
 if(!confirm(msg))return;
 const {error:storageErr}=await sb.storage.from('student-submissions').remove([s.storage_path]);
 if(storageErr)return toast(storageErr.message);
 const {error:dbErr}=await sb.from('submissions').delete().eq('id',id);
 if(dbErr)return toast(dbErr.message);
 toast('Failas ištrintas.');
 if(who==='teacher')showSubmissions(assignmentId,c);
 else if(topicId&&access)openStudentTopic(topicId,c,access);
 else renderStudent();
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
 const [{data:access},{data:attempts},{data:sessions},{data:direct,error:directErr}]=await Promise.all([
  sb.from('topic_access').select('*').eq('class_id',c.id),
  sb.from('practice_attempts').select('*').eq('student_id',me.id).eq('class_id',c.id),
  sb.from('activity_sessions').select('*').eq('user_id',me.id).eq('class_id',c.id),
  sb.from('direct_submissions').select('*').eq('student_id',me.id).eq('class_id',c.id).order('submitted_at',{ascending:false})
 ]);
 if(directErr)return toast(directErr.message);

 const secs=(sessions||[]).reduce((n,x)=>n+(x.duration_seconds||0),0),best=(attempts||[]).length?Math.max(...attempts.map(x=>x.score_percent||0)):0;
 const openTopics=CFG.topics.filter(t=>(access||[]).find(a=>a.topic_id===t.id)?.is_open);

 $('studentContent').innerHTML=`<div class="pageHero"><span class="kicker">PRADŽIA · ${esc(c.name)}</span><h1>Sveiki, ${esc(profile.full_name||'mokiny')}.</h1><p>Čia yra tavo klasė: atidarytos temos, žinių treniruotės, mokymosi failai ir darbų pateikimas.</p></div>
 <div class="dashboardGrid"><div class="metric"><strong>${(attempts||[]).length}</strong><span>bandymų</span></div><div class="metric"><strong>${(attempts||[]).length?best+'%':'–'}</strong><span>geriausias rezultatas</span></div><div class="metric"><strong>${fmtSec(secs)}</strong><span>aktyvus laikas</span></div><div class="metric"><strong>${fmtDate(profile.last_seen_at||profile.last_login_at)}</strong><span>paskutinis aktyvumas</span></div></div>


 <div class="panel studentUploadPanel">
  <div class="sectionTitle"><div class="grow"><span class="kicker">MANO DARBAI</span><h2>Pateikti atliktą darbą</h2></div><button class="primary" id="directSubmitBtn" ${openTopics.length?'':'disabled'}>+ Įkelti failus</button></div>
  <p class="muted">Gali pateikti vieną arba kelis failus vienu metu ir vėliau pridėti dar. Savo įkeltus failus gali atsisiųsti arba ištrinti. Mokytojas iškart matys juos savo klasės skiltyje „Užduotys ir darbai“.</p>
  ${(direct||[]).length?`<div class="miniList"><b>Mano pateikti failai (${direct.length})</b>${(direct||[]).map(s=>`<div class="submissionRow"><div class="grow"><b>${esc(s.title||s.original_name)}</b><div class="subtle">${esc(topicById(s.topic_id)?.title||s.topic_id)} · ${esc(s.original_name)} · ${fmtDate(s.submitted_at)}</div></div><button class="smallBtn" data-my-direct="${s.id}">Atsisiųsti</button><button class="smallBtn dangerMini" data-my-del-direct="${s.id}">Ištrinti</button></div>`).join('')}</div>`:'<div class="emptyState">Dar nieko nepateikei. Gali pasirinkti kelis failus vienu metu.</div>'}
 </div>

 <div class="sectionHead"><span class="kicker">TEMOS</span><h2>Mokymosi turinys</h2></div>
 <div class="studentTopics">${CFG.topics.map(t=>{const a=(access||[]).find(x=>x.topic_id===t.id)||{};return `<article class="topicStudentCard ${a.is_open?'':'locked'}"><span class="badge ${a.is_open?'ok':''}">${a.is_open?'ATIDARYTA':'🔒 UŽRAKINTA'}</span><div style="font-size:30px;margin-top:12px">${t.icon}</div><h3>${esc(t.title)}</h3><p>${t.code} · ${t.hours} val.</p><button class="${a.is_open?'primary':'ghost'}" data-stopic="${t.id}" ${a.is_open?'':'disabled'}>${a.is_open?'Atidaryti':'Užrakinta'}</button></article>`}).join('')}</div>`;

 if($('directSubmitBtn'))$('directSubmitBtn').onclick=()=>openDirectSubmissionModal(c,openTopics);
 document.querySelectorAll('[data-my-direct]').forEach(b=>b.onclick=()=>downloadDirectSubmission(b.dataset.myDirect));
 document.querySelectorAll('[data-my-del-direct]').forEach(b=>b.onclick=()=>deleteDirectSubmission(b.dataset.myDelDirect,c,'student'));
 document.querySelectorAll('[data-stopic]').forEach(b=>b.onclick=()=>openStudentTopic(b.dataset.stopic,c,access||[]));
}

function openDirectSubmissionModal(c,openTopics){
 modal(`<span class="kicker">PATEIKTI DARBĄ</span><h2>Įkelti atliktą užduotį</h2>
 <form id="directSubmissionForm" class="formGroup">
  <label>Tema<select id="directTopic" required>${openTopics.map(t=>`<option value="${t.id}">${esc(t.title)}</option>`).join('')}</select></label>
  <label>Darbo pavadinimas<input id="directTitle" required maxlength="120" placeholder="Pvz., Logotipo kūrimo užduotis"></label>
  <label>Failai<input class="fileInput" type="file" id="directFile" multiple required></label>
  <p class="formHint">Galima pasirinkti kelis failus. Vieno failo maksimalus dydis – 25 MB.</p>
  <button class="primary" type="submit" style="margin-top:14px">Pateikti mokytojui</button>
 </form>`);
 $('directSubmissionForm').onsubmit=async e=>{
  e.preventDefault();
  const files=[...$('directFile').files];if(!files.length)return;
  if(files.some(f=>f.size>25*1024*1024))return toast('Vienas iš failų per didelis. Maksimalus dydis – 25 MB vienam failui.');
  const topicId=$('directTopic').value,title=$('directTitle').value.trim();
  if(!title)return toast('Įrašyk darbo pavadinimą.');
  toast(`Įkeliama: ${files.length} fail.`);
  let uploaded=0;
  for(const f of files){
   const path=`${c.id}/direct/${me.id}/${crypto.randomUUID()}_${f.name.replaceAll('/','_')}`;
   const {error:upErr}=await sb.storage.from('student-submissions').upload(path,f);
   if(upErr){toast(`Nepavyko įkelti ${f.name}: ${upErr.message}`);continue}
   const {error}=await sb.from('direct_submissions').insert({
    class_id:c.id,topic_id:topicId,student_id:me.id,title,
    storage_path:path,original_name:f.name,mime_type:f.type,size_bytes:f.size
   });
   if(error){await sb.storage.from('student-submissions').remove([path]);toast(`Nepavyko išsaugoti ${f.name}: ${error.message}`);continue}
   uploaded++;
  }
  if(uploaded){closeModal();toast(`Pateikta failų: ${uploaded}.`);renderStudent()}
 };
}

async function openStudentTopic(topicId,c,access){
 const t=topicById(topicId),a=access.find(x=>x.topic_id===topicId);if(!a?.is_open)return toast('Tema užrakinta.');
 const [{data:resources},{data:assignments},{data:topicPosts}]=await Promise.all([
  sb.from('learning_resources').select('*').eq('class_id',c.id).eq('topic_id',topicId).order('created_at',{ascending:false}),
  sb.from('assignments').select('*').eq('class_id',c.id).eq('topic_id',topicId).eq('is_open',true).order('created_at',{ascending:false}),
  sb.from('class_posts').select('*').eq('class_id',c.id).eq('topic_id',topicId).order('created_at',{ascending:false})
 ]);
 let existing=[];if(assignments?.length)({data:existing}=await sb.from('submissions').select('*').eq('student_id',me.id).in('assignment_id',assignments.map(x=>x.id)).order('submitted_at',{ascending:false}));
 $('topicContent').innerHTML=`<div class="pageHero"><button class="back" id="backStudent">← Mano klasė</button><span class="kicker">${t.code}</span><h1>${esc(t.title)}</h1><p>${esc(t.area)} · rekomenduojama ${t.hours} val.</p></div>
 <div class="contentGrid"><div class="stack">
  ${(topicPosts||[]).length?`<div class="panel classPostsPanel">
   <div class="sectionTitle"><div class="grow"><span class="kicker">IŠ MOKYTOJO</span><h2>Pranešimai ir nuorodos</h2></div><span class="badge">${(topicPosts||[]).length}</span></div>
   ${(topicPosts||[]).map(p=>`<div class="classPost"><div class="postMeta">${fmtDate(p.created_at)}</div><h3>${esc(p.title)}</h3>${p.body?`<p>${esc(p.body)}</p>`:''}${p.url?`<a class="postLink" href="${esc(p.url)}" target="_blank" rel="noopener noreferrer">Atidaryti nuorodą ↗</a>`:''}</div>`).join('')}
  </div>`:''}
  <div class="panel"><div class="sectionTitle"><div class="grow"><span class="kicker">PRAKTIKA</span><h2>Žinių treniruotė</h2></div><span class="badge ${a.practice_open?'ok':''}">${a.practice_open?'Atidaryta':'Užrakinta'}</span></div>
   <p class="muted"><b>Praktikuotis gali tiek kartų, kiek nori.</b> Kiekvieną kartą sistema iš didesnio klausimų banko atsitiktinai parenka 10 klausimų ir sumaišo atsakymų variantus, todėl bandymai nėra vienodi. Po kiekvieno atsakymo gausi paaiškinimą, o rezultatas ir atlikimo laikas bus išsaugoti tavo paskyroje.</p>
   <button class="primary" id="startPracticeTopic" ${a.practice_open?'':'disabled'}>Pradėti 10 klausimų praktiką</button>
  </div>
  <div class="panel"><div class="sectionTitle"><div class="grow"><span class="kicker">MOKYMOSI FAILAI</span><h2>Failai atsisiuntimui</h2></div></div>
   ${(resources||[]).length?(resources||[]).map(r=>`<div class="resourceRow"><div class="grow"><b>${esc(r.title)}</b><div class="subtle">${esc(r.original_name)}</div></div><button class="smallBtn" data-sresource="${r.id}">Atsisiųsti</button></div>`).join(''):'<div class="emptyState">Mokytojas šiai temai failų dar neįkėlė.</div>'}
  </div>
  <div class="panel"><div class="sectionTitle"><div class="grow"><span class="kicker">MANO DARBAI</span><h2>Užduočių pateikimas</h2></div></div>
   ${(assignments||[]).length?(assignments||[]).map(as=>{
     const subs=(existing||[]).filter(s=>s.assignment_id===as.id);
     return `<div class="assignmentBlock"><div class="assignmentRow"><div class="grow"><b>${esc(as.title)}</b><div class="subtle">${esc(as.instructions||'')} ${as.due_at?' · iki '+fmtDate(as.due_at):''}</div></div><button class="primary" data-submit="${as.id}">+ Pridėti failų</button></div>
      ${subs.length?`<div class="submittedFiles">${subs.map(s=>`<div class="submissionRow"><div class="grow"><b>${esc(s.original_name)}</b><div class="subtle">Pateikta ${fmtDate(s.submitted_at)}</div></div><button class="smallBtn" data-own-assignment-download="${s.id}">Atsisiųsti</button><button class="smallBtn dangerMini" data-own-assignment-delete="${s.id}" data-assignment-id="${as.id}">Ištrinti</button></div>`).join('')}</div>`:'<div class="subtle" style="margin-top:8px">Failų dar nepateikei.</div>'}</div>`
   }).join(''):'<div class="emptyState">Atidarytų užduočių nėra.</div>'}
  </div>
 </div><div class="stack">
  <div class="panel"><span class="kicker">ATSISKAITYMAS</span><h3>Temos testas</h3>${a.assessment_open?`<span class="badge ok">Atidaryta</span><p class="muted">Atsiskaitymas šiuo metu atidarytas.</p><button class="primary" id="startAssessmentTopic">Pradėti atsiskaitymą</button>`:`<div class="lockedBox">🔒 Mokytojas atsiskaitymo dar neatidarė.</div>`}</div>
 </div></div>`;
 show('topic');$('backStudent').onclick=renderStudent;
 if(a.practice_open)$('startPracticeTopic').onclick=()=>startQuiz(topicId,c.id,'practice',10);
 if(a.assessment_open&&$('startAssessmentTopic'))$('startAssessmentTopic').onclick=()=>startQuiz(topicId,c.id,'assessment',CFG.assessmentQuestionCount);
 document.querySelectorAll('[data-sresource]').forEach(b=>b.onclick=()=>downloadResource(b.dataset.sresource));
 document.querySelectorAll('[data-submit]').forEach(b=>b.onclick=()=>submissionModal(b.dataset.submit,c,topicId,access));
 document.querySelectorAll('[data-own-assignment-download]').forEach(b=>b.onclick=()=>downloadSubmission(b.dataset.ownAssignmentDownload));
 document.querySelectorAll('[data-own-assignment-delete]').forEach(b=>b.onclick=()=>deleteAssignmentSubmission(b.dataset.ownAssignmentDelete,c,b.dataset.assignmentId,'student',topicId,access));
}
function submissionModal(assignmentId,c,topicId,access){
 modal(`<span class="kicker">PATEIKTI DARBĄ</span><h2>Įkelti failus</h2><form id="submissionForm" class="formGroup"><label>Failai<input class="fileInput" type="file" id="submissionFile" multiple required></label><p class="formHint">Gali pasirinkti kelis failus ir vėliau pridėti dar.</p><button class="primary" type="submit" style="margin-top:14px">Pateikti</button></form>`);
 $('submissionForm').onsubmit=async e=>{e.preventDefault();const files=[...$('submissionFile').files];if(!files.length)return;
  if(files.some(f=>f.size>25*1024*1024))return toast('Vienas iš failų per didelis. Maksimalus dydis – 25 MB vienam failui.');
  toast(`Įkeliama: ${files.length} fail.`);
  let uploaded=0;
  for(const f of files){
   const path=`${c.id}/${assignmentId}/${me.id}/${crypto.randomUUID()}_${f.name.replaceAll('/','_')}`;
   const {error:upErr}=await sb.storage.from('student-submissions').upload(path,f);if(upErr){toast(`Nepavyko įkelti ${f.name}: ${upErr.message}`);continue}
   const {error}=await sb.from('submissions').insert({assignment_id:assignmentId,student_id:me.id,storage_path:path,original_name:f.name,mime_type:f.type,size_bytes:f.size});
   if(error){await sb.storage.from('student-submissions').remove([path]);toast(`Nepavyko išsaugoti ${f.name}: ${error.message}`);continue}
   uploaded++;
  }
  if(uploaded){closeModal();toast(`Pateikta failų: ${uploaded}.`);openStudentTopic(topicId,c,access)}
 };
}



/* ================= MOKYTOJO MOKINIO VAIZDO PERŽIŪRA ================= */
async function renderTeacherStudentPreview(c){
 const [{data:access},{data:attempts}]=await Promise.all([
  sb.from('topic_access').select('*').eq('class_id',c.id),
  sb.from('practice_attempts').select('id').eq('class_id',c.id)
 ]);
 $('teacherContent').innerHTML=`<div class="previewBanner"><b>👁 Mokinio vaizdo peržiūra</b><span>Tai tik peržiūros režimas – mokinio rezultatai nebus keičiami.</span></div>
 <div class="pageHero"><button class="back" id="backFromPreview">← Grįžti į klasės valdymą</button><span class="kicker">PRADŽIA · ${esc(c.name)}</span><h1>Mokinio klasės vaizdas</h1><p>Taip mokinys mato tavo atidarytas temas ir pagrindines skiltis.</p></div>

 <div class="panel studentUploadPanel previewDisabled"><div class="sectionTitle"><div class="grow"><span class="kicker">MANO DARBAI</span><h2>Pateikti atliktą darbą</h2></div><button class="primary" disabled>+ Įkelti failus</button></div><p class="muted">Mokinys čia gali pateikti vieną ar kelis atliktos užduoties failus.</p></div>
 <div class="sectionHead"><span class="kicker">TEMOS</span><h2>Mokymosi turinys</h2></div>
 <div class="studentTopics">${CFG.topics.map(t=>{const a=(access||[]).find(x=>x.topic_id===t.id)||{};return `<article class="topicStudentCard ${a.is_open?'':'locked'}"><span class="badge ${a.is_open?'ok':''}">${a.is_open?'ATIDARYTA':'🔒 UŽRAKINTA'}</span><div style="font-size:30px;margin-top:12px">${t.icon}</div><h3>${esc(t.title)}</h3><p>${t.code} · ${t.hours} val.</p><button class="${a.is_open?'primary':'ghost'}" data-preview-topic="${t.id}" ${a.is_open?'':'disabled'}>${a.is_open?'Atidaryti':'Užrakinta'}</button></article>`}).join('')}</div>`;
 show('teacher');
 $('backFromPreview').onclick=()=>openTeacherClass(c.id);
 document.querySelectorAll('[data-preview-topic]').forEach(b=>b.onclick=()=>renderTeacherTopicPreview(b.dataset.previewTopic,c,access||[]));
}
async function renderTeacherTopicPreview(topicId,c,access){
 const t=topicById(topicId),a=(access||[]).find(x=>x.topic_id===topicId);if(!a?.is_open)return toast('Tema užrakinta.');
 const [{data:resources},{data:assignments},{data:topicPosts}]=await Promise.all([
  sb.from('learning_resources').select('*').eq('class_id',c.id).eq('topic_id',topicId).order('created_at',{ascending:false}),
  sb.from('assignments').select('*').eq('class_id',c.id).eq('topic_id',topicId).eq('is_open',true).order('created_at',{ascending:false}),
  sb.from('class_posts').select('*').eq('class_id',c.id).eq('topic_id',topicId).order('created_at',{ascending:false})
 ]);
 $('teacherContent').innerHTML=`<div class="previewBanner"><b>👁 Mokinio vaizdo peržiūra</b><span>Veiksmai, kurie kurtų mokinio rezultatą ar pateiktų darbą, yra išjungti.</span></div>
 <div class="pageHero"><button class="back" id="backPreviewTopic">← Mokinio klasės vaizdas</button><span class="kicker">${t.code}</span><h1>${esc(t.title)}</h1><p>${esc(t.area)} · rekomenduojama ${t.hours} val.</p></div>
 <div class="contentGrid"><div class="stack">
  ${(topicPosts||[]).length?`<div class="panel classPostsPanel">
   <div class="sectionTitle"><div class="grow"><span class="kicker">IŠ MOKYTOJO</span><h2>Pranešimai ir nuorodos</h2></div><span class="badge">${(topicPosts||[]).length}</span></div>
   ${(topicPosts||[]).map(p=>`<div class="classPost"><div class="postMeta">${fmtDate(p.created_at)}</div><h3>${esc(p.title)}</h3>${p.body?`<p>${esc(p.body)}</p>`:''}${p.url?`<a class="postLink" href="${esc(p.url)}" target="_blank" rel="noopener noreferrer">Atidaryti nuorodą ↗</a>`:''}</div>`).join('')}
  </div>`:''}
  <div class="panel"><div class="sectionTitle"><div class="grow"><span class="kicker">PRAKTIKA</span><h2>Žinių treniruotė</h2></div><span class="badge ${a.practice_open?'ok':''}">${a.practice_open?'Atidaryta':'Užrakinta'}</span></div>
   <p class="muted"><b>Praktikuotis galima neribotai.</b> Kiekvieną kartą parenkami atsitiktiniai klausimai ir sumaišomi atsakymai.</p><button class="primary" disabled>${a.practice_open?'Pradėti 10 klausimų praktiką':'Praktika užrakinta'}</button>
  </div>
  <div class="panel"><span class="kicker">MOKYMOSI FAILAI</span><h2>Failai atsisiuntimui</h2>
   ${(resources||[]).length?(resources||[]).map(r=>`<div class="resourceRow"><div class="grow"><b>${esc(r.title)}</b><div class="subtle">${esc(r.original_name)}</div></div><button class="smallBtn" data-preview-resource="${r.id}">Atsisiųsti</button></div>`).join(''):'<div class="emptyState">Šiai temai failų dar nėra.</div>'}
  </div>
  <div class="panel"><span class="kicker">MANO DARBAI</span><h2>Užduočių pateikimas</h2>
   ${(assignments||[]).length?(assignments||[]).map(as=>`<div class="assignmentRow"><div class="grow"><b>${esc(as.title)}</b><div class="subtle">${esc(as.instructions||'')} ${as.due_at?' · iki '+fmtDate(as.due_at):''}</div></div><button class="primary" disabled>+ Pridėti failų</button></div>`).join(''):'<div class="emptyState">Atidarytų užduočių nėra.</div>'}
  </div>
 </div><div class="stack"><div class="panel"><span class="kicker">ATSISKAITYMAS</span><h3>Temos testas</h3>${a.assessment_open?'<span class="badge ok">Atidaryta</span><p class="muted">Mokinys čia galėtų pradėti atsiskaitymą.</p><button class="primary" disabled>Pradėti atsiskaitymą</button>':'<div class="lockedBox">🔒 Mokytojas atsiskaitymo dar neatidarė.</div>'}</div></div></div>`;
 show('teacher');
 $('backPreviewTopic').onclick=()=>renderTeacherStudentPreview(c);
 document.querySelectorAll('[data-preview-resource]').forEach(b=>b.onclick=()=>downloadResource(b.dataset.previewResource));
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
 const isStudent=profile.role==='student';
 const nameLocked=isStudent&&profile.name_change_used===true;
 const info=isStudent
  ?(nameLocked?'Vardą ir pavardę jau keitei vieną kartą, todėl dabar jie užrakinti. Jei yra klaida, kreipkis į mokytoją.':'Jei registruojantis suklydai, vardą ir pavardę gali pataisyti vieną kartą. Po išsaugojimo jų keisti nebegalėsi.')
  :'Vardą ir pavardę gali atnaujinti savo paskyroje.';

 $('profileContent').innerHTML=`<div class="pageHero"><span class="kicker">PASKYRA</span><h1>${esc(profile.full_name||'Vartotojas')}</h1><p>Rolė: ${profile.role==='teacher'?'mokytojas':profile.role==='admin'?'administratorius':'mokinys'} · paskutinis prisijungimas ${fmtDate(profile.last_login_at)}</p></div>
 <div class="panel" style="max-width:600px"><h2>Paskyros duomenys</h2><p class="muted">${esc(info)}</p><div class="formGroup"><label>Vardas ir pavardė<input id="profileName" value="${esc(profile.full_name||'')}" ${nameLocked?'disabled':''}></label>${nameLocked?'':`<button class="primary" id="saveProfile" style="margin-top:14px">${isStudent?'Išsaugoti vienintelį pakeitimą':'Išsaugoti'}</button>`}</div></div>`;
 show('profile');

 if(!nameLocked&&$('saveProfile'))$('saveProfile').onclick=async()=>{
  const name=$('profileName').value.trim();
  if(name.length<2)return toast('Įrašyk vardą ir pavardę.');
  if(isStudent&&!confirm('Po šio išsaugojimo vardo ir pavardės pats daugiau pakeisti negalėsi. Tęsti?'))return;
  const {data,error}=await sb.rpc('update_my_name',{p_full_name:name});
  if(error)return toast(error.message);
  profile.full_name=(data||name);
  if(isStudent)profile.name_change_used=true;
  toast('Išsaugota.');
  renderProfile();
 };
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
