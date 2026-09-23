
const SETTINGS=window.SUPABASE_SETTINGS||{};
const configured=SETTINGS.url && SETTINGS.publishableKey &&
 !SETTINGS.url.includes('PAKEISKITE_') && !SETTINGS.publishableKey.includes('PAKEISKITE_');
const sb=configured?window.supabase.createClient(SETTINGS.url,SETTINGS.publishableKey):null;
const CFG=window.SITE_CONFIG,PRACTICE=window.PRACTICE_QUESTIONS||[],ASSESSMENT=window.ASSESSMENT_QUESTIONS||[];
let activeClassTopics=[];
const $=id=>document.getElementById(id);
const topicById=id=>activeClassTopics.find(t=>t.id===id)||CFG.topics.find(t=>t.id===id);
const gradeLabel=g=>g==='10'?'10 klasė':g==='11'?'11 klasė':g==='12'?'12 klasė':g==='custom'?'Kita programa':'';
const topicMeta=t=>{
 if(!t)return '';
 const bits=[];
 if(t.code)bits.push(t.code);
 if(Number(t.hours)>0)bits.push(`${Number(t.hours)} val.`);
 return bits.join(' · ');
};
const topicDescription=t=>{
 if(!t)return '';
 if(t.description)return t.description;
 const bits=[];
 if(t.area)bits.push(t.area);
 if(Number(t.hours)>0)bits.push(`rekomenduojama ${Number(t.hours)} val.`);
 return bits.join(' · ');
};
async function loadClassTopics(classId){
 const {data,error}=await sb.from('class_topics')
  .select('*')
  .eq('class_id',classId)
  .eq('is_archived',false)
  .order('sort_order',{ascending:true})
  .order('created_at',{ascending:true});
 if(error){
  activeClassTopics=[...CFG.topics];
  return activeClassTopics;
 }
 activeClassTopics=(data||[]).map(r=>({
  id:r.topic_id,
  class_id:r.class_id,
  code:r.code||'',
  title:r.title,
  hours:Number(r.hours||0),
  icon:r.icon||'💻',
  area:r.area||'',
  description:r.description||'',
  sort_order:Number(r.sort_order||0)
 }));
 return activeClassTopics;
}
const esc=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
const shuffle=a=>{a=[...a];for(let i=a.length-1;i>0;i--){let j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a};
const fmtSec=s=>{s=Number(s||0);const h=Math.floor(s/3600),m=Math.floor((s%3600)/60);return h?`${h} val. ${m} min.`:`${m} min.`};
const fmtDurationDetailed=s=>{s=Math.max(0,Number(s||0));const h=Math.floor(s/3600),m=Math.floor((s%3600)/60),sec=Math.floor(s%60);return h?`${h} val. ${m} min. ${sec} s`:(m?`${m} min. ${sec} s`:`${sec} s`)};
const qType=q=>q?.type||q?.question_type||'single';
const normalizeAnswer=(v,type)=>{if(type==='multi')return [...(Array.isArray(v)?v:[])].map(Number).sort((x,y)=>x-y);if(type==='matching'&&v&&typeof v==='object'){const o={};Object.keys(v).sort().forEach(k=>o[k]=Number(v[k]));return o}return v===null||v===undefined?null:Number(v)};
const answerEquals=(a,b,type)=>JSON.stringify(normalizeAnswer(a,type))===JSON.stringify(normalizeAnswer(b,type));
const qTypeLabel=t=>({single:'Vienas atsakymas',multi:'Keli atsakymai',odd:'Kuris netinka',matching:'Sujungimas'})[t]||'Klausimas';
const fmtDate=d=>d?new Date(d).toLocaleString('lt-LT'):'–';
let me=null,profile=null,currentClass=null,activitySessionId=null,heartbeatTimer=null;
let presenceActivity='Platforma',presenceTopicId=null,presenceClassId=null,teacherPresenceTimer=null;
let quiz={topicId:null,classId:null,mode:null,items:[],index:0,answers:[],attemptId:null,startMs:0,last:null,completed:false};
let assessmentAccessToken=null,assessmentBlurTimer=null;
let assessmentSaveQueue=Promise.resolve(),assessmentDirtyQuestionIds=new Set();

let uiBackStack=[],restoringBack=false,historyGuardReady=false,currentRestore=null;

const IDLE_LOGOUT_MS=30*60*1000;
const IDLE_WARNING_MS=25*60*1000;
const IDLE_STORAGE_KEY='informatika_last_activity_at';
let idleLastActivity=0,idleCheckTimer=null,idleWarningShown=false,idleListenersReady=false,idleSigningOut=false,lastActivityPersistAt=0;

function readIdleActivity(){
 const saved=Number(localStorage.getItem(IDLE_STORAGE_KEY)||0);
 idleLastActivity=Number.isFinite(saved)&&saved>0?saved:0;
 return idleLastActivity;
}

function persistIdleActivity(ts=Date.now(),force=false){
 idleLastActivity=ts;
 idleWarningShown=false;
 if(force||ts-lastActivityPersistAt>=5000){
  localStorage.setItem(IDLE_STORAGE_KEY,String(ts));
  lastActivityPersistAt=ts;
 }
}

function markUserActivity(){
 if(!me)return;
 persistIdleActivity(Date.now(),false);
}

function resetIdleClock(){
 persistIdleActivity(Date.now(),true);
}

function clearIdleClock(){
 localStorage.removeItem(IDLE_STORAGE_KEY);
 idleLastActivity=0;
 lastActivityPersistAt=0;
}

function idleSessionExpired(){
 const last=readIdleActivity();
 return last>0&&(Date.now()-last)>=IDLE_LOGOUT_MS;
}

async function forceIdleLogout(message='Dėl saugumo atsijungta po 30 min. neaktyvumo.'){
 if(idleSigningOut)return;
 idleSigningOut=true;
 stopHeartbeat();
 stopTeacherPresenceRefresh();
 if(idleCheckTimer)clearInterval(idleCheckTimer);
 idleCheckTimer=null;
 try{await sb.auth.signOut()}finally{
  clearIdleClock();
  me=null;profile=null;currentClass=null;uiBackStack=[];currentRestore=null;
  idleSigningOut=false;
  setHeader();
  show('auth');
  authMsg(message);
 }
}

function startIdleLogout(){
 const last=readIdleActivity();
 if(!last)resetIdleClock();

 if(!idleListenersReady){
  idleListenersReady=true;
  ['pointerdown','keydown','touchstart','input','scroll'].forEach(evt=>{
   window.addEventListener(evt,markUserActivity,{passive:true});
  });
  window.addEventListener('storage',e=>{
   if(e.key===IDLE_STORAGE_KEY&&e.newValue){
    const ts=Number(e.newValue);
    if(Number.isFinite(ts)&&ts>idleLastActivity)idleLastActivity=ts;
   }
  });
 }

 if(idleCheckTimer)clearInterval(idleCheckTimer);
 idleCheckTimer=setInterval(async()=>{
  if(!me||idleSigningOut)return;

  // Visada perskaitome localStorage, kad keli skirtukai naudotų tą patį neaktyvumo laiką.
  const stored=Number(localStorage.getItem(IDLE_STORAGE_KEY)||0);
  if(Number.isFinite(stored)&&stored>idleLastActivity)idleLastActivity=stored;

  const idleFor=Date.now()-idleLastActivity;
  if(idleFor>=IDLE_LOGOUT_MS){
   await forceIdleLogout();
   return;
  }
  if(idleFor>=IDLE_WARNING_MS&&!idleWarningShown){
   idleWarningShown=true;
   toast('Dėl saugumo po 5 min. neaktyvumo būsite automatiškai atjungti.');
  }
 },15000);
}

function stopIdleLogout(){
 if(idleCheckTimer)clearInterval(idleCheckTimer);
 idleCheckTimer=null;
 idleWarningShown=false;
}

function setCurrentRestore(fn){
 currentRestore=typeof fn==='function'?fn:null;
}

function ensureAppHistoryGuard(){
 if(historyGuardReady)return;
 historyGuardReady=true;
 history.replaceState({infRoot:true},'',location.href);
 history.pushState({infGuard:true},'',location.href);
}

function navigateTo(nextFn){
 if(restoringBack||!currentRestore)return nextFn();
 ensureAppHistoryGuard();
 uiBackStack.push(currentRestore);
 history.pushState({infAction:true,depth:uiBackStack.length},'',location.href);
 return nextFn();
}

function appBack(fallback){
 if(uiBackStack.length)return history.back();
 if(typeof fallback==='function')return fallback();
}

window.addEventListener('popstate',()=>{
 if(!me)return;
 if(uiBackStack.length){
  const restore=uiBackStack.pop();
  restoringBack=true;
  Promise.resolve(restore()).finally(()=>{restoringBack=false});
  return;
 }
 // Pagrindiniame programos lange "Atgal" nebeišmeta iš svetainės.
 history.pushState({infGuard:true},'',location.href);
});

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
document.querySelectorAll('[data-route]').forEach(b=>b.onclick=()=>navigateTo(()=>route(b.dataset.route)));

function setHeader(){
 $('appHeader').classList.toggle('hidden',!me);
 if(!profile)return;
 const isTeacher=['teacher','admin'].includes(profile.role);
 $('headerRole').textContent=profile.role==='teacher'?'Mokytojas':profile.role==='admin'?'Administratorius':'Mokinys';

 // Mokinys turi vieną aiškią pradžios nuorodą, kuri visada atidaro jo klasę.
 $('homeNav').classList.toggle('hidden',isTeacher);
 $('homeNav').dataset.route='student';
 $('teacherNav').classList.toggle('hidden',!isTeacher);
 $('teacherNav').textContent=profile.role==='admin'?'Administratoriaus skydelis':'Mokytojo aplinka';
 $('studentNav').classList.add('hidden');

 // Logotipas taip pat grąžina į tinkamą pagrindinį ekraną.
 if($('brandHome'))$('brandHome').dataset.route=isTeacher?'teacher':'student';
}

$('themeToggle').onclick=()=>{const n=(document.documentElement.dataset.theme||'light')==='dark'?'light':'dark';document.documentElement.dataset.theme=n;localStorage.setItem('inf11v3_theme',n)};
$('logoutBtn').onclick=async()=>{stopHeartbeat();stopTeacherPresenceRefresh();stopIdleLogout();clearIdleClock();await sb.auth.signOut();me=null;profile=null;currentClass=null;uiBackStack=[];currentRestore=null;historyGuardReady=false;if($('loginEmail'))$('loginEmail').value='';if($('loginPassword'))$('loginPassword').value='';setHeader();show('auth')};

$('tabLogin').onclick=()=>{$('tabLogin').classList.add('active');$('tabSignup').classList.remove('active');$('loginForm').classList.remove('hidden');$('signupForm').classList.add('hidden')};
$('tabSignup').onclick=()=>{$('tabSignup').classList.add('active');$('tabLogin').classList.remove('active');$('signupForm').classList.remove('hidden');$('loginForm').classList.add('hidden')};

$('loginForm').onsubmit=async e=>{
 e.preventDefault();resetIdleClock();authMsg('Jungiamasi...');
 const {error}=await sb.auth.signInWithPassword({email:$('loginEmail').value.trim(),password:$('loginPassword').value});
 if(error)return authMsg(error.message,true);
 $('loginEmail').value='';
 $('loginPassword').value='';
 authMsg('Prisijungta.');
};
$('signupForm').onsubmit=async e=>{
 e.preventDefault();resetIdleClock();authMsg('Kuriama paskyra...');
 const {data,error}=await sb.auth.signUp({
  email:$('signupEmail').value.trim(),password:$('signupPassword').value,
  options:{data:{full_name:$('signupName').value.trim()}}
 });
 if(error)return authMsg(error.message,true);
 authMsg(data.session?'Paskyra sukurta ir prisijungta.':'Paskyra sukurta. Patikrink el. paštą, jei įjungtas patvirtinimas.');
};

async function loadProfile(){
 const {data,error}=await sb.from('profiles').select('*').eq('id',me.id).single();
 if(error)throw error;profile=data;await sb.rpc('mark_login');setHeader();ensureAppHistoryGuard();startIdleLogout();
}
async function pushPresence(){
 if(!me||!activitySessionId||document.visibilityState!=='visible')return;
 try{
  await sb.rpc('heartbeat_presence',{
   p_session_id:activitySessionId,
   p_activity:presenceActivity||'Platforma',
   p_topic_id:presenceTopicId||null
  });
 }catch(_e){}
}
function setPresenceContext(activity,topicId=null){
 presenceActivity=String(activity||'Platforma').slice(0,120);
 presenceTopicId=topicId||null;
 if(activitySessionId)pushPresence();
}
async function startHeartbeat(classId=null){
 stopHeartbeat();
 presenceClassId=classId||null;
 presenceActivity=classId?'Klasės pradžia':'Platforma';
 presenceTopicId=null;
 const payload={user_id:me.id,class_id:classId,activity_label:presenceActivity,topic_id:null};
 const {data,error}=await sb.from('activity_sessions').insert(payload).select('id').single();
 if(!error){
  activitySessionId=data.id;
  await pushPresence();
  heartbeatTimer=setInterval(pushPresence,30000);
 }
}
function stopHeartbeat(){
 if(heartbeatTimer)clearInterval(heartbeatTimer);
 heartbeatTimer=null;activitySessionId=null;presenceClassId=null;presenceTopicId=null;presenceActivity='Platforma';
}
function stopTeacherPresenceRefresh(){
 if(teacherPresenceTimer)clearInterval(teacherPresenceTimer);
 teacherPresenceTimer=null;
}
function latestPresenceByUser(rows){
 const out={};
 (rows||[]).forEach(r=>{if(!out[r.user_id]||new Date(r.last_seen_at)>new Date(out[r.user_id].last_seen_at))out[r.user_id]=r});
 return out;
}
function presenceIsOnline(row){
 return !!row&&Date.now()-new Date(row.last_seen_at).getTime()<=90000;
}
function presenceAgo(row){
 if(!row)return '–';
 const s=Math.max(0,Math.round((Date.now()-new Date(row.last_seen_at).getTime())/1000));
 return s<10?'ką tik':s<60?`prieš ${s} s`:`prieš ${Math.floor(s/60)} min.`;
}
async function refreshTeacherOnlinePanel(classIds,classes,students){
 const host=$('onlineNowPanel');if(!host)return;
 if(!classIds.length){host.innerHTML='<span class="kicker">PRISIJUNGĘ DABAR</span><h3>Nėra klasių</h3>';return}
 const cutoff=new Date(Date.now()-90000).toISOString();
 const {data,error}=await sb.from('activity_sessions')
  .select('user_id,class_id,last_seen_at,activity_label,topic_id')
  .in('class_id',classIds).gte('last_seen_at',cutoff).order('last_seen_at',{ascending:false});
 if(error){host.innerHTML=`<span class="kicker">PRISIJUNGĘ DABAR</span><h3>Aktyvūs mokiniai</h3><div class="notice">${esc(error.message)}</div>`;return}
 const latest=latestPresenceByUser(data||[]);
 const rows=Object.values(latest).filter(p=>presenceIsOnline(p));
 rows.sort((a,b)=>new Date(b.last_seen_at)-new Date(a.last_seen_at));
 host.innerHTML=`<div class="sectionTitle"><div class="grow"><span class="kicker">PRISIJUNGĘ DABAR</span><h3>Aktyvūs mokiniai</h3></div><span class="badge ${rows.length?'ok':''}">${rows.length}</span></div>
 <p class="muted">Būsena atnaujinama kas 15 s.</p>
 ${rows.length?rows.map(p=>{const st=students.find(s=>s.id===p.user_id),c=classes.find(x=>x.id===p.class_id);return `<div class="studentRow"><div class="grow"><b>${esc(st?.full_name||'Mokinys')}</b><div class="subtle">${esc(c?.name||'Klasė')}</div></div><span class="badge ok">● Prisijungęs</span></div>`}).join(''):'<div class="emptyState">Šiuo metu aktyvių mokinių nėra.</div>'}`;
}
function startTeacherDashboardPresence(classIds,classes,students){
 stopTeacherPresenceRefresh();
 refreshTeacherOnlinePanel(classIds,classes,students);
 teacherPresenceTimer=setInterval(()=>refreshTeacherOnlinePanel(classIds,classes,students),15000);
}
async function refreshClassPresence(classId){
 const cutoff=new Date(Date.now()-90000).toISOString();
 const {data}=await sb.from('activity_sessions')
  .select('user_id,last_seen_at,activity_label,topic_id')
  .eq('class_id',classId).gte('last_seen_at',cutoff).order('last_seen_at',{ascending:false});
 const latest=latestPresenceByUser(data||[]);
 document.querySelectorAll('[data-presence-user]').forEach(el=>{
  const p=latest[el.dataset.presenceUser];
  el.innerHTML=presenceIsOnline(p)
   ?'<span class="badge ok">● Prisijungęs</span>'
   :'<span class="subtle">Neprisijungęs</span>';
 });
}
function startClassPresenceRefresh(classId){
 stopTeacherPresenceRefresh();
 refreshClassPresence(classId);
 teacherPresenceTimer=setInterval(()=>refreshClassPresence(classId),15000);
}

async function renderDashboard(){
 if(profile.role==='teacher'||profile.role==='admin')return renderTeacher();
 return renderStudent();
}

/* ================= TEACHER ================= */
async function renderTeacher(){
 stopTeacherPresenceRefresh();
 setCurrentRestore(()=>renderTeacher());
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

 const latestSubmitted=allSubmitted.slice(0,24);
 const latestGroups=(classes||[]).map(c=>({
  classInfo:c,
  items:latestSubmitted.filter(x=>x.class_id===c.id)
 })).filter(g=>g.items.length);

 $('teacherContent').innerHTML=`
 <div class="pageHero"><span class="kicker">${isAdmin?'ADMINISTRATORIAUS SKYDELIS':'MOKYTOJO APLINKA'}</span><h1>${isAdmin?'Sveiki, Administratoriau.':'Sveiki, Mokytojau.'}</h1><p>${isAdmin?'Matote visas platformos klases ir jų mokymosi statistiką.':'Čia matote tik savo klases, savo mokinius, jų rezultatus ir pateiktus darbus.'}</p></div>
 <div class="dashboardGrid">
  <div class="metric"><strong>${totalStudents}</strong><span>mokinių</span></div>
  <div class="metric"><strong>${totalAttempts}</strong><span>žinių treniruočių / atsiskaitymų bandymų</span></div>
  <div class="metric"><strong>${totalSubmissions}</strong><span>pateiktų failų</span></div>
  <div class="metric"><strong>${fmtSec(totalSeconds)}</strong><span>bendras aktyvus laikas</span></div>
 </div>
 <div class="contentGrid"><div class="panel">
  <div class="sectionTitle"><div class="grow"><span class="kicker">${isAdmin?'VISOS KLASĖS':'MANO KLASĖS'}</span><h2>Klasės</h2></div>${isAdmin?'':'<button class="primary" id="newClassBtn">+ Nauja klasė</button>'}</div>
  <div id="classList">${classes?.length?classes.map(c=>{
    const cnt=new Set(members.filter(m=>m.class_id===c.id).map(m=>m.student_id)).size;
    const teacher=teachers.find(t=>t.id===c.teacher_id);
    return `<div class="classCard"><div class="grow"><div class="classNameLine"><h3>${esc(c.name)}</h3><button class="classEditIcon" data-edit-class-name="${c.id}" title="Keisti grupės pavadinimą" aria-label="Keisti grupės pavadinimą">✎</button></div><span class="subtle">${c.grade_level?`${esc(gradeLabel(c.grade_level)||c.grade_level)} · `:''}${cnt} mok. · kodas <b>${esc(c.join_code)}</b>${isAdmin?` · mokytojas <b>${esc(teacher?.full_name||'–')}</b>`:''}</span></div><div class="classCardActions"><button class="smallBtn" data-preview-class="${c.id}">👁 Mokinio vaizdas</button><button class="primary" data-class="${c.id}">Atidaryti</button></div></div>`
  }).join(''):'<div class="emptyState"><b>Klasių dar nėra.</b></div>'}</div>
 </div>
 <div class="stack">
  <div class="panel" id="onlineNowPanel"><span class="kicker">PRISIJUNGĘ DABAR</span><h3>Kraunama aktyvių mokinių būsena...</h3></div>
  <div class="panel"><span class="kicker">NAUJAUSI DARBAI</span><h3>Pateikti mokinių failai</h3>
   <p class="muted">Paspausk klasę, kad išskleistum arba suskleistum jos naujausius darbus.</p>
   ${latestGroups.length?latestGroups.map(g=>`<details class="latestClassGroup">
    <summary><span>${esc(g.classInfo.name)}</span><span class="badge ${g.items.length?'ok':''}">${g.items.length}</span></summary>
    <div class="latestClassItems">
     ${g.items.map(x=>{const st=students.find(s=>s.id===x.student_id);return `<div class="studentRow"><div class="grow latestWorkIdentity"><b>${esc(st?.full_name||'Mokinys')}</b><span class="latestWorkTitle">${esc(x.title||x.name)}</span></div><button class="smallBtn" ${x.kind==='direct'?`data-latest-direct="${x.id}"`:`data-latest-assignment="${x.id}"`}>Atsisiųsti</button></div>`}).join('')}
    </div>
   </details>`).join(''):'<div class="emptyState">Pateiktų darbų dar nėra.</div>'}
  </div>
  ${isAdmin?'':`<div class="panel" id="teacherLibrary"><span class="kicker">MANO FAILAI</span><h3>Kraunama mokytojo biblioteka...</h3></div>`}
 </div></div>`;
 if(!isAdmin&&$('newClassBtn'))$('newClassBtn').onclick=openNewClassModal;
 document.querySelectorAll('[data-edit-class-name]').forEach(b=>b.onclick=()=>{const c=(classes||[]).find(x=>x.id===b.dataset.editClassName);if(c)openEditClassNameModal(c)});
 document.querySelectorAll('[data-class]').forEach(b=>b.onclick=()=>navigateTo(()=>openTeacherClass(b.dataset.class)));
 document.querySelectorAll('[data-preview-class]').forEach(b=>b.onclick=()=>{const c=(classes||[]).find(x=>x.id===b.dataset.previewClass);if(c)navigateTo(()=>renderTeacherStudentPreview(c,()=>renderTeacher()))});
 document.querySelectorAll('[data-latest-direct]').forEach(b=>b.onclick=()=>downloadDirectSubmission(b.dataset.latestDirect));
 document.querySelectorAll('[data-latest-assignment]').forEach(b=>b.onclick=()=>downloadSubmission(b.dataset.latestAssignment));
 if(!isAdmin)renderTeacherLibrary();
 startTeacherDashboardPresence(classIds,classes||[],students);
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
  const path=`${me.id}/${storageFileName(f.name)}`;
  toast('Įkeliamas failas...');
  const {error:upErr}=await sb.storage.from('teacher-library').upload(path,f,storageUploadOptions(f));
  if(upErr)return toast(upErr.message);
  const {error}=await sb.from('teacher_files').insert({
   owner_id:me.id,title,storage_path:path,original_name:f.name,mime_type:uploadContentType(f),size_bytes:f.size
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


function fileExtension(name){
 const s=String(name||'');
 const dot=s.lastIndexOf('.');
 return dot>=0?s.slice(dot+1).toLowerCase():'';
}

function uploadContentType(file){
 const ext=fileExtension(file?.name);
 const vectorTypes={
  svg:'image/svg+xml',
  ai:'application/postscript',
  eps:'application/postscript',
  cdr:'application/octet-stream',
  dxf:'image/vnd.dxf',
  wmf:'image/wmf',
  emf:'image/emf',
  afdesign:'application/octet-stream',
  sketch:'application/octet-stream',
  fig:'application/octet-stream',
  xd:'application/octet-stream'
 };
 return vectorTypes[ext]||file?.type||'application/octet-stream';
}

function storageUploadOptions(file){
 return {
  cacheControl:'3600',
  upsert:false,
  contentType:uploadContentType(file)
 };
}

function storageFileName(originalName){
 const name=String(originalName||'');
 const dot=name.lastIndexOf('.');
 let ext=dot>0?name.slice(dot+1).toLowerCase().replace(/[^a-z0-9]/g,''):'';
 if(ext.length>12)ext='';
 return `${crypto.randomUUID()}${ext?'.'+ext:''}`;
}

function randomCode(){return Math.random().toString(36).slice(2,8).toUpperCase()}

function openEditClassNameModal(c){
 modal(`<span class="kicker">GRUPĖ</span><h2>Keisti pavadinimą</h2>
 <form id="editClassNameForm" class="formGroup">
  <label>Pavadinimas<input id="editClassName" required maxlength="120"></label>
  <button class="primary" type="submit" style="margin-top:14px">Išsaugoti</button>
 </form>`);
 $('editClassName').value=c.name||'';
 $('editClassNameForm').onsubmit=async e=>{
  e.preventDefault();
  const name=$('editClassName').value.trim();
  if(name.length<2)return toast('Įrašyk grupės pavadinimą.');
  const {error}=await sb.from('classes').update({name}).eq('id',c.id);
  if(error)return toast(error.message);
  c.name=name;
  closeModal();
  toast('Pavadinimas atnaujintas.');
  renderTeacher();
 };
}

function openNewClassModal(){
 modal(`<span class="kicker">NAUJA KLASĖ</span><h2>Sukurti klasę</h2>
 <p class="muted">Kiekviena klasė dabar turi savo atskirą temų sąrašą. 10 ir 11 klasės turi paruoštus temų šablonus. 12 klasei ar kitai programai temas gali susikurti pats.</p>
 <form id="newClassForm" class="formGroup">
  <label>Klasė / programa
   <select id="newClassGrade">
    <option value="10" selected>10 klasė – naudoti paruoštą 10 klasės temų šabloną</option>
    <option value="11">11 klasė – naudoti dabartinį III gimnazijos temų šabloną</option>
    <option value="12">12 klasė</option>
    <option value="custom">Kita / tuščia programa</option>
   </select>
  </label>
  <label>Klasės pavadinimas<input id="newClassName" placeholder="Pvz., 10 A arba Informatika 10 kl." required></label>
  <label>Prisijungimo kodas<input id="newClassCode" value="${randomCode()}" required></label>
  <div class="actions" style="margin-top:14px"><button class="primary" type="submit">Sukurti</button></div>
 </form>`);
 $('newClassForm').onsubmit=async e=>{
  e.preventDefault();
  const name=$('newClassName').value.trim();
  const joinCode=$('newClassCode').value.trim().toUpperCase();
  const gradeLevel=$('newClassGrade').value;
  const {data,error}=await sb.rpc('create_class',{
   p_name:name,
   p_join_code:joinCode,
   p_grade_level:gradeLevel
  });
  if(error)return toast(error.message);
  closeModal();
  toast('Klasė sukurta.');
  openTeacherClass(data);
 };
}
async function openTeacherClass(classId,initialPanel='students'){
 stopTeacherPresenceRefresh();
 const {data:c,error}=await sb.from('classes').select('*').eq('id',classId).single();if(error)return toast(error.message);
 currentClass=c;
 await loadClassTopics(c.id);
 await startHeartbeat(null);
 const [
  {data:members},
  {data:attempts},
  {data:sessions},
  {data:access},
  {data:direct},
  {data:classAssignments},
  {data:assessmentSettings}
 ]=await Promise.all([
  sb.from('class_members').select('student_id,joined_at').eq('class_id',c.id),
  sb.from('practice_attempts').select('*').eq('class_id',c.id),
  sb.from('activity_sessions').select('*').eq('class_id',c.id),
  sb.from('topic_access').select('*').eq('class_id',c.id),
  sb.from('direct_submissions').select('id').eq('class_id',c.id),
  sb.from('assignments').select('id').eq('class_id',c.id),
  sb.from('assessment_settings').select('*').eq('class_id',c.id)
 ]);
 const ids=(members||[]).map(x=>x.student_id);
 let students=[];if(ids.length)({data:students}=await sb.from('profiles').select('id,full_name,last_login_at,last_seen_at,created_at').in('id',ids));students=students||[];
 let assignmentSubs=[];
 const aIds=(classAssignments||[]).map(a=>a.id);
 if(aIds.length)({data:assignmentSubs}=await sb.from('submissions').select('id,student_id,grade').in('assignment_id',aIds));

 students=students.map(s=>{
  const grades=(assignmentSubs||[])
   .filter(x=>x.student_id===s.id)
   .map(x=>Number(String(x.grade??'').replace(',','.')))
   .filter(n=>Number.isFinite(n)&&n>=1&&n<=10);
  return {...s,_gradeAvg:grades.length?grades.reduce((sum,n)=>sum+n,0)/grades.length:null};
 });

 const submissionCount=(direct||[]).length+(assignmentSubs||[]).length;

 $('teacherContent').innerHTML=`
 <div class="pageHero"><button class="back" id="backTeacher">← ${profile.role==='admin'?'Visos klasės':'Mano klasės'}</button><div class="classHeader"><div class="grow"><span class="kicker">KLASĖ${c.grade_level?` · ${esc(gradeLabel(c.grade_level)||c.grade_level)}`:''}</span><h1>${esc(c.name)}</h1></div><div class="classHeaderActions"><div>Prisijungimo kodas <span class="joinCode">${esc(c.join_code)}</span></div><button class="ghost" id="studentPreviewBtn">👁 Mokinio vaizdas</button></div></div></div>
 <div class="tabsRow actions" style="margin-bottom:14px">
  <button class="smallBtn primaryLike" data-tpanel="students">Mokiniai</button>
  <button class="smallBtn" data-tpanel="assessments">Atsiskaitymų rezultatai${(attempts||[]).filter(x=>x.mode==='assessment').length?` <span class="inlineCount">${(attempts||[]).filter(x=>x.mode==='assessment').length}</span>`:''}</button>
  <button class="smallBtn" data-tpanel="topics">Temos</button>
  <button class="smallBtn" data-tpanel="resources">Mokymosi failai</button>
  <button class="smallBtn" data-tpanel="assignments">Užduotys ir darbai${submissionCount?` <span class="inlineCount">${submissionCount}</span>`:''}</button>
 </div>
 <div id="teacherClassPanel"></div>`;
 let activePanel=initialPanel||'students';
 const showClassPanel=panel=>{
  activePanel=panel;
  document.querySelectorAll('[data-tpanel]').forEach(x=>x.classList.toggle('primaryLike',x.dataset.tpanel===panel));
  renderTeacherClassPanel(panel,c,students,members||[],attempts||[],sessions||[],access||[],assessmentSettings||[]);
  setCurrentRestore(()=>showClassPanel(panel));
 };

 $('backTeacher').onclick=()=>appBack(()=>renderTeacher());
 $('studentPreviewBtn').onclick=()=>navigateTo(()=>renderTeacherStudentPreview(c,()=>openTeacherClass(c.id,activePanel)));
 document.querySelectorAll('[data-tpanel]').forEach(b=>b.onclick=()=>{
  const next=b.dataset.tpanel;
  if(next===activePanel)return;
  navigateTo(()=>showClassPanel(next));
 });
 showClassPanel(activePanel);
 startClassPresenceRefresh(c.id);
}
function renderTeacherClassPanel(panel,c,students,members,attempts,sessions,access,assessmentSettings=[]){
 const host=$('teacherClassPanel');
 if(panel==='students'){
  const rows=students.map(s=>{
   const a=attempts.filter(x=>x.student_id===s.id),ss=sessions.filter(x=>x.user_id===s.id),secs=ss.reduce((n,x)=>n+(x.duration_seconds||0),0);
   const practiceCount=a.filter(x=>(x.mode||'practice')==='practice').length;
   const assessmentCount=a.filter(x=>x.mode==='assessment').length;
   const gradeAvg=s._gradeAvg==null?'–':s._gradeAvg.toFixed(1).replace('.',',');
   return `<tr><td><b>${esc(s.full_name||'Mokinys')}</b></td><td data-presence-user="${s.id}"><span class="subtle">Tikrinama...</span></td><td>${fmtDate(s.last_seen_at||s.last_login_at)}</td><td><span title="Žinių treniruotės">${practiceCount} tren.</span> / <span title="Atsiskaitymai">${assessmentCount} ats.</span></td><td>${fmtSec(secs)}</td><td>${gradeAvg}</td><td><button class="smallBtn" data-student="${s.id}">Detaliau</button></td></tr>`
  }).join('');
  host.innerHTML=`<div class="panel"><div class="sectionTitle"><div class="grow"><span class="kicker">MOKINIAI</span><h2>${students.length} mok.</h2></div></div>
   ${students.length?`<div class="tableWrap"><table class="dataTable"><thead><tr><th>Mokinys</th><th>Būsena dabar</th><th>Paskutinis aktyvumas</th><th>Žinių treniruotės / atsiskaitymai</th><th>Aktyvus laikas</th><th>Pažymių vidurkis</th><th></th></tr></thead><tbody>${rows}</tbody></table></div>`:'<div class="emptyState"><b>Mokinių dar nėra.</b>Duokite mokiniams klasės kodą '+esc(c.join_code)+'.</div>'}</div>`;
  document.querySelectorAll('[data-student]').forEach(b=>b.onclick=()=>showStudentDetail(b.dataset.student,c.id));
 }
 if(panel==='assessments'){
  renderTeacherAssessments(c,students,attempts);
 }
 if(panel==='topics'){
  host.innerHTML=`<div class="panel"><div class="sectionTitle"><div class="grow"><span class="kicker">PRIEIGA</span><h2>Klasės temos ir jų atrakinimas</h2><p class="muted">Šios temos priklauso tik klasei <b>${esc(c.name)}</b>. Kitų klasių temos ir failai čia nesimaišo.</p></div><div class="actions"><button class="primary" id="newClassTopicBtn">+ Nauja tema</button><button class="ghost" id="previewTopicsBtn">👁 Peržiūrėti kaip mokiniui</button></div></div>
   ${activeClassTopics.length?activeClassTopics.map(t=>{const a=access.find(x=>x.topic_id===t.id)||{};const qCount=PRACTICE.filter(q=>q.topic===t.id).length;return `<div class="topicToggleRow">
    <div class="topicInfo"><b>${esc(t.title)}</b><div class="subtle">${esc(topicMeta(t)||'Klasės tema')}</div></div>
    <div class="topicControls">
     <div class="topicActionButtons">
      <button class="smallBtn" data-edit-class-topic="${t.id}">Redaguoti temą</button>
      <button class="smallBtn" data-topic-bank="${t.id}">Klausimų bankas${qCount?` (${qCount})`:''}</button>
     </div>
     <div class="topicAccessToggles">
      <label class="toggle"><input type="checkbox" data-access="${t.id}" data-field="is_open" ${a.is_open?'checked':''}> Tema</label>
      <label class="toggle"><input type="checkbox" data-access="${t.id}" data-field="practice_open" ${a.practice_open?'checked':''}> Praktika</label>
      <label class="toggle"><input type="checkbox" data-access="${t.id}" data-field="assessment_open" ${a.assessment_open?'checked':''}> Atsiskaitymas</label>
      ${c.grade_level==='11'?`<button class="smallBtn" data-assessment-settings="${t.id}">⚙ ${(assessmentSettings.find(s=>s.topic_id===t.id)?.question_count)||30} kl.</button>`:''}
     </div>
    </div>
   </div>`}).join(''):'<div class="emptyState"><b>Ši klasė dar neturi temų.</b>Paspausk „+ Nauja tema“ ir sukurk pirmąją 10 klasės mokymosi temą.</div>'}</div>`;
  $('newClassTopicBtn').onclick=()=>openNewClassTopicModal(c);
  document.querySelectorAll('[data-edit-class-topic]').forEach(b=>b.onclick=()=>openEditClassTopicModal(c,b.dataset.editClassTopic));
  document.querySelectorAll('[data-access]').forEach(ch=>ch.onchange=async()=>{
   if(c.grade_level==='11'&&ch.dataset.field==='assessment_open'&&ch.checked){
    ch.checked=false;
    return openAssessmentSettingsModal(c,ch.dataset.access,ch,access,assessmentSettings,true);
   }
   await updateTopicAccess(c.id,ch.dataset.access,ch.dataset.field,ch.checked);
   const row=access.find(x=>x.topic_id===ch.dataset.access);
   if(row)row[ch.dataset.field]=ch.checked;
  });
  document.querySelectorAll('[data-assessment-settings]').forEach(b=>b.onclick=()=>openAssessmentSettingsModal(c,b.dataset.assessmentSettings,null,access,assessmentSettings,false));
  document.querySelectorAll('[data-topic-bank]').forEach(b=>b.onclick=()=>navigateTo(()=>c.grade_level==='10'?renderGrade10QuestionBlocks(c,b.dataset.topicBank,access):renderTeacherTopicQuestionBank(c,b.dataset.topicBank,access)));
  $('previewTopicsBtn').onclick=()=>navigateTo(()=>renderTeacherStudentPreview(c,()=>openTeacherClass(c.id,'topics')));
 }
 if(panel==='resources')renderTeacherResources(c);
 if(panel==='assignments')renderTeacherAssignments(c);
}




function csvCell(value){
 const s=String(value??'').replace(/\r?\n/g,' ');
 return `"${s.replace(/"/g,'""')}"`;
}

function safeDownloadName(value){
 return String(value||'klausimai')
  .normalize('NFD')
  .replace(/[\u0300-\u036f]/g,'')
  .replace(/[^a-zA-Z0-9_-]+/g,'_')
  .replace(/^_+|_+$/g,'')
  .slice(0,80)||'klausimai';
}

function downloadTopicQuestionsCsv(topic,questions){
 if(!['teacher','admin'].includes(profile?.role))return toast('Ši funkcija skirta tik mokytojui.');

 const header=[
  'Nr.','ID','Tema','Kategorija','Sudėtingumas','Klausimas',
  'A','B','C','D','Teisingas variantas','Teisingas atsakymas','Paaiškinimas'
 ];

 const rows=(questions||[]).map((q,i)=>{
  const opts=q.options||[];
  const correctIndex=Number(q.correct);
  return [
   i+1,
   q.id||'',
   topic?.title||q.topic||'',
   q.category||'',
   q.difficulty||'',
   q.question||'',
   opts[0]||'',
   opts[1]||'',
   opts[2]||'',
   opts[3]||'',
   Number.isInteger(correctIndex)&&correctIndex>=0?String.fromCharCode(65+correctIndex):'',
   opts[correctIndex]||'',
   q.explanation||''
  ];
 });

 const csv='\uFEFF'+[header,...rows]
  .map(row=>row.map(csvCell).join(';'))
  .join('\r\n');

 const blob=new Blob([csv],{type:'text/csv;charset=utf-8'});
 const url=URL.createObjectURL(blob);
 const a=document.createElement('a');
 a.href=url;
 a.download=`${safeDownloadName(topic?.title||topic?.id||'klausimai')}_klausimu_bankas.csv`;
 document.body.appendChild(a);
 a.click();
 a.remove();
 setTimeout(()=>URL.revokeObjectURL(url),1000);
 toast(`Atsisiunčiami ${rows.length} klausimai.`);
}


async function renderGrade10QuestionBlocks(c,topicId,access){
 const host=$('teacherClassPanel');
 if(!host)return;
 const t=topicById(topicId);
 host.innerHTML=`<div class="panel"><span class="kicker">KLAUSIMŲ BANKAS</span><h2>Kraunama...</h2></div>`;

 const {data:blocks,error}=await sb.from('class_question_blocks')
  .select('*').eq('class_id',c.id).eq('parent_topic_id',topicId)
  .order('sort_order',{ascending:true});
 if(error){
  host.innerHTML=`<div class="panel"><button class="back" id="backGrade10Bank">← Grįžti į temas</button><div class="notice">${esc(error.message)}</div></div>`;
  $('backGrade10Bank').onclick=()=>appBack(()=>openTeacherClass(c.id,'topics'));
  return;
 }

 const blockIds=(blocks||[]).map(b=>b.id);
 let items=[];
 if(blockIds.length){
  const {data,error:itemErr}=await sb.from('class_question_items')
   .select('*').in('class_block_id',blockIds).eq('is_active',true)
   .order('sort_order',{ascending:true}).order('created_at',{ascending:true});
  if(itemErr)return toast(itemErr.message);
  items=data||[];
 }

 host.innerHTML=`<div class="panel questionBankTools">
  <div class="sectionTitle">
   <div class="grow">
    <button class="back" id="backGrade10Bank">← Grįžti į temas</button>
    <span class="kicker">10 KLASĖ · KLAUSIMŲ BLOKAI</span>
    <h2>${esc(t?.title||topicId)}</h2>
    <p class="muted">Pažymėk, kuriuos klausimų blokus įtraukti į šios klasės žinių treniruotę. Klausimų pakeitimai galioja tik šiai klasei.</p>
   </div>
   <span class="badge ok">${items.length} klaus.</span>
  </div>

  ${(blocks||[]).length?(blocks||[]).map(block=>{
   const qs=items.filter(q=>q.class_block_id===block.id);
   return `<details class="questionBlockCard" ${block.is_enabled?'open':''}>
    <summary>
     <div class="questionBlockTitle">
      <label class="blockEnableToggle" onclick="event.stopPropagation()">
       <input type="checkbox" data-block-enable="${block.id}" ${block.is_enabled?'checked':''}>
       <span>Įtraukti į žinių treniruotę</span>
      </label>
      <div><b>${esc(block.title)}</b><div class="subtle">${esc(block.description||'')}</div></div>
     </div>
     <span class="badge ${block.is_enabled?'ok':''}">${qs.length} klaus.</span>
    </summary>
    <div class="questionBlockBody">
     <div class="questionBlockToolbar"><button class="primary smallPrimary" data-add-block-question="${block.id}">+ Naujas klausimas</button></div>
     ${qs.length?qs.map((q,i)=>renderGrade10TeacherQuestion(q,i)).join(''):'<div class="emptyState"><b>Šiame bloke klausimų nėra.</b></div>'}
    </div>
   </details>`;
  }).join(''):'<div class="emptyState"><b>Šiai temai klausimų blokų dar nėra.</b></div>'}
 </div>`;

 setCurrentRestore(()=>renderGrade10QuestionBlocks(c,topicId,access));
 $('backGrade10Bank').onclick=()=>appBack(()=>openTeacherClass(c.id,'topics'));

 document.querySelectorAll('[data-block-enable]').forEach(ch=>ch.onchange=async()=>{
  const {error}=await sb.from('class_question_blocks').update({is_enabled:ch.checked}).eq('id',ch.dataset.blockEnable).eq('class_id',c.id);
  if(error){ch.checked=!ch.checked;return toast(error.message)}
  toast(ch.checked?'Blokas įtrauktas į treniruotę.':'Blokas išimtas iš treniruotės.');
 });

 document.querySelectorAll('[data-add-block-question]').forEach(b=>b.onclick=()=>{
  const block=(blocks||[]).find(x=>x.id===b.dataset.addBlockQuestion);
  if(block)openGrade10QuestionEditor(c,topicId,access,block,null);
 });

 document.querySelectorAll('[data-edit-g10-question]').forEach(b=>b.onclick=()=>{
  const q=items.find(x=>x.id===b.dataset.editG10Question);
  const block=(blocks||[]).find(x=>x.id===q?.class_block_id);
  if(q&&block)openGrade10QuestionEditor(c,topicId,access,block,q);
 });

 document.querySelectorAll('[data-delete-g10-question]').forEach(b=>b.onclick=()=>{
  const q=items.find(x=>x.id===b.dataset.deleteG10Question);
  if(q)deleteGrade10Question(c,topicId,access,q);
 });
}

function renderGrade10TeacherQuestion(q,index){
 const opts=Array.isArray(q.options)?q.options:[];
 const correct=Number(q.correct_index);
 return `<article class="bankQuestion compactBankQuestion">
  <div class="bankQuestionHeader">
   <div class="grow"><div class="bankQuestionMeta"><span class="badge">${esc(q.category||'Be kategorijos')}</span><span class="badge">${esc(q.difficulty||'–')}</span></div><h3>${esc(q.question)}</h3></div>
   <span class="bankNumber">${index+1}</span>
  </div>
  <div class="bankOptions">${opts.map((o,i)=>`<div class="bankOption ${i===correct?'correctOption':''}"><span class="optionLetter">${String.fromCharCode(65+i)}</span><span>${esc(o)}</span>${i===correct?'<strong class="correctMark">✓ Teisingas</strong>':''}</div>`).join('')}</div>
  ${q.explanation?`<div class="bankExplanation"><b>Paaiškinimas:</b> ${esc(q.explanation)}</div>`:''}
  <div class="bankQuestionActions"><button class="smallBtn" data-edit-g10-question="${q.id}">Redaguoti</button><button class="smallBtn dangerMini" data-delete-g10-question="${q.id}">Ištrinti</button></div>
 </article>`;
}

function openGrade10QuestionEditor(c,topicId,access,block,q=null){
 const editing=!!q,opts=Array.isArray(q?.options)?q.options:['','','',''];
 modal(`<span class="kicker">${editing?'REDAGUOTI KLAUSIMĄ':'NAUJAS KLAUSIMAS'}</span><h2>${esc(block.title)}</h2>
 <form id="g10QuestionForm" class="formGroup">
  <label>Klausimas<textarea id="g10QuestionText" rows="3" maxlength="1000" required></textarea></label>
  <label>A variantas<input id="g10A" maxlength="600" required></label>
  <label>B variantas<input id="g10B" maxlength="600" required></label>
  <label>C variantas<input id="g10C" maxlength="600" required></label>
  <label>D variantas<input id="g10D" maxlength="600" required></label>
  <label>Teisingas atsakymas<select id="g10Correct"><option value="0">A</option><option value="1">B</option><option value="2">C</option><option value="3">D</option></select></label>
  <label>Kategorija<input id="g10Category" maxlength="120"></label>
  <label>Sudėtingumas<select id="g10Difficulty"><option>Lengvas</option><option>Vidutinis</option><option>Sunkus</option></select></label>
  <label>Paaiškinimas<textarea id="g10Explanation" rows="3" maxlength="1600"></textarea></label>
  <button class="primary" type="submit" style="margin-top:14px">${editing?'Išsaugoti':'Pridėti klausimą'}</button>
 </form>`);
 $('g10QuestionText').value=q?.question||'';$('g10A').value=opts[0]||'';$('g10B').value=opts[1]||'';$('g10C').value=opts[2]||'';$('g10D').value=opts[3]||'';
 $('g10Correct').value=String(Number(q?.correct_index||0));$('g10Category').value=q?.category||'';$('g10Difficulty').value=q?.difficulty||'Vidutinis';$('g10Explanation').value=q?.explanation||'';

 $('g10QuestionForm').onsubmit=async e=>{
  e.preventDefault();
  const question=$('g10QuestionText').value.trim(),options=[$('g10A').value.trim(),$('g10B').value.trim(),$('g10C').value.trim(),$('g10D').value.trim()];
  if(!question||options.some(x=>!x))return toast('Užpildyk klausimą ir visus keturis variantus.');
  if(new Set(options.map(x=>x.toLocaleLowerCase('lt'))).size!==4)return toast('Atsakymų variantai turi būti skirtingi.');
  const payload={question,options,correct_index:Number($('g10Correct').value),category:$('g10Category').value.trim(),difficulty:$('g10Difficulty').value,explanation:$('g10Explanation').value.trim(),updated_at:new Date().toISOString()};
  let error;
  if(editing)({error}=await sb.from('class_question_items').update(payload).eq('id',q.id));
  else{delete payload.updated_at;payload.class_block_id=block.id;payload.created_by=me.id;payload.sort_order=9999;({error}=await sb.from('class_question_items').insert(payload))}
  if(error)return toast(error.message);
  closeModal();toast(editing?'Klausimas atnaujintas.':'Klausimas pridėtas.');renderGrade10QuestionBlocks(c,topicId,access);
 };
}

async function deleteGrade10Question(c,topicId,access,q){
 if(!confirm(`Ar tikrai ištrinti klausimą „${q.question}“?`))return;
 const {error}=await sb.from('class_question_items').delete().eq('id',q.id);
 if(error)return toast(error.message);
 toast('Klausimas ištrintas.');renderGrade10QuestionBlocks(c,topicId,access);
}

function renderTeacherTopicQuestionBank(c,topicId,access){
 if(!['teacher','admin'].includes(profile?.role))return renderStudent();

 const host=$('teacherClassPanel');
 if(!host)return;

 const t=topicById(topicId);
 const all=PRACTICE.filter(q=>q.topic===topicId);
 const categories=[...new Set(all.map(q=>q.category).filter(Boolean))].sort((a,b)=>a.localeCompare(b,'lt'));
 const difficulties=[...new Set(all.map(q=>q.difficulty).filter(Boolean))];

 host.innerHTML=`
 <div class="panel questionBankTools">
  <div class="sectionTitle">
   <div class="grow">
    <button class="back" id="backFromTopicBank">← Grįžti į temas</button>
    <span class="kicker">MOKYTOJUI · KLAUSIMŲ BANKAS</span>
    <h2>${esc(t?.title||topicId)}</h2>
    <p class="muted">Čia matai visus šios temos klausimus, iš kurių generuojama mokinių „Žinių treniruotė“.</p>
   </div>
   <div class="questionBankHeaderActions">
    <span class="badge ok">${all.length} klaus.</span>
    ${all.length?'<button class="primary" id="downloadTopicQuestionsBtn">↓ Atsisiųsti visus klausimus</button>':''}
   </div>
  </div>

  ${all.length?`
  <div class="questionFilters topicQuestionFilters">
   <label>Paieška<input id="topicQuestionSearch" type="search" placeholder="Klausimas, atsakymas, ID, paaiškinimas..."></label>
   <label>Kategorija<select id="topicQuestionCategory">
    <option value="">Visos kategorijos</option>
    ${categories.map(x=>`<option value="${esc(x)}">${esc(x)}</option>`).join('')}
   </select></label>
   <label>Sudėtingumas<select id="topicQuestionDifficulty">
    <option value="">Visi lygiai</option>
    ${difficulties.map(x=>`<option value="${esc(x)}">${esc(x)}</option>`).join('')}
   </select></label>
   <button class="ghost topicFilterReset" id="resetTopicQuestionFilters">Išvalyti filtrus</button>
  </div>
  <div class="questionBankCount" id="topicQuestionCount"></div>
  `:''}
 </div>

 <div id="topicQuestionList" class="questionBankList">
  ${all.length?'':'<div class="panel emptyState"><b>Šiai temai klausimų dar nėra.</b>Kai klausimai bus sukurti, jie atsiras čia ir galės būti naudojami žinių treniruotėms.</div>'}
 </div>`;

 setCurrentRestore(()=>renderTeacherTopicQuestionBank(c,topicId,access));
 $('backFromTopicBank').onclick=()=>appBack(()=>openTeacherClass(c.id,'topics'));
 if($('downloadTopicQuestionsBtn'))$('downloadTopicQuestionsBtn').onclick=()=>downloadTopicQuestionsCsv(t,all);

 if(!all.length)return;

 const renderList=()=>{
  const search=$('topicQuestionSearch').value.trim().toLocaleLowerCase('lt');
  const category=$('topicQuestionCategory').value;
  const difficulty=$('topicQuestionDifficulty').value;

  const rows=all.filter(q=>{
   if(category&&q.category!==category)return false;
   if(difficulty&&q.difficulty!==difficulty)return false;
   if(search){
    const hay=[
     q.id,q.question,q.category,q.difficulty,q.explanation,
     ...(q.options||[])
    ].join(' ').toLocaleLowerCase('lt');
    if(!hay.includes(search))return false;
   }
   return true;
  });

  $('topicQuestionCount').innerHTML=`Rodoma <b>${rows.length}</b> iš <b>${all.length}</b> klausimų.`;

  $('topicQuestionList').innerHTML=rows.length?rows.map((q,i)=>{
   const correctIndex=Number(q.correct);
   const correctText=q.options?.[correctIndex]??'–';

   return `<article class="panel bankQuestion">
    <div class="bankQuestionHeader">
     <div class="grow">
      <div class="bankQuestionMeta">
       <span class="badge">${esc(q.id)}</span>
       <span class="badge">${esc(q.category||'Be kategorijos')}</span>
       <span class="badge">${esc(q.difficulty||'–')}</span>
      </div>
      <h3>${esc(q.question)}</h3>
     </div>
     <span class="bankNumber">${i+1}</span>
    </div>

    <div class="bankOptions">
     ${(q.options||[]).map((option,idx)=>`<div class="bankOption ${idx===correctIndex?'correctOption':''}">
      <span class="optionLetter">${String.fromCharCode(65+idx)}</span>
      <span>${esc(option)}</span>
      ${idx===correctIndex?'<strong class="correctMark">✓ Teisingas</strong>':''}
     </div>`).join('')}
    </div>

    <div class="bankExplanation">
     <b>Teisingas atsakymas:</b> ${String.fromCharCode(65+correctIndex)}. ${esc(correctText)}
     ${q.explanation?`<p><b>Paaiškinimas:</b> ${esc(q.explanation)}</p>`:''}
    </div>
   </article>`;
  }).join(''):'<div class="panel emptyState"><b>Klausimų nerasta.</b>Pakeisk filtrus arba paieškos tekstą.</div>';
 };

 ['topicQuestionSearch','topicQuestionCategory','topicQuestionDifficulty'].forEach(id=>{
  $(id).addEventListener(id==='topicQuestionSearch'?'input':'change',renderList);
 });

 $('resetTopicQuestionFilters').onclick=()=>{
  $('topicQuestionSearch').value='';
  $('topicQuestionCategory').value='';
  $('topicQuestionDifficulty').value='';
  renderList();
 };

 renderList();
}


async function refreshTeacherTopicsPanel(c){
 await loadClassTopics(c.id);
 const [{data:access,error},{data:assessmentSettings}]=await Promise.all([
  sb.from('topic_access').select('*').eq('class_id',c.id),
  sb.from('assessment_settings').select('*').eq('class_id',c.id)
 ]);
 if(error)return toast(error.message);
 renderTeacherClassPanel('topics',c,[],[],[],[],access||[],assessmentSettings||[]);
}

function openNewClassTopicModal(c){
 const nextOrder=(activeClassTopics.reduce((m,t)=>Math.max(m,Number(t.sort_order||0)),0)||0)+10;
 modal(`<span class="kicker">NAUJA KLASĖS TEMA</span><h2>Pridėti temą klasei ${esc(c.name)}</h2>
 <p class="muted">Tema bus sukurta tik šiai klasei. Ji nepakeis 11 klasės temų ir nepaveiks kitų klasių mokinių.</p>
 <form id="newClassTopicForm" class="formGroup">
  <label>Temos pavadinimas<input id="classTopicTitle" required maxlength="220" placeholder="Pvz., Skaitmeninis turinys"></label>
  <label>Temos kodas <span class="subtle">(nebūtina)</span><input id="classTopicCode" maxlength="40" placeholder="Pvz., 28.1.1"></label>
  <label>Valandų skaičius <span class="subtle">(nebūtina)</span><input id="classTopicHours" type="number" min="0" max="500" step="1" placeholder="Pvz., 6"></label>
  <label>Sritis <span class="subtle">(nebūtina)</span><input id="classTopicArea" maxlength="160" placeholder="Pvz., Skaitmeninio turinio kūrimas"></label>
  <label>Aprašymas <span class="subtle">(nebūtina)</span><textarea id="classTopicDescription" rows="5" maxlength="4000" placeholder="Ką mokiniai mokysis šioje temoje?"></textarea></label>
  <label>Ženkliukas / emoji <span class="subtle">(nebūtina)</span><input id="classTopicIcon" maxlength="12" placeholder="💻"></label>
  <button class="primary" type="submit" style="margin-top:14px">Sukurti temą</button>
 </form>`);
 $('newClassTopicForm').onsubmit=async e=>{
  e.preventDefault();
  const title=$('classTopicTitle').value.trim();
  if(!title)return toast('Įrašyk temos pavadinimą.');
  const topicId=`custom-${crypto.randomUUID().slice(0,8)}`;
  const hours=Math.max(0,Number($('classTopicHours').value||0));
  const row={
   class_id:c.id,
   topic_id:topicId,
   title,
   code:$('classTopicCode').value.trim(),
   hours:Number.isFinite(hours)?hours:0,
   area:$('classTopicArea').value.trim(),
   description:$('classTopicDescription').value.trim(),
   icon:$('classTopicIcon').value.trim()||'💻',
   sort_order:nextOrder,
   is_archived:false,
   created_by:me.id
  };
  const {error}=await sb.from('class_topics').insert(row);
  if(error)return toast(error.message);

  // Papildoma apsauga: net jei DB triggeris būtų išjungtas, temos prieigos eilutė vis tiek sukuriama.
  const {error:accessError}=await sb.from('topic_access').upsert({
   class_id:c.id,topic_id:topicId,is_open:false,practice_open:false,assessment_open:false
  },{onConflict:'class_id,topic_id'});
  if(accessError)return toast(accessError.message);

  closeModal();
  toast('Tema sukurta.');
  refreshTeacherTopicsPanel(c);
 };
}

function openEditClassTopicModal(c,topicId){
 const t=topicById(topicId);
 if(!t)return toast('Tema nerasta.');
 modal(`<span class="kicker">REDAGUOTI KLASĖS TEMĄ</span><h2>${esc(t.title)}</h2>
 <p class="muted">Temos techninis ID nekeičiamas, todėl prie jos jau susieti mokinių rezultatai, failai, užduotys ir pranešimai lieka savo vietoje.</p>
 <form id="editClassTopicForm" class="formGroup">
  <label>Temos pavadinimas<input id="editClassTopicTitle" required maxlength="220"></label>
  <label>Temos kodas <span class="subtle">(nebūtina)</span><input id="editClassTopicCode" maxlength="40"></label>
  <label>Valandų skaičius <span class="subtle">(nebūtina)</span><input id="editClassTopicHours" type="number" min="0" max="500" step="1"></label>
  <label>Sritis <span class="subtle">(nebūtina)</span><input id="editClassTopicArea" maxlength="160"></label>
  <label>Aprašymas <span class="subtle">(nebūtina)</span><textarea id="editClassTopicDescription" rows="5" maxlength="4000"></textarea></label>
  <label>Ženkliukas / emoji <span class="subtle">(nebūtina)</span><input id="editClassTopicIcon" maxlength="12"></label>
  <button class="primary" type="submit" style="margin-top:14px">Išsaugoti pakeitimus</button>
 </form>`);
 $('editClassTopicTitle').value=t.title||'';
 $('editClassTopicCode').value=t.code||'';
 $('editClassTopicHours').value=Number(t.hours||0)||'';
 $('editClassTopicArea').value=t.area||'';
 $('editClassTopicDescription').value=t.description||'';
 $('editClassTopicIcon').value=t.icon||'💻';

 $('editClassTopicForm').onsubmit=async e=>{
  e.preventDefault();
  const title=$('editClassTopicTitle').value.trim();
  if(!title)return toast('Įrašyk temos pavadinimą.');
  const hours=Math.max(0,Number($('editClassTopicHours').value||0));
  const {error}=await sb.from('class_topics').update({
   title,
   code:$('editClassTopicCode').value.trim(),
   hours:Number.isFinite(hours)?hours:0,
   area:$('editClassTopicArea').value.trim(),
   description:$('editClassTopicDescription').value.trim(),
   icon:$('editClassTopicIcon').value.trim()||'💻',
   updated_at:new Date().toISOString()
  }).eq('class_id',c.id).eq('topic_id',topicId);
  if(error)return toast(error.message);

  closeModal();
  toast('Tema atnaujinta.');
  refreshTeacherTopicsPanel(c);
 };
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


async function renderTeacherTopicPosts(c,topicId){
 setCurrentRestore(()=>renderTeacherTopicPosts(c,topicId));
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
  host.innerHTML=`<div class="panel"><button class="back" id="backToTopicsPosts">← Grįžti į užduotis ir darbus</button><span class="kicker">TEMOS PRANEŠIMAI</span><h2>${esc(t?.title||topicId)}</h2><div class="notice">${esc(error.message)}</div></div>`;
  if($('backToTopicsPosts'))$('backToTopicsPosts').onclick=()=>appBack(()=>renderTeacherAssignments(c));
  return;
 }

 host.innerHTML=`<div class="panel">
  <div class="sectionTitle">
   <div class="grow"><button class="back" id="backToTopicsPosts">← Grįžti į užduotis ir darbus</button><span class="kicker">TEMOS PRANEŠIMAI</span><h2>${esc(t?.title||topicId)}</h2></div>
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
    <div class="postActions">
     ${p.author_id===me.id?`<button class="smallBtn" data-edit-topic-post="${p.id}">Redaguoti</button>`:''}
     <button class="smallBtn dangerSoft" data-delete-topic-post="${p.id}">Ištrinti</button>
    </div>
   </div>`).join(''):'<div class="emptyState"><b>Šiai temai pranešimų dar nėra.</b>Gali pridėti komentarą, instrukciją arba nuorodą.</div>'}
 </div>`;

 $('backToTopicsPosts').onclick=()=>appBack(()=>renderTeacherAssignments(c));
 $('newTopicPostBtn').onclick=()=>openTopicPostModal(c,topicId);
 document.querySelectorAll('[data-edit-topic-post]').forEach(b=>b.onclick=()=>openEditTopicPostModal(b.dataset.editTopicPost,c,topicId));
 document.querySelectorAll('[data-delete-topic-post]').forEach(b=>b.onclick=()=>deleteTopicPost(b.dataset.deleteTopicPost,c,topicId));
}

function openTopicPostModal(c,topicId){
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
  renderTeacherTopicPosts(c,topicId);
 };
}


async function openEditTopicPostModal(id,c,topicId){
 const {data:p,error}=await sb.from('class_posts')
  .select('*')
  .eq('id',id)
  .eq('author_id',me.id)
  .single();

 if(error)return toast(error.message);

 const t=topicById(topicId);
 modal(`<span class="kicker">REDAGUOTI TEMOS PRANEŠIMĄ</span><h2>${esc(t?.title||topicId)}</h2>
 <p class="muted">Pakeitimai iškart bus matomi mokiniams.</p>
 <form id="editTopicPostForm" class="formGroup">
  <label>Pavadinimas<input id="editTopicPostTitle" required maxlength="120"></label>
  <label>Pranešimas<textarea id="editTopicPostBody" rows="4" maxlength="1500"></textarea></label>
  <label>Nuoroda <span class="subtle">(nebūtina)</span><input id="editTopicPostUrl" type="url" placeholder="https://..."></label>
  <button class="primary" type="submit" style="margin-top:14px">Išsaugoti pakeitimus</button>
 </form>`);

 $('editTopicPostTitle').value=p.title||'';
 $('editTopicPostBody').value=p.body||'';
 $('editTopicPostUrl').value=p.url||'';

 $('editTopicPostForm').onsubmit=async e=>{
  e.preventDefault();

  const title=$('editTopicPostTitle').value.trim();
  const body=$('editTopicPostBody').value.trim();
  const rawUrl=$('editTopicPostUrl').value.trim();
  const url=normalizeHttpUrl(rawUrl);

  if(!title)return toast('Įrašyk pavadinimą.');
  if(!body&&!rawUrl)return toast('Įrašyk pranešimą arba pridėk nuorodą.');
  if(rawUrl&&url===null)return toast('Nuoroda turi prasidėti http:// arba https://');

  const {error:updateError}=await sb.from('class_posts')
   .update({
    title,
    body:body||null,
    url:url||null,
    updated_at:new Date().toISOString()
   })
   .eq('id',id)
   .eq('author_id',me.id);

  if(updateError)return toast(updateError.message);

  closeModal();
  toast('Pranešimas atnaujintas.');
  renderTeacherTopicPosts(c,topicId);
 };
}

async function deleteTopicPost(id,c,topicId){
 if(!confirm('Ar tikrai ištrinti šį temos pranešimą? Mokiniai jo nebematys.'))return;
 const {error}=await sb.from('class_posts').delete().eq('id',id);
 if(error)return toast(error.message);
 toast('Pranešimas ištrintas.');
 renderTeacherTopicPosts(c,topicId);
}


async function renderTeacherAssessments(c,students,attempts){
 const host=$('teacherClassPanel');
 const rows=(attempts||[]).filter(x=>x.mode==='assessment').sort((a,b)=>new Date(b.started_at)-new Date(a.started_at));
 host.innerHTML=`<div class="panel"><div class="sectionTitle"><div class="grow"><span class="kicker">ATSISKAITYMŲ REZULTATAI</span><h2>Mokinių atsiskaitymai</h2><p class="muted">Mokytojas rezultatą ir visus atsakymus mato iš karto. Papildomą bandymą konkrečiam mokiniui galima suteikti tik iš čia.</p></div></div><div class="emptyState">Kraunama...</div></div>`;
 if(!rows.length){host.innerHTML=`<div class="panel"><div class="sectionTitle"><div class="grow"><span class="kicker">ATSISKAITYMŲ REZULTATAI</span><h2>Mokinių atsiskaitymai</h2><p class="muted">Kai mokiniai pradės atsiskaitymą, rezultatai atsiras čia.</p></div></div><div class="emptyState">Atsiskaitymų dar nėra.</div></div>`;return}
 const ids=rows.map(x=>x.id);
 const [{data:events,error},{data:retryRows}]=await Promise.all([
  sb.from('assessment_focus_events').select('attempt_id,event_type,occurred_at').in('attempt_id',ids),
  sb.from('assessment_retry_permissions').select('class_id,student_id,topic_id,extra_attempts').eq('class_id',c.id)
 ]);
 const eventRows=error?[]:(events||[]);
 const countBy={};eventRows.forEach(e=>countBy[e.attempt_id]=(countBy[e.attempt_id]||0)+1);
 const studentBy=Object.fromEntries((students||[]).map(x=>[x.id,x]));
 const totalStudents=(students||[]).length;
 const completedByTopic={};
 rows.filter(x=>x.completed_at).forEach(x=>{
  if(!completedByTopic[x.topic_id])completedByTopic[x.topic_id]=new Set();
  completedByTopic[x.topic_id].add(x.student_id);
 });
 const keyOf=x=>`${x.student_id}::${x.topic_id}`;
 const groups={};
 [...rows].sort((a,b)=>new Date(a.started_at)-new Date(b.started_at)).forEach(x=>{
  const k=keyOf(x);(groups[k]||(groups[k]=[])).push(x);
 });
 const attemptNoById={};
 const latestByKey={};
 Object.entries(groups).forEach(([k,list])=>{
  list.forEach((x,i)=>attemptNoById[x.id]=i+1);
  latestByKey[k]=list[list.length-1];
 });
 const retryByKey={};(retryRows||[]).forEach(r=>retryByKey[`${r.student_id}::${r.topic_id}`]=r);
 const body=rows.map(x=>{
  const st=studentBy[x.student_id],done=!!x.completed_at,k=keyOf(x),group=groups[k]||[];
  const duration=done?fmtDurationDetailed(x.duration_seconds):fmtDurationDetailed(Math.max(1,Math.floor((Date.now()-new Date(x.started_at).getTime())/1000)));
  const result=done?`${x.correct_answers||0}/${x.total_questions||0} · ${x.score_percent||0}%`:'—';
  const completed=completedByTopic[x.topic_id]?.size||0;
  const released=totalStudents>0&&completed>=totalStudents;
  const studentVisibility=released?'<span class="badge ok">Rodoma</span>':`<span class="badge">Laukiama ${completed}/${totalStudents}</span>`;
  const completedAttempts=group.filter(a=>a.completed_at).length;
  const hasUnfinished=group.some(a=>!a.completed_at);
  const allowedAttempts=1+Number(retryByKey[k]?.extra_attempts||0);
  const retryAlreadyAvailable=!hasUnfinished&&completedAttempts<allowedAttempts;
  const isLatest=latestByKey[k]?.id===x.id;
  let retryAction='';
  if(done&&isLatest){
   retryAction=retryAlreadyAvailable
    ? '<span class="badge ok">Pakartojimas leistas</span>'
    : `<button class="smallBtn" data-grant-assessment-retry="${x.student_id}" data-retry-topic="${esc(x.topic_id)}" data-retry-name="${esc(st?.full_name||'Mokinys')}">Leisti pakartoti</button>`;
  }
  return `<tr><td><b>${esc(st?.full_name||'Mokinys')}</b></td><td>${esc(topicById(x.topic_id)?.title||x.topic_id)}</td><td><b>${attemptNoById[x.id]||1}</b></td><td><span class="badge ${done?'ok':''}">${done?'Baigtas':'Vyksta / nebaigtas'}</span></td><td><b>${result}</b></td><td>${duration}${done?'':' (iki dabar)'}</td><td><b>${countBy[x.id]||0}</b></td><td>${studentVisibility}</td><td>${fmtDate(x.started_at)}</td><td><div class="actions"><button class="smallBtn" data-assessment-result="${x.id}" data-assessment-student="${x.student_id}">Peržiūrėti atsakymus</button>${retryAction}</div></td></tr>`;
 }).join('');
 host.innerHTML=`<div class="panel"><div class="sectionTitle"><div class="grow"><span class="kicker">ATSISKAITYMŲ REZULTATAI</span><h2>Mokinių atsiskaitymai</h2><p class="muted">Pagal nutylėjimą mokinys turi vieną bandymą. Paspaudus „Leisti pakartoti“ jam atrakinamas tik vienas kitas bandymas. Ankstesni rezultatai lieka istorijoje, o naujam bandymui sistema pirmiausia parenka anksčiau nematytus lygiaverčius klausimų variantus.</p></div><span class="badge">${rows.length} band.</span></div>
 <div class="tableWrap"><table class="dataTable"><thead><tr><th>Mokinys</th><th>Tema</th><th>Bandymas</th><th>Būsena</th><th>Rezultatas</th><th>Laikas</th><th>Išėjo iš lango</th><th>Mokiniams</th><th>Pradėta</th><th></th></tr></thead><tbody>${body}</tbody></table></div></div>`;
 document.querySelectorAll('[data-assessment-result]').forEach(b=>b.onclick=()=>showAssessmentAttemptDetail(b.dataset.assessmentResult,b.dataset.assessmentStudent,c.id));
 document.querySelectorAll('[data-grant-assessment-retry]').forEach(b=>b.onclick=()=>grantAssessmentRetry(c,b.dataset.grantAssessmentRetry,b.dataset.retryTopic,b.dataset.retryName,b));
}

async function grantAssessmentRetry(c,studentId,topicId,studentName,button=null){
 if(!confirm(`Leisti mokiniui „${studentName||'Mokinys'}“ dar vieną šio atsiskaitymo bandymą? Ankstesnis rezultatas liks istorijoje, o naujam bandymui bus parenkami kiti lygiaverčiai klausimų variantai.`))return;
 if(button)button.disabled=true;
 const {data,error}=await sb.rpc('grant_assessment_retry',{p_class_id:c.id,p_student_id:studentId,p_topic_id:topicId});
 if(error){if(button)button.disabled=false;return toast(error.message)}
 const info=(typeof data==='object'&&data)||{};
 toast(info.message||'Papildomas bandymas leistas.');
 openTeacherClass(c.id,'assessments');
}

async function updateTopicAccess(classId,topicId,field,value){
 const payload={[field]:value,updated_at:new Date().toISOString()};
 const {error}=await sb.from('topic_access').update(payload).eq('class_id',classId).eq('topic_id',topicId);
 toast(error?error.message:'Atnaujinta.');
}
async function openAssessmentSettingsModal(c,topicId,checkbox,access,settings,openAfterSave=false){
 const current=settings.find(s=>s.topic_id===topicId)?.question_count||30;
 const t=topicById(topicId);
 modal(`<span class="kicker">ATSISKAITYMO NUSTATYMAI</span><h2>${esc(t?.title||topicId)}</h2><p class="muted">Pasirink, kiek klausimų gaus kiekvienas mokinys. Sistema naudoja vienodą balanso karkasą: kiekvienam mokiniui tenka tokios pačios temos, tie patys sunkumo lygiai ir tie patys klausimų tipai, bet parenkami skirtingi lygiaverčiai klausimų variantai.</p><form id="assessmentSettingsForm" class="formGroup"><label>Klausimų skaičius<input id="assessmentQuestionCountInput" type="number" min="5" max="30" step="1" value="${current}" required></label><p class="formHint">Rekomenduojama: 30 klausimų. Galima rinktis nuo 5 iki 30.</p><button class="primary" type="submit">${openAfterSave?'Išsaugoti ir atidaryti atsiskaitymą':'Išsaugoti'}</button></form>`);
 $('assessmentSettingsForm').onsubmit=async e=>{
  e.preventDefault();
  const count=Math.max(5,Math.min(30,Number($('assessmentQuestionCountInput').value)||30));
  const {data,error}=await sb.from('assessment_settings').upsert({class_id:c.id,topic_id:topicId,question_count:count,updated_by:me.id,updated_at:new Date().toISOString()},{onConflict:'class_id,topic_id'}).select().single();
  if(error)return toast(error.message);
  const ix=settings.findIndex(s=>s.topic_id===topicId);if(ix>=0)settings[ix]=data;else settings.push(data);
  if(openAfterSave){
   await updateTopicAccess(c.id,topicId,'assessment_open',true);
   const row=access.find(x=>x.topic_id===topicId);if(row)row.assessment_open=true;
   if(checkbox)checkbox.checked=true;
  }
  closeModal();toast(openAfterSave?`Atsiskaitymas atidarytas: ${count} klausimų.`:`Atsiskaitymo klausimų skaičius: ${count}.`);
  openTeacherClass(c.id,'topics');
 };
}
async function showStudentDetail(studentId,classId){
 modal(`<span class="kicker">MOKINIO INFORMACIJA</span><h2>Kraunama...</h2>`);
 const [
  {data:s,error:profileErr},{data:a},{data:ss},{data:logins},{data:direct},{data:assignments}
 ]=await Promise.all([
  sb.from('profiles').select('id,full_name,last_login_at,last_seen_at,created_at').eq('id',studentId).single(),
  sb.from('practice_attempts').select('*').eq('student_id',studentId).eq('class_id',classId).order('started_at',{ascending:false}),
  sb.from('activity_sessions').select('*').eq('user_id',studentId).eq('class_id',classId).order('started_at',{ascending:false}),
  sb.from('login_events').select('*').eq('user_id',studentId).order('logged_in_at',{ascending:false}).limit(30),
  sb.from('direct_submissions').select('*').eq('student_id',studentId).eq('class_id',classId),
  sb.from('assignments').select('id').eq('class_id',classId)
 ]);
 if(profileErr)return modal(`<div class="notice">${esc(profileErr.message)}</div>`);
 let assignedSubs=[];const assignmentIds=(assignments||[]).map(x=>x.id);
 if(assignmentIds.length)({data:assignedSubs}=await sb.from('submissions').select('*').eq('student_id',studentId).in('assignment_id',assignmentIds));
 const attempts=a||[],sessions=ss||[],loginRows=logins||[];
 const assessmentIds=attempts.filter(x=>x.mode==='assessment').map(x=>x.id);
 let focusRows=[];if(assessmentIds.length)({data:focusRows}=await sb.from('assessment_focus_events').select('attempt_id,event_type,occurred_at').in('attempt_id',assessmentIds));
 const focusCountByAttempt={};(focusRows||[]).forEach(e=>focusCountByAttempt[e.attempt_id]=(focusCountByAttempt[e.attempt_id]||0)+1);
 const secs=sessions.reduce((n,x)=>n+(x.duration_seconds||0),0);
 const avgScore=attempts.length?Math.round(attempts.reduce((n,x)=>n+(x.score_percent||0),0)/attempts.length):0;
 const best=attempts.length?Math.max(...attempts.map(x=>x.score_percent||0)):0;
 const totalQ=attempts.reduce((n,x)=>n+(x.total_questions||0),0),correctQ=attempts.reduce((n,x)=>n+(x.correct_answers||0),0);
 const avgSession=sessions.length?Math.round(secs/sessions.length):0,avgAttempt=attempts.length?Math.round(attempts.reduce((n,x)=>n+(x.duration_seconds||0),0)/attempts.length):0;
 const practiceCount=attempts.filter(x=>x.mode==='practice').length,assessmentCount=attempts.filter(x=>x.mode==='assessment').length;
 const fileCount=(direct||[]).length+(assignedSubs||[]).length;
 modal(`<div class="sectionTitle"><div class="grow"><span class="kicker">${profile.role==='admin'?'ADMINISTRATORIUS · ':''}MOKINIO INFORMACIJA</span><h2>${esc(s?.full_name||'Mokinys')}</h2></div><button class="smallBtn dangerSoft" id="removeStudentFromClass">Pašalinti iš klasės</button></div>
 <p class="muted">Paskyra sukurta ${fmtDate(s?.created_at)} · paskutinis prisijungimas ${fmtDate(s?.last_login_at)} · paskutinis aktyvumas ${fmtDate(s?.last_seen_at)}</p>
 <div class="detailMetrics">
  <div class="metric"><strong>${attempts.length}</strong><span>bandymų</span></div><div class="metric"><strong>${avgScore||'–'}${attempts.length?'%':''}</strong><span>rezultatų vidurkis</span></div>
  <div class="metric"><strong>${attempts.length?best+'%':'–'}</strong><span>geriausias rezultatas</span></div><div class="metric"><strong>${fmtSec(secs)}</strong><span>aktyvus laikas</span></div>
  <div class="metric"><strong>${sessions.length}</strong><span>aktyvumo sesijų</span></div><div class="metric"><strong>${fmtSec(avgSession)}</strong><span>vid. sesijos trukmė</span></div>
  <div class="metric"><strong>${fileCount}</strong><span>pateiktų failų</span></div><div class="metric"><strong>${totalQ?Math.round(correctQ/totalQ*100)+'%':'–'}</strong><span>teisingų atsakymų</span></div>
 </div>
 <div class="detailColumns"><div><h3>Bandymų istorija</h3><div class="subtle">Praktika: ${practiceCount} · atsiskaitymai: ${assessmentCount} · vid. bandymo trukmė: ${fmtSec(avgAttempt)}</div>
 ${attempts.length?attempts.slice(0,30).map(x=>`<div class="studentRow attemptHistoryRow"><div class="grow"><b>${esc(topicById(x.topic_id)?.title||x.topic_id)}</b><div class="subtle">${fmtDate(x.started_at)} · ${x.mode==='assessment'?'Atsiskaitymas':'Praktika'} · ${x.correct_answers||0}/${x.total_questions||0} teisingai · ${fmtDurationDetailed(x.duration_seconds)}${x.mode==='assessment'&&focusCountByAttempt[x.id]!=null?` · išėjimų/fokuso įvykių: ${focusCountByAttempt[x.id]}`:''}</div></div><strong>${x.score_percent}%</strong>${x.mode==='assessment'?`<button class="smallBtn" data-assessment-attempt="${x.id}">Peržiūrėti</button>`:''}</div>`).join(''):'<div class="emptyState">Bandymų dar nėra.</div>'}</div>
 <div><h3>Prisijungimų istorija</h3><p class="subtle">Istorija kaupiama nuo v3.3 įdiegimo.</p>${loginRows.length?loginRows.map(x=>`<div class="historyRow"><b>${fmtDate(x.logged_in_at)}</b></div>`).join(''):'<div class="emptyState">Naujų prisijungimų dar neužfiksuota.</div>'}
 <h3 style="margin-top:22px">Aktyvumo sesijos</h3>${sessions.length?sessions.slice(0,20).map(x=>`<div class="historyRow"><div><b>${fmtDate(x.started_at)}</b><div class="subtle">Paskutinis aktyvumas ${fmtDate(x.last_seen_at)}</div></div><strong>${fmtSec(x.duration_seconds)}</strong></div>`).join(''):'<div class="emptyState">Sesijų dar nėra.</div>'}</div></div>`);
 document.querySelectorAll('[data-assessment-attempt]').forEach(b=>b.onclick=()=>showAssessmentAttemptDetail(b.dataset.assessmentAttempt,studentId,classId));
 if($('removeStudentFromClass'))$('removeStudentFromClass').onclick=()=>removeStudentFromClass(studentId,classId,s?.full_name||'Mokinys');
}

async function removeStudentFromClass(studentId,classId,studentName){
 if(!confirm(`Pašalinti mokinį „${studentName}“ iš šios klasės?\n\nBus ištrinti VISI jo žinių treniruočių ir atsiskaitymų bandymai šioje klasėje, įskaitant testo atsakymus, laiką ir išėjimų iš lango istoriją. Pateikti failai ir pati prisijungimo paskyra nebus trinami.`))return;
 const {error}=await sb.rpc('teacher_remove_student_from_class',{p_class_id:classId,p_student_id:studentId});
 if(error)return toast(error.message);
 closeModal();
 toast('Mokinys pašalintas iš klasės, o jo testų ir treniruočių rezultatai ištrinti.');
 openTeacherClass(classId,'students');
}

function formatStoredAnswer(q,answer){
 if(answer===null||answer===undefined)return 'neatsakyta';
 const type=q.question_type||'single',opts=q.options;
 if(type==='single'||type==='odd'){const i=Number(answer);return Array.isArray(opts)&&opts[i]!=null?opts[i]:String(answer)}
 if(type==='multi'){return (Array.isArray(answer)?answer:[]).map(i=>Array.isArray(opts)&&opts[Number(i)]!=null?opts[Number(i)]:String(i)).join('; ')||'neatsakyta'}
 if(type==='matching'){
  const left=opts?.left||[],right=opts?.right||[];return left.map((l,i)=>`${l} → ${right[Number(answer?.[String(i)])]??'—'}`).join(' | ')
 }
 return String(answer);
}
function focusEventLabel(t){return ({hidden:'Perėjo į kitą skirtuką / puslapis paslėptas',blur:'Naršyklės langas prarado fokusą',pagehide:'Išėjo arba perkrovė puslapį',quit:'Paspaudė „Baigti“ nebaigęs'})[t]||t}
async function showAssessmentAttemptDetail(attemptId,studentId,classId){
 modal(`<span class="kicker">ATSISKAITYMO DETALĖS</span><h2>Kraunama...</h2>`);
 const [{data:attempt,error:aErr},{data:questions,error:qErr},{data:events,error:eErr}]=await Promise.all([
  sb.from('practice_attempts').select('*').eq('id',attemptId).single(),
  sb.from('assessment_attempt_questions').select('*').eq('attempt_id',attemptId).order('question_order',{ascending:true}),
  sb.from('assessment_focus_events').select('*').eq('attempt_id',attemptId).order('occurred_at',{ascending:true})
 ]);
 if(aErr)return modal(`<div class="notice">${esc(aErr.message)}</div>`);
 const hasDetails=!qErr&&(questions||[]).length>0;
 modal(`<button class="back" id="backToStudentDetail">← Atgal į mokinį</button><span class="kicker">ATSISKAITYMO DETALĖS</span><h2>${esc(topicById(attempt.topic_id)?.title||attempt.topic_id)}</h2>
 <div class="detailMetrics assessmentMetrics"><div class="metric"><strong>${attempt.score_percent}%</strong><span>rezultatas</span></div><div class="metric"><strong>${attempt.correct_answers}/${attempt.total_questions}</strong><span>teisingai</span></div><div class="metric"><strong>${fmtDurationDetailed(attempt.duration_seconds)}</strong><span>trukmė</span></div><div class="metric"><strong>${(events||[]).length}</strong><span>išėjimų / fokuso įvykių</span></div></div>
 <p class="muted">Pradėta: <b>${fmtDate(attempt.started_at)}</b> · baigta: <b>${fmtDate(attempt.completed_at)}</b></p>
 <div class="panel assessmentFocusPanel"><h3>Išėjimai ir fokuso praradimai</h3>${eErr?`<div class="notice">${esc(eErr.message)}</div>`:(events||[]).length?(events||[]).map((e,i)=>`<div class="historyRow"><span>${i+1}. ${esc(focusEventLabel(e.event_type))}</span><b>${fmtDate(e.occurred_at)}</b></div>`).join(''):'<div class="emptyState">Neužfiksuota nė vieno išėjimo ar fokuso praradimo.</div>'}</div>
 <div class="panel"><h3>Klausimai ir atsakymai</h3>${hasDetails?(questions||[]).map(q=>`<div class="assessmentQuestionDetail ${q.is_correct?'isCorrect':'isWrong'}"><div class="bankQuestionMeta"><span class="badge">${q.question_order}</span><span class="badge">${esc(qTypeLabel(q.question_type))}</span><span class="badge">${esc(q.category)}</span></div><b>${esc(q.question_text)}</b><p>Mokinio atsakymas: <strong>${esc(formatStoredAnswer(q,q.student_answer))}</strong><br>Teisingas atsakymas: <strong>${esc(formatStoredAnswer(q,q.correct_answer))}</strong></p><div class="subtle">${q.is_correct?'✓ Teisingai':'✕ Neteisingai / neatsakyta'}${q.answered_at?' · atsakyta '+fmtDate(q.answered_at):''}</div>${q.explanation?`<div class="subtle">${esc(q.explanation)}</div>`:''}</div>`).join(''):'<div class="emptyState">Šis bandymas atliktas iki v5.3, todėl klausimų ir fokuso įvykių detalizacija jam nebuvo kaupiama.</div>'}</div>`);
 $('backToStudentDetail').onclick=()=>showStudentDetail(studentId,classId);
}



async function renderTeacherResources(c){
 const {data:rows,error}=await sb.from('learning_resources').select('*').eq('class_id',c.id).order('created_at',{ascending:false});
 if(error)return toast(error.message);

 const knownIds=new Set(activeClassTopics.map(t=>t.id));
 const extraTopicIds=[...new Set((rows||[]).map(r=>r.topic_id).filter(id=>id&&!knownIds.has(id)))];
 const groupTopics=[
  ...activeClassTopics,
  ...extraTopicIds.map(id=>topicById(id)||{id,title:id,code:'',hours:0})
 ];
 const groups=groupTopics
  .map(t=>({topic:t,items:(rows||[]).filter(r=>r.topic_id===t.id)}))
  .filter(g=>g.items.length);

 $('teacherClassPanel').innerHTML=`<div class="panel">
  <div class="sectionTitle">
   <div class="grow"><span class="kicker">MOKYMOSI FAILAI</span><h2>Failai mokiniams pagal temas</h2><p class="muted">Failai sugrupuoti pagal temas, kad augant medžiagos kiekiui būtų lengva rasti reikiamą turinį.</p></div>
   <button class="primary" id="uploadResourceBtn" ${activeClassTopics.length?'':'disabled'}>+ Įkelti failą</button>
  </div>
  ${groups.length?groups.map(g=>`<details class="topicContentGroup">
   <summary>
    <div><b>${esc(g.topic.title)}</b><div class="subtle">${esc(topicMeta(g.topic)||'Mokymosi tema')}</div></div>
    <span class="badge ${g.items.length?'ok':''}">${g.items.length} fail.</span>
   </summary>
   <div class="topicContentBody">
    ${g.items.map(r=>`<div class="resourceRow"><div class="grow"><b>${esc(r.title)}</b><div class="subtle">${esc(r.original_name)} · ${fmtDate(r.created_at)}</div></div><button class="smallBtn" data-download-resource="${r.id}">Atsisiųsti</button><button class="smallBtn" data-delete-resource="${r.id}">Trinti</button></div>`).join('')}
   </div>
  </details>`).join(''):'<div class="emptyState"><b>Failų dar nėra.</b>Įkelkite PDF, DOCX, PPTX, ZIP ar kitą medžiagą mokiniams.</div>'}
 </div>`;

 $('uploadResourceBtn').onclick=()=>resourceUploadModal(c);
 document.querySelectorAll('[data-download-resource]').forEach(b=>b.onclick=()=>downloadResource(b.dataset.downloadResource));
 document.querySelectorAll('[data-delete-resource]').forEach(b=>b.onclick=()=>deleteResource(b.dataset.deleteResource,c));
}
function resourceUploadModal(c){
 if(!activeClassTopics.length)return toast('Pirmiausia klasėje sukurk bent vieną temą.');
 modal(`<span class="kicker">MOKYMOSI FAILAS</span><h2>Įkelti mokiniams</h2><form id="resourceForm" class="formGroup">
 <label>Tema<select id="resourceTopic">${activeClassTopics.map(t=>`<option value="${t.id}">${esc(t.title)}</option>`).join('')}</select></label>
 <label>Pavadinimas<input id="resourceTitle" required placeholder="Pvz., Vektorinės grafikos teorija"></label>
 <label>Failas<input class="fileInput" type="file" id="resourceFile" required></label>
 <button class="primary" type="submit" style="margin-top:14px">Įkelti</button></form>`);
 $('resourceForm').onsubmit=async e=>{
  e.preventDefault();const f=$('resourceFile').files[0];if(!f)return;
  const topic=$('resourceTopic').value,path=`${c.id}/${topic}/${storageFileName(f.name)}`;
  toast('Įkeliamas failas...');
  const {error:upErr}=await sb.storage.from('teacher-resources').upload(path,f,storageUploadOptions(f));
  if(upErr)return toast(upErr.message);
  const {error}=await sb.from('learning_resources').insert({class_id:c.id,topic_id:topic,title:$('resourceTitle').value.trim(),storage_path:path,original_name:f.name,mime_type:uploadContentType(f),size_bytes:f.size,uploaded_by:me.id});
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
 const [
  {data:rows,error:assignErr},
  {data:direct,error:directErr},
  {data:topicPosts,error:postsErr}
 ]=await Promise.all([
  sb.from('assignments').select('*').eq('class_id',c.id).order('created_at',{ascending:false}),
  sb.from('direct_submissions').select('*').eq('class_id',c.id).order('submitted_at',{ascending:false}),
  sb.from('class_posts').select('id,topic_id').eq('class_id',c.id)
 ]);
 if(assignErr)return toast(assignErr.message);
 if(directErr)return toast(directErr.message);
 if(postsErr)return toast(postsErr.message);

 const ids=[...new Set((direct||[]).map(s=>s.student_id))];
 let studs=[];
 if(ids.length)({data:studs}=await sb.from('profiles').select('id,full_name').in('id',ids));
 studs=studs||[];

 let assignmentSubs=[];
 const aIds=(rows||[]).map(a=>a.id);
 if(aIds.length)({data:assignmentSubs}=await sb.from('submissions').select('id,assignment_id').in('assignment_id',aIds));
 assignmentSubs=assignmentSubs||[];

 const countFor=id=>assignmentSubs.filter(s=>s.assignment_id===id).length;
 const postCountFor=topicId=>(topicPosts||[]).filter(p=>p.topic_id===topicId).length;

 const knownIds=new Set(activeClassTopics.map(t=>t.id));
 const contentTopicIds=[...new Set([
  ...(rows||[]).map(x=>x.topic_id),
  ...(direct||[]).map(x=>x.topic_id),
  ...(topicPosts||[]).map(x=>x.topic_id)
 ].filter(Boolean))];
 const extraIds=contentTopicIds.filter(id=>!knownIds.has(id));
 const groupTopics=[
  ...activeClassTopics,
  ...extraIds.map(id=>topicById(id)||{id,title:id,code:'',hours:0})
 ];

 $('teacherClassPanel').innerHTML=`
 <div class="panel">
  <div class="sectionTitle">
   <div class="grow"><span class="kicker">UŽDUOTYS IR DARBAI</span><h2>Turinys pagal temas</h2><p class="muted">Kiekvienoje temoje rasi jos pranešimus, užduotis ir mokinių savarankiškai pateiktus darbus.</p></div>
   <button class="primary" id="newAssignmentBtn" ${activeClassTopics.length?'':'disabled'}>+ Nauja užduotis</button>
  </div>

  ${groupTopics.length?groupTopics.map(t=>{
   const topicAssignments=(rows||[]).filter(a=>a.topic_id===t.id);
   const topicDirect=(direct||[]).filter(s=>s.topic_id===t.id);
   const postCount=postCountFor(t.id);
   const submittedCount=topicAssignments.reduce((n,a)=>n+countFor(a.id),0)+topicDirect.length;
   return `<details class="topicContentGroup assignmentTopicGroup">
    <summary>
     <div><b>${esc(t.title)}</b><div class="subtle">${esc(topicMeta(t)||'Klasės tema')}</div></div>
     <div class="topicSummaryCounts">
      <span class="badge ${postCount?'ok':''}">${postCount} praneš.</span>
      <span class="badge ${topicAssignments.length?'ok':''}">${topicAssignments.length} užd.</span>
      <span class="badge ${submittedCount?'ok':''}">${submittedCount} fail.</span>
     </div>
    </summary>

    <div class="topicContentBody">
     <div class="topicGroupToolbar">
      <button class="smallBtn" data-assignment-topic-posts="${t.id}">Pranešimai / nuorodos ${postCount?`(${postCount})`:''}</button>
      <button class="primary smallPrimary" data-new-topic-assignment="${t.id}">+ Nauja užduotis</button>
     </div>

     <div class="topicSubsection">
      <h3>Mokytojo sukurtos užduotys</h3>
      ${topicAssignments.length?topicAssignments.map(a=>`<div class="assignmentRow"><div class="grow"><b>${esc(a.title)}</b><div class="subtle">${a.is_open?'Atidaryta':'Uždaryta'} · terminas ${a.due_at?fmtDate(a.due_at):'nenustatytas'}</div></div><span class="badge ${countFor(a.id)?'ok':''}">${countFor(a.id)} fail.</span><div class="assignmentActions"><button class="smallBtn" data-edit-assignment="${a.id}">Redaguoti</button><button class="smallBtn dangerMini" data-delete-assignment="${a.id}" data-file-count="${countFor(a.id)}">Ištrinti</button><button class="smallBtn" data-assignment="${a.id}">Pateikti darbai</button></div></div>`).join(''):'<div class="topicEmptyLine">Šioje temoje užduočių dar nėra.</div>'}
     </div>

     <div class="topicSubsection">
      <h3>Mokinių savarankiškai pateikti darbai</h3>
      ${topicDirect.length?topicDirect.map(s=>{const st=studs.find(x=>x.id===s.student_id);return `<div class="submissionRow"><div class="grow"><b>${esc(st?.full_name||'Mokinys')} · ${esc(s.title||s.original_name)}</b><div class="subtle">${esc(s.original_name)} · ${fmtDate(s.submitted_at)}</div></div><button class="smallBtn" data-ddirect="${s.id}">Atsisiųsti</button><button class="smallBtn dangerMini" data-del-direct="${s.id}">Ištrinti</button></div>`}).join(''):'<div class="topicEmptyLine">Šioje temoje savarankiškai pateiktų darbų dar nėra.</div>'}
     </div>
    </div>
   </details>`;
  }).join(''):'<div class="emptyState"><b>Temų dar nėra.</b>Pirmiausia sukurk klasės temas.</div>'}
 </div>`;

 $('newAssignmentBtn').onclick=()=>newAssignmentModal(c);
 document.querySelectorAll('[data-new-topic-assignment]').forEach(b=>b.onclick=()=>newAssignmentModal(c,b.dataset.newTopicAssignment));
 document.querySelectorAll('[data-assignment-topic-posts]').forEach(b=>b.onclick=()=>navigateTo(()=>renderTeacherTopicPosts(c,b.dataset.assignmentTopicPosts)));
 document.querySelectorAll('[data-edit-assignment]').forEach(b=>b.onclick=()=>editAssignmentModal(b.dataset.editAssignment,c));
 document.querySelectorAll('[data-delete-assignment]').forEach(b=>b.onclick=()=>deleteAssignment(b.dataset.deleteAssignment,c,Number(b.dataset.fileCount||0)));
 document.querySelectorAll('[data-assignment]').forEach(b=>b.onclick=()=>showSubmissions(b.dataset.assignment,c));
 document.querySelectorAll('[data-ddirect]').forEach(b=>b.onclick=()=>downloadDirectSubmission(b.dataset.ddirect));
 document.querySelectorAll('[data-del-direct]').forEach(b=>b.onclick=()=>deleteDirectSubmission(b.dataset.delDirect,c,'teacher'));
}
function newAssignmentModal(c,presetTopicId=null){
 if(!activeClassTopics.length)return toast('Pirmiausia klasėje sukurk bent vieną temą.');
 const presetTopic=activeClassTopics.find(t=>t.id===presetTopicId);
 modal(`<span class="kicker">NAUJA UŽDUOTIS</span><h2>${presetTopic?`Nauja užduotis · ${esc(presetTopic.title)}`:'Sukurti darbų pateikimą'}</h2><form id="assignmentForm" class="formGroup">
 <label>Tema<select id="aTopic">${activeClassTopics.map(t=>`<option value="${t.id}" ${t.id===presetTopicId?'selected':''}>${esc(t.title)}</option>`).join('')}</select></label>
 <label>Pavadinimas<input id="aTitle" required></label>
 <label>Instrukcija<textarea id="aInstructions"></textarea></label>
 <label>Terminas<input type="datetime-local" id="aDue"></label>
 <p class="formHint">Sukūrus užduotį ji bus iškart atidaryta mokiniams ir jie galės prie jos įkelti vieną ar kelis failus.</p>
 <button class="primary" type="submit" style="margin-top:14px">Sukurti ir atidaryti mokiniams</button></form>`);
 $('assignmentForm').onsubmit=async e=>{e.preventDefault();const due=$('aDue').value?new Date($('aDue').value).toISOString():null;
  const {error}=await sb.from('assignments').insert({
   class_id:c.id,
   topic_id:$('aTopic').value,
   title:$('aTitle').value.trim(),
   instructions:$('aInstructions').value.trim(),
   due_at:due,
   is_open:true,
   created_by:me.id
  });
  if(error)return toast(error.message);
  closeModal();
  toast('Užduotis sukurta ir atidaryta mokiniams.');
  renderTeacherAssignments(c);
 };
}

async function editAssignmentModal(id,c){
 const {data:a,error}=await sb.from('assignments').select('*').eq('id',id).single();
 if(error)return toast(error.message);

 let dueLocal='';
 if(a.due_at){
  const d=new Date(a.due_at);
  dueLocal=new Date(d.getTime()-d.getTimezoneOffset()*60000).toISOString().slice(0,16);
 }

 modal(`<span class="kicker">REDAGUOTI UŽDUOTĮ</span><h2>${esc(a.title)}</h2>
 <p class="muted">Pakeitimai iškart bus matomi mokiniams.</p>
 <form id="editAssignmentForm" class="formGroup">
  <label>Tema<select id="editATopic">${activeClassTopics.map(t=>`<option value="${t.id}" ${t.id===a.topic_id?'selected':''}>${esc(t.title)}</option>`).join('')}</select></label>
  <label>Pavadinimas<input id="editATitle" required maxlength="160"></label>
  <label>Instrukcija<textarea id="editAInstructions" rows="5"></textarea></label>
  <label>Terminas<input type="datetime-local" id="editADue"></label>
  <label class="toggle editAssignmentToggle"><input type="checkbox" id="editAOpen" ${a.is_open?'checked':''}> Užduotis atidaryta mokiniams</label>
  <button class="primary" type="submit" style="margin-top:14px">Išsaugoti pakeitimus</button>
 </form>`);

 $('editATitle').value=a.title||'';
 $('editAInstructions').value=a.instructions||'';
 $('editADue').value=dueLocal;

 $('editAssignmentForm').onsubmit=async e=>{
  e.preventDefault();

  const title=$('editATitle').value.trim();
  if(!title)return toast('Įrašyk užduoties pavadinimą.');

  const due=$('editADue').value?new Date($('editADue').value).toISOString():null;
  const {error:updateError}=await sb.from('assignments').update({
   topic_id:$('editATopic').value,
   title,
   instructions:$('editAInstructions').value.trim(),
   due_at:due,
   is_open:$('editAOpen').checked
  }).eq('id',id);

  if(updateError)return toast(updateError.message);

  closeModal();
  toast('Užduotis atnaujinta.');
  renderTeacherAssignments(c);
 };
}

async function deleteAssignment(id,c,fileCount=0){
 const {data:a,error}=await sb.from('assignments').select('id,title').eq('id',id).single();
 if(error)return toast(error.message);

 const warning=fileCount>0
  ?`Užduotis „${a.title}“ turi ${fileCount} pateiktą(-us) mokinių failą(-us). Ištrynus užduotį bus negrįžtamai ištrinti ir visi prie jos pateikti failai. Ar tikrai tęsti?`
  :`Ar tikrai ištrinti užduotį „${a.title}“? Šio veiksmo atšaukti nepavyks.`;

 if(!confirm(warning))return;

 // Pirmiausia iš Storage pašaliname prie šios užduoties pateiktus failus.
 const {data:subs,error:subsErr}=await sb.from('submissions')
  .select('id,storage_path')
  .eq('assignment_id',id);

 if(subsErr)return toast(subsErr.message);

 const paths=(subs||[]).map(s=>s.storage_path).filter(Boolean);
 if(paths.length){
  const {error:storageErr}=await sb.storage.from('student-submissions').remove(paths);
  if(storageErr)return toast(`Užduotis neištrinta, nes nepavyko pašalinti mokinių failų: ${storageErr.message}`);
 }

 // DB submissions išsitrins per ON DELETE CASCADE.
 const {error:deleteErr}=await sb.from('assignments').delete().eq('id',id);
 if(deleteErr)return toast(deleteErr.message);

 toast('Užduotis ištrinta.');
 renderTeacherAssignments(c);
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
 stopTeacherPresenceRefresh();
 setCurrentRestore(()=>renderStudent());
 show('student');$('studentContent').innerHTML='<div class="pageHero"><span class="kicker">MOKINYS</span><h1>Kraunama...</h1></div>';
 const c=await getStudentClass();currentClass=c;
 if(!c){stopHeartbeat();$('studentContent').innerHTML=`<div class="authShell"><div class="authCard"><span class="kicker">PRISIJUNGTI PRIE KLASĖS</span><h1>Sveiki, ${esc(profile.full_name||'mokiny')}!</h1><p>Įveskite mokytojo pateiktą klasės kodą.</p><form id="joinForm"><label>Klasės kodas<input id="joinCode" required placeholder="Pvz., A7K2QX"></label><button class="primary wide" type="submit">Prisijungti prie klasės</button></form></div></div>`;
  $('joinForm').onsubmit=async e=>{e.preventDefault();const {error}=await sb.rpc('join_class_by_code',{p_code:$('joinCode').value.trim()});if(error)return toast(error.message);toast('Prisijungta prie klasės.');renderStudent()};return;
 }
 await loadClassTopics(c.id);
 await startHeartbeat(c.id);
 setPresenceContext('Klasės pradžia',null);
 const [{data:access},{data:attempts},{data:sessions},{data:direct,error:directErr}]=await Promise.all([
  sb.from('topic_access').select('*').eq('class_id',c.id),
  sb.from('practice_attempts').select('*').eq('student_id',me.id).eq('class_id',c.id).eq('mode','practice'),
  sb.from('activity_sessions').select('*').eq('user_id',me.id).eq('class_id',c.id),
  sb.from('direct_submissions').select('*').eq('student_id',me.id).eq('class_id',c.id).order('submitted_at',{ascending:false})
 ]);
 if(directErr)return toast(directErr.message);

 const secs=(sessions||[]).reduce((n,x)=>n+(x.duration_seconds||0),0),best=(attempts||[]).length?Math.max(...attempts.map(x=>x.score_percent||0)):0;
 const openTopics=activeClassTopics.filter(t=>(access||[]).find(a=>a.topic_id===t.id)?.is_open);

 $('studentContent').innerHTML=`<div class="pageHero"><span class="kicker">PRADŽIA · ${esc(c.name)}</span><h1>Sveiki, ${esc(profile.full_name||'mokiny')}.</h1><p>Čia yra tavo klasė: atidarytos temos, žinių treniruotės, mokymosi failai ir darbų pateikimas.</p></div>
 <div class="dashboardGrid"><div class="metric"><strong>${(attempts||[]).length}</strong><span>bandymų</span></div><div class="metric"><strong>${(attempts||[]).length?best+'%':'–'}</strong><span>geriausias rezultatas</span></div><div class="metric"><strong>${fmtSec(secs)}</strong><span>aktyvus laikas</span></div><div class="metric"><strong>${fmtDate(profile.last_seen_at||profile.last_login_at)}</strong><span>paskutinis aktyvumas</span></div></div>


 <div class="panel studentUploadPanel">
  <div class="sectionTitle"><div class="grow"><span class="kicker">MANO DARBAI</span><h2>Pateikti atliktą darbą</h2></div><button class="primary" id="directSubmitBtn" ${openTopics.length?'':'disabled'}>+ Įkelti failus</button></div>
  <p class="muted">Gali pateikti vieną arba kelis failus vienu metu ir vėliau pridėti dar. Savo įkeltus failus gali atsisiųsti arba ištrinti. Mokytojas iškart matys juos savo klasės skiltyje „Užduotys ir darbai“.</p>
  ${(direct||[]).length?`<div class="miniList"><b>Mano pateikti failai (${direct.length})</b>${(direct||[]).map(s=>`<div class="submissionRow"><div class="grow"><b>${esc(s.title||s.original_name)}</b><div class="subtle">${esc(topicById(s.topic_id)?.title||s.topic_id)} · ${esc(s.original_name)} · ${fmtDate(s.submitted_at)}</div></div><button class="smallBtn" data-my-direct="${s.id}">Atsisiųsti</button><button class="smallBtn dangerMini" data-my-del-direct="${s.id}">Ištrinti</button></div>`).join('')}</div>`:'<div class="emptyState">Dar nieko nepateikei. Gali pasirinkti kelis failus vienu metu.</div>'}
 </div>

 <div class="sectionHead"><span class="kicker">TEMOS</span><h2>Mokymosi turinys</h2></div>
 <div class="studentTopics">${activeClassTopics.length?activeClassTopics.map(t=>{const a=(access||[]).find(x=>x.topic_id===t.id)||{};return `<article class="topicStudentCard ${a.is_open?'':'locked'}"><span class="badge ${a.is_open?'ok':''}">${a.is_open?'ATIDARYTA':'🔒 UŽRAKINTA'}</span><div style="font-size:30px;margin-top:12px">${t.icon||'💻'}</div><h3>${esc(t.title)}</h3><p>${esc(topicMeta(t)||'Mokymosi tema')}</p><button class="${a.is_open?'primary':'ghost'}" data-stopic="${t.id}" ${a.is_open?'':'disabled'}>${a.is_open?'Atidaryti':'Užrakinta'}</button></article>`}).join(''):'<div class="panel emptyState"><b>Mokytojas šiai klasei temų dar nesukūrė.</b></div>'}</div>`;

 if($('directSubmitBtn'))$('directSubmitBtn').onclick=()=>openDirectSubmissionModal(c,openTopics);
 document.querySelectorAll('[data-my-direct]').forEach(b=>b.onclick=()=>downloadDirectSubmission(b.dataset.myDirect));
 document.querySelectorAll('[data-my-del-direct]').forEach(b=>b.onclick=()=>deleteDirectSubmission(b.dataset.myDelDirect,c,'student'));
 document.querySelectorAll('[data-stopic]').forEach(b=>b.onclick=()=>navigateTo(()=>openStudentTopic(b.dataset.stopic,c,access||[])));
}

function openDirectSubmissionModal(c,openTopics){
 modal(`<span class="kicker">PATEIKTI DARBĄ</span><h2>Įkelti atliktą užduotį</h2>
 <form id="directSubmissionForm" class="formGroup">
  <label>Tema<select id="directTopic" required>${openTopics.map(t=>`<option value="${t.id}">${esc(t.title)}</option>`).join('')}</select></label>
  <label>Darbo pavadinimas<input id="directTitle" required maxlength="120" placeholder="Pvz., Logotipo kūrimo užduotis"></label>
  <label>Failai<input class="fileInput" type="file" id="directFile" multiple required></label>
  <p class="formHint">Galima pasirinkti kelis failus. Vieno failo maksimalus dydis – 25 MB. Palaikomi ir vektoriniai failai: SVG, AI, EPS, CDR, DXF, WMF, EMF.</p>
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
   const path=`${c.id}/direct/${me.id}/${storageFileName(f.name)}`;
   const {error:upErr}=await sb.storage.from('student-submissions').upload(path,f,storageUploadOptions(f));
   if(upErr){toast(`Nepavyko įkelti ${f.name}: ${upErr.message}`);continue}
   const {error}=await sb.from('direct_submissions').insert({
    class_id:c.id,topic_id:topicId,student_id:me.id,title,
    storage_path:path,original_name:f.name,mime_type:uploadContentType(f),size_bytes:f.size
   });
   if(error){await sb.storage.from('student-submissions').remove([path]);toast(`Nepavyko išsaugoti ${f.name}: ${error.message}`);continue}
   uploaded++;
  }
  if(uploaded){closeModal();toast(`Pateikta failų: ${uploaded}.`);renderStudent()}
 };
}


function renderGrade10StudentPracticePicker(blocks,practiceOpen){
 if(!practiceOpen)return '<p class="muted">Mokytojas žinių treniruotės dar neatidarė.</p>';
 if(!blocks.length)return '<p class="muted">Mokytojas dar neparinko klausimų blokų šiai žinių treniruotei.</p>';
 if(blocks.length===1)return `<div class="practiceBlockSingle"><b>${esc(blocks[0].title)}</b>${blocks[0].description?`<div class="subtle">${esc(blocks[0].description)}</div>`:''}</div><button class="primary" id="startGrade10Practice" data-single-block="${blocks[0].id}">Pradėti treniruotę</button>`;
 return `<p class="muted">Pasirink, ką nori kartotis. Gali pažymėti vieną, kelias temas arba visą skyrių.</p>
 <div class="practiceBlockPicker">
  <label class="practiceAllBlocks"><input type="checkbox" id="practiceAllBlocks"> <b>Visas skyrius</b></label>
  ${blocks.map(b=>`<label class="practiceBlockChoice"><input type="checkbox" data-practice-block="${b.id}"><span><b>${esc(b.title)}</b>${b.description?`<small>${esc(b.description)}</small>`:''}</span></label>`).join('')}
 </div><button class="primary" id="startGrade10Practice">Pradėti pasirinktą treniruotę</button>`;
}


function assessmentStatusRow(data){
 return Array.isArray(data)?(data[0]||null):(data||null);
}
function renderStudentAssessmentCard(c,a,assessmentSetting,status){
 if(c.grade_level!=='11'){
  return a.assessment_open?'<span class="badge ok">Atidaryta</span><p class="muted">Atsiskaitymas šiuo metu atidarytas.</p><button class="primary" id="startAssessmentTopic">Pradėti atsiskaitymą</button>':'<div class="lockedBox">🔒 Mokytojas atsiskaitymo dar neatidarė.</div>';
 }
 if(status?.completed_at){
  const attemptNo=status.attempt_number||status.completed_attempts||1;
  const retryAllowed=!!status.can_start_new;
  const retryButton=(a.assessment_open&&retryAllowed)?`<button class="primary" id="startAssessmentTopic">Pradėti ${attemptNo+1} bandymą</button>`:'';
  const retryNotice=retryAllowed?'<div class="notice"><b>Mokytojas leido dar vieną bandymą.</b> Ankstesnis rezultatas išliks istorijoje, o naujas variantas bus sugeneruotas iš lygiaverčių klausimų.</div>':'<p class="subtle">Papildomą bandymą gali atrakinti mokytojas.</p>';
  if(status.results_released){
   return `<span class="badge ok">${attemptNo} bandymas atliktas · rezultatai paskelbti</span>
   <div class="detailMetrics"><div class="metric"><strong>${status.score_percent??0}%</strong><span>rezultatas</span></div><div class="metric"><strong>${status.correct_answers??0}/${status.total_questions||0}</strong><span>teisingai</span></div><div class="metric"><strong>${fmtDurationDetailed(status.duration_seconds)}</strong><span>trukmė</span></div></div>
   <div class="actions"><button class="ghost" id="studentAssessmentReview">Peržiūrėti savo atsakymus</button>${retryButton}</div>${retryNotice}`;
  }
  return `<span class="badge ok">${attemptNo} bandymas atliktas</span><p class="muted"><b>Atsiskaitymas pateiktas.</b> Rezultatas ir teisingi atsakymai bus parodyti, kai visi klasės mokiniai baigs šios temos atsiskaitymą.</p>
  <div class="detailMetrics"><div class="metric"><strong>${status.completed_students||0}/${status.total_students||0}</strong><span>jau baigė</span></div><div class="metric"><strong>${fmtDurationDetailed(status.duration_seconds)}</strong><span>tavo trukmė</span></div><div class="metric"><strong>${status.focus_events||0}</strong><span>išėjimų / fokuso įvykių</span></div></div>${retryNotice}${retryButton}`;
 }
 if(a.assessment_open){
  const attemptNo=status?.attempt_number||1;
  return `<span class="badge ok">Atidaryta</span><p class="muted">${status?.attempt_id?`Tęsiamas <b>${attemptNo} bandymas</b>. Naujas bandymas nebus kuriamas, kol šis nebaigtas.`:`Atsiskaitymas šiuo metu atidarytas.`} Klausimų skaičius: <b>${assessmentSetting?.question_count||30}</b>. Pagal nutylėjimą suteikiamas vienas bandymas, o papildomą gali atrakinti tik mokytojas. Fiksuojamas atlikimo laikas ir išėjimai iš lango / fokuso praradimai.</p><button class="primary" id="startAssessmentTopic">${status?.attempt_id?'Tęsti atsiskaitymą':'Pradėti atsiskaitymą'}</button>`;
 }
 return '<div class="lockedBox">🔒 Mokytojas atsiskaitymo dar neatidarė.</div>';
}

async function showMyAssessmentReview(attemptId){
 modal(`<span class="kicker">MANO ATSISKAITYMAS</span><h2>Kraunama...</h2>`);
 const {data,error}=await sb.rpc('get_my_assessment_review',{p_attempt_id:attemptId});
 if(error)return modal(`<span class="kicker">MANO ATSISKAITYMAS</span><h2>Rezultatai dar užrakinti</h2><div class="notice">${esc(error.message)}</div>`);
 const rows=data||[];
 modal(`<span class="kicker">MANO ATSISKAITYMAS</span><h2>Klausimai ir atsakymai</h2><p class="muted">Ši peržiūra tapo prieinama tik tada, kai visi klasės mokiniai baigė atsiskaitymą.</p>
 ${rows.length?rows.map(q=>`<div class="assessmentQuestionDetail ${q.is_correct?'isCorrect':'isWrong'}"><div class="bankQuestionMeta"><span class="badge">${q.question_order}</span><span class="badge">${esc(qTypeLabel(q.question_type))}</span><span class="badge">${esc(q.category)}</span></div><b>${esc(q.question_text)}</b><p>Tavo atsakymas: <strong>${esc(formatStoredAnswer(q,q.student_answer))}</strong><br>Teisingas atsakymas: <strong>${esc(formatStoredAnswer(q,q.correct_answer))}</strong></p>${q.explanation?`<div class="subtle">${esc(q.explanation)}</div>`:''}</div>`).join(''):'<div class="emptyState">Klausimų nėra.</div>'}`);
}

async function openStudentTopic(topicId,c,access){
 setCurrentRestore(()=>openStudentTopic(topicId,c,access));
 const t=topicById(topicId),a=access.find(x=>x.topic_id===topicId);if(!a?.is_open)return toast('Tema užrakinta.');
 setPresenceContext(`Tema: ${t?.title||topicId}`,topicId);
 const [{data:resources},{data:assignments},{data:topicPosts},{data:practiceBlocks},{data:assessmentSetting},{data:assessmentStatusData}]=await Promise.all([
  sb.from('learning_resources').select('*').eq('class_id',c.id).eq('topic_id',topicId).order('created_at',{ascending:false}),
  sb.from('assignments').select('*').eq('class_id',c.id).eq('topic_id',topicId).eq('is_open',true).order('created_at',{ascending:false}),
  sb.from('class_posts').select('*').eq('class_id',c.id).eq('topic_id',topicId).order('created_at',{ascending:false}),
  c.grade_level==='10'?sb.from('class_question_blocks').select('id,title,description').eq('class_id',c.id).eq('parent_topic_id',topicId).eq('is_enabled',true).order('sort_order',{ascending:true}):Promise.resolve({data:[]}),
  c.grade_level==='11'?sb.from('assessment_settings').select('question_count').eq('class_id',c.id).eq('topic_id',topicId).maybeSingle():Promise.resolve({data:null}),
  c.grade_level==='11'?sb.rpc('get_my_assessment_status',{p_class_id:c.id,p_topic_id:topicId}):Promise.resolve({data:[]})
 ]);
 const assessmentStatus=assessmentStatusRow(assessmentStatusData);
 let existing=[];if(assignments?.length)({data:existing}=await sb.from('submissions').select('*').eq('student_id',me.id).in('assignment_id',assignments.map(x=>x.id)).order('submitted_at',{ascending:false}));
 $('topicContent').innerHTML=`<div class="pageHero"><button class="back" id="backStudent">← Mano klasė</button><span class="kicker">${esc(t?.code||'TEMA')}</span><h1>${esc(t?.title||topicId)}</h1>${topicDescription(t)?`<p>${esc(topicDescription(t))}</p>`:''}</div>
 <div class="contentGrid"><div class="stack">
  ${(topicPosts||[]).length?`<div class="panel classPostsPanel">
   <div class="sectionTitle"><div class="grow"><span class="kicker">IŠ MOKYTOJO</span><h2>Pranešimai ir nuorodos</h2></div><span class="badge">${(topicPosts||[]).length}</span></div>
   ${(topicPosts||[]).map(p=>`<div class="classPost"><div class="postMeta">${fmtDate(p.created_at)}</div><h3>${esc(p.title)}</h3>${p.body?`<p>${esc(p.body)}</p>`:''}${p.url?`<a class="postLink" href="${esc(p.url)}" target="_blank" rel="noopener noreferrer">Atidaryti nuorodą ↗</a>`:''}</div>`).join('')}
  </div>`:''}
  <div class="panel"><div class="sectionTitle"><div class="grow"><span class="kicker">PRAKTIKA</span><h2>Žinių treniruotė</h2></div><span class="badge ${a.practice_open?'ok':''}">${a.practice_open?'Atidaryta':'Užrakinta'}</span></div>
   ${c.grade_level==='10'?renderGrade10StudentPracticePicker(practiceBlocks||[],a.practice_open):`<p class="muted"><b>Praktikuotis gali tiek kartų, kiek nori.</b> Kiekvieną kartą sistema iš didesnio klausimų banko atsitiktinai parenka 10 klausimų ir sumaišo atsakymų variantus, todėl bandymai nėra vienodi. Po kiekvieno atsakymo gausi paaiškinimą, o rezultatas ir atlikimo laikas bus išsaugoti tavo paskyroje.</p><button class="primary" id="startPracticeTopic" ${a.practice_open?'':'disabled'}>Pradėti 10 klausimų praktiką</button>`}
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
  <div class="panel"><span class="kicker">ATSISKAITYMAS</span><h3>Temos testas</h3>${renderStudentAssessmentCard(c,a,assessmentSetting,assessmentStatus)}</div>
 </div></div>`;
 show('topic');$('backStudent').onclick=()=>appBack(()=>renderStudent());
 if(a.practice_open&&$('startPracticeTopic'))$('startPracticeTopic').onclick=()=>startQuiz(topicId,c.id,'practice',10);
 if($('practiceAllBlocks'))$('practiceAllBlocks').onchange=()=>document.querySelectorAll('[data-practice-block]').forEach(ch=>ch.checked=$('practiceAllBlocks').checked);
 if($('startGrade10Practice'))$('startGrade10Practice').onclick=()=>{
  const single=$('startGrade10Practice').dataset.singleBlock;
  const blockIds=single?[single]:[...document.querySelectorAll('[data-practice-block]:checked')].map(ch=>ch.dataset.practiceBlock);
  if(!blockIds.length)return toast('Pasirink bent vieną temą.');
  startGrade10BlockQuiz(topicId,c.id,blockIds,10);
 };
 if(a.assessment_open&&$('startAssessmentTopic'))$('startAssessmentTopic').onclick=()=>c.grade_level==='11'?startSecureAssessment(topicId,c.id):startQuiz(topicId,c.id,'assessment',CFG.assessmentQuestionCount);
 if($('studentAssessmentReview'))$('studentAssessmentReview').onclick=()=>showMyAssessmentReview(assessmentStatus.attempt_id);
 document.querySelectorAll('[data-sresource]').forEach(b=>b.onclick=()=>downloadResource(b.dataset.sresource));
 document.querySelectorAll('[data-submit]').forEach(b=>b.onclick=()=>submissionModal(b.dataset.submit,c,topicId,access));
 document.querySelectorAll('[data-own-assignment-download]').forEach(b=>b.onclick=()=>downloadSubmission(b.dataset.ownAssignmentDownload));
 document.querySelectorAll('[data-own-assignment-delete]').forEach(b=>b.onclick=()=>deleteAssignmentSubmission(b.dataset.ownAssignmentDelete,c,b.dataset.assignmentId,'student',topicId,access));
}
function submissionModal(assignmentId,c,topicId,access){
 modal(`<span class="kicker">PATEIKTI DARBĄ</span><h2>Įkelti failus</h2><form id="submissionForm" class="formGroup"><label>Failai<input class="fileInput" type="file" id="submissionFile" multiple required></label><p class="formHint">Gali pasirinkti kelis failus ir vėliau pridėti dar. Palaikomi ir vektoriniai failai: SVG, AI, EPS, CDR, DXF, WMF, EMF. Vieno failo maksimalus dydis – 25 MB.</p><button class="primary" type="submit" style="margin-top:14px">Pateikti</button></form>`);
 $('submissionForm').onsubmit=async e=>{e.preventDefault();const files=[...$('submissionFile').files];if(!files.length)return;
  if(files.some(f=>f.size>25*1024*1024))return toast('Vienas iš failų per didelis. Maksimalus dydis – 25 MB vienam failui.');
  toast(`Įkeliama: ${files.length} fail.`);
  let uploaded=0;
  for(const f of files){
   const path=`${c.id}/${assignmentId}/${me.id}/${storageFileName(f.name)}`;
   const {error:upErr}=await sb.storage.from('student-submissions').upload(path,f,storageUploadOptions(f));if(upErr){toast(`Nepavyko įkelti ${f.name}: ${upErr.message}`);continue}
   const {error}=await sb.from('submissions').insert({assignment_id:assignmentId,student_id:me.id,storage_path:path,original_name:f.name,mime_type:uploadContentType(f),size_bytes:f.size});
   if(error){await sb.storage.from('student-submissions').remove([path]);toast(`Nepavyko išsaugoti ${f.name}: ${error.message}`);continue}
   uploaded++;
  }
  if(uploaded){closeModal();toast(`Pateikta failų: ${uploaded}.`);openStudentTopic(topicId,c,access)}
 };
}



/* ================= MOKYTOJO MOKINIO VAIZDO PERŽIŪRA ================= */
async function renderTeacherStudentPreview(c,backFn=null){
 setCurrentRestore(()=>renderTeacherStudentPreview(c,backFn));
 await loadClassTopics(c.id);
 const [{data:access},{data:attempts}]=await Promise.all([
  sb.from('topic_access').select('*').eq('class_id',c.id),
  sb.from('practice_attempts').select('id').eq('class_id',c.id)
 ]);
 $('teacherContent').innerHTML=`<div class="previewBanner"><b>👁 Mokinio vaizdo peržiūra</b><span>Tai tik peržiūros režimas – mokinio rezultatai nebus keičiami.</span></div>
 <div class="pageHero"><button class="back" id="backFromPreview">← Grįžti į klasės valdymą</button><span class="kicker">PRADŽIA · ${esc(c.name)}</span><h1>Mokinio klasės vaizdas</h1><p>Taip mokinys mato tavo atidarytas temas ir pagrindines skiltis.</p></div>

 <div class="panel studentUploadPanel previewDisabled"><div class="sectionTitle"><div class="grow"><span class="kicker">MANO DARBAI</span><h2>Pateikti atliktą darbą</h2></div><button class="primary" disabled>+ Įkelti failus</button></div><p class="muted">Mokinys čia gali pateikti vieną ar kelis atliktos užduoties failus.</p></div>
 <div class="sectionHead"><span class="kicker">TEMOS</span><h2>Mokymosi turinys</h2></div>
 <div class="studentTopics">${activeClassTopics.length?activeClassTopics.map(t=>{const a=(access||[]).find(x=>x.topic_id===t.id)||{};return `<article class="topicStudentCard ${a.is_open?'':'locked'}"><span class="badge ${a.is_open?'ok':''}">${a.is_open?'ATIDARYTA':'🔒 UŽRAKINTA'}</span><div style="font-size:30px;margin-top:12px">${t.icon||'💻'}</div><h3>${esc(t.title)}</h3><p>${esc(topicMeta(t)||'Mokymosi tema')}</p><button class="${a.is_open?'primary':'ghost'}" data-preview-topic="${t.id}" ${a.is_open?'':'disabled'}>${a.is_open?'Atidaryti':'Užrakinta'}</button></article>`}).join(''):'<div class="panel emptyState"><b>Šiai klasei temų dar nėra.</b></div>'}</div>`;
 show('teacher');
 $('backFromPreview').onclick=()=>appBack(backFn||(()=>openTeacherClass(c.id)));
 document.querySelectorAll('[data-preview-topic]').forEach(b=>b.onclick=()=>navigateTo(()=>renderTeacherTopicPreview(b.dataset.previewTopic,c,access||[],backFn)));
}
async function renderTeacherTopicPreview(topicId,c,access,backFn=null){
 setCurrentRestore(()=>renderTeacherTopicPreview(topicId,c,access,backFn));
 const t=topicById(topicId),a=(access||[]).find(x=>x.topic_id===topicId);if(!a?.is_open)return toast('Tema užrakinta.');
 const [{data:resources},{data:assignments},{data:topicPosts}]=await Promise.all([
  sb.from('learning_resources').select('*').eq('class_id',c.id).eq('topic_id',topicId).order('created_at',{ascending:false}),
  sb.from('assignments').select('*').eq('class_id',c.id).eq('topic_id',topicId).eq('is_open',true).order('created_at',{ascending:false}),
  sb.from('class_posts').select('*').eq('class_id',c.id).eq('topic_id',topicId).order('created_at',{ascending:false})
 ]);
 $('teacherContent').innerHTML=`<div class="previewBanner"><b>👁 Mokinio vaizdo peržiūra</b><span>Veiksmai, kurie kurtų mokinio rezultatą ar pateiktų darbą, yra išjungti.</span></div>
 <div class="pageHero"><button class="back" id="backPreviewTopic">← Mokinio klasės vaizdas</button><span class="kicker">${esc(t?.code||'TEMA')}</span><h1>${esc(t?.title||topicId)}</h1>${topicDescription(t)?`<p>${esc(topicDescription(t))}</p>`:''}</div>
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
 $('backPreviewTopic').onclick=()=>appBack(()=>renderTeacherStudentPreview(c,backFn));
 document.querySelectorAll('[data-preview-resource]').forEach(b=>b.onclick=()=>downloadResource(b.dataset.previewResource));
}


/* ================= QUIZ + DB ================= */

function practiceTypeTargets(n){
 const multi=Math.min(2,Math.floor(n*.2)),odd=Math.min(1,Math.floor(n*.1)),matching=Math.min(1,Math.floor(n*.1));
 return {single:n-multi-odd-matching,multi,odd,matching};
}
function pickBalancedQuestions(pool,n){
 n=Math.min(Number(n)||10,pool.length);const targets=practiceTypeTargets(n),catCounts={},diffCounts={Lengvas:0,Vidutinis:0,Sunkesnis:0},chosen=[];
 const diffTargets={Lengvas:Math.round(n*.3),Vidutinis:Math.round(n*.5),Sunkesnis:n-Math.round(n*.3)-Math.round(n*.5)};
 const take=(type,count)=>{
  for(let k=0;k<count;k++){
   const remaining=pool.filter(q=>!chosen.includes(q)&&qType(q)===type);if(!remaining.length)break;
   const ranked=shuffle(remaining).sort((x,y)=>{
    const sx=(catCounts[x.category]||0)*12+Math.max(0,(diffCounts[x.difficulty]||0)-(diffTargets[x.difficulty]||0))*4;
    const sy=(catCounts[y.category]||0)*12+Math.max(0,(diffCounts[y.difficulty]||0)-(diffTargets[y.difficulty]||0))*4;
    return sx-sy;
   });
   const q=ranked[0];chosen.push(q);catCounts[q.category]=(catCounts[q.category]||0)+1;diffCounts[q.difficulty]=(diffCounts[q.difficulty]||0)+1;
  }
 };
 ['single','multi','odd','matching'].forEach(t=>take(t,targets[t]||0));
 while(chosen.length<n){const rem=shuffle(pool.filter(q=>!chosen.includes(q))).sort((x,y)=>(catCounts[x.category]||0)-(catCounts[y.category]||0));if(!rem.length)break;const q=rem[0];chosen.push(q);catCounts[q.category]=(catCounts[q.category]||0)+1;}
 return shuffle(chosen);
}

function assessmentDraftStorageKey(attemptId){return `informatika_assessment_draft_${attemptId}`}
function assessmentAnswerHasValue(q,answer){
 const type=qType(q);
 if(answer===null||answer===undefined)return false;
 if(type==='multi')return Array.isArray(answer)&&answer.length>0;
 if(type==='matching')return answer&&typeof answer==='object'&&Object.keys(answer).length>0;
 return Number.isFinite(Number(answer));
}
function assessmentAnswerComplete(q,answer){
 const type=qType(q);
 if(!assessmentAnswerHasValue(q,answer))return false;
 if(type==='matching'){
  const left=q.options?.left||[];
  return left.every((_x,i)=>answer?.[String(i)]!==undefined&&answer?.[String(i)]!==null&&answer?.[String(i)]!=='');
 }
 return true;
}
function saveAssessmentDraftLocal(){
 if(quiz.mode!=='assessment-secure'||!quiz.attemptId)return;
 try{localStorage.setItem(assessmentDraftStorageKey(quiz.attemptId),JSON.stringify({answers:quiz.answers,updatedAt:Date.now()}))}catch(_e){}
}
function loadAssessmentDraftLocal(attemptId){
 try{const raw=localStorage.getItem(assessmentDraftStorageKey(attemptId));if(!raw)return null;const parsed=JSON.parse(raw);return Array.isArray(parsed?.answers)?parsed.answers:null}catch(_e){return null}
}
function clearAssessmentDraftLocal(attemptId){try{localStorage.removeItem(assessmentDraftStorageKey(attemptId))}catch(_e){}}
function setAssessmentSaveStatus(text,state=''){
 const el=$('questionSaveStatus');if(!el)return;el.textContent=text||'';el.className=`saveStatus ${state}`.trim();
}
function queueAssessmentAnswerSave(q,answer){
 if(quiz.mode!=='assessment-secure'||!quiz.attemptId)return;
 const type=qType(q),normalized=normalizeAnswer(answer,type),snapshot=JSON.stringify(normalized),attemptId=quiz.attemptId;
 assessmentDirtyQuestionIds.add(q.id);saveAssessmentDraftLocal();
 if(quiz.items[quiz.index]?.id===q.id)setAssessmentSaveStatus('Išsaugoma…','saving');
 assessmentSaveQueue=assessmentSaveQueue.catch(()=>{}).then(async()=>{
  const {error}=await sb.rpc('submit_assessment_answer',{p_attempt_id:attemptId,p_attempt_question_id:q.id,p_answer:normalized});
  if(error)throw error;
  const qi=quiz.items.findIndex(x=>x.id===q.id);
  if(qi>=0&&JSON.stringify(normalizeAnswer(quiz.answers[qi],type))===snapshot)assessmentDirtyQuestionIds.delete(q.id);
  if(quiz.mode==='assessment-secure'&&quiz.items[quiz.index]?.id===q.id)setAssessmentSaveStatus('Išsaugota','saved');
 }).catch(err=>{if(quiz.mode==='assessment-secure'&&quiz.items[quiz.index]?.id===q.id)setAssessmentSaveStatus('Išsaugota šiame įrenginyje','local');console.warn('Assessment autosave:',err)});
}
async function flushAssessmentSaves(){
 await assessmentSaveQueue.catch(()=>{});
 const dirty=[...assessmentDirtyQuestionIds];
 for(const id of dirty){
  const qi=quiz.items.findIndex(q=>q.id===id);if(qi<0)continue;
  const q=quiz.items[qi],answer=quiz.answers[qi];
  if(!assessmentAnswerHasValue(q,answer)){assessmentDirtyQuestionIds.delete(id);continue}
  const {error}=await sb.rpc('submit_assessment_answer',{p_attempt_id:quiz.attemptId,p_attempt_question_id:q.id,p_answer:normalizeAnswer(answer,qType(q))});
  if(error)throw error;assessmentDirtyQuestionIds.delete(id);
 }
 saveAssessmentDraftLocal();
}
function renderAssessmentQuestionNav(){
 const nav=$('assessmentQuestionNav');if(!nav)return;
 if(quiz.mode!=='assessment-secure'){nav.classList.add('hidden');nav.innerHTML='';return}
 nav.classList.remove('hidden');
 nav.innerHTML=quiz.items.map((q,i)=>{const complete=assessmentAnswerComplete(q,quiz.answers[i]),has=assessmentAnswerHasValue(q,quiz.answers[i]);return `<button type="button" class="questionNavBtn ${i===quiz.index?'current':''} ${complete?'answered':has?'partial':''}" data-qnav="${i}" title="${complete?'Atsakyta':has?'Atsakymas nebaigtas':'Neatsakyta'}">${i+1}</button>`}).join('');
 nav.querySelectorAll('[data-qnav]').forEach(b=>b.onclick=()=>{quiz.index=Number(b.dataset.qnav);renderQ()});
}

function prepareClientQuestion(q){
 const type=qType(q),out={...q,type};
 if(type==='single'||type==='odd'||type==='multi')out.shown=shuffle((q.options||[]).map((text,original)=>({text,original})));
 return out;
}
function renderQuestionInput(q){
 const type=qType(q),isAssessment=quiz.mode==='assessment-secure',saved=quiz.answers[quiz.index];
 if(type==='single'||type==='odd'){
  $('answers').innerHTML=(q.shown||[]).map((o,i)=>`<button class="answer ${isAssessment&&Number(saved)===Number(o.original)?'selected':''}" data-v="${o.original}"><b>${String.fromCharCode(65+i)}.</b> ${esc(o.text)}</button>`).join('');
  document.querySelectorAll('.answer').forEach(b=>b.onclick=()=>{const value=Number(b.dataset.v);if(isAssessment){quiz.answers[quiz.index]=value;document.querySelectorAll('.answer').forEach(x=>x.classList.toggle('selected',Number(x.dataset.v)===value));renderAssessmentQuestionNav();queueAssessmentAnswerSave(q,value);return}submitQuestionAnswer(value)});return;
 }
 if(type==='multi'){
  const selected=new Set(Array.isArray(saved)?saved.map(Number):[]);
  $('answers').innerHTML=`<div class="multiHint">Pažymėk visus teisingus atsakymus.</div>${(q.shown||[]).map((o,i)=>`<label class="multiAnswer ${isAssessment&&selected.has(Number(o.original))?'selected':''}"><input type="checkbox" data-multi-v="${o.original}" ${isAssessment&&selected.has(Number(o.original))?'checked':''}><span><b>${String.fromCharCode(65+i)}.</b> ${esc(o.text)}</span></label>`).join('')}${isAssessment?'':'<button class="primary confirmAnswerBtn" id="confirmMultiAnswer">Patvirtinti atsakymą</button>'}`;
  if(isAssessment){document.querySelectorAll('[data-multi-v]').forEach(ch=>ch.onchange=()=>{const vals=[...document.querySelectorAll('[data-multi-v]:checked')].map(x=>Number(x.dataset.multiV)).sort((a,b)=>a-b);quiz.answers[quiz.index]=vals;document.querySelectorAll('.multiAnswer').forEach(l=>l.classList.toggle('selected',l.querySelector('input')?.checked===true));renderAssessmentQuestionNav();queueAssessmentAnswerSave(q,vals)})}
  else $('confirmMultiAnswer').onclick=()=>{const vals=[...document.querySelectorAll('[data-multi-v]:checked')].map(x=>Number(x.dataset.multiV)).sort((a,b)=>a-b);if(!vals.length)return toast('Pasirink bent vieną atsakymą.');submitQuestionAnswer(vals)};return;
 }
 if(type==='matching'){
  const left=q.options?.left||[],right=q.options?.right||[],existing=saved&&typeof saved==='object'?saved:{};
  $('answers').innerHTML=`<div class="multiHint">Kiekvienai sąvokai parink tinkamą porą.</div><div class="matchingGrid">${left.map((l,i)=>`<label class="matchingRow ${isAssessment&&existing[String(i)]!==undefined?'selected':''}"><span>${esc(l)}</span><select data-match="${i}"><option value="">— pasirink —</option>${right.map((r,j)=>`<option value="${j}" ${isAssessment&&Number(existing[String(i)])===j?'selected':''}>${esc(r)}</option>`).join('')}</select></label>`).join('')}</div>${isAssessment?'':'<button class="primary confirmAnswerBtn" id="confirmMatchingAnswer">Patvirtinti atsakymą</button>'}`;
  if(isAssessment){document.querySelectorAll('[data-match]').forEach(sel=>sel.onchange=()=>{const ans={};document.querySelectorAll('[data-match]').forEach(x=>{if(x.value!=='')ans[x.dataset.match]=Number(x.value)});quiz.answers[quiz.index]=ans;document.querySelectorAll('.matchingRow').forEach(l=>l.classList.toggle('selected',l.querySelector('select')?.value!==''));renderAssessmentQuestionNav();queueAssessmentAnswerSave(q,ans)})}
  else $('confirmMatchingAnswer').onclick=()=>{const ans={};let ok=true;document.querySelectorAll('[data-match]').forEach(s=>{if(s.value==='')ok=false;else ans[s.dataset.match]=Number(s.value)});if(!ok)return toast('Sujunk visas poras.');submitQuestionAnswer(ans)};
 }
}
function markPracticeAnswer(q,answer,ok){
 const type=qType(q);
 if(type==='single'||type==='odd')document.querySelectorAll('.answer').forEach(b=>{const x=Number(b.dataset.v);b.disabled=true;if(x===Number(q.correct))b.classList.add('correct');if(x===Number(answer)&&!ok)b.classList.add('wrong')});
 else document.querySelectorAll('#answers input,#answers select,#answers button').forEach(el=>el.disabled=true);
}
function formatClientAnswer(q,answer){
 if(answer===null||answer===undefined)return 'neatsakyta';const type=qType(q),opts=q.options;
 if(type==='single'||type==='odd')return opts?.[Number(answer)]??String(answer);
 if(type==='multi')return (Array.isArray(answer)?answer:[]).map(i=>opts?.[Number(i)]??String(i)).join('; ');
 if(type==='matching'){const left=opts?.left||[],right=opts?.right||[];return left.map((l,i)=>`${l} → ${right[Number(answer?.[String(i)])]??'—'}`).join(' | ')}
 return String(answer);
}

async function startGrade10BlockQuiz(topicId,classId,blockIds,count){
 setPresenceContext(`Žinių treniruotė: ${topicById(topicId)?.title||topicId}`,topicId);
 const {data,error}=await sb.rpc('start_grade10_practice',{p_class_id:classId,p_parent_topic_id:topicId,p_block_ids:blockIds,p_count:Number(count)||10});
 if(error)return toast(error.message);const rows=data||[];if(!rows.length)return toast('Pasirinktuose blokuose klausimų nėra.');
 quiz={topicId,classId,mode:'practice-g10',blockIds:[...blockIds],items:rows.map(r=>prepareClientQuestion({id:r.attempt_question_id,question:r.question_text,options:Array.isArray(r.options)?r.options:[],correct:null,explanation:'',category:'',difficulty:'',type:'single'})),index:0,answers:Array(rows.length).fill(null),attemptId:rows[0].attempt_id,startMs:Date.now(),last:null,completed:false};
 $('quizMode').textContent='PRAKTIKA';$('quizTitle').textContent=topicById(topicId).title;show('quiz');renderQ();
}

let assessmentStartPending=false;
async function startSecureAssessment(topicId,classId){
 setPresenceContext(`Atsiskaitymas: ${topicById(topicId)?.title||topicId}`,topicId);
 if(assessmentStartPending)return;assessmentStartPending=true;
 try{
  const {data,error}=await sb.rpc('start_assessment',{p_class_id:classId,p_topic_id:topicId});if(error)return toast(error.message);
  const rows=data||[];if(!rows.length)return toast('Atsiskaitymo klausimų bankas tuščias.');
  const {data:sessionData}=await sb.auth.getSession();assessmentAccessToken=sessionData?.session?.access_token||null;
  const items=rows.map(r=>prepareClientQuestion({id:r.attempt_question_id,question:r.question_text,options:r.options,correct:null,explanation:'',category:r.category||'',difficulty:r.difficulty||'',type:r.question_type||'single'}));
  const serverAnswers=rows.map(r=>r.student_answer===null||r.student_answer===undefined?null:r.student_answer),localAnswers=loadAssessmentDraftLocal(rows[0].attempt_id);
  const answers=serverAnswers.map((a,i)=>{const local=Array.isArray(localAnswers)?localAnswers[i]:null;return assessmentAnswerHasValue(items[i],local)?local:a});
  assessmentDirtyQuestionIds=new Set();assessmentSaveQueue=Promise.resolve();
  quiz={topicId,classId,mode:'assessment-secure',items,index:0,answers,attemptId:rows[0].attempt_id,startMs:Date.now(),last:null,completed:false};
  const firstIncomplete=items.findIndex((q,i)=>!assessmentAnswerComplete(q,answers[i]));quiz.index=firstIncomplete>=0?firstIncomplete:0;saveAssessmentDraftLocal();
  if(Array.isArray(localAnswers))items.forEach((q,i)=>{if(assessmentAnswerHasValue(q,localAnswers[i])&&!answerEquals(localAnswers[i],serverAnswers[i],qType(q)))queueAssessmentAnswerSave(q,localAnswers[i])});
  $('quizMode').textContent='ATSISKAITYMAS';$('quizTitle').textContent=topicById(topicId).title;show('quiz');renderQ();
 }finally{assessmentStartPending=false}
}

async function startQuiz(topicId,classId,mode,count){
 setPresenceContext(`Žinių treniruotė: ${topicById(topicId)?.title||topicId}`,topicId);
 if(mode==='assessment')return toast('Šiam atsiskaitymui naudok saugų atsiskaitymo režimą.');
 const pool=PRACTICE.filter(q=>q.topic===topicId);if(!pool.length)return toast('Klausimų bankas tuščias.');
 const n=Math.min(Number(count)||10,pool.length);const selected=pickBalancedQuestions(pool,n);
 const {data:attempt,error}=await sb.from('practice_attempts').insert({student_id:me.id,class_id:classId,topic_id:topicId,mode:'practice',total_questions:n}).select('id,started_at').single();if(error)return toast(error.message);
 quiz={topicId,classId,mode:'practice',items:selected.map(prepareClientQuestion),index:0,answers:Array(n).fill(null),attemptId:attempt.id,startMs:Date.now(),last:null,completed:false};
 $('quizMode').textContent='PRAKTIKA';$('quizTitle').textContent=topicById(topicId).title;show('quiz');renderQ();
}
function renderQ(){
 const q=quiz.items[quiz.index];$('quizCounter').textContent=`${quiz.index+1}/${quiz.items.length}`;$('progressBar').style.width=`${(quiz.index+1)/quiz.items.length*100}%`;
 const live=quiz.items.slice(0,quiz.index).reduce((n,item,i)=>n+(item.correct!=null&&answerEquals(quiz.answers[i],item.correct,qType(item))?1:0),0);$('quizScoreLive').textContent=String(quiz.mode).startsWith('practice')?`Teisingai: ${live}`:'';
 $('questionCategory').textContent=[q.category,qTypeLabel(qType(q))].filter(Boolean).join(' · ');$('questionDifficulty').textContent=q.difficulty||'';$('questionText').textContent=q.question;$('feedback').classList.add('hidden');renderQuestionInput(q);
 const isAssessment=quiz.mode==='assessment-secure';$('quitQuiz').textContent=isAssessment?'Išeiti':'Baigti';$('prevQuestion').classList.toggle('hidden',!isAssessment||quiz.index===0);
 if(isAssessment){$('nextQuestion').textContent=quiz.index===quiz.items.length-1?'Pateikti atsiskaitymą':'Kitas klausimas →';$('nextQuestion').classList.remove('hidden');setAssessmentSaveStatus(assessmentAnswerHasValue(q,quiz.answers[quiz.index])?'Išsaugota':'Atsakymai išsaugomi automatiškai',assessmentAnswerHasValue(q,quiz.answers[quiz.index])?'saved':'')}
 else{$('nextQuestion').classList.add('hidden');setAssessmentSaveStatus('')}
 renderAssessmentQuestionNav();
}
async function submitQuestionAnswer(answer){
 if(quiz.answers[quiz.index]!==null)return;const q=quiz.items[quiz.index],type=qType(q);
 if(quiz.mode==='assessment-secure'){
  quiz.answers[quiz.index]=answer;queueAssessmentAnswerSave(q,answer);renderQ();return;
 }
 if(quiz.mode==='practice-g10'){
  document.querySelectorAll('#answers button,#answers input,#answers select').forEach(el=>el.disabled=true);
  const {data,error}=await sb.rpc('check_grade10_practice_answer',{p_attempt_id:quiz.attemptId,p_attempt_question_id:q.id,p_selected_index:Number(answer)});if(error){document.querySelectorAll('#answers button').forEach(el=>el.disabled=false);return toast(error.message)}
  const r=Array.isArray(data)?data[0]:data;q.correct=Number(r.correct_index);q.explanation=r.explanation||'';const ok=r.is_correct===true;quiz.answers[quiz.index]=Number(answer);markPracticeAnswer(q,Number(answer),ok);$('feedback').className='feedback';$('feedback').innerHTML=`<b>${ok?'✓ Teisingai':'✕ Neteisingai'}</b><br>${esc(q.explanation)}`;$('nextQuestion').textContent=quiz.index===quiz.items.length-1?'Baigti bandymą':'Kitas klausimas →';$('nextQuestion').classList.remove('hidden');return;
 }
 const ok=answerEquals(answer,q.correct,type);quiz.answers[quiz.index]=answer;markPracticeAnswer(q,answer,ok);$('feedback').className='feedback';$('feedback').innerHTML=`<b>${ok?'✓ Teisingai':'✕ Neteisingai'}</b><br>${esc(q.explanation)}`;$('nextQuestion').textContent=quiz.index===quiz.items.length-1?'Baigti bandymą':'Kitas klausimas →';$('nextQuestion').classList.remove('hidden');
 await sb.from('attempt_answers').insert({attempt_id:quiz.attemptId,question_id:q.id,question_type:type,selected_index:(type==='single'||type==='odd')?Number(answer):null,correct_index:(type==='single'||type==='odd')?Number(q.correct):null,selected_answer:normalizeAnswer(answer,type),correct_answer:normalizeAnswer(q.correct,type),is_correct:ok});
}
$('prevQuestion').onclick=()=>{if(quiz.mode==='assessment-secure'&&quiz.index>0){quiz.index--;renderQ()}};
$('nextQuestion').onclick=async()=>{
 if(quiz.mode==='assessment-secure'){
  if(quiz.index<quiz.items.length-1){quiz.index++;renderQ();return}
  const unanswered=quiz.items.reduce((n,q,i)=>n+(assessmentAnswerComplete(q,quiz.answers[i])?0:1),0);
  const msg=unanswered?`Liko neatsakytų arba nebaigtų klausimų: ${unanswered}. Ar tikrai pateikti atsiskaitymą? Po pateikimo atsakymų keisti nebegalėsi.`:'Ar tikrai pateikti atsiskaitymą? Po pateikimo atsakymų keisti nebegalėsi.';
  if(!confirm(msg))return;
  try{setAssessmentSaveStatus('Išsaugomi paskutiniai pakeitimai…','saving');await flushAssessmentSaves()}catch(e){toast('Nepavyko išsaugoti paskutinių atsakymų. Patikrink interneto ryšį ir bandyk dar kartą.');return}
  return finishQuiz();
 }
 if(quiz.index===quiz.items.length-1)finishQuiz();else{quiz.index++;renderQ()}
};
$('quitQuiz').onclick=async()=>{
 if(quiz.mode==='assessment-secure'){
  if(!confirm('Išeiti iš atsiskaitymo? Tavo pasirinkti atsakymai išsaugomi automatiškai ir vėliau galėsi tęsti tą patį bandymą. Išėjimas bus užfiksuotas.'))return;
  try{await flushAssessmentSaves()}catch(_e){}
  await logAssessmentExit('quit');
  quiz={topicId:null,classId:null,mode:null,items:[],index:0,answers:[],attemptId:null,startMs:0,last:null,completed:false};
  return renderStudent();
 }
 if(!confirm('Baigti bandymą nebaigus?'))return;renderStudent();
};
async function finishQuiz(){
 let total=quiz.items.length,correct=quiz.items.reduce((n,q,i)=>n+(q.correct!=null&&answerEquals(quiz.answers[i],q.correct,qType(q))?1:0),0),pct=total?Math.round(correct/total*100):0,seconds=Math.max(1,Math.round((Date.now()-quiz.startMs)/1000)),pass=quiz.mode==='assessment-secure'?CFG.assessmentPassPercent:CFG.practicePassPercent,focusEvents=0,resultsReleased=true,completedStudents=0,totalStudents=0;
 if(quiz.mode==='assessment-secure'){
  try{await flushAssessmentSaves()}catch(e){return toast('Nepavyko išsaugoti paskutinių atsakymų. Atsiskaitymas dar nepateiktas.')}
  const {data,error}=await sb.rpc('finish_assessment',{p_attempt_id:quiz.attemptId});if(error)return toast(error.message);
  const r=Array.isArray(data)?data[0]:data;
  if(r){
   total=Number(r.total_questions)||total;
   seconds=Number(r.duration_seconds)||seconds;
   focusEvents=Number(r.focus_events)||0;
   resultsReleased=r.results_released===true;
   completedStudents=Number(r.completed_students)||0;
   totalStudents=Number(r.total_students)||0;
   if(resultsReleased){correct=Number(r.correct_answers)||0;pct=Number(r.score_percent)||0}
  }
  quiz.completed=true;
  clearAssessmentDraftLocal(quiz.attemptId);
 }else if(quiz.mode==='practice-g10'){
  const {data,error}=await sb.rpc('finish_grade10_practice',{p_attempt_id:quiz.attemptId});if(error)return toast(error.message);const r=Array.isArray(data)?data[0]:data;if(r){total=Number(r.total_questions)||total;correct=Number(r.correct_answers)||0;pct=Number(r.score_percent)||0;seconds=Number(r.duration_seconds)||seconds}
 }else await sb.from('practice_attempts').update({completed_at:new Date().toISOString(),duration_seconds:seconds,correct_answers:correct,score_percent:pct}).eq('id',quiz.attemptId);

 setPresenceContext(`Rezultatų peržiūra: ${topicById(quiz.topicId)?.title||quiz.topicId}`,quiz.topicId);
 quiz.last={...quiz,correct,total,pct,seconds,pass,focusEvents,resultsReleased,completedStudents,totalStudents};
 $('errorsReview').classList.add('hidden');
 $('retryQuiz').classList.toggle('hidden',quiz.mode==='assessment-secure');

 if(quiz.mode==='assessment-secure'&&!resultsReleased){
  $('resultPercent').textContent='—';$('scoreCircle').style.setProperty('--score','0%');
  $('correctCount').textContent='—';$('wrongCount').textContent='—';$('resultGoal').textContent='—';
  $('resultTitle').textContent='Atsiskaitymas pateiktas';
  $('resultSubtitle').textContent=`Rezultatas bus paskelbtas vėliau. Tavo trukmė: ${fmtDurationDetailed(seconds)}. Užfiksuoti išėjimo / fokuso įvykiai: ${focusEvents}.`;
  $('reviewErrors').classList.add('hidden');
  show('results');return;
 }

 $('resultPercent').textContent=pct+'%';$('scoreCircle').style.setProperty('--score',pct+'%');$('correctCount').textContent=correct;$('wrongCount').textContent=total-correct;$('resultGoal').textContent=pass+'%';$('resultTitle').textContent=pct>=pass?(pct===100?'Puiku – 100%!':'Tikslas pasiektas!'):'Dar pasipraktikuok';
 $('resultSubtitle').textContent=quiz.mode==='assessment-secure'?`Atsiskaitymo trukmė: ${fmtDurationDetailed(seconds)}. Užfiksuoti išėjimo / fokuso įvykiai: ${focusEvents}.`:`Bandymo trukmė: ${fmtDurationDetailed(seconds)}.`;
 if(quiz.mode==='assessment-secure'){
  $('reviewErrors').textContent='Peržiūrėti savo atsakymus';
  $('reviewErrors').classList.remove('hidden');
 }else{
  $('reviewErrors').textContent='Peržiūrėti klaidas';
  $('reviewErrors').classList.remove('hidden');
 }
 show('results');
}
$('retryQuiz').onclick=()=>{const r=quiz.last;if(!r||r.mode==='assessment-secure')return;if(r.mode==='practice-g10')return startGrade10BlockQuiz(r.topicId,r.classId,r.blockIds||[],r.items.length);startQuiz(r.topicId,r.classId,'practice',r.items.length)};
$('reviewErrors').onclick=()=>{const r=quiz.last;if(!r)return;if(r.mode==='assessment-secure'){if(r.resultsReleased)return showMyAssessmentReview(r.attemptId);return}const bad=r.items.map((q,i)=>({q,a:r.answers[i]})).filter(x=>!answerEquals(x.a,x.q.correct,qType(x.q)));$('errorsReview').classList.remove('hidden');$('errorsReview').innerHTML=bad.length?`<span class="kicker">PERŽIŪRA</span><h2>Klaidos ir paaiškinimai</h2>`+bad.map((x,i)=>`<div class="errorItem"><b>${i+1}. ${esc(x.q.question)}</b><p>Tavo atsakymas: <b>${esc(formatClientAnswer(x.q,x.a))}</b><br>Teisingas: <b>${esc(formatClientAnswer(x.q,x.q.correct))}</b><br>${esc(x.q.explanation)}</p></div>`).join(''):`<h2>Be klaidų 🎉</h2>`};

async function logAssessmentExit(type){
 if(quiz.mode!=='assessment-secure'||!quiz.attemptId||quiz.completed)return;try{await sb.rpc('log_assessment_focus_event',{p_attempt_id:quiz.attemptId,p_event_type:type})}catch(_e){}
}
function logAssessmentExitKeepalive(type){
 if(quiz.mode!=='assessment-secure'||!quiz.attemptId||quiz.completed||!assessmentAccessToken||!configured)return;
 try{fetch(`${SETTINGS.url}/rest/v1/rpc/log_assessment_focus_event`,{method:'POST',headers:{apikey:SETTINGS.publishableKey,Authorization:`Bearer ${assessmentAccessToken}`,'Content-Type':'application/json'},body:JSON.stringify({p_attempt_id:quiz.attemptId,p_event_type:type}),keepalive:true})}catch(_e){}
}
document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='hidden')logAssessmentExit('hidden')});
window.addEventListener('blur',()=>{if(assessmentBlurTimer)clearTimeout(assessmentBlurTimer);assessmentBlurTimer=setTimeout(()=>{if(document.visibilityState==='visible')logAssessmentExit('blur')},250)});
window.addEventListener('pagehide',()=>logAssessmentExitKeepalive('pagehide'));


/* ================= PROFILE ================= */
function renderProfile(){
 stopTeacherPresenceRefresh();
 if(profile?.role==='student')setPresenceContext('Paskyra',null);
 setCurrentRestore(()=>renderProfile());
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

 if(session){
  if(idleSessionExpired()){
   clearIdleClock();
   await sb.auth.signOut();
   show('auth');
   authMsg('Dėl saugumo ankstesnė sesija užbaigta po 30 min. neaktyvumo.');
  }else{
   if(!readIdleActivity())resetIdleClock();
   me=session.user;
   await loadProfile();
   setHeader();
   route('dashboard');
  }
 }else{
  clearIdleClock();
  show('auth');
 }

 sb.auth.onAuthStateChange(async(event,session)=>{
  if(session&&!me){
   if(event==='SIGNED_IN')resetIdleClock();
   else if(idleSessionExpired()){
    await forceIdleLogout('Dėl saugumo ankstesnė sesija užbaigta po 30 min. neaktyvumo.');
    return;
   }else if(!readIdleActivity())resetIdleClock();

   me=session.user;
   await loadProfile();
   setHeader();
   route('dashboard');
  }
  if(!session){
   stopTeacherPresenceRefresh();
   stopIdleLogout();
   me=null;profile=null;
   setHeader();
   show('auth');
  }
 });
}
boot();
