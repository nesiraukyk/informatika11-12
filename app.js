
const SETTINGS=window.SUPABASE_SETTINGS||{};
const configured=SETTINGS.url && SETTINGS.publishableKey &&
 !SETTINGS.url.includes('PAKEISKITE_') && !SETTINGS.publishableKey.includes('PAKEISKITE_');
const sb=configured?window.supabase.createClient(SETTINGS.url,SETTINGS.publishableKey):null;
const CFG=window.SITE_CONFIG,PRACTICE=window.PRACTICE_QUESTIONS||[],ASSESSMENT=window.ASSESSMENT_QUESTIONS||[],VBE_CRYPTO=window.VBE_CRYPTO_PRACTICE_QUESTIONS||[];
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
const questionChoices=q=>Array.isArray(q?.options)?q.options:(Array.isArray(q?.options?.choices)?q.options.choices:[]);
const normalizeAnswer=(v,type)=>{
 if(type==='multi')return [...(Array.isArray(v)?v:[])].map(Number).sort((x,y)=>x-y);
 if((type==='matching'||type==='sequence')&&v&&typeof v==='object'&&!Array.isArray(v)){const o={};Object.keys(v).sort((a,b)=>Number(a)-Number(b)).forEach(k=>o[k]=Number(v[k]));return o}
 if(type==='short')return v===null||v===undefined?null:String(v).trim();
 return v===null||v===undefined?null:Number(v)
};
const answerEquals=(a,b,type)=>JSON.stringify(normalizeAnswer(a,type))===JSON.stringify(normalizeAnswer(b,type));
const qTypeLabel=t=>({single:'Vienas atsakymas',multi:'Keli atsakymai',odd:'Kuris netinka',matching:'Sujungimas',sequence:'Eiliškumas',short:'Trumpas atsakymas'})[t]||'Klausimas';
function renderQuestionVisual(q){
 const v=q?.options?.visual;if(!v||!v.kind)return '';
 const caption=v.caption?`<div class="questionVisualCaption">${esc(v.caption)}</div>`:'';
 if(v.kind==='bezier-labelled')return `<div class="questionVisual">${caption}<svg viewBox="0 0 620 210" role="img" aria-label="Bezjė kreivės schema"><path d="M115 150 C215 25 390 25 500 150" fill="none" stroke="currentColor" stroke-width="7"/><line x1="115" y1="150" x2="205" y2="55" stroke="currentColor" stroke-width="2" stroke-dasharray="7 7" opacity=".5"/><circle cx="115" cy="150" r="12" class="visualAccent"/><circle cx="205" cy="55" r="10" class="visualHandle"/><text x="88" y="188">A</text><text x="194" y="38">B</text><text x="315" y="64">C</text><text x="153" y="104">D</text></svg></div>`;
 if(v.kind==='vector-raster-zoom')return `<div class="questionVisual">${caption}<div class="visualCompare"><div><b>A</b><svg viewBox="0 0 180 130"><circle cx="90" cy="65" r="44" class="visualSmooth"/></svg><span>Padidinta</span></div><div><b>B</b><div class="pixelCircle" aria-label="pikseliuotas apskritimas"></div><span>Padidinta</span></div></div></div>`;
 if(v.kind==='composition-space')return `<div class="questionVisual">${caption}<div class="compositionCompare"><div><b>A</b><div class="crowdedMock"><span></span><span></span><span></span><span></span><span></span><span></span></div></div><div><b>B</b><div class="balancedMock"><span class="heroBox"></span><span></span><span></span></div></div></div></div>`;
 if(v.kind==='gradient-samples')return `<div class="questionVisual">${caption}<div class="gradientSamples"><div><b>A</b><span class="solidSample"></span></div><div><b>B</b><span class="gradientSample"></span></div><div><b>C</b><span class="outlineSample"></span></div><div><b>D</b><span class="transparentSample"></span></div></div></div>`;
 return '';
}
const fmtDate=d=>d?new Date(d).toLocaleString('lt-LT'):'–';
const fmtDateOnly=d=>d?new Date(d).toLocaleDateString('lt-LT',{year:'numeric',month:'2-digit',day:'2-digit'}):'–';

function renderStudentTeacherUpdates(posts=[]){
 if(!posts?.length)return '';
 return `<section class="teacherUpdatesSection">
  <div class="teacherUpdatesHeader">
   <div class="grow"><span class="kicker">IŠ MOKYTOJO</span><h2>Mokytojo pastabos</h2><p>Papildomi komentarai, priminimai ir nuorodos šiai temai.</p></div>
   <span class="teacherUpdatesCount">${posts.length}</span>
  </div>
  <div class="teacherUpdatesList">
   ${posts.map(p=>{
    const hasLink=!!p.url,hasBody=!!String(p.body||'').trim();
    const kind=hasLink?(hasBody?'NUORODA + PASTABA':'NUORODA'):'PASTABA';
    const icon=hasLink?'↗':'i';
    return `<article class="teacherUpdateItem">
     <div class="teacherUpdateIcon ${hasLink?'link':''}">${icon}</div>
     <div class="teacherUpdateContent">
      <div class="teacherUpdateMeta"><span>${kind}</span><time>${fmtDate(p.created_at)}</time></div>
      <h3>${esc(p.title)}</h3>
      ${hasBody?`<p>${esc(p.body)}</p>`:''}
      ${hasLink?`<a class="teacherUpdateLink" href="${esc(p.url)}" target="_blank" rel="noopener noreferrer">Atidaryti nuorodą <span>↗</span></a>`:''}
     </div>
    </article>`;
   }).join('')}
  </div>
 </section>`;
}

let me=null,profile=null,currentClass=null,activitySessionId=null,heartbeatTimer=null;
let presenceActivity='Platforma',presenceTopicId=null,presenceClassId=null,teacherPresenceTimer=null;
let quiz={topicId:null,classId:null,mode:null,items:[],index:0,answers:[],attemptId:null,startMs:0,last:null,completed:false};
let assessmentAccessToken=null,assessmentBlurTimer=null;
let assessmentSaveQueue=Promise.resolve(),assessmentDirtyQuestionIds=new Set();
let assessmentPracticalView={attemptId:null,topicId:null,classId:null};

let uiBackStack=[],restoringBack=false,historyGuardReady=false,currentRestore=null;
let currentNavView=null, initialViewRestored=false;
let assessmentTeacherGradesByAttempt={};

const IDLE_LOGOUT_MS=30*60*1000;
const IDLE_WARNING_MS=25*60*1000;
const IDLE_STORAGE_KEY='informatika_last_activity_at';
const REMEMBER_EMAIL_KEY='informatika_remember_email';
let passwordRecoveryMode=false;
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
  sessionStorage.removeItem(practiceProgressKey());sessionStorage.removeItem(resultsProgressKey());
  me=null;profile=null;currentClass=null;uiBackStack=[];currentRestore=null;currentNavView=null;initialViewRestored=false;historyGuardReady=false;history.replaceState(null,'',location.pathname+location.search);
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

// Navigacija yra URL ir naršyklės istorijoje, ne vien JavaScript atmintyje.
// Po F5 atkuriamas ankstesnis puslapis; mygtukas „Atgal“ grįžta į tikrą ankstesnį įrašą.
function navHash(view){
 if(!view||!view.kind)return '';
 const params=new URLSearchParams();
 params.set('view',view.kind);
 if(view.classId)params.set('class',view.classId);
 if(view.topicId)params.set('topic',view.topicId);
 if(view.panel)params.set('panel',view.panel);
 if(view.attemptId)params.set('attempt',view.attemptId);
 return '#'+params.toString();
}
function viewFromHash(){
 const hash=String(location.hash||'').replace(/^#/,'');
 const p=new URLSearchParams(hash);
 const kind=p.get('view');
 if(!kind)return null;
 const allowed=['teacher','teacher-class','teacher-posts','teacher-question-bank','teacher-grade10-bank','teacher-preview','teacher-topic-preview','student','student-topic','student-results','achievements','classmates','profile','assessment-quiz','assessment-practical','practice-quiz','results','crypto-mission','crypto-teacher','cyberlab','cyberlab-preview'];
 if(!allowed.includes(kind))return null;
 return {kind,classId:p.get('class')||null,topicId:p.get('topic')||null,panel:p.get('panel')||null,attemptId:p.get('attempt')||null};
}
function savedNavView(){
 if(history.state?.infApp&&history.state.infView)return history.state.infView;
 return viewFromHash();
}
function setCurrentRestore(fn,view=null){
 currentRestore=typeof fn==='function'?fn:null;
 if(!view||!me||passwordRecoveryMode)return;
 currentNavView=view;
 ensureAppHistoryGuard();
 const old=history.state||{};
 history.replaceState({...old,infApp:true,infView:view,infStep:Number(old.infStep||0)},'',location.pathname+location.search+navHash(view));
}
function ensureAppHistoryGuard(){
 if(historyGuardReady)return;
 historyGuardReady=true;
 if(!history.state?.infApp)history.replaceState({infApp:true,infStep:0,infView:viewFromHash()},'',location.href);
}
function navigateTo(nextFn){
 if(restoringBack||!me)return nextFn();
 ensureAppHistoryGuard();
 const step=Number(history.state?.infStep||0)+1;
 history.pushState({infApp:true,infStep:step,infView:currentNavView},'',location.href);
 return nextFn();
}
function appBack(fallback){
 if(history.state?.infApp&&Number(history.state.infStep||0)>0)return history.back();
 if(typeof fallback==='function')return fallback();
}
async function restoreNavigation(view){
 if(!view||!profile)return renderDashboard();
 const isTeacher=['teacher','admin'].includes(profile.role);
 const getTeacherClass=async()=>{
  if(!isTeacher||!view.classId)return null;
  const {data:c,error}=await sb.from('classes').select('*').eq('id',view.classId).single();
  if(error||!c)return null;
  await loadClassTopics(c.id);
  return c;
 };
 if(view.kind==='teacher')return isTeacher?renderTeacher():renderStudent();
 if(view.kind==='teacher-class'&&isTeacher)return openTeacherClass(view.classId,view.panel||'students');
 if(['teacher-posts','teacher-question-bank','teacher-grade10-bank','teacher-preview','teacher-topic-preview'].includes(view.kind)&&isTeacher){
  const c=await getTeacherClass();if(!c)return renderTeacher();
  if(view.kind==='teacher-preview')return renderTeacherStudentPreview(c,()=>openTeacherClass(c.id));
  const {data:access}=await sb.from('topic_access').select('*').eq('class_id',c.id);
  if(view.kind==='teacher-topic-preview')return renderTeacherTopicPreview(view.topicId,c,access||[],()=>renderTeacherStudentPreview(c));
  // Įkeliame klasės valdymo skirtukus, o tada atidarome norimą vidinį puslapį.
  await openTeacherClass(c.id,view.kind==='teacher-posts'?'assignments':'topics');
  if(view.kind==='teacher-posts')return renderTeacherTopicPosts(c,view.topicId);
  if(view.kind==='teacher-grade10-bank')return renderGrade10QuestionBlocks(c,view.topicId,access||[]);
  return renderTeacherTopicQuestionBank(c,view.topicId,access||[]);
 }
 if(view.kind==='student')return profile.role==='student'?renderStudent():renderTeacher();
 if(view.kind==='achievements')return profile.role==='student'?renderAchievements():renderTeacher();
 if(view.kind==='classmates')return profile.role==='student'?renderClassmates():renderTeacher();
 if(view.kind==='student-results')return profile.role==='student'?renderStudentResults():renderTeacher();
 if(view.kind==='profile')return renderProfile();
 if(view.kind==='cyberlab-preview'&&isTeacher){const c=await getTeacherClass();return c?openCyberLab(c.id,true,c):renderTeacher()}
 if(view.kind==='cyberlab'&&profile.role==='student'){
  const c=await getStudentClass();if(!c||c.id!==view.classId)return renderStudent();
  await loadClassTopics(c.id);
  if(view.topicId!=='kriptografija'||!activeClassTopics.some(t=>t.id==='kriptografija'))return renderStudent();
  return openCyberLab(c.id,false,c);
 }
 if(view.kind==='crypto-teacher'&&isTeacher){const c=await getTeacherClass();return c?openTeacherClass(c.id,'assignments'):renderTeacher();}
 if(view.kind==='crypto-mission'&&profile.role==='student'){const c=await getStudentClass();if(!c)return renderStudent();await loadClassTopics(c.id);const {data:access}=await sb.from('topic_access').select('*').eq('class_id',c.id);return (access||[]).some(a=>a.topic_id==='kriptografija'&&a.is_open)?openStudentTopic('kriptografija',c,access||[]):renderStudent();}
 if(view.kind==='results'&&profile.role==='student')return restoreResultsPage(view);
 if(view.kind==='practice-quiz'&&profile.role==='student')return restorePracticeQuiz(view);
 if(['student-topic','assessment-quiz','assessment-practical'].includes(view.kind)&&profile.role==='student'){
  const c=await getStudentClass();if(!c)return renderStudent();
  await loadClassTopics(c.id);
  const {data:access}=await sb.from('topic_access').select('*').eq('class_id',c.id);
  const topicId=view.topicId;
  if(!topicId||!activeClassTopics.some(x=>x.id===topicId))return renderStudent();
  if(view.kind==='student-topic')return openStudentTopic(topicId,c,access||[]);
  const {data:rawStatus}=await sb.rpc('get_my_assessment_status',{p_class_id:c.id,p_topic_id:topicId});
  const status=assessmentStatusRow(rawStatus);
  if(status?.completed_at)return openStudentTopic(topicId,c,access||[]);
  if(view.kind==='assessment-practical')return status?.theory_submitted_at&&status?.attempt_id?openAssessmentPractical(status.attempt_id,topicId,c.id):openStudentTopic(topicId,c,access||[]);
  if(status?.theory_submitted_at&&status?.practical_required)return openAssessmentPractical(status.attempt_id,topicId,c.id);
  if(status?.attempt_id)return startSecureAssessment(topicId,c.id,status);
  return openStudentTopic(topicId,c,access||[]);
 }
 return renderDashboard();
}
async function restoreInitialNavigation(){
 if(initialViewRestored)return;
 initialViewRestored=true;
 const view=savedNavView();
 restoringBack=true;
 try{await restoreNavigation(view)}
 catch(err){console.warn('Navigacijos atkūrimas:',err);await renderDashboard()}
 finally{restoringBack=false}
}
window.addEventListener('popstate',async event=>{
 if(!me||!profile||passwordRecoveryMode)return;
 if(restoringBack)return;
 restoringBack=true;closeModal();
 try{await restoreNavigation(event.state?.infView||viewFromHash())}
 catch(err){console.warn('Atgal:',err);await renderDashboard()}
 finally{restoringBack=false}
});


// Praktikos klausimų atsakymai ir pasirinkta klausimų tvarka atkuriami tik tame pačiame skirtuke.
// Atsiskaitymo (assessment-secure) atsakymai perimami iš serverio ir neįrašomi čia.
function practiceProgressKey(){return 'inf_practice_v520_'+(me?.id||'anonymous')}
function resultsProgressKey(){return 'inf_results_v520_'+(me?.id||'anonymous')}
function persistPracticeProgress(){
 if(!me||!String(quiz.mode||'').startsWith('practice')||quiz.completed)return;
 try{sessionStorage.setItem(practiceProgressKey(),JSON.stringify(quiz))}catch(_err){}
}
function restorePracticeQuiz(view){
 let saved;try{saved=JSON.parse(sessionStorage.getItem(practiceProgressKey())||'null')}catch(_err){}
 if(!saved||saved.topicId!==view.topicId||saved.classId!==view.classId||!String(saved.mode).startsWith('practice')||!Array.isArray(saved.items)||!saved.items.length)return renderStudent();
 quiz=saved;setCurrentRestore(null,{kind:'practice-quiz',classId:quiz.classId,topicId:quiz.topicId});
 $('quizMode').textContent=quiz.mode==='practice-vbe-crypto'?'VBE PRAKTIKA':'PRAKTIKA';$('quizTitle').textContent=quiz.mode==='practice-vbe-crypto'?'Kriptografija · ankstesnių egzaminų klausimai':topicById(quiz.topicId)?.title||'Praktika';
 show('quiz');renderQ();
}
function storeResultsPage(){
 if(!me)return;
 const ids=['resultPercent','correctCount','wrongCount','resultGoal','resultTitle','resultSubtitle'];
 const values={};ids.forEach(id=>values[id]=$(id)?.textContent||'');
 const snapshot={values,topicId:quiz.topicId||currentNavView?.topicId||null,classId:quiz.classId||currentNavView?.classId||null};
 try{sessionStorage.setItem(resultsProgressKey(),JSON.stringify(snapshot))}catch(_err){}
 setCurrentRestore(null,{kind:'results',topicId:snapshot.topicId,classId:snapshot.classId});
}
function restoreResultsPage(view){
 let snap;try{snap=JSON.parse(sessionStorage.getItem(resultsProgressKey())||'null')}catch(_err){}
 if(!snap||!snap.values)return renderStudent();
 Object.entries(snap.values).forEach(([id,val])=>{if($(id))$(id).textContent=String(val)});
 $('retryQuiz').classList.add('hidden');$('reviewErrors').classList.add('hidden');$('errorsReview').classList.add('hidden');
 $('scoreCircle').style.setProperty('--score',String(snap.values.resultPercent||'0%'));
 setCurrentRestore(null,{kind:'results',topicId:view.topicId,classId:view.classId});
 show('results');
}
function show(name){document.querySelectorAll('.view').forEach(v=>v.classList.add('hidden'));$('view-'+name).classList.remove('hidden');if(name==='results'&&!restoringBack)storeResultsPage();window.scrollTo({top:0,behavior:'smooth'})}
function toast(x){$('toast').textContent=x;$('toast').classList.remove('hidden');clearTimeout(window.__toast);window.__toast=setTimeout(()=>$('toast').classList.add('hidden'),2500)}
function modal(html){$('modalContent').innerHTML=html;$('modal').classList.remove('hidden')}
function closeModal(){$('modal').classList.add('hidden')}
$('modalClose').onclick=closeModal;
$('modal').onclick=e=>{if(e.target===$('modal'))closeModal()};
function authMsg(text,error=false){$('authMessage').textContent=text;$('authMessage').className='formMessage '+(error?'error':'')}

function rememberedEmail(){
 return String(localStorage.getItem(REMEMBER_EMAIL_KEY)||'').trim();
}
function setAuthMode(mode='login'){
 const forms=['loginForm','signupForm','forgotPasswordForm','newPasswordForm'];
 forms.forEach(id=>{if($(id))$(id).classList.toggle('hidden',id!==mode)});
 const recovery=mode==='newPasswordForm';
 if($('authTabs'))$('authTabs').classList.toggle('hidden',recovery);
 if($('tabLogin'))$('tabLogin').classList.toggle('active',mode==='loginForm');
 if($('tabSignup'))$('tabSignup').classList.toggle('active',mode==='signupForm');
 if($('authMessage'))$('authMessage').classList.add('hidden');
}
function passwordRecoveryRedirect(){
 // Atkūrimo nuorodos negalima nukreipti į localhost: ten mokinio įrenginyje
 // serveris neveikia. Viešoje svetainėje paliekame realų jos HTTPS adresą,
 // o vietiniame kūrimo serveryje grįžtame į viešą adresą iš konfigūracijos.
 const host=location.hostname.toLowerCase();
 const isLocal=host==='localhost'||host==='127.0.0.1'||host==='[::1]'||host.endsWith('.localhost');
 if(location.protocol==='https:'&&!isLocal){
  return new URL('./',location.href).href;
 }
 const publicUrl=String(SETTINGS.publicSiteUrl||'').trim();
 try{
  const target=new URL(publicUrl);
  if(target.protocol==='https:'&&target.hostname&&!['localhost','127.0.0.1'].includes(target.hostname)){
   return target.href;
  }
 }catch(_error){}
 throw new Error('Nenustatytas viešas HTTPS svetainės adresas. Patikrink supabase-config.js.');
}
function isPasswordRecoveryUrl(){
 const hash=new URLSearchParams(String(location.hash||'').replace(/^#/,''));
 const query=new URLSearchParams(location.search);
 return hash.get('type')==='recovery'||query.get('type')==='recovery';
}
function recoveryUrlError(){
 const hash=new URLSearchParams(String(location.hash||'').replace(/^#/,''));
 const query=new URLSearchParams(location.search);
 return hash.get('error_code')||query.get('error_code')||hash.get('error')||query.get('error')||'';
}
function showPasswordRecovery(){
 passwordRecoveryMode=true;
 setAuthMode('newPasswordForm');
 show('auth');
 setTimeout(()=>$('newPassword')?.focus(),0);
}
function restoreRememberedLogin(){
 const email=rememberedEmail();
 if($('loginEmail')&&!$('loginEmail').value)$('loginEmail').value=email;
 if($('rememberLogin'))$('rememberLogin').checked=!!email||$('rememberLogin').checked;
}
document.querySelectorAll('[data-password-target]').forEach(btn=>btn.onclick=()=>{
 const input=$(btn.dataset.passwordTarget);if(!input)return;
 const showing=input.type==='text';
 input.type=showing?'password':'text';
 btn.textContent=showing?'Rodyti':'Slėpti';
 btn.setAttribute('aria-label',showing?'Rodyti slaptažodį':'Slėpti slaptažodį');
});

function route(name){
 if(!me && !['auth','setup'].includes(name))return show('auth');
 if(name==='dashboard')return renderDashboard();
 if(name==='teacher')return profile?.role==='teacher'||profile?.role==='admin'?renderTeacher():renderStudent();
 if(name==='student')return renderStudent();
 if(name==='achievements')return profile?.role==='student'?renderAchievements():renderTeacher();
 if(name==='classmates')return profile?.role==='student'?renderClassmates():renderTeacher();
 if(name==='student-results')return profile?.role==='student'?renderStudentResults():renderTeacher();
 if(name==='profile')return renderProfile();
 show(name);
}
document.querySelectorAll('[data-route]').forEach(b=>b.onclick=()=>navigateTo(()=>route(b.dataset.route)));

function setHeader(){
 $('appHeader').classList.toggle('hidden',!me);
 if(!profile)return;
 const isTeacher=['teacher','admin'].includes(profile.role);
 if($('headerRole'))$('headerRole').textContent=profile.role==='teacher'?'Mokytojas':profile.role==='admin'?'Administratorius':'Mokinys';

 // Mokinys turi vieną aiškią pradžios nuorodą, kuri visada atidaro jo klasę.
 $('homeNav').classList.toggle('hidden',isTeacher);
 $('homeNav').dataset.route='student';
 if($('studentResultsNav'))$('studentResultsNav').classList.toggle('hidden',isTeacher);
 if($('achievementsNav'))$('achievementsNav').classList.add('hidden');
 if($('classmatesNav'))$('classmatesNav').classList.add('hidden');
 if(isTeacher)delete document.documentElement.dataset.studentSkin;
 $('teacherNav').classList.toggle('hidden',!isTeacher);
 $('teacherNav').textContent=profile.role==='admin'?'Administratoriaus skydelis':'Mokytojo aplinka';
 $('studentNav').classList.add('hidden');

 // Logotipas taip pat grąžina į tinkamą pagrindinį ekraną.
 if($('brandHome'))$('brandHome').dataset.route=isTeacher?'teacher':'student';
}

$('themeToggle').onclick=()=>{const n=(document.documentElement.dataset.theme||'light')==='dark'?'light':'dark';document.documentElement.dataset.theme=n;localStorage.setItem('inf11v3_theme',n)};
$('logoutBtn').onclick=async()=>{stopHeartbeat();stopTeacherPresenceRefresh();stopIdleLogout();clearIdleClock();sessionStorage.removeItem(practiceProgressKey());sessionStorage.removeItem(resultsProgressKey());await sb.auth.signOut();delete document.documentElement.dataset.studentSkin;me=null;profile=null;currentClass=null;uiBackStack=[];currentRestore=null;currentNavView=null;initialViewRestored=false;historyGuardReady=false;history.replaceState(null,'',location.pathname+location.search);if($('loginEmail'))$('loginEmail').value=rememberedEmail();if($('loginPassword'))$('loginPassword').value='';setHeader();setAuthMode('loginForm');show('auth')};

$('tabLogin').onclick=()=>{passwordRecoveryMode=false;setAuthMode('loginForm');restoreRememberedLogin()};
$('tabSignup').onclick=()=>{passwordRecoveryMode=false;setAuthMode('signupForm')};

$('forgotPasswordBtn').onclick=()=>{
 const current=$('loginEmail').value.trim()||rememberedEmail();
 $('forgotPasswordEmail').value=current;
 setAuthMode('forgotPasswordForm');
 setTimeout(()=>$('forgotPasswordEmail')?.focus(),0);
};
$('backToLoginBtn').onclick=()=>{setAuthMode('loginForm');restoreRememberedLogin()};

$('loginForm').onsubmit=async e=>{
 e.preventDefault();resetIdleClock();authMsg('Jungiamasi...');
 const email=$('loginEmail').value.trim();
 const password=$('loginPassword').value;
 const {error}=await sb.auth.signInWithPassword({email,password});
 if(error)return authMsg(error.message,true);
 if($('rememberLogin')?.checked)localStorage.setItem(REMEMBER_EMAIL_KEY,email);
 else localStorage.removeItem(REMEMBER_EMAIL_KEY);
 $('loginPassword').value='';
 authMsg('Prisijungta.');
};

$('forgotPasswordForm').onsubmit=async e=>{
 e.preventDefault();
 const email=$('forgotPasswordEmail').value.trim();
 if(!email)return authMsg('Įrašyk el. paštą.',true);
 authMsg('Siunčiama slaptažodžio atkūrimo nuoroda...');
 let redirectTo;
 try{redirectTo=passwordRecoveryRedirect()}
 catch(error){return authMsg(error.message,true)}
 const {error}=await sb.auth.resetPasswordForEmail(email,{redirectTo});
 if(error)return authMsg(error.message,true);
 authMsg('Atkūrimo nuoroda išsiųsta. Patikrink el. paštą (taip pat Spam / Šlamštas aplanką).');
};

$('newPasswordForm').onsubmit=async e=>{
 e.preventDefault();
 const a=$('newPassword').value,b=$('newPasswordRepeat').value;
 const {data:{session:recoverySession}}=await sb.auth.getSession();
 if(!recoverySession?.user)return authMsg('Atkūrimo nuoroda nebegalioja. Grįžk ir paprašyk naujos nuorodos.',true);
 if(a.length<8)return authMsg('Slaptažodis turi būti bent 8 simbolių.',true);
 if(a!==b)return authMsg('Slaptažodžiai nesutampa.',true);
 authMsg('Išsaugomas naujas slaptažodis...');
 const {error}=await sb.auth.updateUser({password:a});
 if(error)return authMsg(error.message,true);
 passwordRecoveryMode=false;
 $('newPassword').value='';$('newPasswordRepeat').value='';
 authMsg('Slaptažodis pakeistas. Prisijungimas tęsiamas...');
 history.replaceState(null,'',location.pathname);
 const {data:{session}}=await sb.auth.getSession();
 if(session){
  me=session.user;
  await loadProfile();
  setHeader();
  route('dashboard');
 }else{
  setAuthMode('loginForm');
  restoreRememberedLogin();
  authMsg('Slaptažodis pakeistas. Prisijunk su nauju slaptažodžiu.');
 }
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
 if(error)throw error;
 profile=data;
 setHeader();ensureAppHistoryGuard();startIdleLogout();
 // Prisijungimo statistika neturi blokuoti mokytojo ar mokinio puslapio.
 sb.rpc('mark_login').then(({error:markError})=>{
  if(markError)console.warn('Prisijungimo žyma:',markError.message);
 }).catch(err=>console.warn('Prisijungimo žyma:',err));
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
 <p class="muted">Būsena atnaujinama kas 30 s.</p>
 ${rows.length?rows.map(p=>{const st=students.find(s=>s.id===p.user_id),c=classes.find(x=>x.id===p.class_id);return `<div class="studentRow"><div class="grow"><b>${esc(st?.full_name||'Mokinys')}</b><div class="subtle">${esc(c?.name||'Klasė')}</div></div><span class="badge ok">● Prisijungęs</span></div>`}).join(''):'<div class="emptyState">Šiuo metu aktyvių mokinių nėra.</div>'}`;
}
function startTeacherDashboardPresence(classIds,classes,students){
 stopTeacherPresenceRefresh();
 refreshTeacherOnlinePanel(classIds,classes,students);
 teacherPresenceTimer=setInterval(()=>{if(document.visibilityState==='visible')refreshTeacherOnlinePanel(classIds,classes,students)},30000);
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
 teacherPresenceTimer=setInterval(()=>{if(document.visibilityState==='visible')refreshClassPresence(classId)},30000);
}

async function renderDashboard(){
 if(profile.role==='teacher'||profile.role==='admin')return renderTeacher();
 return renderStudent();
}

/* ================= TEACHER ================= */
async function renderTeacher(){
 stopTeacherPresenceRefresh();
 setCurrentRestore(()=>renderTeacher(),{kind:'teacher'});
 show('teacher');$('teacherContent').innerHTML='<div class="pageHero"><span class="kicker">VALDYMAS</span><h1>Kraunama...</h1></div>';
 const isAdmin=profile.role==='admin';
 let classQuery=sb.from('classes').select('*').order('created_at');
 if(!isAdmin)classQuery=classQuery.eq('teacher_id',me.id);
 const {data:classes,error}=await classQuery;
 if(error)return $('teacherContent').innerHTML=`<div class="notice">${esc(error.message)}</div>`;
 const classIds=(classes||[]).map(c=>c.id);
 let members=[],attempts=[],sessions=[],directSubs=[],assignments=[],assignmentSubs=[];
 if(classIds.length){
  const [membersRes,attemptsRes,sessionsRes,directRes,assignmentsRes]=await Promise.all([
   sb.from('class_members').select('class_id,student_id,joined_at').in('class_id',classIds),
   // Pradžios suvestinei pakanka kelių stulpelių – nesiunčiame visos istorijos objektų.
   sb.from('practice_attempts').select('id').in('class_id',classIds),
   sb.from('activity_sessions').select('user_id,duration_seconds').in('class_id',classIds),
   sb.from('direct_submissions').select('id,class_id,student_id,original_name,title,submitted_at').in('class_id',classIds).order('submitted_at',{ascending:false}),
   sb.from('assignments').select('id,class_id,title').in('class_id',classIds)
  ]);
  members=membersRes.data||[];
  attempts=attemptsRes.data||[];
  sessions=sessionsRes.data||[];
  directSubs=directRes.data||[];
  assignments=assignmentsRes.data||[];
 }
 members=members||[];attempts=attempts||[];sessions=sessions||[];directSubs=directSubs||[];assignments=assignments||[];
 const studentIds=[...new Set(members.map(m=>m.student_id))];
 const assignmentIds=assignments.map(a=>a.id);
 // Mokinių profilius ir pateiktus darbus krauname vienu metu.
 const [profilesResult,submissionsResult]=await Promise.all([
  studentIds.length?sb.from('profiles').select('id,full_name,last_login_at,last_seen_at,created_at').in('id',studentIds):Promise.resolve({data:[]}),
  assignmentIds.length?sb.from('submissions').select('id,assignment_id,student_id,original_name,submitted_at').in('assignment_id',assignmentIds).order('submitted_at',{ascending:false}):Promise.resolve({data:[]})
 ]);
 const students=profilesResult.data||[];
 assignmentSubs=submissionsResult.data||[];
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
 <div class="pageHero compactTeacherHero"><div class="teacherPageTitle">${isAdmin?'Administratoriaus skydelis':'Mokytojo aplinka'}</div></div>
 <div class="dashboardGrid teacherDashboardMetrics">
  <div class="metric"><strong>${totalStudents}</strong><span>mokinių</span></div>
  <div class="metric"><strong>${totalAttempts}</strong><span>žinių treniruočių / atsiskaitymų bandymų</span></div>
  <div class="metric"><strong>${totalSubmissions}</strong><span>pateiktų failų</span></div>
 </div>
 <div class="contentGrid"><div class="panel">
  <div class="sectionTitle dashboardSectionTitle"><div class="grow"><span class="kicker biggerSectionKicker">${isAdmin?'VISOS KLASĖS':'MANO KLASĖS'}</span></div>${isAdmin?'':'<button class="primary" id="newClassBtn">+ Nauja klasė</button>'}</div>
  <div id="classList">${classes?.length?classes.map(c=>{
    const cnt=new Set(members.filter(m=>m.class_id===c.id).map(m=>m.student_id)).size;
    const teacher=teachers.find(t=>t.id===c.teacher_id);
    return `<article class="classCard modernTopicCard modernClassCard"><div class="topicCardTop classCardTop"><span class="classCardIcon classCardGlyph" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="4" y="5" width="16" height="14" rx="3" stroke="currentColor" stroke-width="1.8"/><path d="M8 9h8M8 12h8M8 15h5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg></span><div class="grow"><div class="classNameLine"><h3>${esc(c.name)}</h3><button class="classEditIcon" data-edit-class-name="${c.id}" title="Keisti grupės pavadinimą" aria-label="Keisti grupės pavadinimą">✎</button></div><span class="subtle">${c.grade_level?`${esc(gradeLabel(c.grade_level)||c.grade_level)} · `:''}${cnt} mok. · kodas <b>${esc(c.join_code)}</b>${isAdmin?` · mokytojas <b>${esc(teacher?.full_name||'–')}</b>`:''}</span></div><div class="classCardActions iconClassActions"><button class="iconActionBtn" data-preview-class="${c.id}" aria-label="Mokinio vaizdas: ${esc(c.name)}" title="Mokinio vaizdas">👁</button><button class="topicCardAction" data-class="${c.id}" aria-label="Atidaryti klasę: ${esc(c.name)}" title="Atidaryti klasę">→</button></div></div></article>`
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
 <div class="learningFileList">${(rows||[]).length?(rows||[]).map(r=>`<div class="resourceRow resourceDownloadCard learningFileRow"><span class="resourceFileGlyph" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M13.5 3.5H7a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-9L13.5 3.5Z"/><path d="M13 3.5v6h6"/></svg></span><div class="grow"><b>${esc(r.title||r.original_name)}</b><div class="subtle">${esc(r.original_name)}</div></div><div class="learningFileActions"><button class="smallBtn resourceDownloadAction" data-teacher-download="${r.id}" title="Atsisiųsti" aria-label="Atsisiųsti ${esc(r.original_name)}"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 4v12m-4-4 4 4 4-4M4 19.5h16"/></svg></button><button class="smallBtn learningFileDelete" data-teacher-delete="${r.id}" title="Ištrinti" aria-label="Ištrinti ${esc(r.original_name)}"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 7h16M9 7V5h6v2m-9 0 .7 12h10.6L18 7M10 10.5v5M14 10.5v5"/></svg></button></div></div>`).join(''):'<div class="compactTaskEmpty">Failų dar nėra.</div>'}</div>`;
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

// Siunčiame Blob su ORIGINALIU failo vardu (ne Storage sugeneruotu ID).
// Taip neveikia jokie vieši nuolatiniai URL ir nekeičiamas saugyklos kelias.
async function downloadOriginalFile(bucket,path,originalName){
 const {data,error}=await sb.storage.from(bucket).download(path);
 if(error)return toast(`Nepavyko atsisiųsti: ${error.message}`);
 const fallback=String(path||'').split('/').pop()||'failas';
 const name=String(originalName||fallback).split(/[\\/]/).pop().replace(/[\u0000-\u001f<>:"|?*]/g,'_').trim()||'failas';
 const url=URL.createObjectURL(data),a=document.createElement('a');
 a.href=url;a.download=name;a.style.display='none';document.body.appendChild(a);a.click();a.remove();
 setTimeout(()=>URL.revokeObjectURL(url),60000);
}

async function downloadTeacherFile(id){
 const {data:r,error}=await sb.from('teacher_files').select('*').eq('id',id).single();
 if(error)return toast(error.message);
 await downloadOriginalFile('teacher-library',r.storage_path,r.original_name);
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

function fmtFileSize(bytes){
 const n=Number(bytes||0);if(!n)return '0 B';
 if(n<1024)return `${n} B`;if(n<1024*1024)return `${(n/1024).toFixed(1)} KB`;
 return `${(n/1024/1024).toFixed(1)} MB`;
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
 // Visi nepriklausomi užklausų etapai pradedami vienu metu.
 const [
  {data:c,error},
  ,
  {data:members},
  {data:attempts},
  {data:sessions},
  {data:access},
  {data:direct},
  {data:classAssignments},
  {data:assessmentSettings}
 ]=await Promise.all([
  sb.from('classes').select('*').eq('id',classId).single(),
  loadClassTopics(classId),
  sb.from('class_members').select('student_id,joined_at').eq('class_id',classId),
  sb.from('practice_attempts').select('*').eq('class_id',classId),
  sb.from('activity_sessions').select('*').eq('class_id',classId),
  sb.from('topic_access').select('*').eq('class_id',classId),
  sb.from('direct_submissions').select('id').eq('class_id',classId),
  sb.from('assignments').select('id').eq('class_id',classId),
  sb.from('assessment_settings').select('*').eq('class_id',classId)
 ]);
 if(error||!c)return toast(error?.message||'Klasė nerasta.');
 currentClass=c;
 // Lankomumo žyma negali stabdyti klasės atidarymo.
 startHeartbeat(null).catch(err=>console.warn('Aktyvumo žyma:',err));
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
 <div class="pageHero classTitleHero"><div class="classHeader"><div class="grow"><h1>${esc(c.name)}</h1></div><div class="classHeaderActions"><div>Prisijungimo kodas <span class="joinCode">${esc(c.join_code)}</span></div><button class="ghost" id="studentPreviewBtn">👁 Mokinio vaizdas</button></div></div></div>
 <div class="tabsRow actions" style="margin-bottom:14px">
  <button class="smallBtn primaryLike" data-tpanel="students">Mokiniai</button>
  <button class="smallBtn" data-tpanel="motivation">🎯 Motyvacija</button>
  <button class="smallBtn" data-tpanel="assessments">Atsiskaitymų rezultatai${(attempts||[]).filter(x=>x.mode==='assessment').length?` <span class="inlineCount">${(attempts||[]).filter(x=>x.mode==='assessment').length}</span>`:''}</button>
  <button class="smallBtn" data-tpanel="topics">Temos</button>
  <button class="smallBtn" data-tpanel="resources">Mokymosi failai</button>
  <button class="smallBtn" data-tpanel="assignments">Darbų pateikimas${submissionCount?` <span class="inlineCount">${submissionCount}</span>`:''}</button>
 </div>
 <div id="teacherClassPanel"></div>`;
 let activePanel=initialPanel||'students';
 const showClassPanel=panel=>{
  activePanel=panel;
  document.querySelectorAll('[data-tpanel]').forEach(x=>x.classList.toggle('primaryLike',x.dataset.tpanel===panel));
  renderTeacherClassPanel(panel,c,students,members||[],attempts||[],sessions||[],access||[],assessmentSettings||[]);
  setCurrentRestore(()=>showClassPanel(panel),{kind:'teacher-class',classId:c.id,panel});
 };

 $('studentPreviewBtn').onclick=()=>navigateTo(()=>renderTeacherStudentPreview(c,()=>openTeacherClass(c.id,activePanel)));
 document.querySelectorAll('[data-tpanel]').forEach(b=>b.onclick=()=>{
  const next=b.dataset.tpanel;
  if(next===activePanel)return;
  navigateTo(()=>showClassPanel(next));
 });
 showClassPanel(activePanel);
 startClassPresenceRefresh(c.id);
}

async function loadTeacherMotivationSettings(classId){
 const {data,error}=await sb.rpc('get_motivation_teacher_settings',{p_class_id:classId});
 if(error)throw error;
 return data||{class_enabled:false,show_classmates:false,show_badges:true,allow_cosmetics:false,students:[]};
}
async function renderTeacherMotivation(c,students){
 const host=$('teacherClassPanel');if(!host)return;
 host.innerHTML=`<div class="panel"><div class="sectionTitle"><div class="grow"><span class="kicker">MOTYVACINĖ SISTEMA</span><h2>Kraunama...</h2></div></div></div>`;
 let settings;
 try{settings=await loadTeacherMotivationSettings(c.id)}catch(e){host.innerHTML=`<div class="panel"><div class="notice">${esc(e.message||String(e))}</div></div>`;return}
 const byId=Object.fromEntries((settings.students||[]).map(x=>[x.student_id,x]));
 const classOn=!!settings.class_enabled;
 const showClassmates=!!settings.show_classmates,showBadges=settings.show_badges!==false,allowCosmetics=!!settings.allow_cosmetics;
 const rows=students.map(s=>{
  const st=byId[s.id]||{has_override:false,override_enabled:null,effective_enabled:classOn};
  const mode=st.has_override?(st.override_enabled?'on':'off'):'inherit';
  return `<tr><td><b>${esc(s.full_name||'Mokinys')}</b></td><td><span class="badge ${st.effective_enabled?'ok':''}">${st.effective_enabled?'Įjungta':'Išjungta'}</span></td><td><select class="motivationStudentSelect" data-motivation-student="${s.id}"><option value="inherit" ${mode==='inherit'?'selected':''}>Pagal klasės nustatymą</option><option value="on" ${mode==='on'?'selected':''}>Įjungti šiam mokiniui</option><option value="off" ${mode==='off'?'selected':''}>Išjungti šiam mokiniui</option></select></td></tr>`;
 }).join('');
 host.innerHTML=`<div class="panel motivationAdminPanel">
  <div class="sectionTitle"><div class="grow"><span class="kicker">MOTYVACINĖ SISTEMA</span><h2>XP, lygiai ir pasiekimai</h2><p class="muted">Gali įjungti visai klasei arba padaryti išimtį konkrečiam mokiniui. Testavimui patogu klasę palikti išjungtą ir įjungti tik savo demo mokiniui.</p></div></div>
  <div class="motivationMasterSwitch"><div class="grow"><b>Visai klasei</b><span>${classOn?'Mokiniai pagal nutylėjimą mato motyvacinę sistemą.':'Mokiniai pagal nutylėjimą motyvacinės sistemos nemato.'}</span></div><label class="toggle motivationBigToggle"><input type="checkbox" id="classMotivationEnabled" ${classOn?'checked':''}> ${classOn?'Įjungta':'Išjungta'}</label></div>
  <div class="notice"><b>Individuali išimtis turi pirmenybę.</b> Jei klasei sistema išjungta, gali ją įjungti tik vienam demo mokiniui.</div>
  <div class="motivationFeatureOptions">
   <label class="toggle"><input type="checkbox" id="motivationShowClassmates" ${showClassmates?'checked':''}> Rodyti mokiniams klasės draugus</label>
   <label class="toggle"><input type="checkbox" id="motivationShowBadges" ${showBadges?'checked':''}> Rodyti statuso ženkliukus prie vardų</label>
   <label class="toggle"><input type="checkbox" id="motivationAllowCosmetics" ${allowCosmetics?'checked':''}> Leisti kosmetines aplinkos temas</label>
  </div>
  ${students.length?`<div class="tableWrap"><table class="dataTable motivationAdminTable"><thead><tr><th>Mokinys</th><th>Dabar mato</th><th>Nustatymas</th></tr></thead><tbody>${rows}</tbody></table></div>`:'<div class="emptyState">Klasėje dar nėra mokinių.</div>'}
 </div>`;
 const master=$('classMotivationEnabled');
 if(master)master.onchange=async()=>{
  master.disabled=true;
  const {error}=await sb.rpc('set_class_motivation_enabled',{p_class_id:c.id,p_enabled:master.checked});
  if(error){master.checked=!master.checked;master.disabled=false;return toast(error.message)}
  toast(master.checked?'Motyvacinė sistema įjungta klasei.':'Motyvacinė sistema išjungta klasei.');
  renderTeacherMotivation(c,students);
 };
 const saveMotivationOptions=async()=>{
  const a=$('motivationShowClassmates'),b=$('motivationShowBadges'),d=$('motivationAllowCosmetics');
  [a,b,d].filter(Boolean).forEach(x=>x.disabled=true);
  const {error}=await sb.rpc('set_motivation_class_options',{
   p_class_id:c.id,
   p_show_classmates:!!a?.checked,
   p_show_badges:!!b?.checked,
   p_allow_cosmetics:!!d?.checked
  });
  if(error){toast(error.message);return renderTeacherMotivation(c,students)}
  toast('Motyvacinės sistemos parinktys išsaugotos.');
  renderTeacherMotivation(c,students);
 };
 ['motivationShowClassmates','motivationShowBadges','motivationAllowCosmetics'].forEach(id=>{if($(id))$(id).onchange=saveMotivationOptions});
 document.querySelectorAll('[data-motivation-student]').forEach(sel=>sel.onchange=async()=>{
  sel.disabled=true;
  let error=null;
  if(sel.value==='inherit'){
   ({error}=await sb.rpc('clear_student_motivation_override',{p_class_id:c.id,p_student_id:sel.dataset.motivationStudent}));
  }else{
   ({error}=await sb.rpc('set_student_motivation_override',{p_class_id:c.id,p_student_id:sel.dataset.motivationStudent,p_enabled:sel.value==='on'}));
  }
  if(error){sel.disabled=false;toast(error.message);return}
  toast('Mokinio motyvacinės sistemos nustatymas išsaugotas.');
  renderTeacherMotivation(c,students);
 });
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
 if(panel==='motivation'){
  renderTeacherMotivation(c,students);
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
  if(activeClassTopics.some(t=>t.id==='kriptografija')&&window.SecureLink){
   const block=document.createElement('div');block.id='cyberlabTeacherControl';host.appendChild(block);
   window.SecureLink.mountTeacher({host:block,sb,c,students,openPreview:()=>navigateTo(()=>openCyberLab(c.id,true,c))}).catch(err=>console.warn('SECURE LINK valdymas:',err));
  }
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

 setCurrentRestore(()=>renderGrade10QuestionBlocks(c,topicId,access),{kind:'teacher-grade10-bank',classId:c.id,topicId});
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

 setCurrentRestore(()=>renderTeacherTopicQuestionBank(c,topicId,access),{kind:'teacher-question-bank',classId:c.id,topicId});
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
 setCurrentRestore(()=>renderTeacherTopicPosts(c,topicId),{kind:'teacher-posts',classId:c.id,topicId});
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
 host.innerHTML=`<div class="panel"><div class="sectionTitle"><div class="grow"><span class="kicker">ATSISKAITYMŲ REZULTATAI</span><h2>Mokinių atsiskaitymai</h2><p class="muted">Mokytojas teorijos rezultatą ir mokinio atsakymus mato iš karto. Logotipo praktinė dalis vertinama atskirai pagal 10 taškų rubriką.</p></div></div><div class="emptyState">Kraunama...</div></div>`;
 if(!rows.length){host.innerHTML=`<div class="panel"><div class="sectionTitle"><div class="grow"><span class="kicker">ATSISKAITYMŲ REZULTATAI</span><h2>Mokinių atsiskaitymai</h2><p class="muted">Kai mokiniai pradės atsiskaitymą, rezultatai atsiras čia.</p></div></div><div class="emptyState">Atsiskaitymų dar nėra.</div></div>`;return}
 const ids=rows.map(x=>x.id);
 const [{data:events,error},{data:retryRows},{data:practicalRows},{data:teacherGrades,error:gradeLoadError}]=await Promise.all([
  sb.from('assessment_focus_events').select('attempt_id,event_type,occurred_at').in('attempt_id',ids),
  sb.from('assessment_retry_permissions').select('class_id,student_id,topic_id,extra_attempts').eq('class_id',c.id),
  sb.from('assessment_attempt_practical').select('*').in('attempt_id',ids),
  sb.rpc('list_assessment_teacher_grades',{p_class_id:c.id})
 ]);
 assessmentTeacherGradesByAttempt=Object.fromEntries((teacherGrades||[]).map(g=>[g.attempt_id,g]));
 const practicalBy=Object.fromEntries((practicalRows||[]).map(x=>[x.attempt_id,x]));
 const eventRows=error?[]:(events||[]),countBy={};eventRows.forEach(e=>countBy[e.attempt_id]=(countBy[e.attempt_id]||0)+1);
 const studentBy=Object.fromEntries((students||[]).map(x=>[x.id,x]));
 const totalStudents=(students||[]).length,completedByTopic={};
 rows.filter(x=>x.completed_at).forEach(x=>{if(!completedByTopic[x.topic_id])completedByTopic[x.topic_id]=new Set();completedByTopic[x.topic_id].add(x.student_id)});
 const keyOf=x=>`${x.student_id}::${x.topic_id}`,groups={};
 [...rows].sort((a,b)=>new Date(a.started_at)-new Date(b.started_at)).forEach(x=>{const k=keyOf(x);(groups[k]||(groups[k]=[])).push(x)});
 const attemptNoById={},latestByKey={};Object.entries(groups).forEach(([k,list])=>{list.forEach((x,i)=>attemptNoById[x.id]=i+1);latestByKey[k]=list[list.length-1]});
 const retryByKey={};(retryRows||[]).forEach(r=>retryByKey[`${r.student_id}::${r.topic_id}`]=r);
 // Trumpa suvestinė: viena eilutė vienam mokiniui kiekvienoje atsiskaitymo temoje.
 // Rodyti ir dar nepateikusius mokinius, kad mokytojas matytų visą klasę.
 const assessmentTopics=[...new Set(rows.map(x=>x.topic_id))];
 const studentsSorted=[...(students||[])].sort((a,b)=>String(a.full_name||'').localeCompare(String(b.full_name||''),'lt'));
 const overviewRows=[];
 for(const topicId of assessmentTopics){
  for(const st of studentsSorted){
   const studentAttempts=rows.filter(x=>x.topic_id===topicId&&x.student_id===st.id);
   const submitted=[...studentAttempts].filter(x=>x.completed_at).sort((a,b)=>new Date(b.completed_at)-new Date(a.completed_at))[0]||null; // naujausias pateiktas bandymas
   const active=studentAttempts.find(x=>!x.completed_at)||null;
   const graded=submitted?assessmentTeacherGradesByAttempt[submitted.id]:null;
   const pct=submitted&&submitted.score_percent!=null?`${Math.round(Number(submitted.score_percent))}%`:'—';
   const status=submitted?(active?'Pateikė · kartoja':'Pateikė'):(active?'Vyksta':'Nepateikė');
   const grade=graded?`<span class="assessmentGradeBig" aria-label="Pažymys ${Number(graded.grade)}">${Number(graded.grade)}</span>`:(submitted?'<span class="subtle">Neįvertinta</span>':'<span class="subtle">—</span>');
   const key=`${st.id}::${topicId}`;
   const completedAttempts=studentAttempts.filter(x=>x.completed_at).length;
   const allowedAttempts=1+Number(retryByKey[key]?.extra_attempts||0);
   const retryAction=submitted?(active?'':(completedAttempts<allowedAttempts?'<span class="badge ok">Pakartojimas leistas</span>':`<button class="smallBtn" data-grant-assessment-retry="${st.id}" data-retry-topic="${esc(topicId)}" data-retry-name="${esc(st.full_name||'Mokinys')}">Leisti pakartoti</button>`)):'';
   const buttons=submitted?`<button class="smallBtn" data-assessment-grade="${submitted.id}" data-assessment-student="${st.id}">${graded?'Keisti':'Įvertinti'}</button><button class="smallBtn" data-assessment-result="${submitted.id}" data-assessment-student="${st.id}">Detalės</button>${retryAction}`:'<span class="subtle">—</span>';
   overviewRows.push(`<tr data-overview-topic="${esc(topicId)}"><td><b>${esc(st.full_name||'Mokinys')}</b></td><td>${esc(status)}</td><td><b>${pct}</b></td><td>${grade}</td><td class="assessmentQuickActions">${buttons}</td></tr>`);
  }
 }
 const overviewStats=Object.fromEntries(assessmentTopics.map(topicId=>{
  const completedStudents=new Set(rows.filter(x=>x.topic_id===topicId&&x.completed_at).map(x=>x.student_id));
  const gradedStudents=new Set(rows.filter(x=>x.topic_id===topicId&&x.completed_at&&assessmentTeacherGradesByAttempt[x.id]).map(x=>x.student_id));
  return [topicId,{submitted:completedStudents.size,graded:gradedStudents.size,total:studentsSorted.length}];
 }));
 const topicChoices=assessmentTopics.map(id=>`<option value="${esc(id)}">${esc(topicById(id)?.title||id)}</option>`).join('');
 const body=rows.map(x=>{
  const st=studentBy[x.student_id],done=!!x.completed_at,k=keyOf(x),group=groups[k]||[],pr=practicalBy[x.id],teacherGrade=assessmentTeacherGradesByAttempt[x.id];
  const duration=done?fmtDurationDetailed(x.duration_seconds):fmtDurationDetailed(Math.max(1,Math.floor((Date.now()-new Date(x.started_at).getTime())/1000)));
  let result='—',logo='—',stateLabel=done?'Baigtas':'Vyksta / nebaigtas';
  if(pr){
   if(pr.theory_submitted_at&&!done)stateLabel='II dalis · logotipas';
   if(pr.practical_submitted_at&&pr.practical_score==null)logo='<span class="badge ok">Pateiktas · vertinti</span>';
   else if(pr.practical_score!=null){const ps=Number(pr.practical_score),overall=Math.round(((Number(x.correct_answers)||0)+ps)*100/Math.max(1,(Number(x.total_questions)||0)+Number(pr.practical_max_points||10)));logo=`<span class="badge ok">${ps%1?ps.toFixed(1):ps}/${Number(pr.practical_max_points||10)}</span>`;result=`Teorija ${x.correct_answers||0}/${x.total_questions||0} · <b>${overall}%</b>`}
   else if(pr.theory_submitted_at)logo='<span class="badge">Rengia</span>';
   else logo='<span class="badge">Nepradėtas</span>';
   if(result==='—'&&pr.theory_submitted_at)result=`Teorija ${x.correct_answers||0}/${x.total_questions||0} · ${x.score_percent||0}%`;
  }else if(done)result=`${x.correct_answers||0}/${x.total_questions||0} · ${x.score_percent||0}%`;
  const completed=completedByTopic[x.topic_id]?.size||0,released=totalStudents>0&&completed>=totalStudents&&(!pr||pr.practical_score!=null);
  const studentVisibility=released?'<span class="badge ok">Rodoma</span>':(totalStudents>0&&completed>=totalStudents&&pr&&pr.practical_score==null?'<span class="badge">Laukia įvertinimo</span>':`<span class="badge">Laukiama ${completed}/${totalStudents}</span>`);
  const completedAttempts=group.filter(a=>a.completed_at).length,hasUnfinished=group.some(a=>!a.completed_at),allowedAttempts=1+Number(retryByKey[k]?.extra_attempts||0),retryAlreadyAvailable=!hasUnfinished&&completedAttempts<allowedAttempts,isLatest=latestByKey[k]?.id===x.id;
  let retryAction='';if(done&&isLatest)retryAction=retryAlreadyAvailable?'<span class="badge ok">Pakartojimas leistas</span>':`<button class="smallBtn" data-grant-assessment-retry="${x.student_id}" data-retry-topic="${esc(x.topic_id)}" data-retry-name="${esc(st?.full_name||'Mokinys')}">Leisti pakartoti</button>`;
  const fullTopicTitle=topicById(x.topic_id)?.title||x.topic_id;
  const gradeCell=teacherGrade?`<span class="assessmentGradeBig">${Number(teacherGrade.grade)}</span>`:(done?'<span class="badge">Neįvertinta</span>':'—');
  const gradeAction=done?`<button class="smallBtn" data-assessment-grade="${x.id}" data-assessment-student="${x.student_id}">${teacherGrade?'Keisti pažymį':'Įvertinti'}</button>`:'';
  return `<tr><td><b>${esc(st?.full_name||'Mokinys')}</b></td><td class="assessmentTopicCell"><button type="button" class="assessmentTopicToggle" data-toggle-assessment-topic title="${esc(fullTopicTitle)}"><span class="assessmentTopicText">${esc(fullTopicTitle)}</span><span class="assessmentTopicChevron" aria-hidden="true">⌄</span></button></td><td><b>${attemptNoById[x.id]||1}</b></td><td><span class="badge ${done?'ok':''}">${stateLabel}</span></td><td><b>${result}</b></td><td>${logo}</td><td>${duration}${done?'':' (iki dabar)'}</td><td><b>${countBy[x.id]||0}</b></td><td>${studentVisibility}</td><td>${gradeCell}</td><td><div class="actions"><button class="smallBtn" data-assessment-result="${x.id}" data-assessment-student="${x.student_id}">Peržiūrėti</button>${gradeAction}${retryAction}</div></td></tr>`;
 }).join('');
 host.innerHTML=`<div class="panel"><div class="sectionTitle"><div class="grow"><span class="kicker">ATSISKAITYMŲ REZULTATAI</span><h2>Visos klasės pažymiai</h2><p class="muted">Pasirink temą ir vienoje vietoje matyk visų mokinių įvertinimus. Pažymį galima įrašyti arba pakeisti iškart po darbo pateikimo. Mokinys savo pažymį mato iškart, o teisingus atsakymus – tik visai klasei baigus.</p></div></div>
 ${gradeLoadError?`<div class="notice">Pažymių duomenys neprijungti. Patikrink ankstesnį v5.20 SQL diegimą. ${esc(gradeLoadError.message)}</div>`:''}
 <div class="assessmentSummaryToolbar"><label for="assessmentOverviewTopic"><b>Tema</b></label><select id="assessmentOverviewTopic">${topicChoices}</select><span class="badge" id="assessmentOverviewStats"></span></div>
 <div class="tableWrap"><table class="dataTable assessmentSummaryTable"><thead><tr><th>Mokinys</th><th>Būsena</th><th>Rezultatas</th><th>Pažymys</th><th>Veiksmai</th></tr></thead><tbody>${overviewRows.join('')}</tbody></table></div>
 <details class="assessmentDetailsDisclosure"><summary>Išsami atsiskaitymų istorija ir kiti duomenys (${rows.length} band.)</summary><p class="muted">Čia rasi visus bandymus, laiką, išėjimus, praktinę dalį ir rezultatų paskelbimo būseną.</p><div class="tableWrap"><table class="dataTable"><thead><tr><th>Mokinys</th><th>Tema</th><th>Bandymas</th><th>Būsena</th><th>Rezultatas</th><th>Logotipas</th><th>Laikas</th><th>Išėjo</th><th>Atsakymai</th><th>Pažymys</th><th></th></tr></thead><tbody>${body}</tbody></table></div></details></div>`;
 const overviewSelect=$('assessmentOverviewTopic');
 const updateAssessmentOverview=()=>{
  const selected=overviewSelect.value;
  document.querySelectorAll('[data-overview-topic]').forEach(tr=>{tr.hidden=tr.dataset.overviewTopic!==selected;});
  const stats=overviewStats[selected];
  $('assessmentOverviewStats').textContent=stats?`Pateikė ${stats.submitted}/${stats.total} · įvertinta ${stats.graded}`:'';
 };
 overviewSelect.onchange=updateAssessmentOverview;
 updateAssessmentOverview();
 document.querySelectorAll('[data-assessment-result],[data-assessment-grade]').forEach(b=>b.onclick=()=>showAssessmentAttemptDetail(b.dataset.assessmentResult||b.dataset.assessmentGrade,b.dataset.assessmentStudent,c.id));
 document.querySelectorAll('[data-toggle-assessment-topic]').forEach(b=>b.onclick=()=>{b.classList.toggle('expanded');b.setAttribute('aria-expanded',b.classList.contains('expanded')?'true':'false')});
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
 const row=settings.find(s=>s.topic_id===topicId)||{};
 const cryptoLimited=['kriptografija','kriptografija-vbe-atsiskaitymas'].includes(topicId);
 const maxQuestions=cryptoLimited?20:30;
 const current=Math.min(maxQuestions,row.question_count||maxQuestions);
 const t=topicById(topicId);
 const supportsLogo=c.grade_level==='11'&&topicId==='vektorine-grafika';
 const logoEnabled=supportsLogo?(row.practical_enabled!==false):false;
 modal(`<span class="kicker">ATSISKAITYMO NUSTATYMAI</span><h2>${esc(t?.title||topicId)}</h2><p class="muted">Pasirink, kiek klausimų gaus kiekvienas mokinys. Sistema naudoja vienodą balanso karkasą: kiekvienam mokiniui tenka tokios pačios temos, tie patys sunkumo lygiai ir tie patys klausimų tipai, bet parenkami skirtingi lygiaverčiai klausimų variantai.</p><form id="assessmentSettingsForm" class="formGroup"><label>Klausimų skaičius<input id="assessmentQuestionCountInput" type="number" min="5" max="${maxQuestions}" step="1" value="${current}" required></label><p class="formHint">${cryptoLimited?'Šioje kriptografijos temoje parengta 20 subalansuotų klausimų grupių su dviem variantais kiekvienai grupei. Galima rinktis iki 20 klausimų.':'Rekomenduojama: 30 klausimų. Galima rinktis nuo 5 iki 30.'}</p>
 ${supportsLogo?`<label class="assessmentPracticalSetting"><input id="assessmentPracticalEnabled" type="checkbox" ${logoEnabled?'checked':''}><span><b>II dalis – logotipo kūrimas</b><small>Mokinys po teorijos pateiks SVG originalą ir PNG peržiūrą. Praktinę dalį mokytojas vertina iki 10 taškų.</small></span></label>`:''}
 <button class="primary" type="submit">${openAfterSave?'Išsaugoti ir atidaryti atsiskaitymą':'Išsaugoti'}</button></form>`);
 $('assessmentSettingsForm').onsubmit=async e=>{
  e.preventDefault();
  const count=Math.max(5,Math.min(maxQuestions,Number($('assessmentQuestionCountInput').value)||maxQuestions));
  const practicalEnabled=supportsLogo?$('assessmentPracticalEnabled').checked:false;
  const payload={class_id:c.id,topic_id:topicId,question_count:count,updated_by:me.id,updated_at:new Date().toISOString()};
  if(supportsLogo){Object.assign(payload,{practical_enabled:practicalEnabled,practical_title:'Logotipo kūrimas',practical_max_points:10,practical_instructions:'Sukurkite originalų vektorinį logotipą pasirinkta tema. Naudokite bent 3 vektorinius objektus, geometrines formas, bent vieną Bezjė kreivę, užpildą ir kontūrą, gradientą bei tekstą. Išlaikykite aiškią ir tvarkingą kompoziciją. Pateikite SVG originalą ir PNG peržiūrą.'})}
  const {data,error}=await sb.from('assessment_settings').upsert(payload,{onConflict:'class_id,topic_id'}).select().single();
  if(error)return toast(error.message);
  const ix=settings.findIndex(s=>s.topic_id===topicId);if(ix>=0)settings[ix]=data;else settings.push(data);
  if(openAfterSave){
   await updateTopicAccess(c.id,topicId,'assessment_open',true);
   const ar=access.find(x=>x.topic_id===topicId);if(ar)ar.assessment_open=true;
   if(checkbox)checkbox.checked=true;
  }
  closeModal();toast(openAfterSave?`Atsiskaitymas atidarytas: ${count} teorijos klausimų${practicalEnabled?' + logotipo užduotis':''}.`:'Atsiskaitymo nustatymai išsaugoti.');
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
 if(!confirm(`Pašalinti mokinį „${studentName}“ iš šios klasės?\n\nBus ištrinti VISI jo žinių treniruočių ir atsiskaitymų bandymai šioje klasėje, įskaitant testo atsakymus, laiką, išėjimų istoriją ir atsiskaitymo praktinės dalies SVG/PNG failus. Įprastų užduočių failai ir pati prisijungimo paskyra nebus trinami.`))return;
 const {data:practicalFiles}=await sb.from('assessment_practical_files').select('storage_path').eq('student_id',studentId).eq('class_id',classId);
 const paths=(practicalFiles||[]).map(x=>x.storage_path).filter(Boolean);
 if(paths.length){const {error:storageErr}=await sb.storage.from('student-submissions').remove(paths);if(storageErr)return toast(`Nepavyko ištrinti praktinės dalies failų: ${storageErr.message}`)}
 const {error}=await sb.rpc('teacher_remove_student_from_class',{p_class_id:classId,p_student_id:studentId});
 if(error)return toast(error.message);
 closeModal();toast('Mokinys pašalintas, o jo testų ir praktinės dalies rezultatai ištrinti.');openTeacherClass(classId,'students');
}

function formatStoredAnswer(q,answer){
 if(answer===null||answer===undefined)return 'neatsakyta';
 const type=q.question_type||'single',opts=q.options,choices=questionChoices(q);
 if(type==='single'||type==='odd'){const i=Number(answer);return choices[i]!=null?choices[i]:String(answer)}
 if(type==='multi'){return (Array.isArray(answer)?answer:[]).map(i=>choices[Number(i)]!=null?choices[Number(i)]:String(i)).join('; ')||'neatsakyta'}
 if(type==='matching'){
  const left=opts?.left||[],right=opts?.right||[];return left.map((l,i)=>`${l} → ${right[Number(answer?.[String(i)])]??'—'}`).join(' | ')
 }
 if(type==='sequence'){
  const items=opts?.items||[];return Object.entries(answer||{}).sort((a,b)=>Number(a[1])-Number(b[1])).map(([idx,pos])=>`${Number(pos)+1}. ${items[Number(idx)]??'—'}`).join(' → ')||'neatsakyta'
 }
 if(type==='short')return String(answer||'').trim()||'neatsakyta';
 return String(answer);
}
function focusEventLabel(t){return ({hidden:'Perėjo į kitą skirtuką / puslapis paslėptas',blur:'Naršyklės langas prarado fokusą',pagehide:'Išėjo arba perkrovė puslapį',quit:'Paspaudė „Baigti“ nebaigęs'})[t]||t}
async function showAssessmentAttemptDetail(attemptId,studentId,classId){
 modal(`<span class="kicker">ATSISKAITYMO DETALĖS</span><h2>Kraunama...</h2>`);
 const [{data:attempt,error:aErr},{data:questions,error:qErr},{data:events,error:eErr},{data:practical},{data:files}]=await Promise.all([
  sb.from('practice_attempts').select('*').eq('id',attemptId).single(),
  sb.from('assessment_attempt_questions').select('*').eq('attempt_id',attemptId).order('question_order',{ascending:true}),
  sb.from('assessment_focus_events').select('*').eq('attempt_id',attemptId).order('occurred_at',{ascending:true}),
  sb.from('assessment_attempt_practical').select('*').eq('attempt_id',attemptId).maybeSingle(),
  sb.from('assessment_practical_files').select('*').eq('attempt_id',attemptId).order('uploaded_at',{ascending:true})
 ]);
 if(aErr)return modal(`<div class="notice">${esc(aErr.message)}</div>`);
 const hasDetails=!qErr&&(questions||[]).length>0,fileBy=Object.fromEntries((files||[]).map(f=>[f.file_kind,f]));
 if(!Object.hasOwn(assessmentTeacherGradesByAttempt,attemptId)){
  const {data:grades}=await sb.rpc('list_assessment_teacher_grades',{p_class_id:classId});
  if(grades)grades.forEach(g=>assessmentTeacherGradesByAttempt[g.attempt_id]=g);
 }
 const priorGrade=assessmentTeacherGradesByAttempt[attemptId]||null;
 let pngUrl='';if(fileBy.png){const {data:signed}=await sb.storage.from('student-submissions').createSignedUrl(fileBy.png.storage_path,120);pngUrl=signed?.signedUrl||''}
 const practicalScore=practical?.practical_score==null?null:Number(practical.practical_score),practicalMax=Number(practical?.practical_max_points||10),overall=practicalScore==null?null:Math.round(((Number(attempt.correct_answers)||0)+practicalScore)*100/Math.max(1,(Number(attempt.total_questions)||0)+practicalMax));
 const theorySeconds=Number(practical?.theory_duration_seconds||0),practicalSeconds=practical?.practical_started_at&&practical?.practical_submitted_at?Math.max(0,Math.round((new Date(practical.practical_submitted_at)-new Date(practical.practical_started_at))/1000)):0;
 const rb=practical?.rubric_scores||{};
 const individualGradePanel=attempt.completed_at?`<div class="panel"><span class="kicker">INDIVIDUALUS VERTINIMAS</span><h3>Mokytojo pažymys (1–10)</h3><p class="muted">Šį mokinį gali įvertinti iš karto – kitų mokinių laukti nereikia. Pažymys ir komentaras mokiniui rodomi iškart po išsaugojimo. Teisingi atsakymai liks paslėpti iki visų klasės mokinių atsiskaitymo.</p><form id="assessmentTeacherGradeForm" class="formGroup"><label>Pažymys <select id="assessmentTeacherGrade" required><option value="">— pasirink pažymį —</option>${Array.from({length:10},(_v,i)=>i+1).map(n=>`<option value="${n}" ${priorGrade?.grade===n?'selected':''}>${n}</option>`).join('')}</select></label><label>Komentaras mokiniui<textarea id="assessmentTeacherComment" rows="3" maxlength="2000" placeholder="Nebūtina">${esc(priorGrade?.teacher_comment||'')}</textarea></label><button class="primary" type="submit">${priorGrade?'Atnaujinti įvertinimą':'Išsaugoti įvertinimą'}</button></form></div>`:`<div class="panel"><p class="muted">Mokinys dar nepateikė viso atsiskaitymo. Vertinti bus galima iškart po pateikimo.</p></div>`;
 const practicalPanel=practical?`<div class="panel practicalTeacherPanel"><div class="sectionTitle"><div class="grow"><span class="kicker">II DALIS</span><h3>Logotipo kūrimas</h3><p class="muted">${practical.practical_submitted_at?`Pateikta ${fmtDate(practical.practical_submitted_at)}`:(practical.theory_submitted_at?'Teorija baigta, praktinė dalis dar nepateikta.':'Praktinė dalis dar nepradėta.')}</p></div>${practicalScore!=null?`<span class="badge ok">${practicalScore%1?practicalScore.toFixed(1):practicalScore}/${practicalMax}</span>`:''}</div>
 ${pngUrl?`<a href="${pngUrl}" target="_blank" rel="noopener"><img class="assessmentLogoPreview" src="${pngUrl}" alt="Mokinio logotipo PNG peržiūra"></a>`:''}
 <div class="practicalTeacherFiles">${(files||[]).length?(files||[]).map(f=>`<div class="resourceRow"><div class="grow"><b>${f.file_kind.toUpperCase()} · ${esc(f.original_name)}</b><div class="subtle">${fmtFileSize(f.size_bytes)}</div></div><button class="smallBtn" data-assessment-practical-file="${f.id}">Atsisiųsti</button></div>`).join(''):'<div class="emptyState">Failų dar nėra.</div>'}</div>
 ${practical.practical_submitted_at?`<form id="practicalGradeForm" class="formGroup practicalGradeForm"><h3>Vertinimo rubrika · 10 t.</h3><div class="rubricInputs">
  <label>Objektai ir formos <span>0–2</span><input id="rubricObjects" type="number" min="0" max="2" step="0.5" value="${rb.objects??''}" required></label>
  <label>Bezjė kreivė <span>0–2</span><input id="rubricBezier" type="number" min="0" max="2" step="0.5" value="${rb.bezier??''}" required></label>
  <label>Užpildas, kontūras, gradientas <span>0–2</span><input id="rubricStyle" type="number" min="0" max="2" step="0.5" value="${rb.style??''}" required></label>
  <label>Tekstas <span>0–1</span><input id="rubricText" type="number" min="0" max="1" step="0.5" value="${rb.text??''}" required></label>
  <label>Kompozicija <span>0–2</span><input id="rubricComposition" type="number" min="0" max="2" step="0.5" value="${rb.composition??''}" required></label>
  <label>SVG + PNG pateikimas <span>0–1</span><input id="rubricFiles" type="number" min="0" max="1" step="0.5" value="${rb.files??''}" required></label>
 </div><label>Komentaras mokiniui<textarea id="practicalTeacherComment" rows="3" placeholder="Nebūtina">${esc(practical.teacher_comment||'')}</textarea></label><button class="primary" type="submit">Išsaugoti praktinės dalies vertinimą</button></form>`:''}</div>`:'';
 modal(`<button class="back" id="backToStudentDetail">← Atgal į mokinį</button><span class="kicker">ATSISKAITYMO DETALĖS</span><h2>${esc(topicById(attempt.topic_id)?.title||attempt.topic_id)}</h2>
 <div class="detailMetrics assessmentMetrics"><div class="metric"><strong>${attempt.correct_answers||0}/${attempt.total_questions||0}</strong><span>teorija</span></div><div class="metric"><strong>${attempt.score_percent??0}%</strong><span>teorijos %</span></div>${practical?`<div class="metric"><strong>${practicalScore==null?'—':`${practicalScore%1?practicalScore.toFixed(1):practicalScore}/${practicalMax}`}</strong><span>logotipas</span></div><div class="metric"><strong>${overall==null?'—':overall+'%'}</strong><span>bendras</span></div><div class="metric"><strong>${fmtDurationDetailed(theorySeconds)}</strong><span>teorijos laikas</span></div><div class="metric"><strong>${practicalSeconds?fmtDurationDetailed(practicalSeconds):'—'}</strong><span>praktikos laikas</span></div>`:`<div class="metric"><strong>${fmtDurationDetailed(attempt.duration_seconds)}</strong><span>trukmė</span></div>`}<div class="metric"><strong>${(events||[]).length}</strong><span>išėjimų teorijoje</span></div></div>
 <p class="muted">Pradėta: <b>${fmtDate(attempt.started_at)}</b> · baigta: <b>${fmtDate(attempt.completed_at)}</b></p>${individualGradePanel}${practicalPanel}
 <div class="panel assessmentFocusPanel"><h3>Išėjimai teorinės dalies metu</h3>${eErr?`<div class="notice">${esc(eErr.message)}</div>`:(events||[]).length?(events||[]).map((e,i)=>`<div class="historyRow"><span>${i+1}. ${esc(focusEventLabel(e.event_type))}</span><b>${fmtDate(e.occurred_at)}</b></div>`).join(''):'<div class="emptyState">Neužfiksuota nė vieno išėjimo ar fokuso praradimo.</div>'}</div>
 <div class="panel"><h3>I dalis · teorijos klausimai ir atsakymai</h3>${hasDetails?(questions||[]).map(q=>`<div class="assessmentQuestionDetail ${q.is_correct?'isCorrect':'isWrong'}"><div class="bankQuestionMeta"><span class="badge">${q.question_order}</span><span class="badge">${esc(qTypeLabel(q.question_type))}</span><span class="badge">${esc(q.category)}</span></div><b>${esc(q.question_text)}</b><p>Mokinio atsakymas: <strong>${esc(formatStoredAnswer(q,q.student_answer))}</strong><br>Teisingas atsakymas: <strong>${esc(formatStoredAnswer(q,q.correct_answer))}</strong></p><div class="subtle">${q.is_correct?'✓ Teisingai':'✕ Neteisingai / neatsakyta'}${q.answered_at?' · atsakyta '+fmtDate(q.answered_at):''}</div>${q.explanation?`<div class="subtle">${esc(q.explanation)}</div>`:''}</div>`).join(''):'<div class="emptyState">Šiam bandymui teorijos detalizacijos nėra.</div>'}</div>`);
 $('backToStudentDetail').onclick=()=>showStudentDetail(studentId,classId);
 if($('assessmentTeacherGradeForm'))$('assessmentTeacherGradeForm').onsubmit=async e=>{
  e.preventDefault();const grade=Number($('assessmentTeacherGrade').value);
  if(!Number.isInteger(grade)||grade<1||grade>10)return toast('Pasirink pažymį nuo 1 iki 10.');
  const button=$('assessmentTeacherGradeForm').querySelector('[type="submit"]');button.disabled=true;
  const {error}=await sb.rpc('grade_assessment_attempt',{p_attempt_id:attemptId,p_grade:grade,p_comment:$('assessmentTeacherComment').value.trim()||null});
  if(error){button.disabled=false;return toast(`Vertinimo nepavyko išsaugoti: ${error.message}`)}
  toast('Individualus mokinio įvertinimas išsaugotas.');
  // Atnaujiname mokytojo lentelę ir mokinio detalių langą.
  await openTeacherClass(classId,'assessments');
  showAssessmentAttemptDetail(attemptId,studentId,classId);
 };
 document.querySelectorAll('[data-assessment-practical-file]').forEach(b=>b.onclick=()=>downloadAssessmentPracticalFile(b.dataset.assessmentPracticalFile));
 if($('practicalGradeForm'))$('practicalGradeForm').onsubmit=async e=>{
  e.preventDefault();
  const rubric={objects:Number($('rubricObjects').value),bezier:Number($('rubricBezier').value),style:Number($('rubricStyle').value),text:Number($('rubricText').value),composition:Number($('rubricComposition').value),files:Number($('rubricFiles').value)};
  const {error}=await sb.rpc('grade_assessment_practical',{p_attempt_id:attemptId,p_rubric:rubric,p_comment:$('practicalTeacherComment').value.trim()||null});
  if(error)return toast(error.message);toast('Logotipo vertinimas išsaugotas.');showAssessmentAttemptDetail(attemptId,studentId,classId);
 };
}


// Temos atvėrimo būsena išlieka po failų įkėlimo ar darbų rūšiavimo.
const teacherExpandedTopics={resources:new Set(),assignments:new Set()};
function rememberTeacherTopicExpansion(scope){
 document.querySelectorAll('details[data-tgroup]').forEach(el=>el.addEventListener('toggle',()=>{
  if(el.open)teacherExpandedTopics[scope].add(el.dataset.tgroup);
  else teacherExpandedTopics[scope].delete(el.dataset.tgroup);
 }));
}
function teacherTopicHeader(t,countText){
 return `<span class="topicCardIcon" aria-hidden="true">${esc(t.icon||'💻')}</span><span class="topicCardTitle"><b>${esc(t.title)}</b></span><span class="topicCardCount">${esc(countText)}</span>`;
}

// Ta pati mokymosi failų eilutė visose aplinkose: mokinys, mokinio peržiūra ir mokytojas.
function learningFileRow(r,mode='student'){
 const id=esc(r.id),name=esc(r.title||r.original_name||'Failas'),original=esc(r.original_name||r.title||'');
 const key=mode==='teacher'?'data-download-resource':mode==='preview'?'data-preview-resource':'data-sresource';
 const isTheory=r.resource_kind==='theory';
 const typeLabel=isTheory?'Teorija':'Užduotys';
 const fileActionLabel=isTheory?'Atidaryti naujame skirtuke':'Atsisiųsti';
 const actionIcon=isTheory?'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M13 5h6v6m0-6-9 9"/><path d="M19 13v5a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h6"/></svg>':'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M12 4v12m-4-4 4 4 4-4M4 19.5h16"/></svg>';
 const removeIcon='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M4 7h16M9 7V5h6v2m-9 0 .7 12h10.6L18 7M10 10.5v5M14 10.5v5"/></svg>';
 return `<div class="resourceRow resourceDownloadCard learningFileRow ${isTheory?'learningTheoryFile':'learningTaskFile'}">
  <span class="resourceFileGlyph" aria-hidden="true">${isTheory?'📖':'📄'}</span>
  <div class="grow"><b title="${name}">${name}</b> <span class="learningFileKind ${isTheory?'kindTheory':'kindTask'}">${typeLabel}</span><div class="subtle" title="${original}">${original}</div></div>
  <div class="learningFileActions"><button type="button" class="smallBtn resourceDownloadAction" ${key}="${id}" data-resource-kind="${isTheory?'theory':'task'}" aria-label="${fileActionLabel}: ${name}" title="${fileActionLabel}">${actionIcon}</button>
  ${mode==='teacher'?`<button type="button" class="smallBtn learningFileDelete" data-delete-resource="${id}" aria-label="Ištrinti failą: ${name}" title="Ištrinti">${removeIcon}</button>`:''}</div>
 </div>`;
}

// Peržiūra nesimuliuoja konkretaus mokinio pateiktų darbų: įkėlimo veiksmai išjungti.
function previewTaskRow(a){
 const name=esc(a.title||'Užduotis');
 return `<section class="compactTask previewCompactTask"><div class="compactTaskHeader">
 <div class="compactTaskGlyph" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><rect x="5" y="3.5" width="14" height="17" rx="2.6"/><path d="M8.5 9h7M8.5 13h7M8.5 17h4.5"/></svg></div>
 <div class="compactTaskInfo"><b>${name}</b><div class="compactTaskSecondary">${a.instructions?`<span class="compactTaskInstructions" title="${esc(a.instructions)}">${esc(a.instructions)}</span>`:''}${a.due_at?`<span class="compactTaskDeadline">Iki ${esc(fmtDate(a.due_at).split(' ')[0])}</span>`:''}</div></div>
 <div class="compactTaskActions"><button class="compactTaskUpload" type="button" disabled title="Peržiūros režimas: mokinys galėtų įkelti darbą" aria-label="Įkelti failą užduočiai ${name} (tik peržiūra)"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 17V5m-4.5 4.5L12 5l4.5 4.5"/><path d="M4 17.5v2h16v-2"/></svg><span>Įkelti</span></button></div></div></section>`;
}

async function renderTeacherResources(c){
 const [resourcesResult,assignmentsResult,foldersResult]=await Promise.all([
  sb.from('learning_resources').select('*').eq('class_id',c.id).order('created_at',{ascending:false}),
  sb.from('assignments').select('id,topic_id,title,is_open,due_at').eq('class_id',c.id).order('created_at',{ascending:false}),
  sb.from('learning_resource_folders').select('*').eq('class_id',c.id).order('name')
 ]);
 if(resourcesResult.error)return toast(resourcesResult.error.message);
 if(assignmentsResult.error)return toast(assignmentsResult.error.message);
 if(foldersResult.error)return toast('Aplankų klaida: '+foldersResult.error.message);
 const rows=resourcesResult.data||[],tasks=assignmentsResult.data||[],folders=foldersResult.data||[];
 const knownIds=new Set(activeClassTopics.map(t=>t.id));
 const extraTopicIds=[...new Set([...rows.map(r=>r.topic_id),...tasks.map(t=>t.topic_id)].filter(id=>id&&!knownIds.has(id)))];
 const groupTopics=[...activeClassTopics,...extraTopicIds.map(id=>topicById(id)||{id,title:id,icon:'📁'})];
 const groups=groupTopics.map(topic=>({topic,items:rows.filter(r=>r.topic_id===topic.id),tasks:tasks.filter(t=>t.topic_id===topic.id),folders:folders.filter(f=>f.topic_id===topic.id)}));
 $('teacherClassPanel').innerHTML=`<div class="panel teacherThemePanel">
  <div class="sectionTitle teacherThemeHead refreshedTeacherResourcesHead"><div class="grow"><h2>Mokymosi failai</h2></div>
   <button class="primary refreshedUploadButton" id="uploadResourceBtn" ${activeClassTopics.length?'':'disabled'}>+ Įkelti failą</button></div>
  <div class="teacherTopicDeck">${groups.length?groups.map(g=>`<details class="topicContentGroup teacherTopicCard" data-tgroup="${esc(g.topic.id)}" ${teacherExpandedTopics.resources.has(g.topic.id)?'open':''}>
    <summary>${teacherTopicHeader(g.topic,`${g.items.length} fail. · ${g.tasks.length} užd.`)}</summary>
    <div class="topicContentBody">
      <div class="topicGroupToolbar compactResourceToolbar"><span class="topicSubsectionLabel">Failai atsisiuntimui</span><button class="compactTaskUpload compactResourceAdd" data-resource-topic="${esc(g.topic.id)}" ${activeClassTopics.some(t=>t.id===g.topic.id)?'':'disabled'}>+ Pridėti</button></div>
      <div class="topicGroupToolbar compactResourceToolbar"><span class="subtle">Nutempk failą į aplanką arba pasirink „Perkelti“</span><button type="button" class="smallBtn" data-create-resource-folder="${esc(g.topic.id)}">+ Aplankas</button></div>
      <div class="resourceFolderGrid">
       ${g.folders.map(folder=>`<details class="resourceFolder" data-folder-drop="${esc(folder.id)}"><summary>📁 ${esc(folder.name)} <span class="subtle">(${g.items.filter(r=>r.folder_id===folder.id).length})</span></summary><div class="learningFileList">${g.items.filter(r=>r.folder_id===folder.id).map(r=>teacherFolderFileRow(r)).join('')||'<div class="compactTaskEmpty">Aplankas tuščias. Nutempk failą čia.</div>'}</div><button type="button" class="smallBtn" data-resource-add-folder="${esc(folder.id)}" data-folder-topic="${esc(g.topic.id)}">+ Įkelti čia</button> <button type="button" class="smallBtn" data-rename-resource-folder="${esc(folder.id)}">Pervadinti</button> <button type="button" class="smallBtn" data-delete-resource-folder="${esc(folder.id)}">Pašalinti aplanką</button></details>`).join('')}
      </div>
      <div class="resourceFolderLoose" data-folder-drop="" data-topic-drop="${esc(g.topic.id)}"><b>Failai be aplanko</b><div class="learningFileList">${g.items.filter(r=>!r.folder_id).map(r=>teacherFolderFileRow(r)).join('')||'<div class="compactTaskEmpty">Visi failai suskirstyti į aplankus.</div>'}</div></div>
      <div class="topicSubsection refreshedTasksSubsection"><div class="topicGroupToolbar compactResourceToolbar"><span class="topicSubsectionLabel">Užduotys mokiniams</span><button class="compactTaskUpload compactResourceAdd" data-resource-new-assignment="${esc(g.topic.id)}" ${activeClassTopics.some(t=>t.id===g.topic.id)?'':'disabled'}>+ Nauja</button></div>
       <div class="compactTaskList">${g.tasks.length?g.tasks.map(a=>`<section class="compactTask teacherResourceTask"><div class="compactTaskHeader"><div class="compactTaskGlyph" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><rect x="5" y="3.5" width="14" height="17" rx="2.6"/><path d="M8.5 9h7M8.5 13h7"/></svg></div><div class="compactTaskInfo"><b>${esc(a.title)}</b><div class="compactTaskSecondary">${a.due_at?`Iki ${esc(fmtDate(a.due_at).split(' ')[0])}`:'Be termino'}</div></div><span class="teacherTaskStatus ${a.is_open?'isOpen':''}">${a.is_open?'Atidaryta':'Uždaryta'}</span></div></section>`).join(''):'<div class="compactTaskEmpty">Užduočių nėra.</div>'}</div></div>
    </div>
   </details>`).join(''):'<div class="emptyState">Temų dar nėra. Pirmiausia sukurk temą.</div>'}</div>
 </div>`;
 $('uploadResourceBtn').onclick=()=>resourceUploadModal(c);
 document.querySelectorAll('[data-resource-topic]').forEach(b=>b.onclick=()=>resourceUploadModal(c,b.dataset.resourceTopic));
 document.querySelectorAll('[data-resource-new-assignment]').forEach(b=>b.onclick=()=>newAssignmentModal(c,b.dataset.resourceNewAssignment,true));
 document.querySelectorAll('[data-download-resource]').forEach(b=>b.onclick=()=>downloadResource(b.dataset.downloadResource,b.dataset.resourceKind));
 document.querySelectorAll('[data-delete-resource]').forEach(b=>b.onclick=()=>deleteResource(b.dataset.deleteResource,c));
 document.querySelectorAll('[data-create-resource-folder]').forEach(b=>b.onclick=()=>createResourceFolder(c,b.dataset.createResourceFolder));
 document.querySelectorAll('[data-rename-resource-folder]').forEach(b=>b.onclick=()=>renameResourceFolder(c,b.dataset.renameResourceFolder,folders));
 document.querySelectorAll('[data-delete-resource-folder]').forEach(b=>b.onclick=()=>deleteResourceFolder(c,b.dataset.deleteResourceFolder));
 document.querySelectorAll('[data-move-resource]').forEach(b=>b.onclick=()=>chooseResourceFolder(c,b.dataset.moveResource,rows,folders));
 document.querySelectorAll('[data-change-resource-kind]').forEach(b=>b.onclick=()=>changeResourceKind(c,b.dataset.changeResourceKind,b.dataset.newKind));
 document.querySelectorAll('[data-resource-add-folder]').forEach(b=>b.onclick=()=>resourceUploadModal(c,b.dataset.folderTopic,b.dataset.resourceAddFolder));
 document.querySelectorAll('[data-resource-drag]').forEach(el=>el.addEventListener('dragstart',e=>{e.dataTransfer.setData('text/plain',el.dataset.resourceDrag);e.dataTransfer.effectAllowed='move'}));
 document.querySelectorAll('[data-folder-drop]').forEach(el=>{
  el.addEventListener('dragover',e=>{e.preventDefault();e.dataTransfer.dropEffect='move';el.classList.add('dragOver')});
  el.addEventListener('dragleave',()=>el.classList.remove('dragOver'));
  el.addEventListener('drop',async e=>{e.preventDefault();el.classList.remove('dragOver');const id=e.dataTransfer.getData('text/plain');if(!id)return;await moveResourceIntoFolder(c,id,el.dataset.folderDrop||null)});
 });
 rememberTeacherTopicExpansion('resources');
}


function teacherFolderFileRow(r){
 const html=learningFileRow(r,'teacher');
 const nextKind=r.resource_kind==='theory'?'task':'theory';
 const nextTitle=nextKind==='theory'?'Pažymėti kaip teoriją':'Pažymėti kaip užduotis';
 return '<div draggable="true" data-resource-drag="'+esc(r.id)+'" class="resourceDraggable">'+html+'<button type="button" class="smallBtn" data-change-resource-kind="'+esc(r.id)+'" data-new-kind="'+nextKind+'" title="'+nextTitle+'">Tipas</button><button type="button" class="smallBtn" data-move-resource="'+esc(r.id)+'">Perkelti</button></div>';
}
async function changeResourceKind(c,id,kind){
 if(!['theory','task'].includes(kind))return;
 const {error}=await sb.from('learning_resources').update({resource_kind:kind}).eq('id',id).eq('class_id',c.id);
 if(error)return toast('Nepavyko pakeisti tipo: '+error.message);
 toast(kind==='theory'?'Pažymėta kaip teorija.':'Pažymėta kaip užduotys.');
 await renderTeacherResources(c);
}
async function createResourceFolder(c,topicId){
 const name=prompt('Naujo aplanko pavadinimas:')?.trim();if(!name)return;
 const {error}=await sb.from('learning_resource_folders').insert({class_id:c.id,topic_id:topicId,name,created_by:me.id});
 if(error)return toast('Nepavyko sukurti aplanko: '+error.message);
 teacherExpandedTopics.resources.add(topicId);await renderTeacherResources(c);
}
async function renameResourceFolder(c,id,folders){
 const folder=folders.find(x=>x.id===id);if(!folder)return;
 const name=prompt('Aplanko pavadinimas:',folder.name)?.trim();if(!name||name===folder.name)return;
 const {error}=await sb.from('learning_resource_folders').update({name}).eq('id',id).eq('class_id',c.id);
 if(error)return toast(error.message);await renderTeacherResources(c);
}
async function deleteResourceFolder(c,id){
 if(!confirm('Pašalinti aplanką? Jame esantys failai nebus ištrinti – liks be aplanko.'))return;
 const {error}=await sb.from('learning_resource_folders').delete().eq('id',id).eq('class_id',c.id);
 if(error)return toast(error.message);await renderTeacherResources(c);
}
async function moveResourceIntoFolder(c,resourceId,folderId){
 const {error}=await sb.rpc('set_learning_resource_folder',{p_resource_id:resourceId,p_folder_id:folderId});
 if(error)return toast('Perkėlimo klaida: '+error.message);
 toast('Failas perkeltas.');await renderTeacherResources(c);
}
async function chooseResourceFolder(c,id,rows,folders){
 const resource=rows.find(r=>r.id===id);if(!resource)return;
 const list=folders.filter(f=>f.topic_id===resource.topic_id);
 const options=['Be aplanko',...list.map(f=>f.name)];
 const choice=prompt('Kur perkelti failą? Įvesk numerį:\\n'+options.map((s,i)=>i+' – '+s).join('\\n'));
 if(choice===null)return;
 const n=Number(choice);if(!Number.isInteger(n)||n<0||n>=options.length)return toast('Netinkamas aplanko numeris.');
 await moveResourceIntoFolder(c,id,n===0?null:list[n-1].id);
}

async function resourceUploadModal(c,presetTopicId=null,presetFolderId=null){
 if(!activeClassTopics.length)return toast('Pirmiausia klasėje sukurk bent vieną temą.');
 const {data:folders,error:folderError}=await sb.from('learning_resource_folders')
  .select('id,name,topic_id').eq('class_id',c.id).order('name');
 if(folderError)return toast('Nepavyko gauti aplankų: '+folderError.message);
 modal(`<span class="kicker">MOKYMOSI FAILAS</span><h2>Įkelti mokiniams</h2><form id="resourceForm" class="formGroup">
 <label>Tema<select id="resourceTopic">${activeClassTopics.map(t=>`<option value="${t.id}" ${t.id===presetTopicId?'selected':''}>${esc(t.title)}</option>`).join('')}</select></label>
 <label>Aplankas<select id="resourceFolder"><option value="">Be aplanko</option></select></label>
 <label>Medžiagos tipas<select id="resourceKind"><option value="task">📄 Užduotys (atsisiunčiamos)</option><option value="theory">📖 Teorija (atidaroma naujame skirtuke)</option></select></label>
 <p class="formHint">Teoriją patogiausia kelti PDF formatu: naršyklė ją atvers naujame skirtuke. Word ir Excel dokumentus naršyklė gali atsisiųsti, net jei pažymėta „Teorija“.</p>
 <label>Pavadinimas<input id="resourceTitle" required placeholder="Pvz., Loginės funkcijos AND, OR, NOT"></label>
 <label>Failas<input class="fileInput" type="file" id="resourceFile" required></label>
 <button class="primary" type="submit" style="margin-top:14px">Įkelti</button></form>`);
 const updateFolderOptions=()=>{
  const select=$('resourceFolder'),topic=$('resourceTopic').value;
  select.innerHTML='<option value="">Be aplanko</option>'+((folders||[]).filter(x=>x.topic_id===topic).map(x=>`<option value="${esc(x.id)}">${esc(x.name)}</option>`).join(''));
  if(presetFolderId&&(folders||[]).some(x=>x.id===presetFolderId&&x.topic_id===topic))select.value=presetFolderId;
  presetFolderId=null;
 };
 $('resourceTopic').onchange=updateFolderOptions;updateFolderOptions();
 $('resourceForm').onsubmit=async e=>{
  e.preventDefault();
  const form=$('resourceForm'),button=form?.querySelector('button[type="submit"]');
  if(!form||form.dataset.uploading==='true')return;
  const file=$('resourceFile').files[0];if(!file)return toast('Pasirink failą.');
  const topic=$('resourceTopic').value,title=$('resourceTitle').value.trim(),
        folderId=$('resourceFolder').value||null,resourceKind=$('resourceKind').value;
  form.dataset.uploading='true';if(button){button.disabled=true;button.textContent='Tikrinama...';}
  const status=(message,error=false)=>{
   let line=$('resourceUploadStatus');
   if(!line){line=document.createElement('p');line.id='resourceUploadStatus';line.setAttribute('role','status');form.appendChild(line);}
   line.textContent=message;line.style.color=error?'#b91c1c':'#475569';
  };
  let path='';
  try{
   const {data:duplicates,error:checkErr}=await sb.from('learning_resources')
    .select('id').eq('class_id',c.id).eq('topic_id',topic)
    .eq('original_name',file.name).eq('size_bytes',file.size).limit(1);
   if(checkErr)throw checkErr;
   if(duplicates?.length){status('Toks failas jau įkeltas į pasirinktą temą.',true);toast('Failas jau įkeltas.');return;}
   path=`${c.id}/${topic}/${storageFileName(file.name)}`;
   if(button)button.textContent='Įkeliamas...';
   status('Failas siunčiamas į saugyklą...');
   const {error:upErr}=await sb.storage.from('teacher-resources').upload(path,file,storageUploadOptions(file));
   if(upErr)throw upErr;
   status('Failas įkeltas; išsaugomas jo tipas ir aplankas...');
   const {error:dbErr}=await sb.from('learning_resources').insert({
    class_id:c.id,topic_id:topic,title,storage_path:path,original_name:file.name,
    mime_type:uploadContentType(file),size_bytes:file.size,uploaded_by:me.id,
    folder_id:folderId,resource_kind:resourceKind
   });
   if(dbErr){
    const {error:cleanErr}=await sb.storage.from('teacher-resources').remove([path]);
    if(cleanErr)console.warn('Nepašalintas neįregistruotas failas:',cleanErr);
    throw dbErr;
   }
   teacherExpandedTopics.resources.add(topic);
   closeModal();toast('Failas įkeltas į pasirinktą aplanką.');
   await renderTeacherResources(c);
  }catch(err){
   status('Nepavyko įkelti: '+(err?.message||'Nežinoma klaida'),true);
   toast('Įkėlimo klaida: '+(err?.message||'Nežinoma klaida'));
   console.error('Mokymosi failo įkėlimo klaida:',err);
  }finally{
   form.dataset.uploading='false';
   if(button){button.disabled=false;button.textContent='Įkelti';}
  }
 };
}

async function downloadResource(id,kind='task'){
 // Atidarome skirtuką sinchroniškai, kad naršyklė jo neužblokuotų po asinchroninio kreipinio.
 const tab=kind==='theory'?window.open('about:blank','_blank'):null;
 if(tab)tab.opener=null;
 const {data:r,error}=await sb.from('learning_resources').select('*').eq('id',id).single();
 if(error||!r){if(tab)tab.close();return toast('Failo nepavyko atidaryti: '+(error?.message||'Nerastas'));}
 const theory=r.resource_kind==='theory';
 try{
  if(r.site_file_path){
   if(!/^learning-materials\\/[A-Za-z0-9_./-]+$/.test(r.site_file_path))throw new Error('Netinkama failo nuoroda');
   const url=new URL(r.site_file_path,location.origin);
   if(theory){
    if(tab)tab.location.replace(url.href);else window.open(url.href,'_blank','noopener');
   }else{
    const res=await fetch(url.href);
    if(!res.ok)throw new Error('Nepavyko atsisiųsti failo ('+res.status+')');
    const blob=await res.blob(),link=document.createElement('a'),blobUrl=URL.createObjectURL(blob);
    link.href=blobUrl;link.download=r.original_name||url.pathname.split('/').pop()||'Užduotys';
    document.body.appendChild(link);link.click();link.remove();
    setTimeout(()=>URL.revokeObjectURL(blobUrl),60000);
   }
   return;
  }
  if(theory){
   // Supabase privatus failas: laikinai pasirašyta nuoroda, be 'download' parametro.
   const {data,error:signError}=await sb.storage.from('teacher-resources').createSignedUrl(r.storage_path,180);
   if(signError||!data?.signedUrl)throw signError||new Error('Nepavyko gauti laikinos nuorodos');
   if(tab)tab.location.replace(data.signedUrl);else window.open(data.signedUrl,'_blank','noopener');
  }else await downloadOriginalFile('teacher-resources',r.storage_path,r.original_name);
 }catch(err){
  if(tab)tab.close();
  toast('Failo klaida: '+(err?.message||'Nepavyko atidaryti'));
 }
}
async function deleteResource(id,c){
 if(!confirm('Ištrinti failą?'))return;
 const {data:r,error}=await sb.from('learning_resources').select('*').eq('id',id).single();
 if(error||!r)return toast(error?.message||'Failas nerastas');
 if(!r.site_file_path){
  const {error:storageErr}=await sb.storage.from('teacher-resources').remove([r.storage_path]);
  if(storageErr)return toast('Saugyklos klaida: '+storageErr.message);
 }
 const {error:dbErr}=await sb.from('learning_resources').delete().eq('id',id);
 if(dbErr)return toast(dbErr.message);
 await renderTeacherResources(c);
}

// Mokytojo aplankai – tai tik DB susiejimai. Originalūs mokinių failai neliečiami.
const teacherWorkFolderFilter={};
async function renderTeacherAssignments(c){
 const [ar,dr,pr,fr,pl]=await Promise.all([
  sb.from('assignments').select('*').eq('class_id',c.id).order('created_at',{ascending:false}),
  sb.from('direct_submissions').select('*').eq('class_id',c.id).order('submitted_at',{ascending:false}),
  sb.from('class_posts').select('id,topic_id').eq('class_id',c.id),
  sb.from('submission_folders').select('*').eq('class_id',c.id).order('created_at',{ascending:true}),
  sb.from('submission_folder_items').select('*').eq('class_id',c.id)
 ]);
 if(ar.error)return toast(ar.error.message);
 if(dr.error)return toast(dr.error.message);
 if(pr.error)return toast(pr.error.message);
 const rows=ar.data||[],direct=dr.data||[],topicPosts=pr.data||[];
 const folderReady=!fr.error&&!pl.error;
 const folders=folderReady?(fr.data||[]):[];
 const placements=folderReady?(pl.data||[]):[];
 const aIds=rows.map(a=>a.id);
 let assignmentSubs=[];
 if(aIds.length){const resp=await sb.from('submissions').select('id,assignment_id,student_id,original_name,submitted_at').in('assignment_id',aIds);if(resp.error)return toast(resp.error.message);assignmentSubs=resp.data||[];}
 const ids=[...new Set([...direct,...assignmentSubs].map(s=>s.student_id))];
 let studs=[];
 if(ids.length){const resp=await sb.from('profiles').select('id,full_name').in('id',ids);studs=resp.data||[];}
 const studentName=id=>studs.find(s=>s.id===id)?.full_name||'Mokinys';
 const countFor=id=>assignmentSubs.filter(s=>s.assignment_id===id).length;
 const postCountFor=id=>topicPosts.filter(p=>p.topic_id===id).length;
 const knownIds=new Set(activeClassTopics.map(t=>t.id));
 const contentIds=[...new Set([...rows.map(x=>x.topic_id),...direct.map(x=>x.topic_id),...topicPosts.map(x=>x.topic_id)].filter(Boolean))];
 const topics=[...activeClassTopics,...contentIds.filter(id=>!knownIds.has(id)).map(id=>topicById(id)||{id,title:id,icon:'📁'})];
 const archive=[
  ...direct.map(s=>({...s,kind:'direct',assignmentTitle:s.title||'Pateiktas darbas',topicId:s.topic_id})),
  ...assignmentSubs.map(s=>({...s,kind:'assignment',assignmentTitle:rows.find(a=>a.id===s.assignment_id)?.title||'Užduotis',topicId:rows.find(a=>a.id===s.assignment_id)?.topic_id}))
 ].sort((a,b)=>String(b.submitted_at).localeCompare(String(a.submitted_at)));
 const folderOf=x=>placements.find(p=>p.kind===x.kind&&p.submission_id===x.id)?.folder_id||'';
 let selected=teacherWorkFolderFilter[c.id]||'all';
 if(selected!=='all'&&selected!=='unsorted'&&!folders.some(f=>f.id===selected))selected='all';
 teacherWorkFolderFilter[c.id]=selected;
 const archiveList=(selectedId)=>{
  const shown=archive.filter(s=>selectedId==='all'||(selectedId==='unsorted'?!folderOf(s):folderOf(s)===selectedId));
  return shown.length?shown.map(s=>`<div class="workArchiveItem">
   <div class="workArchiveFileIcon" aria-hidden="true">📄</div>
   <div class="grow workArchiveFileInfo"><b>${esc(studentName(s.student_id))}</b><span>${esc(s.assignmentTitle)} · ${esc(topicById(s.topicId)?.title||'Tema')}</span><small title="${esc(s.original_name)}">${esc(s.original_name)} · ${fmtDate(s.submitted_at)}</small></div>
   <div class="workArchiveActions"><label class="folderMoveLabel">Aplankas<select data-move-kind="${s.kind}" data-move-file="${s.id}" aria-label="Pasirinkti aplanką failui ${esc(s.original_name)}"><option value="" ${folderOf(s)?'':'selected'}>Nesurūšiuota</option>${folders.map(f=>`<option value="${f.id}" ${folderOf(s)===f.id?'selected':''}>${esc(f.name)}</option>`).join('')}</select></label>
    <button class="smallBtn moveFileButton" data-folder-move="${s.kind}:${s.id}">📁 Perkelti</button><button class="smallBtn" data-archive-download="${s.kind}:${s.id}">↓ Atsisiųsti</button></div></div>`).join(''):'<div class="emptyState">Šiame aplanke darbų nėra.</div>';
 };
 const folderChip=(id,title,count)=>`<button class="folderChip ${selected===id?'active':''}" data-folder-filter="${id}">${esc(title)} <span>${count}</span></button>`;
 const folderChoices=folderChip('all','Visi',archive.length)+folderChip('unsorted','Nesurūšiuoti',archive.filter(s=>!folderOf(s)).length)+folders.map(f=>folderChip(f.id,f.name,archive.filter(s=>folderOf(s)===f.id).length)).join('');
 $('teacherClassPanel').innerHTML=`<div class="panel teacherThemePanel">
  <div class="sectionTitle teacherThemeHead"><div class="grow"><span class="kicker">DARBŲ PATEIKIMAS</span><h2>Užduotys mokiniams</h2><p class="muted">Atverk temą, sukurk užduotį ir peržiūrėk pateiktus darbus.</p></div>
   <button class="primary" id="newAssignmentBtn" ${activeClassTopics.length?'':'disabled'}>+ Nauja užduotis</button></div>
  <div class="teacherTopicDeck">${topics.length?topics.map(t=>{
    const ta=rows.filter(a=>a.topic_id===t.id),td=direct.filter(s=>s.topic_id===t.id),postCount=postCountFor(t.id);
    const subCount=ta.reduce((n,a)=>n+countFor(a.id),0)+td.length;
    return `<details class="topicContentGroup teacherTopicCard assignmentTopicGroup" data-tgroup="${esc(t.id)}" ${teacherExpandedTopics.assignments.has(t.id)?'open':''}>
    <summary>${teacherTopicHeader(t,`${ta.length} užd. · ${subCount} darb.`)}</summary>
    <div class="topicContentBody">
     <div class="topicGroupToolbar"><button class="smallBtn" data-assignment-topic-posts="${t.id}">Pranešimai ${postCount?`(${postCount})`:''}</button><button class="primary smallPrimary" data-new-topic-assignment="${t.id}" ${activeClassTopics.some(v=>v.id===t.id)?'':'disabled'}>+ Nauja užduotis</button></div>
     <div class="topicSubsection"><h3>Mokytojo paskirtos užduotys</h3>
      ${ta.length?ta.map(a=>`<div class="assignmentRow"><div class="grow"><b>${esc(a.title)}</b><div class="subtle">${a.is_open?'Atidaryta':'Uždaryta'} · terminas ${a.due_at?fmtDate(a.due_at):'nenustatytas'}</div></div><span class="badge ${countFor(a.id)?'ok':''}">${countFor(a.id)} fail.</span><div class="assignmentActions"><button class="smallBtn" data-edit-assignment="${a.id}">Redaguoti</button><button class="smallBtn" data-assignment="${a.id}">Pateikti darbai</button><button class="smallBtn dangerMini" data-delete-assignment="${a.id}" data-file-count="${countFor(a.id)}">Ištrinti</button></div></div>`).join(''):'<div class="topicEmptyLine">Užduočių dar nėra.</div>'}</div>
     <div class="topicSubsection"><h3>Įkelti savarankiški darbai</h3>
      ${td.length?td.map(s=>`<div class="submissionRow"><div class="grow"><b>${esc(studentName(s.student_id))} · ${esc(s.title||s.original_name)}</b><div class="subtle">${esc(s.original_name)} · ${fmtDate(s.submitted_at)}</div></div><button class="smallBtn" data-folder-move="direct:${s.id}">📁 Perkelti</button><button class="smallBtn" data-ddirect="${s.id}">Atsisiųsti</button><button class="smallBtn dangerMini" data-del-direct="${s.id}">Ištrinti</button></div>`).join(''):'<div class="topicEmptyLine">Darbų dar nėra.</div>'}</div>
    </div></details>`;
  }).join(''):'<div class="emptyState">Pirmiausia sukurk klasės temą.</div>'}</div>
 </div>
 <div class="panel workArchivePanel" id="workArchivePanel"><div class="sectionTitle teacherThemeHead"><div class="grow"><span class="kicker">MOKINIŲ FAILAI</span><h2>Pateiktų darbų archyvas</h2><p class="muted">Dėliok failus į savo aplankus. Failai mokinių paskyrose nepasikeis.</p></div>${folderReady?'<button class="primary" id="newSubmissionFolderBtn">+ Naujas aplankas</button>':''}</div>
 ${folderReady?`<div class="folderChips" id="folderChips">${folderChoices}</div><div class="folderArchiveToolbar"><span id="workArchiveCounter">${archive.length} pateiktų failų</span><div id="folderEditControls">${selected!=='all'&&selected!=='unsorted'?`<button class="smallBtn" id="renameSubmissionFolder">Pervadinti aplanką</button><button class="smallBtn dangerMini" id="deleteSubmissionFolder">Pašalinti aplanką</button>`:''}</div></div><div id="workArchiveItems">${archiveList(selected)}</div>`:'<div class="notice">Aplankų funkcijai pirmiausia paleisk prie šios svetainės versijos pridėtą SQL kodą Supabase sistemoje. Pateikti darbai liko nepakeisti.</div>'}
 </div>`;
 const archivePanel=$('workArchivePanel');if(archivePanel)archivePanel.parentElement.prepend(archivePanel);
 $('newAssignmentBtn').onclick=()=>newAssignmentModal(c);
 document.querySelectorAll('[data-new-topic-assignment]').forEach(b=>b.onclick=()=>newAssignmentModal(c,b.dataset.newTopicAssignment));
 document.querySelectorAll('[data-assignment-topic-posts]').forEach(b=>b.onclick=()=>navigateTo(()=>renderTeacherTopicPosts(c,b.dataset.assignmentTopicPosts)));
 document.querySelectorAll('[data-edit-assignment]').forEach(b=>b.onclick=()=>editAssignmentModal(b.dataset.editAssignment,c));
 document.querySelectorAll('[data-delete-assignment]').forEach(b=>b.onclick=()=>deleteAssignment(b.dataset.deleteAssignment,c,Number(b.dataset.fileCount||0)));
 document.querySelectorAll('[data-assignment]').forEach(b=>b.onclick=()=>showSubmissions(b.dataset.assignment,c));
 document.querySelectorAll('[data-ddirect]').forEach(b=>b.onclick=()=>downloadDirectSubmission(b.dataset.ddirect));
 document.querySelectorAll('.assignmentTopicGroup [data-folder-move]').forEach(b=>b.onclick=()=>{const [kind,id]=b.dataset.folderMove.split(':');moveStudentWorkModal(c,kind,id)});
 document.querySelectorAll('[data-del-direct]').forEach(b=>b.onclick=()=>deleteDirectSubmission(b.dataset.delDirect,c,'teacher'));
 rememberTeacherTopicExpansion('assignments');
 if(!folderReady)return;
 if($('newSubmissionFolderBtn'))$('newSubmissionFolderBtn').onclick=()=>editSubmissionFolderModal(c);
 function bindArchive(){
  document.querySelectorAll('[data-folder-filter]').forEach(b=>b.onclick=()=>{teacherWorkFolderFilter[c.id]=b.dataset.folderFilter;renderTeacherAssignments(c)});
  document.querySelectorAll('[data-archive-download]').forEach(b=>b.onclick=()=>{const [kind,id]=b.dataset.archiveDownload.split(':');kind==='direct'?downloadDirectSubmission(id):downloadSubmission(id)});
  document.querySelectorAll('#workArchivePanel [data-folder-move]').forEach(b=>b.onclick=()=>{const [kind,id]=b.dataset.folderMove.split(':');moveStudentWorkModal(c,kind,id)});
  document.querySelectorAll('[data-move-file]').forEach(sel=>sel.onchange=async()=>{
   const old=placements.find(p=>p.kind===sel.dataset.moveKind&&p.submission_id===sel.dataset.moveFile)?.folder_id||'';
   sel.disabled=true;
   let error;
   if(sel.value){({error}=await sb.from('submission_folder_items').upsert({class_id:c.id,kind:sel.dataset.moveKind,submission_id:sel.dataset.moveFile,folder_id:sel.value,placed_by:me.id},{onConflict:'kind,submission_id'}));}
   else{({error}=await sb.from('submission_folder_items').delete().eq('class_id',c.id).eq('kind',sel.dataset.moveKind).eq('submission_id',sel.dataset.moveFile));}
   if(error){toast(error.message);sel.disabled=false;sel.value=old;return}
   toast('Darbas priskirtas aplankui.');renderTeacherAssignments(c);
  });
  if($('renameSubmissionFolder'))$('renameSubmissionFolder').onclick=()=>editSubmissionFolderModal(c,folders.find(f=>f.id===teacherWorkFolderFilter[c.id]));
  if($('deleteSubmissionFolder'))$('deleteSubmissionFolder').onclick=async()=>{
   const f=folders.find(x=>x.id===teacherWorkFolderFilter[c.id]);if(!f)return;
   if(!confirm(`Pašalinti aplanką „${f.name}“? Jame esantys mokinių failai NEBUS ištrinti, tik taps nesurūšiuoti.`))return;
   const {error}=await sb.from('submission_folders').delete().eq('id',f.id).eq('class_id',c.id);
   if(error)return toast(error.message);teacherWorkFolderFilter[c.id]='unsorted';toast('Aplankas pašalintas. Mokinių failai išsaugoti.');renderTeacherAssignments(c);
  };
 }
 bindArchive();
}
async function moveStudentWorkModal(c,kind,id){
 const [{data:folders,error},{data:placements,error:pErr}]=await Promise.all([
  sb.from('submission_folders').select('id,name').eq('class_id',c.id).order('name'),
  sb.from('submission_folder_items').select('folder_id').eq('class_id',c.id).eq('kind',kind).eq('submission_id',id)
 ]);
 if(error||pErr)return toast('Aplankai nepasiekiami. Patikrink v5.22 SQL: '+(error||pErr).message);
 const current=placements?.[0]?.folder_id||'';
 modal(`<span class="kicker">MOKINIO DARBAS</span><h2>📁 Perkelti į aplanką</h2><p class="muted">Pasirink aplanką arba sukurk naują. Originalus failas lieka saugykloje, mokinys jo nepraranda.</p>
 <form id="moveStudentWorkForm" class="formGroup"><label>Aplankas<select id="moveStudentWorkFolder"><option value="">Nesurūšiuota</option>${(folders||[]).map(f=>`<option value="${f.id}" ${f.id===current?'selected':''}>${esc(f.name)}</option>`).join('')}</select></label>
 <label>Arba sukurk naują aplanką<input id="moveStudentWorkNewFolder" maxlength="100" placeholder="Pvz., Excel II savarankiškas"></label><button class="primary" type="submit">Išsaugoti perkėlimą</button></form>`);
 $('moveStudentWorkForm').onsubmit=async e=>{
  e.preventDefault();let folderId=$('moveStudentWorkFolder').value;const name=$('moveStudentWorkNewFolder').value.trim();const btn=$('moveStudentWorkForm').querySelector('button[type="submit"]');btn.disabled=true;
  if(name){const ins=await sb.from('submission_folders').insert({class_id:c.id,name,created_by:me.id}).select('id').single();if(ins.error){btn.disabled=false;return toast(ins.error.message)}folderId=ins.data.id;}
  const res=folderId?await sb.from('submission_folder_items').upsert({class_id:c.id,kind,submission_id:id,folder_id:folderId,placed_by:me.id},{onConflict:'kind,submission_id'}):await sb.from('submission_folder_items').delete().eq('class_id',c.id).eq('kind',kind).eq('submission_id',id);
  if(res.error){btn.disabled=false;return toast(res.error.message)}
  closeModal();toast(folderId?'Darbas perkeltas į aplanką.':'Darbas grąžintas į nesurūšiuotus.');teacherWorkFolderFilter[c.id]='all';renderTeacherAssignments(c);
 };
}

function editSubmissionFolderModal(c,folder=null){
 modal(`<span class="kicker">MOKINIŲ DARBŲ APLANKAI</span><h2>${folder?'Pervadinti aplanką':'Naujas aplankas'}</h2><p class="muted">Sukuriama tik grupė mokytojo aplinkoje. Failai saugykloje neliečiami.</p><form id="workFolderForm" class="formGroup"><label>Aplanko pavadinimas<input id="workFolderName" required maxlength="100" placeholder="Pvz., Kriptografija – praktiniai darbai"></label><button class="primary" type="submit">${folder?'Išsaugoti':'Sukurti aplanką'}</button></form>`);
 if(folder)$('workFolderName').value=folder.name;
 $('workFolderForm').onsubmit=async e=>{
  e.preventDefault();const name=$('workFolderName').value.trim();if(!name)return toast('Įrašyk aplanko pavadinimą.');
  const res=folder?await sb.from('submission_folders').update({name}).eq('id',folder.id).eq('class_id',c.id):await sb.from('submission_folders').insert({class_id:c.id,name,created_by:me.id}).select('id').single();
  if(res.error)return toast(res.error.message);
  if(!folder&&res.data?.id)teacherWorkFolderFilter[c.id]=res.data.id;
  closeModal();toast(folder?'Aplankas pervadintas.':'Aplankas sukurtas.');renderTeacherAssignments(c);
 };
}


function newAssignmentModal(c,presetTopicId=null,returnToResources=false){
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
  if(returnToResources)renderTeacherResources(c);else renderTeacherAssignments(c);
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
 ${(subs||[]).length?(subs||[]).map(s=>{const st=(studs||[]).find(x=>x.id===s.student_id);return `<div class="submissionRow"><div class="grow"><b>${esc(st?.full_name||'Mokinys')}</b><div class="subtle">${esc(s.original_name)} · ${fmtDate(s.submitted_at)}</div></div><button class="smallBtn" data-folder-move="assignment:${s.id}">📁 Perkelti</button><button class="smallBtn" data-dsub="${s.id}">Atsisiųsti</button><button class="smallBtn dangerMini" data-del-sub="${s.id}">Ištrinti</button></div>`}).join(''):'<div class="emptyState">Darbų dar nepateikta.</div>'}`);
 document.querySelectorAll('[data-dsub]').forEach(b=>b.onclick=()=>downloadSubmission(b.dataset.dsub));
 document.querySelectorAll('[data-folder-move]').forEach(b=>b.onclick=()=>{const [kind,id]=b.dataset.folderMove.split(':');moveStudentWorkModal(c,kind,id)});
 document.querySelectorAll('[data-del-sub]').forEach(b=>b.onclick=()=>deleteAssignmentSubmission(b.dataset.delSub,c,assignmentId,'teacher'));
}
async function downloadSubmission(id){
 const {data:s,error}=await sb.from('submissions').select('*').eq('id',id).single();if(error)return toast(error.message);
 await downloadOriginalFile('student-submissions',s.storage_path,s.original_name);
}
async function downloadDirectSubmission(id){
 const {data:s,error}=await sb.from('direct_submissions').select('*').eq('id',id).single();if(error)return toast(error.message);
 await downloadOriginalFile('student-submissions',s.storage_path,s.original_name);
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



/* ================= MOTYVACIJA ================= */
function motivationDefault(enabled=false){
 return {enabled,total_xp:0,level_no:1,level_name:'Pradedantysis',level_min_xp:0,next_level_xp:250,level_progress_percent:0,completed_practices:0,perfect_count:0,best_score:0,today_practices:0,streak_days:0,weekly_practices:0,weekly_goal:3,badges:[],badges_unlocked:0,topic_mastery:[],class_weekly_practices:0,class_challenge_goal:3,class_challenge_percent:0,classmates_visible:false,badges_visible:false,cosmetics_enabled:false,featured_badge_key:null,ui_theme:'default',unlocked_themes:[{key:'default',title:'Numatytoji',min_practices:0}]};
}
async function getMotivationSummary(classId){
 if(!classId)return motivationDefault(false);
 const {data,error}=await sb.rpc('get_my_motivation_summary',{p_class_id:classId});
 if(error){console.warn('Motyvacija:',error.message);return motivationDefault(false)}
 return data||motivationDefault(false);
}
async function getPracticeReward(attemptId){
 if(!attemptId)return null;
 const {data,error}=await sb.rpc('get_my_practice_reward',{p_attempt_id:attemptId});
 if(error){console.warn('XP:',error.message);return null}
 return data||null;
}
function masteryFor(summary,topicId){
 return (summary?.topic_mastery||[]).find(x=>x.topic_id===topicId)||null;
}
function motivationBadgeByKey(summary,key){
 return (summary?.badges||[]).find(b=>b.key===key)||null;
}
function applyMotivationSkin(summary){
 const html=document.documentElement;
 if(summary?.enabled&&summary?.cosmetics_enabled&&summary?.ui_theme&&summary.ui_theme!=='default')html.dataset.studentSkin=summary.ui_theme;
 else delete html.dataset.studentSkin;
}
function milestonePrivilege(summary){
 const n=Number(summary?.completed_practices)||0;
 const map={10:'Vandenynas',20:'Miškas',30:'Violetinė',50:'Naktis',100:'Aurora',200:'Auksinė',300:'Deimantinė',500:'Meistro',1000:'Legendos'};
 return map[n]||null;
}
function motivationProgressText(s){
 return s?.next_level_xp==null?`${Number(s.total_xp)||0} XP · aukščiausias lygis`:`${Number(s.total_xp)||0} / ${Number(s.next_level_xp)||0} XP`;
}
function renderMotivationCard(s){
 s=s||motivationDefault(false);if(!s.enabled)return '';
 const weekly=Math.min(Number(s.weekly_practices)||0,Number(s.weekly_goal)||3),weeklyGoal=Number(s.weekly_goal)||3;
 const classNow=Number(s.class_weekly_practices)||0,classGoal=Number(s.class_challenge_goal)||3;
 return `<section class="motivationCard">
  <div class="motivationTop">
   <div><span class="kicker">TAVO PROGRESAS</span><h2>${Number(s.level_no)||1} lygis · ${esc(s.level_name||'Pradedantysis')}</h2><p>${motivationProgressText(s)}</p></div>
   <div class="xpOrb"><strong>${Number(s.total_xp)||0}</strong><span>XP</span></div>
  </div>
  <div class="xpTrack"><span style="width:${Math.max(0,Math.min(100,Number(s.level_progress_percent)||0))}%"></span></div>
  <div class="motivationMiniGrid">
   <div><strong>🔥 ${Number(s.streak_days)||0}</strong><span>dienų serija</span></div>
   <div><strong>🎯 ${weekly} / ${weeklyGoal}</strong><span>treniruotės šią savaitę</span></div>
   <div><strong>🏅 ${Number(s.badges_unlocked)||0}</strong><span>atrakinti ženkliukai</span></div>
  </div>
  <div class="classChallengeMini">
   <div class="grow"><b>🤝 Klasės savaitės iššūkis</b><span>${classNow} / ${classGoal} treniruočių</span></div>
   <div class="miniProgress"><span style="width:${Math.max(0,Math.min(100,Number(s.class_challenge_percent)||0))}%"></span></div>
  </div>
  <div class="motivationActions"><button class="ghost" id="openAchievements">🏆 Mano pasiekimai</button><span class="subtle">${Number(s.today_practices)||0?'Dienos misija įvykdyta ✓':'Dienos misija: atlik 1 treniruotę'}</span></div>
 </section>`;
}
function detectNewBadge(summary,pct){
 if(!summary)return null;
 const n=Number(summary.completed_practices)||0;
 const milestones={
  10:{icon:'🌟',title:'Startuolis'},20:{icon:'🧭',title:'Aktyvus'},30:{icon:'⚡',title:'Įsibėgėjęs'},
  50:{icon:'🥉',title:'Atkaklus'},100:{icon:'🥈',title:'Patyręs'},200:{icon:'🥇',title:'Pažengęs'},
  300:{icon:'💎',title:'Žinovas'},500:{icon:'👑',title:'Meistras'},1000:{icon:'🏆',title:'Legenda'}
 };
 if(milestones[n])return milestones[n];
 if(n===1)return {icon:'🌱',title:'Pirmas žingsnis'};
 if(Number(pct)===100&&Number(summary.perfect_count)===1)return {icon:'🎯',title:'Be klaidų'};
 if(Number(summary.weekly_practices)===3)return {icon:'⭐',title:'Savaitės tikslas'};
 if(Number(summary.streak_days)===3)return {icon:'🔥',title:'3 dienų serija'};
 if(Number(summary.streak_days)===7)return {icon:'🔥',title:'7 dienų serija'};
 return null;
}
function renderPracticeMotivationReward(reward,topicId,pct){
 const box=$('motivationResult');if(!box)return;
 if(!reward?.enabled||!reward?.summary?.enabled){box.classList.add('hidden');box.innerHTML='';return}
 const s=reward.summary,m=masteryFor(s,topicId),badge=detectNewBadge(s,pct);
 box.classList.remove('hidden');
 box.innerHTML=`<div class="rewardXp"><span>Už treniruotę</span><strong>+${Number(reward.xp_gained)||0} XP</strong></div>
  <div class="rewardLevel"><div class="grow"><b>${Number(s.level_no)||1} lygis · ${esc(s.level_name||'Pradedantysis')}</b><span>${motivationProgressText(s)}</span></div><div class="miniProgress"><span style="width:${Math.max(0,Math.min(100,Number(s.level_progress_percent)||0))}%"></span></div></div>
  <div class="rewardFacts"><span>🔥 Serija: <b>${Number(s.streak_days)||0} d.</b></span><span>🎯 Savaitė: <b>${Math.min(Number(s.weekly_practices)||0,3)}/3</b></span>${m?`<span>📈 Temos įvaldymas: <b>${Number(m.mastery_percent)||0}%</b></span>`:''}</div>
  ${badge?`<div class="newBadge"><span>${badge.icon}</span><div><small>NAUJAS ŽENKLIUKAS</small><b>${esc(badge.title)}</b></div></div>`:''}
  ${s.cosmetics_enabled&&milestonePrivilege(s)?`<div class="newBadge privilegeUnlock"><span>🎨</span><div><small>NAUJA PRIVILEGIJA</small><b>Atrakinta tema „${esc(milestonePrivilege(s))}“</b></div></div>`:''}`;
}
async function renderAchievements(){
 stopTeacherPresenceRefresh();
 setPresenceContext('Pasiekimai',null);
 setCurrentRestore(()=>renderAchievements(),{kind:'achievements'});
 const c=await getStudentClass();
 if(!c)return renderStudent();
 $('achievementsContent').innerHTML='<div class="pageHero"><span class="kicker">PASIEKIMAI</span><h1>Kraunama...</h1></div>';
 await loadClassTopics(c.id);
 const s=await getMotivationSummary(c.id);
 if(!s.enabled){
  if($('achievementsNav'))$('achievementsNav').classList.add('hidden');
  $('achievementsContent').innerHTML=`<div class="pageHero"><button class="back" id="backAchievements">← Mano klasė</button><span class="kicker">🏆 PASIEKIMAI</span><h1>Motyvacinė sistema neįjungta</h1><p>Šiai paskyrai mokytojas motyvacinės sistemos dar neįjungė.</p></div><div class="panel"><div class="emptyState">Žinių treniruotes gali atlikti kaip įprastai. XP, lygiai ir ženkliukai bus rodomi tik tada, kai mokytojas įjungs sistemą.</div></div>`;
  show('achievements');$('backAchievements').onclick=()=>appBack(()=>renderStudent());return;
 }
 applyMotivationSkin(s);
 if($('classmatesNav'))$('classmatesNav').classList.toggle('hidden',!(s.enabled&&s.classmates_visible));
 const badges=s.badges||[],mastery=s.topic_mastery||[];
 const milestoneBadges=badges.filter(b=>/^m\d+$/.test(b.key||'')&&b.unlocked);
 const selectedBadge=s.featured_badge_key||'auto';
 const themes=s.unlocked_themes||[{key:'default',title:'Numatytoji',min_practices:0}];
 $('achievementsContent').innerHTML=`<div class="pageHero"><button class="back" id="backAchievements">← Mano klasė</button><span class="kicker">🏆 PASIEKIMAI</span><h1>Tavo mokymosi progresas</h1><p>XP gauni už žinių treniruotes. Atsiskaitymų pažymiai XP nekeičia.</p></div>
 ${renderMotivationCard(s)}
 <div class="contentGrid achievementsGrid"><div class="stack">
  <div class="panel"><div class="sectionTitle"><div class="grow"><span class="kicker">ŽENKLIUKAI</span><h2>Atrakinti pasiekimai</h2></div><span class="badge">${Number(s.badges_unlocked)||0}/${badges.length}</span></div>
   <div class="badgeGrid">${badges.map(b=>`<article class="achievementBadge ${b.unlocked?'unlocked':'locked'}"><div class="badgeIcon">${b.unlocked?esc(b.icon||'🏅'):'🔒'}</div><div><b>${esc(b.title||'Pasiekimas')}</b><p>${esc(b.description||'Dar neatrakinta')}</p></div></article>`).join('')}</div>
  </div>
  <div class="panel"><div class="sectionTitle"><div class="grow"><span class="kicker">TEMŲ ĮVALDYMAS</span><h2>Kaip sekasi pagal temas</h2></div></div>
   ${mastery.length?`<div class="masteryList">${mastery.map(m=>{const title=topicById(m.topic_id)?.title||m.topic_id;return `<div class="masteryRow"><div class="masteryHead"><b>${esc(title)}</b><strong>${Number(m.mastery_percent)||0}%</strong></div><div class="masteryTrack"><span style="width:${Math.max(0,Math.min(100,Number(m.mastery_percent)||0))}%"></span></div><div class="subtle">Paskutinių iki 5 treniruočių vidurkis · geriausias ${Number(m.best_score)||0}%</div></div>`}).join('')}</div>`:'<div class="emptyState">Atlik bent vieną žinių treniruotę – čia atsiras temos įvaldymas.</div>'}
  </div>
 </div><div class="stack">
  <div class="panel privilegePanel"><span class="kicker">PRIVILEGIJOS</span><h3>Profilio išvaizda</h3>
   <label class="motivationPrefLabel">Ženkliukas prie tavo vardo
    <select id="featuredMotivationBadge">
     <option value="auto" ${selectedBadge==='auto'||!s.featured_badge_key?'selected':''}>Automatiškai aukščiausias</option>
     ${milestoneBadges.map(b=>`<option value="${esc(b.key)}" ${s.featured_badge_key===b.key?'selected':''}>${esc(b.icon||'🏅')} ${esc(b.title)}</option>`).join('')}
    </select>
   </label>
   ${s.cosmetics_enabled?`<label class="motivationPrefLabel">Aplinkos tema
    <select id="motivationTheme">${themes.map(t=>`<option value="${esc(t.key)}" ${s.ui_theme===t.key?'selected':''}>${esc(t.title)}</option>`).join('')}</select>
   </label><div class="subtle">Naujos temos atrakinamos ilgalaikiais 10, 20, 30, 50, 100, 200, 300, 500 ir 1000 treniruočių pasiekimais.</div>`:'<div class="notice"><b>Kosmetinės privilegijos dar išjungtos.</b> Mokytojas gali jas įjungti motyvacinės sistemos nustatymuose.</div>'}
  </div>
  <div class="panel"><span class="kicker">KAIP RENKAMAS XP</span><h3>Atlygis už mokymąsi</h3><p class="muted">Savaitės tikslas – atlikti 3 žinių treniruotes per savaitę. Pvz., 0/3 reiškia, kad šią savaitę dar neatlikta nė viena iš trijų. 10 klausimų treniruotėje gali gauti iki maždaug 100 XP pagal rezultatą. 100 % rezultatas duoda papildomą premiją. Taip pat yra premija už pirmą dienos treniruotę, asmeninį pagerėjimą ir savaitės tikslą.</p><div class="notice"><b>Pakartotinės treniruotės:</b> tą pačią temą kartojant kelis kartus tą pačią dieną, už vėlesnius bandymus skiriama mažiau XP.</div></div>
  <div class="panel"><span class="kicker">BENDRAS TIKSLAS</span><h3>🤝 Klasės savaitės iššūkis</h3><p class="muted">Visa klasė kartu renka treniruotes į bendrą savaitės tikslą.</p><div class="masteryHead"><b>${Number(s.class_weekly_practices)||0} / ${Number(s.class_challenge_goal)||3}</b><strong>${Number(s.class_challenge_percent)||0}%</strong></div><div class="masteryTrack"><span style="width:${Math.max(0,Math.min(100,Number(s.class_challenge_percent)||0))}%"></span></div></div>
 </div></div>`;
 show('achievements');
 $('backAchievements').onclick=()=>appBack(()=>renderStudent());
 if($('openAchievements'))$('openAchievements').onclick=()=>{};
 if($('featuredMotivationBadge'))$('featuredMotivationBadge').onchange=async e=>{
  e.target.disabled=true;
  const value=e.target.value==='auto'?null:e.target.value;
  const {error}=await sb.rpc('set_my_featured_motivation_badge',{p_class_id:c.id,p_badge_key:value});
  if(error){e.target.disabled=false;return toast(error.message)}
  toast('Ženkliukas prie vardo atnaujintas.');
  renderAchievements();
 };
 if($('motivationTheme'))$('motivationTheme').onchange=async e=>{
  e.target.disabled=true;
  const {error}=await sb.rpc('set_my_motivation_theme',{p_class_id:c.id,p_theme:e.target.value});
  if(error){e.target.disabled=false;return toast(error.message)}
  toast('Aplinkos tema pakeista.');
  renderAchievements();
 };
}


async function renderClassmates(){
 stopTeacherPresenceRefresh();
 setPresenceContext('Mano klasė',null);
 setCurrentRestore(()=>renderClassmates(),{kind:'classmates'});
 const c=await getStudentClass();
 if(!c)return renderStudent();

 const s=await getMotivationSummary(c.id);
 applyMotivationSkin(s);
 if(!s.enabled||!s.classmates_visible){
  if($('classmatesNav'))$('classmatesNav').classList.add('hidden');
  $('classmatesContent').innerHTML=`<div class="pageHero"><button class="back" id="backClassmates">← Mano klasė</button><span class="kicker">👥 KLASĖ</span><h1>Klasės draugų vaizdas neįjungtas</h1><p>Šią motyvacinės sistemos dalį valdo mokytojas.</p></div>`;
  show('classmates');$('backClassmates').onclick=()=>appBack(()=>renderStudent());return;
 }

 const {data,error}=await sb.rpc('get_my_class_motivation_peers',{p_class_id:c.id});
 if(error)return toast(error.message);
 const peers=Array.isArray(data)?data:[];
 $('classmatesContent').innerHTML=`<div class="pageHero"><button class="back" id="backClassmates">← Mano klasė</button><span class="kicker">👥 ${esc(c.name)}</span><h1>Mano klasė</h1><p>Čia rodomi tik motyvacinės sistemos statuso ženkliukai. Pažymiai, XP skaičius ir atsiskaitymų rezultatai klasės draugams nerodomi.</p></div>
 <div class="panel"><div class="sectionTitle"><div class="grow"><span class="kicker">KLASĖS DRAUGAI</span><h2>${peers.length} mok.</h2></div></div>
  <div class="classmateGrid">${peers.map(p=>`<article class="classmateCard ${p.is_me?'me':''}">
   <div class="classmateAvatar">${esc((p.full_name||'?').trim().split(/\\s+/).slice(0,2).map(x=>x[0]||'').join('').toUpperCase()||'?')}</div>
   <div class="classmateInfo"><div><b>${esc(p.full_name||'Mokinys')}</b>${p.is_me?'<span class="youPill">Tu</span>':''}</div>
    ${p.motivation_enabled?(p.badge_title?`<span>${esc(p.badge_icon||'🏅')} ${esc(p.badge_title)}</span>`:'<span>Pirmasis ilgalaikis ženkliukas – nuo 10 treniruočių</span>'):'<span>Motyvacinė sistema išjungta</span>'}
   </div>
   ${p.badge_icon?`<div class="classmateStatusIcon" title="${esc(p.badge_title||'')}">${esc(p.badge_icon)}</div>`:''}
  </article>`).join('')}</div>
 </div>`;
 show('classmates');
 $('backClassmates').onclick=()=>appBack(()=>renderStudent());
}

/* ================= MOKINIO ATSISKAITYMŲ SUVESTINĖ ================= */
function renderMyResultValue(row){
 if(row.teacher_grade!==null && row.teacher_grade!==undefined){
  const grade=Number(row.teacher_grade);
  return Number.isFinite(grade)?`<span class="resultsScore isGrade" aria-label="Mokytojo pažymys ${grade}">${grade}</span>`:'<span class="resultsPending">Laukiama pažymio</span>';
 }
 if(row.results_released && row.score_percent!==null && row.score_percent!==undefined){
  return `<span class="resultsScore isPercent" aria-label="Automatinis rezultatas ${Number(row.score_percent)} procentų">${Number(row.score_percent)}%</span>`;
 }
 return '<span class="resultsPending">Laukiama įvertinimo</span>';
}
function normalizeWorkGrade(value){
 const raw=String(value??'').trim();
 const grade=raw.match(/^([1-9]|10)\s*\/\s*10$/);
 return grade?grade[1]:raw;
}
async function renderStudentResults(){
 setCurrentRestore(()=>renderStudentResults(),{kind:'student-results'});
 show('student-results');
 $('studentResultsContent').innerHTML='<div class="pageHero studentResultHero"><h1>Rezultatai</h1></div><div class="panel"><p class="muted">Kraunami tavo atsiskaitymai...</p></div>';
 const c=await getStudentClass();
 if(!c){$('studentResultsContent').innerHTML='<div class="pageHero studentResultHero"><h1>Rezultatai</h1></div><div class="panel emptyState">Pirmiausia prisijunk prie klasės.</div>';return}
 const [{data:results,error:resultError},{data:workSubmissions,error:submissionsError},{data:classAssignments,error:assignmentsError}]=await Promise.all([
  sb.rpc('list_my_assessment_results',{p_class_id:c.id}),
  sb.from('submissions').select('assignment_id,grade,teacher_note,submitted_at').eq('student_id',me.id).not('grade','is',null).order('submitted_at',{ascending:false}),
  sb.from('assignments').select('id,title,class_id,topic_id').eq('class_id',c.id)
 ]);
 await loadClassTopics(c.id);
 const sortedResults=[...(results||[])].sort((a,b)=>new Date(b.completed_at||0)-new Date(a.completed_at||0));
 const assignmentMap=new Map((classAssignments||[]).map(x=>[x.id,x]));
 const gradedWork=(workSubmissions||[]).filter(x=>assignmentMap.has(x.assignment_id)&&String(x.grade??'').trim());
 if(resultError)console.warn('Atsiskaitymų suvestinė:',resultError);
 const resultErrorMessage=resultError?'<div class="notice resultsError">Šiuo metu atsiskaitymų suvestinė nepasiekiama. Pamėgink atnaujinti puslapį.</div>':'';
 const taskErrorMessage=(submissionsError||assignmentsError)?'<div class="notice resultsError">Įvertintų įkeltų darbų dabar nepavyko įkelti.</div>':'';
 $('studentResultsContent').innerHTML=`
  <div class="pageHero studentResultHero"><h1>Rezultatai</h1><p>${esc(c.name)}</p></div>
  <section class="panel studentResultPanel">
   <div class="resultsSectionHead"><h2>Atsiskaitymai</h2><span class="resultsCount">${sortedResults.length}</span></div>
   ${resultErrorMessage}
   ${sortedResults.length?`<div class="resultsEntries">${sortedResults.map(row=>{
    const topic=topicById(row.topic_id);
    const topicName=row.topic_title||topic?.title||row.topic_id;
    const details=row.teacher_comment&&row.teacher_grade!=null?`<p class="resultsNote">${esc(row.teacher_comment)}</p>`:'';
    return `<div class="resultsEntry"><div class="resultsEntryDetails"><b>${esc(topicName)}</b><div class="resultsMeta">${row.attempt_number>1?`<span>${Number(row.attempt_number)} bandymas</span> · `:''}<time datetime="${esc(String(row.completed_at||'').slice(0,10))}">${esc(fmtDateOnly(row.completed_at))}</time></div>${details}</div><div class="resultsEntryScore">${renderMyResultValue(row)}</div></div>`;
   }).join('')}</div>`:(!resultError?'<div class="emptyState">Dar nėra pateiktų atsiskaitymų.</div>':'')}
  </section>
  <section class="panel studentResultPanel">
   <div class="resultsSectionHead"><h2>Įvertinti darbai</h2><span class="resultsCount">${gradedWork.length}</span></div>
   ${taskErrorMessage}
   ${gradedWork.length?`<div class="resultsEntries">${gradedWork.map(work=>{
    const task=assignmentMap.get(work.assignment_id);
    return `<div class="resultsEntry"><div class="resultsEntryDetails"><b>${esc(task?.title||'Pateiktas darbas')}</b><div class="resultsMeta">${esc(topicById(task?.topic_id)?.title||'')}${task?.topic_id?' · ':''}${esc(fmtDateOnly(work.submitted_at))}</div>${work.teacher_note?`<p class="resultsNote">${esc(work.teacher_note)}</p>`:''}</div><div class="resultsEntryScore"><span class="resultsScore isGrade">${esc(normalizeWorkGrade(work.grade))}</span></div></div>`;
   }).join('')}</div>`:(!submissionsError&&!assignmentsError?'<div class="emptyState">Dar nėra įvertintų pateiktų darbų.</div>':'')}
  </section>`;
}

/* ================= MOKYMOSI TAŠKŲ SUVESTINĖ ================= */
function renderStudentProgressTiles(practiceCount, seconds, points){
 const total=Number(points?.total_points);
 const ready=points && Number.isFinite(total) && total>=0;
 return `<div class="studentProgressStrip compactProgressStrip">
  <article class="studentProgressTile compactProgressTile">
   <span class="studentProgressIcon progressPractice" aria-hidden="true">✓</span>
   <div class="progressTileText"><strong class="studentProgressValue">${Number(practiceCount)||0}</strong><span class="studentProgressLabel">Atliktos žinių treniruotės</span></div>
  </article>
  <article class="studentProgressTile compactProgressTile">
   <span class="studentProgressIcon progressClock" aria-hidden="true">◷</span>
   <div class="progressTileText"><strong class="studentProgressValue">${esc(fmtSec(seconds))}</strong><span class="studentProgressLabel">Mokymosi laikas</span></div>
  </article>
  <article class="studentProgressTile compactProgressTile studentPointsTile">
   <span class="studentProgressIcon studentPointsSpark" aria-hidden="true">✦</span>
   <div class="progressTileText"><strong class="studentProgressValue">${ready?total.toLocaleString('lt-LT'):'—'} <span class="studentPointsUnit">taškų</span></strong><span class="studentProgressLabel">Sukaupti mokymosi taškai</span></div>
  </article>
 </div>`;
}

/* ================= STUDENT ================= */
async function getStudentClass(){
 const {data:mem}=await sb.from('class_members').select('class_id,joined_at').eq('student_id',me.id).order('joined_at',{ascending:true}).limit(1);
 if(!mem?.length)return null;
 const {data:c}=await sb.from('classes').select('*').eq('id',mem[0].class_id).single();return c||null;
}
async function renderStudent(){
 stopTeacherPresenceRefresh();
 setCurrentRestore(()=>renderStudent(),{kind:'student'});
 show('student');$('studentContent').innerHTML='<div class="pageHero"><span class="kicker">MOKINYS</span><h1>Kraunama...</h1></div>';
 const c=await getStudentClass();currentClass=c;
 if(!c){stopHeartbeat();$('studentContent').innerHTML=`<div class="authShell"><div class="authCard"><span class="kicker">PRISIJUNGTI PRIE KLASĖS</span><h1>Sveiki, ${esc(profile.full_name||'mokiny')}!</h1><p>Įveskite mokytojo pateiktą klasės kodą.</p><form id="joinForm"><label>Klasės kodas<input id="joinCode" required placeholder="Pvz., A7K2QX"></label><button class="primary wide" type="submit">Prisijungti prie klasės</button></form></div></div>`;
  $('joinForm').onsubmit=async e=>{e.preventDefault();const {error}=await sb.rpc('join_class_by_code',{p_code:$('joinCode').value.trim()});if(error)return toast(error.message);toast('Prisijungta prie klasės.');renderStudent()};return;
 }
 // Temas ir klasės informaciją užkrauname tuo pačiu metu, o ne vieną po kitos.
 // Buvimo klasėje žyma siunčiama atskirai.
 startHeartbeat(c.id).catch(err=>console.warn('Mokinio aktyvumo žyma:',err));
 setPresenceContext('Klasės pradžia',null);
 const [,{data:access},{data:attempts},{data:sessions},{data:personalFiles,error:personalErr},motivation,{data:learningPoints,error:learningPointsError}]=await Promise.all([
  loadClassTopics(c.id),
  sb.from('topic_access').select('*').eq('class_id',c.id),
  sb.from('practice_attempts').select('id').eq('student_id',me.id).eq('class_id',c.id).eq('mode','practice').not('completed_at','is',null),
  sb.from('activity_sessions').select('duration_seconds').eq('user_id',me.id).eq('class_id',c.id),
  sb.from('student_personal_files').select('id,title,original_name,created_at,storage_path,size_bytes').eq('student_id',me.id).order('created_at',{ascending:false}),
  getMotivationSummary(c.id),
  sb.rpc('get_my_learning_points',{p_class_id:c.id})
 ]);
 applyMotivationSkin(motivation);
 if($('achievementsNav'))$('achievementsNav').classList.toggle('hidden',!motivation?.enabled);
 if($('classmatesNav'))$('classmatesNav').classList.toggle('hidden',!(motivation?.enabled&&motivation?.classmates_visible));
 if(personalErr)console.warn('Asmeninių failų suvestinė:',personalErr.message);

 if(learningPointsError)console.warn('Mokymosi taškų suvestinė:',learningPointsError.message);
 const secs=(sessions||[]).reduce((n,x)=>n+(x.duration_seconds||0),0);
 const openTopics=activeClassTopics.filter(t=>(access||[]).find(a=>a.topic_id===t.id)?.is_open);

 $('studentContent').innerHTML=`<div class="pageHero studentClassHero"><h1>${esc(c.name)}</h1><div class="studentIdentity" title="Prisijungusi paskyra"><span class="studentIdentityIcon" aria-hidden="true">${esc((profile.full_name||'M').trim().charAt(0).toUpperCase())}</span><span>${esc(profile.full_name||'Mokinys')}</span></div></div>
 ${renderStudentProgressTiles(learningPoints?.practice_count??(attempts||[]).length,secs,learningPoints)}
 ${renderMotivationCard(motivation)}


 <section class="panel studentUploadPanel modernStudentUpload privateVaultPanel">
  <div class="studentUploadTop"><div class="studentUploadIntro"><span class="studentUploadGlyph" aria-hidden="true">▤</span><div><h2>Mano failai</h2>${(personalFiles||[]).length?`<span class="studentUploadCount">${personalFiles.length} ${personalFiles.length===1?'failas':'failai (-ų)'}</span>`:''}</div></div><button class="primary studentUploadButton" id="personalFileUploadBtn"><span aria-hidden="true">+</span> Įkelti failą</button></div>
  ${personalErr?`<div class="notice vaultError">Asmeninių failų saugykla dar neparuošta. Mokytojas turi paleisti v5.39 SQL.</div>`:''}
  ${(personalFiles||[]).length?`<div class="studentWorkList">${(personalFiles||[]).map(f=>`<div class="studentWorkItem"><span class="studentWorkFileIcon" aria-hidden="true">▤</span><div class="grow"><b>${esc(f.title||f.original_name)}</b><div class="subtle">${esc(f.original_name)} · ${esc(fmtDateOnly(f.created_at))}</div></div><div class="studentWorkActions"><button class="smallBtn" data-my-personal="${f.id}" title="Atsisiųsti failą" aria-label="Atsisiųsti: ${esc(f.original_name)}">↓</button><button class="smallBtn dangerMini" data-my-del-personal="${f.id}" title="Ištrinti failą" aria-label="Ištrinti: ${esc(f.original_name)}">×</button></div></div>`).join('')}</div>`:''}
 </section>

 <div class="sectionHead"><span class="kicker">TEMOS</span><h2>Mokymosi turinys</h2></div>
 <div class="studentTopics topicDeck">${activeClassTopics.length?activeClassTopics.map(t=>{const a=(access||[]).find(x=>x.topic_id===t.id)||{};return `<article class="topicStudentCard modernTopicCard ${a.is_open?'':'locked'}"><div class="topicCardTop"><span class="topicCardIcon" aria-hidden="true">${esc(t.icon||'💻')}</span><div class="topicCardTitle"><h3>${esc(t.title)}</h3></div><button class="topicCardAction ${a.is_open?'':'isDisabled'}" data-stopic="${t.id}" ${a.is_open?'':'disabled'} aria-label="${a.is_open?'Atidaryti temą':'Tema užrakinta'}: ${esc(t.title)}">${a.is_open?'→':'🔒'}</button></div></article>`}).join(''):'<div class="panel emptyState"><b>Mokytojas šiai klasei temų dar nesukūrė.</b></div>'}</div>
 <section class="panel" id="theoryExamEntry" style="margin-top:32px;padding:26px">
  <span class="kicker">PASIRUOŠIMAS INFORMATIKOS VBE</span>
  <h2>I dalies teorijos egzamino treniruoklis</h2>
  <p class="muted">30 mokomųjų klausimų iš informatikos temų. Klausimų ir struktūrinių užduočių stiliaus simuliacija su schemomis, lentelėmis ir diagramomis; ne oficialus NŠA egzaminas ir ne pažodinis jo atkartojimas.</p>
  <button class="primary" id="startTheoryExamSim">Pradėti 30 klausimų testą</button>
 </section>`;

 if($('startTheoryExamSim'))$('startTheoryExamSim').onclick=()=>startTheoryExamSimulation();

 if($('openAchievements'))$('openAchievements').onclick=()=>navigateTo(()=>renderAchievements());
 if($('personalFileUploadBtn'))$('personalFileUploadBtn').onclick=openPersonalFileUploadModal;
 document.querySelectorAll('[data-my-personal]').forEach(b=>b.onclick=()=>downloadPersonalFile(b.dataset.myPersonal));
 document.querySelectorAll('[data-my-del-personal]').forEach(b=>b.onclick=()=>deletePersonalFile(b.dataset.myDelPersonal));
 document.querySelectorAll('[data-stopic]').forEach(b=>b.onclick=()=>navigateTo(()=>openStudentTopic(b.dataset.stopic,c,access||[])));
}

/* ================= PRIVATŪS MOKINIO FAILAI ================= */
function openPersonalFileUploadModal(){
 modal(`<span class="kicker">MANO FAILAI</span><h2>Įkelti savo failus</h2>
 <form id="personalFileUploadForm" class="formGroup">
  <label>Failai<input class="fileInput" type="file" id="personalFileInput" multiple required></label>
  <p class="formHint">Failai saugomi tik tavo paskyroje. Mokytojui pateik darbus pasirinktos temos užduotyse. Iki 25 MB vienam failui.</p>
  <button class="primary" type="submit" style="margin-top:14px">Išsaugoti mano failuose</button>
 </form>`);
 $('personalFileUploadForm').onsubmit=async e=>{
  e.preventDefault();
  const files=[...$('personalFileInput').files];if(!files.length)return;
  if(files.some(f=>f.size>25*1024*1024))return toast('Vienas iš failų per didelis. Maksimalus dydis – 25 MB.');
  const submit=$('personalFileUploadForm').querySelector('[type="submit"]');submit.disabled=true;
  let uploaded=0;
  for(const f of files){
   const path=`${me.id}/${storageFileName(f.name)}`;
   const {error:upErr}=await sb.storage.from('student-personal-files').upload(path,f,storageUploadOptions(f));
   if(upErr){toast(`Nepavyko įkelti ${f.name}: ${upErr.message}`);continue;}
   const {error:dbErr}=await sb.from('student_personal_files').insert({
    student_id:me.id,title:f.name,storage_path:path,original_name:f.name,
    mime_type:uploadContentType(f),size_bytes:f.size
   });
   if(dbErr){await sb.storage.from('student-personal-files').remove([path]);toast(`Nepavyko išsaugoti ${f.name}: ${dbErr.message}`);continue;}
   uploaded++;
  }
  if(uploaded){closeModal();toast(`Išsaugota asmeninių failų: ${uploaded}.`);renderStudent();}
  else submit.disabled=false;
 };
}
async function downloadPersonalFile(id){
 const {data,error}=await sb.from('student_personal_files').select('storage_path,original_name').eq('id',id).eq('student_id',me.id).single();
 if(error)return toast(error.message);
 await downloadOriginalFile('student-personal-files',data.storage_path,data.original_name);
}
async function deletePersonalFile(id){
 const {data,error}=await sb.from('student_personal_files').select('storage_path,original_name').eq('id',id).eq('student_id',me.id).single();
 if(error)return toast(error.message);
 if(!confirm(`Ar tikrai ištrinti savo failą „${data.original_name}“?`))return;
 const {error:storageErr}=await sb.storage.from('student-personal-files').remove([data.storage_path]);
 if(storageErr)return toast(`Nepavyko ištrinti failo: ${storageErr.message}`);
 const {error:dbErr}=await sb.from('student_personal_files').delete().eq('id',id).eq('student_id',me.id);
 if(dbErr)return toast(`Failas ištrintas iš saugyklos, bet nepavyko ištrinti įrašo: ${dbErr.message}`);
 toast('Failas ištrintas.');renderStudent();
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
  const retryNotice=retryAllowed?'<div class="notice"><b>Mokytojas leido dar vieną bandymą.</b> Ankstesnis rezultatas išliks istorijoje, o naujam bandymui bus sugeneruotas kitas lygiavertis variantas.</div>':'<p class="subtle">Papildomą bandymą gali atrakinti mokytojas.</p>';
  if(status.results_released){
   const teacherGrade=status.teacher_grade!=null?`<div class="metric assessmentStudentGrade"><strong>${Number(status.teacher_grade)}</strong><span>Mokytojo pažymys</span></div>`:'';
   const practical=status.practical_required?`<div class="metric"><strong>${Number(status.practical_score||0).toFixed(Number(status.practical_score)%1?1:0)}/${Number(status.practical_max_points||10).toFixed(0)}</strong><span>logotipas</span></div>`:'';
   const overall=status.practical_required?`<div class="metric"><strong>${status.overall_percent??0}%</strong><span>bendras rezultatas</span></div>`:`<div class="metric"><strong>${status.score_percent??0}%</strong><span>rezultatas</span></div>`;
   return `<span class="badge ok">${attemptNo} bandymas atliktas · rezultatai paskelbti</span>
   <div class="detailMetrics">${overall}${teacherGrade}<div class="metric"><strong>${status.correct_answers??0}/${status.total_questions||0}</strong><span>teorija</span></div>${practical}<div class="metric"><strong>${fmtDurationDetailed(status.duration_seconds)}</strong><span>bendra trukmė</span></div></div>
   ${status.teacher_comment?`<div class="notice"><b>Mokytojo komentaras:</b><br>${esc(status.teacher_comment)}</div>`:''}
   ${status.practical_comment?`<div class="notice"><b>Mokytojo komentaras apie logotipą:</b><br>${esc(status.practical_comment)}</div>`:''}
   <div class="actions"><button class="ghost" id="studentAssessmentReview">Peržiūrėti teorijos atsakymus</button>${retryButton}</div>${retryNotice}`;
  }
  const visibleGrade=status.teacher_grade!=null?`<div class="metric assessmentStudentGrade"><strong>${Number(status.teacher_grade)}</strong><span>Mokytojo pažymys</span></div>`:'';
  const comment=status.teacher_grade!=null&&status.teacher_comment?`<div class="notice"><b>Mokytojo komentaras:</b><br>${esc(status.teacher_comment)}</div>`:'';
  const gradeMessage=status.teacher_grade!=null?'<b>Mokytojo pažymys jau paskelbtas.</b> Teisingi testo atsakymai ir išsamūs rezultatai bus rodomi, kai visi klasės mokiniai baigs atsiskaitymą.':'<b>Atsiskaitymas pateiktas.</b> Mokytojo pažymio dar nėra. Teisingi atsakymai bus paskelbti, kai visi klasės mokiniai baigs.';
  return `<span class="badge ok">${attemptNo} bandymas pateiktas</span><p class="muted">${gradeMessage}</p>
  <div class="detailMetrics">${visibleGrade}<div class="metric"><strong>${fmtDurationDetailed(status.duration_seconds)}</strong><span>bendra trukmė</span></div><div class="metric"><strong>${status.focus_events||0}</strong><span>išėjimų teorijos metu</span></div></div>${comment}${retryNotice}${retryButton}`;
 }
 if(status?.practical_required&&status?.theory_submitted_at&&!status?.practical_submitted_at){
  return `<span class="badge ok">I dalis baigta</span><div class="assessmentStepsMini"><span class="done">1 · Teorija ✓</span><span class="active">2 · Logotipas</span></div><p class="muted">Teorinė dalis pateikta ir jos atsakymų keisti nebegalima. Dabar atlik II dalį: sukurk logotipą ir įkelk SVG bei PNG failus.</p><button class="primary" id="continueAssessmentPractical">Tęsti II dalį – logotipas →</button>`;
 }
 if(a.assessment_open){
  const attemptNo=status?.attempt_number||1;
  const twoParts=assessmentSetting?.practical_enabled===true;
  return `<span class="badge ok">Atidaryta</span><div class="assessmentStepsMini"><span class="active">1 · Teorija</span>${twoParts?'<span>2 · Logotipas</span>':''}</div><p class="muted">${status?.attempt_id?`Tęsiamas <b>${attemptNo} bandymas</b>. Naujas bandymas nebus kuriamas, kol šis nebaigtas.`:'Atsiskaitymas šiuo metu atidarytas.'} Teorijos klausimų: <b>${assessmentSetting?.question_count||30}</b>${twoParts?'. Po teorijos pereisi į praktinę logotipo kūrimo dalį.':'.'} Fokuso / išėjimų stebėjimas taikomas tik teorinei daliai.</p><button class="primary" id="startAssessmentTopic">${status?.attempt_id?'Tęsti I dalį – teoriją':'Pradėti I dalį – teoriją'}</button>`;
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

// Išsaugome išskleistų mokinio užduočių būseną, kai grįžtama iš failo įkėlimo.
const expandedStudentTasks=new Set();

async function openCyberLab(classId,preview=false,c=null){
 if(!window.SecureLink)return toast('Nepavyko įkelti laboratorijos modulio.');
 if(!c){
  if(preview){const {data:row}=await sb.from('classes').select('*').eq('id',classId).single();c=row}
  else c=await getStudentClass();
 }
 if(!c||c.id!==classId)return toast('Klasė nerasta.');
 if(!activeClassTopics.some(t=>t.id==='kriptografija'))await loadClassTopics(classId);
 if(!activeClassTopics.some(t=>t.id==='kriptografija'))return toast('Ši klasė dar neturi kriptografijos temos.');
 if(preview&&!['teacher','admin'].includes(profile?.role))return toast('Prieiga negalima.');
 if(!preview&&profile?.role!=='student')return toast('Prieiga negalima.');
 setCurrentRestore(()=>openCyberLab(classId,preview,c),{kind:preview?'cyberlab-preview':'cyberlab',classId,topicId:'kriptografija'});
 show('cyberlab');
 $('cyberlabContent').innerHTML='<div class="panel">Įkeliama SECURE LINK laboratorija...</div>';
 const onBack=async()=>{
  if(preview){
   const {data:access}=await sb.from('topic_access').select('*').eq('class_id',classId);
   appBack(()=>renderTeacherTopicPreview('kriptografija',c,access||[],()=>openTeacherClass(classId,'topics')));
  }else{
   const {data:access}=await sb.from('topic_access').select('*').eq('class_id',classId);
   appBack(()=>openStudentTopic('kriptografija',c,access||[]));
  }
 };
 await window.SecureLink.mount({host:$('cyberlabContent'),sb,classId,userId:me.id,preview,onBack});
}

async function openStudentTopic(topicId,c,access){
 setCurrentRestore(()=>openStudentTopic(topicId,c,access),{kind:'student-topic',classId:c.id,topicId});
 const t=topicById(topicId),a=access.find(x=>x.topic_id===topicId);if(!a?.is_open)return toast('Tema užrakinta.');
 setPresenceContext(`Tema: ${t?.title||topicId}`,topicId);
 const [{data:resources},{data:folders},{data:assignments},{data:topicPosts},{data:practiceBlocks},{data:assessmentSetting},{data:assessmentStatusData}]=await Promise.all([
  sb.from('learning_resources').select('*').eq('class_id',c.id).eq('topic_id',topicId).order('created_at',{ascending:false}),
  sb.from('learning_resource_folders').select('id,name').eq('class_id',c.id).eq('topic_id',topicId).order('name'),
  sb.from('assignments').select('*').eq('class_id',c.id).eq('topic_id',topicId).eq('is_open',true).order('created_at',{ascending:false}),
  sb.from('class_posts').select('*').eq('class_id',c.id).eq('topic_id',topicId).order('created_at',{ascending:false}),
  c.grade_level==='10'?sb.from('class_question_blocks').select('id,title,description').eq('class_id',c.id).eq('parent_topic_id',topicId).eq('is_enabled',true).order('sort_order',{ascending:true}):Promise.resolve({data:[]}),
  c.grade_level==='11'?sb.from('assessment_settings').select('*').eq('class_id',c.id).eq('topic_id',topicId).maybeSingle():Promise.resolve({data:null}),
  c.grade_level==='11'?sb.rpc('get_my_assessment_status',{p_class_id:c.id,p_topic_id:topicId}):Promise.resolve({data:[]})
 ]);
 const assessmentStatus=assessmentStatusRow(assessmentStatusData);
 if(assessmentStatus?.completed_at&&assessmentStatus.attempt_id){
  // RPC leidžia mokiniui matyti tik jo pateikto darbo mokytojo pažymį. Teisingi atsakymai lieka užrakinti.
  const {data:gradeRows}=await sb.rpc('get_my_assessment_teacher_grade',{p_attempt_id:assessmentStatus.attempt_id});
  const gradeRow=Array.isArray(gradeRows)?gradeRows[0]:gradeRows;
  if(gradeRow){assessmentStatus.teacher_grade=gradeRow.grade;assessmentStatus.teacher_comment=gradeRow.teacher_comment;}
 }
 const motivation=await getMotivationSummary(c.id),topicMastery=masteryFor(motivation,topicId);
 const showCyberLab=topicId==='kriptografija'&&window.SecureLink&&await window.SecureLink.available(sb,c.id);
 let existing=[];if(assignments?.length)({data:existing}=await sb.from('submissions').select('*').eq('student_id',me.id).in('assignment_id',assignments.map(x=>x.id)).order('submitted_at',{ascending:false}));
 $('topicContent').innerHTML=`<div class="pageHero studentTopicHero"><h1>${esc(t?.title||topicId)}</h1>${topicDescription(t)?`<p>${esc(topicDescription(t))}</p>`:''}</div>
 <div class="contentGrid"><div class="stack">
  ${renderStudentTeacherUpdates(topicPosts||[])}
  ${showCyberLab?`<section class="cl-launch-card" aria-label="SECURE LINK ryšio laboratorija">
  <span class="cl-launch-eyebrow">INTERAKTYVI LABORATORIJA</span>
  <h3>SECURE LINK · Ryšio laboratorija</h3>
  <p>Išbandyk Cezario šifrą, AES ir RSA. Patikrink, ką gali perskaityti tinklo stebėtojas.</p>
  <button type="button" class="cl-launch-cta" id="openCyberLabStudent">Atidaryti laboratoriją <span aria-hidden="true">→</span></button>
</section>`:''}
  ${topicId==='kriptografija'&&c.grade_level==='11'&&a.practice_open&&VBE_CRYPTO.length?`<div class="panel vbeCryptoPractice"><span class="kicker">PAPILDOMA ŽINIŲ TRENIRUOTĖ</span><h3>Kriptografija · ankstesnių egzaminų klausimai</h3><p class="muted">10 atsitiktinių klausimų iš ${VBE_CRYPTO.length} klausimų banko, parengtų pagal ankstesnius valstybinius, pakartotinius ir bandomuosius / pavyzdinius egzaminus. Mokomosios, perfrazuotos užduotys. Po atsakymo pateikiamas paaiškinimas. Rezultatas išsaugomas.</p><button class="primary" id="startVbeCrypto">Pradėti 10 klausimų treniruotę</button></div>`:''}
  ${topicId==='duomenu-vizualizavimas'&&c.grade_level==='11'&&a.practice_open?`<section class="panel excelPracticeSets"><span class="kicker">PAPILDOMOS EXCEL ŽINIŲ TRENIRUOTĖS</span><h3>Skaičiuoklės užduotys · po 20 klausimų</h3><p class="muted">Pagal mokomųjų failų temų pavadinimus: IF, SUMIF ir COUNTIF, rikiavimas, filtravimas bei diagramos. Tai mokomosios, o ne patvirtintos istorinių egzaminų užduotys.</p><div style="display:flex;gap:10px;flex-wrap:wrap">${(window.EXCEL_PRACTICE_SETS||[]).map((set,i)=>`<button class="primary" type="button" data-excel-practice="${i}">${esc(set.title)} · 20 klausimų</button>`).join('')}</div></section>`:''}
  <div class="panel"><div class="sectionTitle"><div class="grow"><span class="kicker">PRAKTIKA</span><h2>Žinių treniruotė</h2></div><span class="badge ${a.practice_open?'ok':''}">${a.practice_open?'Atidaryta':'Užrakinta'}</span></div>
   ${motivation?.enabled?(topicMastery?`<div class="topicMasteryBox"><div class="masteryHead"><span>Temos įvaldymas</span><strong>${Number(topicMastery.mastery_percent)||0}%</strong></div><div class="masteryTrack"><span style="width:${Math.max(0,Math.min(100,Number(topicMastery.mastery_percent)||0))}%"></span></div><div class="subtle">Skaičiuojama pagal paskutines iki 5 treniruočių · geriausias rezultatas ${Number(topicMastery.best_score)||0}%</div></div>`:'<div class="topicMasteryBox empty"><b>Temos įvaldymas</b><span>Atlik pirmą treniruotę – čia atsiras tavo progresas.</span></div>'):''}
   ${c.grade_level==='10'?renderGrade10StudentPracticePicker(practiceBlocks||[],a.practice_open):`<p class="muted"><b>Praktikuotis gali tiek kartų, kiek nori.</b> Kiekvieną kartą sistema iš didesnio klausimų banko atsitiktinai parenka 10 klausimų ir sumaišo atsakymų variantus, todėl bandymai nėra vienodi. Po kiekvieno atsakymo gausi paaiškinimą, o rezultatas ir atlikimo laikas bus išsaugoti tavo paskyroje.</p><button class="primary" id="startPracticeTopic" ${a.practice_open?'':'disabled'}>Pradėti 10 klausimų praktiką</button>`}
  </div>
  <div class="panel"><div class="sectionTitle"><div class="grow"><span class="kicker">MOKYMOSI FAILAI</span><h2>Failai atsisiuntimui</h2></div></div>
   <div class="studentResourceFolders">
   ${(folders||[]).map(folder=>`<details class="resourceFolder studentResourceFolder" ${(resources||[]).some(r=>r.folder_id===folder.id)?'':'data-empty-folder="true"'}><summary>📁 ${esc(folder.name)} <span class="subtle">(${(resources||[]).filter(r=>r.folder_id===folder.id).length})</span></summary><div class="learningFileList">${(resources||[]).filter(r=>r.folder_id===folder.id).map(r=>learningFileRow(r,'student')).join('')||'<div class="compactTaskEmpty">Aplankas tuščias.</div>'}</div></details>`).join('')}
   ${(resources||[]).some(r=>!r.folder_id)?`<div class="studentUngroupedFiles">${(folders||[]).length?'<h4>Failai be aplanko</h4>':''}<div class="learningFileList">${(resources||[]).filter(r=>!r.folder_id).map(r=>learningFileRow(r,'student')).join('')}</div></div>`:''}
   ${!(resources||[]).length&&!(folders||[]).length?'<div class="compactTaskEmpty">Mokymosi failų dar nėra.</div>':''}
   </div>
  </div>
  <div class="panel topicAssignmentUploadPanel"><div class="sectionTitle compactTaskSectionHead"><div class="grow"><h2>Paskirtų užduočių įkėlimas</h2></div>${(assignments||[]).length?`<span class="compactTaskTotal">${assignments.length}</span>`:''}</div>
   <div class="compactTaskList">
   ${(assignments||[]).length?(assignments||[]).map(as=>{
     const subs=(existing||[]).filter(s=>s.assignment_id===as.id);
     const isExpanded=expandedStudentTasks.has(as.id);
     const fileCountText=subs.length?`${subs.length} ${subs.length===1?'failas':subs.length<10&&[2,3,4].includes(subs.length)?'failai':'failų'}`:'Neįkelta';
     return `<section class="compactTask" data-task-card="${as.id}">
       <div class="compactTaskHeader">
         <div class="compactTaskGlyph" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><rect x="5" y="3.5" width="14" height="17" rx="2.6"/><path d="M8.5 9h7M8.5 13h7M8.5 17h4.5"/></svg></div>
         <div class="compactTaskInfo"><b>${esc(as.title)}</b><div class="compactTaskSecondary">${as.instructions?`<span class="compactTaskInstructions" title="${esc(as.instructions)}">${esc(as.instructions)}</span>`:''}${as.due_at?`<span class="compactTaskDeadline">Iki ${esc(fmtDate(as.due_at).split(' ')[0])}</span>`:''}<span class="compactTaskFileCount ${subs.length?'hasFiles':''}">${fileCountText}</span></div></div>
         <div class="compactTaskActions"><button class="compactTaskUpload" type="button" data-submit="${as.id}" title="Įkelti atliktą užduotį" aria-label="Įkelti failą užduočiai ${esc(as.title)}"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 17V5m-4.5 4.5L12 5l4.5 4.5"/><path d="M4 17.5v2h16v-2"/></svg><span>Įkelti</span></button>
         ${subs.length?`<button type="button" class="compactTaskExpand ${isExpanded?'isExpanded':''}" data-task-toggle="${as.id}" aria-expanded="${isExpanded}" aria-controls="task-files-${as.id}" aria-label="${isExpanded?'Suskleisti':'Rodyti'} pateiktus failus: ${esc(as.title)}" title="${isExpanded?'Suskleisti':'Rodyti'} pateiktus failus"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m6.5 9.5 5.5 5.5 5.5-5.5"/></svg></button>`:''}
         </div>
       </div>
       ${subs.length?`<div id="task-files-${as.id}" class="compactTaskFiles" data-task-files="${as.id}" ${isExpanded?'':'hidden'}><div class="compactTaskFilesTitle">Pateikti failai</div>${subs.map(s=>`<div class="compactSubmittedFile"><div class="compactSubmittedIcon" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M13.5 3.5H7a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-9L13.5 3.5Z"/><path d="M13 3.5v6h6"/></svg></div><div class="compactSubmittedName"><b title="${esc(s.original_name)}">${esc(s.original_name)}</b><small>Pateikta ${esc(fmtDate(s.submitted_at).split(' ')[0])}</small></div><div class="compactSubmittedActions"><button class="compactSubmittedDownload" data-own-assignment-download="${s.id}" aria-label="Atsisiųsti ${esc(s.original_name)}" title="Atsisiųsti"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 4v12m-4-4 4 4 4-4M4 19.5h16"/></svg></button><button class="compactSubmittedDelete" data-own-assignment-delete="${s.id}" data-assignment-id="${as.id}" aria-label="Ištrinti ${esc(s.original_name)}" title="Ištrinti"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 7h16M9 7V5h6v2m-9 0 .7 12h10.6L18 7M10 10.5v5M14 10.5v5"/></svg></button></div></div>`).join('')}</div>`:''}
     </section>`
   }).join(''):'<div class="compactTaskEmpty">Šiai temai dar nėra paskirtų užduočių.</div>'}
   </div>
  </div>
 </div><div class="stack">
  <div class="panel"><span class="kicker">ATSISKAITYMAS</span><h3>Temos testas</h3>${renderStudentAssessmentCard(c,a,assessmentSetting,assessmentStatus)}</div>
 </div></div>`;
 show('topic');
 if($('openCyberLabStudent'))$('openCyberLabStudent').onclick=()=>navigateTo(()=>openCyberLab(c.id,false,c));
 if(a.practice_open&&$('startPracticeTopic'))$('startPracticeTopic').onclick=()=>navigateTo(()=>startQuiz(topicId,c.id,'practice',10));
 if($('startVbeCrypto'))$('startVbeCrypto').onclick=()=>navigateTo(()=>startVbeCryptoQuiz(c.id));
 document.querySelectorAll('[data-excel-practice]').forEach(b=>b.onclick=()=>startExcelPractice(Number(b.dataset.excelPractice)));
 if($('practiceAllBlocks'))$('practiceAllBlocks').onchange=()=>document.querySelectorAll('[data-practice-block]').forEach(ch=>ch.checked=$('practiceAllBlocks').checked);
 if($('startGrade10Practice'))$('startGrade10Practice').onclick=()=>{
  const single=$('startGrade10Practice').dataset.singleBlock;
  const blockIds=single?[single]:[...document.querySelectorAll('[data-practice-block]:checked')].map(ch=>ch.dataset.practiceBlock);
  if(!blockIds.length)return toast('Pasirink bent vieną temą.');
  navigateTo(()=>startGrade10BlockQuiz(topicId,c.id,blockIds,10));
 };
 if(a.assessment_open&&$('startAssessmentTopic'))$('startAssessmentTopic').onclick=()=>navigateTo(()=>c.grade_level==='11'?startSecureAssessment(topicId,c.id,assessmentStatus):startQuiz(topicId,c.id,'assessment',CFG.assessmentQuestionCount));
 if($('continueAssessmentPractical'))$('continueAssessmentPractical').onclick=()=>navigateTo(()=>openAssessmentPractical(assessmentStatus.attempt_id,topicId,c.id));
 if($('studentAssessmentReview'))$('studentAssessmentReview').onclick=()=>showMyAssessmentReview(assessmentStatus.attempt_id);
 document.querySelectorAll('[data-sresource]').forEach(b=>b.onclick=()=>downloadResource(b.dataset.sresource,b.dataset.resourceKind));
 document.querySelectorAll('[data-submit]').forEach(b=>b.onclick=()=>submissionModal(b.dataset.submit,c,topicId,access));
 document.querySelectorAll('[data-task-toggle]').forEach(b=>b.onclick=()=>{
   const id=b.dataset.taskToggle;
   const target=document.getElementById(`task-files-${id}`);
   if(!target)return;
   const wasExpanded=b.getAttribute('aria-expanded')==='true';
   target.hidden=wasExpanded;
   b.setAttribute('aria-expanded',String(!wasExpanded));
   b.classList.toggle('isExpanded',!wasExpanded);
   b.setAttribute('title',wasExpanded?'Rodyti pateiktus failus':'Suskleisti');
   b.setAttribute('aria-label',wasExpanded?'Rodyti pateiktus failus':'Suskleisti pateiktus failus');
   if(wasExpanded)expandedStudentTasks.delete(id);else expandedStudentTasks.add(id);
 });
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
  if(uploaded){expandedStudentTasks.add(assignmentId);closeModal();toast(`Pateikta failų: ${uploaded}.`);openStudentTopic(topicId,c,access)}
 };
}



/* ================= MOKYTOJO MOKINIO VAIZDO PERŽIŪRA ================= */
async function renderTeacherStudentPreview(c,backFn=null){
 setCurrentRestore(()=>renderTeacherStudentPreview(c,backFn),{kind:'teacher-preview',classId:c.id});
 await loadClassTopics(c.id);
 const [{data:access},{data:attempts}]=await Promise.all([
  sb.from('topic_access').select('*').eq('class_id',c.id),
  sb.from('practice_attempts').select('id').eq('class_id',c.id)
 ]);
 $('teacherContent').innerHTML=`<div class="previewBanner"><b>👁 Mokinio vaizdo peržiūra</b><span>Tai tik peržiūros režimas – mokinio rezultatai nebus keičiami.</span></div>
 <div class="pageHero studentClassHero previewStudentClassHero"><button class="back previewReturn" id="backFromPreview">← Grįžti į klasės valdymą</button><h1>${esc(c.name)}</h1></div>


 <div class="sectionHead"><span class="kicker">TEMOS</span><h2>Mokymosi turinys</h2></div>
 <div class="studentTopics topicDeck">${activeClassTopics.length?activeClassTopics.map(t=>{const a=(access||[]).find(x=>x.topic_id===t.id)||{};return `<article class="topicStudentCard modernTopicCard ${a.is_open?'':'locked'}"><div class="topicCardTop"><span class="topicCardIcon" aria-hidden="true">${esc(t.icon||'💻')}</span><div class="topicCardTitle"><h3>${esc(t.title)}</h3></div><button class="topicCardAction ${a.is_open?'':'isDisabled'}" data-preview-topic="${t.id}" ${a.is_open?'':'disabled'} aria-label="${a.is_open?'Atidaryti temą':'Tema užrakinta'}: ${esc(t.title)}">${a.is_open?'→':'🔒'}</button></div></article>`}).join(''):'<div class="panel emptyState"><b>Šiai klasei temų dar nėra.</b></div>'}</div>`;
 show('teacher');
 $('backFromPreview').onclick=()=>appBack(backFn||(()=>openTeacherClass(c.id)));
 document.querySelectorAll('[data-preview-topic]').forEach(b=>b.onclick=()=>navigateTo(()=>renderTeacherTopicPreview(b.dataset.previewTopic,c,access||[],backFn)));
}
async function renderTeacherTopicPreview(topicId,c,access,backFn=null){
 setCurrentRestore(()=>renderTeacherTopicPreview(topicId,c,access,backFn),{kind:'teacher-topic-preview',classId:c.id,topicId});
 const t=topicById(topicId),a=(access||[]).find(x=>x.topic_id===topicId);if(!a?.is_open)return toast('Tema užrakinta.');
 const showCyberLab=topicId==='kriptografija'&&window.SecureLink&&await window.SecureLink.available(sb,c.id);
 const [{data:resources},{data:assignments},{data:topicPosts}]=await Promise.all([
  sb.from('learning_resources').select('*').eq('class_id',c.id).eq('topic_id',topicId).order('created_at',{ascending:false}),
  sb.from('assignments').select('*').eq('class_id',c.id).eq('topic_id',topicId).eq('is_open',true).order('created_at',{ascending:false}),
  sb.from('class_posts').select('*').eq('class_id',c.id).eq('topic_id',topicId).order('created_at',{ascending:false})
 ]);
 $('teacherContent').innerHTML=`<div class="previewBanner"><b>👁 Mokinio vaizdo peržiūra</b><span>Veiksmai, kurie kurtų mokinio rezultatą ar pateiktų darbą, yra išjungti.</span></div>
 <div class="pageHero studentTopicHero previewTopicHero"><button class="back previewReturn" id="backPreviewTopic">← Mokinio klasės vaizdas</button><h1>${esc(t?.title||topicId)}</h1>${topicDescription(t)?`<p>${esc(topicDescription(t))}</p>`:''}</div>
 <div class="contentGrid"><div class="stack">
  ${renderStudentTeacherUpdates(topicPosts||[])}
  ${showCyberLab?`<div class="cl-launch-card"><div><div class="cl-launch-eyebrow">✦ MOKINIO VAIZDO PERŽIŪRA</div><h3>🛡️ SECURE LINK: Ryšio laboratorija</h3><p>Galite atidaryti laboratorijos demonstraciją nekeičiant mokinių pažangos.</p></div><button type="button" id="openCyberLabPreview">Peržiūrėti →</button></div>`:''}
  <div class="panel"><div class="sectionTitle"><div class="grow"><span class="kicker">PRAKTIKA</span><h2>Žinių treniruotė</h2></div><span class="badge ${a.practice_open?'ok':''}">${a.practice_open?'Atidaryta':'Užrakinta'}</span></div>
   <p class="muted"><b>Praktikuotis galima neribotai.</b> Kiekvieną kartą parenkami atsitiktiniai klausimai ir sumaišomi atsakymai.</p><button class="primary" disabled>${a.practice_open?'Pradėti 10 klausimų praktiką':'Praktika užrakinta'}</button>
  </div>
  <div class="panel"><div class="sectionTitle"><div class="grow"><span class="kicker">MOKYMOSI FAILAI</span><h2>Failai atsisiuntimui</h2></div></div>
   <div class="learningFileList">${(resources||[]).length?(resources||[]).map(r=>learningFileRow(r,'preview')).join(''):'<div class="compactTaskEmpty">Mokymosi failų dar nėra.</div>'}</div>
  </div>
  <div class="panel topicAssignmentUploadPanel"><div class="sectionTitle compactTaskSectionHead"><div class="grow"><h2>Paskirtų užduočių įkėlimas</h2></div>${(assignments||[]).length?`<span class="compactTaskTotal">${assignments.length}</span>`:''}</div>
   <div class="compactTaskList">${(assignments||[]).length?(assignments||[]).map(a=>previewTaskRow(a)).join(''):'<div class="compactTaskEmpty">Šiai temai dar nėra paskirtų užduočių.</div>'}</div>
  </div>
 </div><div class="stack"><div class="panel"><span class="kicker">ATSISKAITYMAS</span><h3>Temos testas</h3>${a.assessment_open?'<span class="badge ok">Atidaryta</span><p class="muted">Mokinys čia galėtų pradėti atsiskaitymą.</p><button class="primary" disabled>Pradėti atsiskaitymą</button>':'<div class="lockedBox">🔒 Mokytojas atsiskaitymo dar neatidarė.</div>'}</div></div></div>`;
 show('teacher');
 $('backPreviewTopic').onclick=()=>appBack(()=>renderTeacherStudentPreview(c,backFn));
 if($('openCyberLabPreview'))$('openCyberLabPreview').onclick=()=>navigateTo(()=>openCyberLab(c.id,true,c));
 document.querySelectorAll('[data-preview-resource]').forEach(b=>b.onclick=()=>downloadResource(b.dataset.previewResource,b.dataset.resourceKind));
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
function assessmentQuestionPositionKey(attemptId){return `inf_assessment_position_${attemptId}`}
function assessmentAnswerHasValue(q,answer){
 const type=qType(q);
 if(answer===null||answer===undefined)return false;
 if(type==='multi')return Array.isArray(answer)&&answer.length>0;
 if(type==='matching'||type==='sequence')return answer&&typeof answer==='object'&&!Array.isArray(answer)&&Object.keys(answer).length>0;
 if(type==='short')return String(answer).trim().length>0;
 return Number.isFinite(Number(answer));
}
function assessmentAnswerComplete(q,answer){
 const type=qType(q);
 if(!assessmentAnswerHasValue(q,answer))return false;
 if(type==='matching'){
  const left=q.options?.left||[];
  return left.every((_x,i)=>answer?.[String(i)]!==undefined&&answer?.[String(i)]!==null&&answer?.[String(i)]!=='');
 }
 if(type==='sequence'){
  const items=q.options?.items||[],vals=items.map((_x,i)=>answer?.[String(i)]).filter(v=>v!==undefined&&v!==null&&v!=='').map(Number);
  return vals.length===items.length&&new Set(vals).size===items.length&&vals.every(v=>v>=0&&v<items.length);
 }
 if(type==='short')return String(answer).trim().length>=2;
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
 if(type==='single'||type==='odd'||type==='multi'){
  const choices=questionChoices(q).map((text,original)=>({text,original}));
  out.shown=q?.options?.shuffle===false?choices:shuffle(choices);
 }
 if(type==='sequence')out.sequenceShown=shuffle((q.options?.items||[]).map((text,original)=>({text,original})));
 return out;
}
function renderQuestionInput(q){
 const type=qType(q),isAssessment=quiz.mode==='assessment-secure',saved=quiz.answers[quiz.index],visual=renderQuestionVisual(q);
 if(type==='single'||type==='odd'){
  $('answers').innerHTML=visual+(q.shown||[]).map((o,i)=>`<button class="answer ${isAssessment&&assessmentAnswerHasValue(q,saved)&&Number(saved)===Number(o.original)?'selected':''}" data-v="${o.original}"><b>${String.fromCharCode(65+i)}.</b> ${esc(o.text)}</button>`).join('');
  document.querySelectorAll('.answer').forEach(b=>b.onclick=()=>{const value=Number(b.dataset.v);if(isAssessment){quiz.answers[quiz.index]=value;document.querySelectorAll('.answer').forEach(x=>x.classList.toggle('selected',Number(x.dataset.v)===value));renderAssessmentQuestionNav();queueAssessmentAnswerSave(q,value);return}submitQuestionAnswer(value)});return;
 }
 if(type==='multi'){
  const selected=new Set(Array.isArray(saved)?saved.map(Number):[]);
  $('answers').innerHTML=visual+`<div class="multiHint">Pažymėk visus teisingus atsakymus.</div>${(q.shown||[]).map((o,i)=>`<label class="multiAnswer ${isAssessment&&selected.has(Number(o.original))?'selected':''}"><input type="checkbox" data-multi-v="${o.original}" ${isAssessment&&selected.has(Number(o.original))?'checked':''}><span><b>${String.fromCharCode(65+i)}.</b> ${esc(o.text)}</span></label>`).join('')}${isAssessment?'':'<button class="primary confirmAnswerBtn" id="confirmMultiAnswer">Patvirtinti atsakymą</button>'}`;
  if(isAssessment){document.querySelectorAll('[data-multi-v]').forEach(ch=>ch.onchange=()=>{const vals=[...document.querySelectorAll('[data-multi-v]:checked')].map(x=>Number(x.dataset.multiV)).sort((a,b)=>a-b);quiz.answers[quiz.index]=vals;document.querySelectorAll('.multiAnswer').forEach(l=>l.classList.toggle('selected',l.querySelector('input')?.checked===true));renderAssessmentQuestionNav();queueAssessmentAnswerSave(q,vals)})}
  else $('confirmMultiAnswer').onclick=()=>{const vals=[...document.querySelectorAll('[data-multi-v]:checked')].map(x=>Number(x.dataset.multiV)).sort((a,b)=>a-b);if(!vals.length)return toast('Pasirink bent vieną atsakymą.');submitQuestionAnswer(vals)};return;
 }
 if(type==='matching'){
  const left=q.options?.left||[],right=q.options?.right||[],existing=saved&&typeof saved==='object'?saved:{};
  $('answers').innerHTML=visual+`<div class="multiHint">Kiekvienai sąvokai parink tinkamą porą.</div><div class="matchingGrid">${left.map((l,i)=>`<label class="matchingRow ${isAssessment&&existing[String(i)]!==undefined?'selected':''}"><span>${esc(l)}</span><select data-match="${i}"><option value="">— pasirink —</option>${right.map((r,j)=>`<option value="${j}" ${isAssessment&&Number(existing[String(i)])===j?'selected':''}>${esc(r)}</option>`).join('')}</select></label>`).join('')}</div>${isAssessment?'':'<button class="primary confirmAnswerBtn" id="confirmMatchingAnswer">Patvirtinti atsakymą</button>'}`;
  if(isAssessment){document.querySelectorAll('[data-match]').forEach(sel=>sel.onchange=()=>{const ans={};document.querySelectorAll('[data-match]').forEach(x=>{if(x.value!=='')ans[x.dataset.match]=Number(x.value)});quiz.answers[quiz.index]=ans;document.querySelectorAll('.matchingRow').forEach(l=>l.classList.toggle('selected',l.querySelector('select')?.value!==''));renderAssessmentQuestionNav();queueAssessmentAnswerSave(q,ans)})}
  else $('confirmMatchingAnswer').onclick=()=>{const ans={};let ok=true;document.querySelectorAll('[data-match]').forEach(s=>{if(s.value==='')ok=false;else ans[s.dataset.match]=Number(s.value)});if(!ok)return toast('Sujunk visas poras.');submitQuestionAnswer(ans)};
  return;
 }
 if(type==='sequence'){
  const items=q.sequenceShown||[],existing=saved&&typeof saved==='object'&&!Array.isArray(saved)?saved:{},n=q.options?.items?.length||items.length;
  $('answers').innerHTML=visual+`<div class="multiHint">Kiekvienam žingsniui parink jo vietą sekoje: 1 – pirmas žingsnis.</div><div class="sequenceGrid">${items.map(item=>`<label class="sequenceRow ${existing[String(item.original)]!==undefined?'selected':''}"><span>${esc(item.text)}</span><select data-sequence="${item.original}"><option value="">— vieta —</option>${Array.from({length:n},(_x,j)=>`<option value="${j}" ${Number(existing[String(item.original)])===j?'selected':''}>${j+1}</option>`).join('')}</select></label>`).join('')}</div><div class="sequenceHint" id="sequenceHint"></div>`;
  const updateSequence=()=>{const ans={};document.querySelectorAll('[data-sequence]').forEach(x=>{if(x.value!=='')ans[x.dataset.sequence]=Number(x.value)});quiz.answers[quiz.index]=ans;document.querySelectorAll('.sequenceRow').forEach(l=>l.classList.toggle('selected',l.querySelector('select')?.value!==''));const vals=Object.values(ans).map(Number),duplicate=vals.length!==new Set(vals).size;$('sequenceHint').textContent=duplicate?'Kiekviena vieta sekoje gali būti panaudota tik vieną kartą.':'';renderAssessmentQuestionNav();queueAssessmentAnswerSave(q,ans)};
  document.querySelectorAll('[data-sequence]').forEach(sel=>sel.onchange=updateSequence);
  return;
 }
 if(type==='short'){
  const val=saved===null||saved===undefined?'':String(saved);
  $('answers').innerHTML=visual+`<div class="multiHint">Atsakyk trumpai, 1–2 sakiniais. Atsakymą gali keisti iki teorinės dalies pateikimo.</div><textarea id="shortAssessmentAnswer" class="shortAnswerInput" rows="4" maxlength="500" placeholder="Įrašyk atsakymą...">${esc(val)}</textarea><div class="shortAnswerMeta"><span>Iki 500 simbolių</span><span id="shortAnswerCount">${val.length}/500</span></div>`;
  const ta=$('shortAssessmentAnswer');
  let timer=null;
  ta.oninput=()=>{const value=ta.value;quiz.answers[quiz.index]=value;assessmentDirtyQuestionIds.add(q.id);saveAssessmentDraftLocal();renderAssessmentQuestionNav();$('shortAnswerCount').textContent=`${value.length}/500`;setAssessmentSaveStatus('Išsaugoma…','saving');clearTimeout(timer);timer=setTimeout(()=>queueAssessmentAnswerSave(q,value),650)};
  ta.onblur=()=>{clearTimeout(timer);queueAssessmentAnswerSave(q,ta.value)};
  return;
 }
 $('answers').innerHTML=visual+'<div class="emptyState">Šio klausimo tipas nepalaikomas.</div>';
}
function markPracticeAnswer(q,answer,ok){
 const type=qType(q);
 if(type==='single'||type==='odd')document.querySelectorAll('.answer').forEach(b=>{const x=Number(b.dataset.v);b.disabled=true;if(x===Number(q.correct))b.classList.add('correct');if(x===Number(answer)&&!ok)b.classList.add('wrong')});
 else document.querySelectorAll('#answers input,#answers select,#answers button').forEach(el=>el.disabled=true);
}
function formatClientAnswer(q,answer){
 if(answer===null||answer===undefined)return 'neatsakyta';const type=qType(q),opts=q.options,choices=questionChoices(q);
 if(type==='single'||type==='odd')return choices?.[Number(answer)]??String(answer);
 if(type==='multi')return (Array.isArray(answer)?answer:[]).map(i=>choices?.[Number(i)]??String(i)).join('; ');
 if(type==='matching'){const left=opts?.left||[],right=opts?.right||[];return left.map((l,i)=>`${l} → ${right[Number(answer?.[String(i)])]??'—'}`).join(' | ')}
 if(type==='sequence'){const items=opts?.items||[];return Object.entries(answer||{}).sort((a,b)=>Number(a[1])-Number(b[1])).map(([idx,pos])=>`${Number(pos)+1}. ${items[Number(idx)]??'—'}`).join(' → ')}
 if(type==='short')return String(answer||'').trim()||'neatsakyta';
 return String(answer);
}

async function startGrade10BlockQuiz(topicId,classId,blockIds,count){
 setPresenceContext(`Žinių treniruotė: ${topicById(topicId)?.title||topicId}`,topicId);
 const {data,error}=await sb.rpc('start_grade10_practice',{p_class_id:classId,p_parent_topic_id:topicId,p_block_ids:blockIds,p_count:Number(count)||10});
 if(error)return toast(error.message);const rows=data||[];if(!rows.length)return toast('Pasirinktuose blokuose klausimų nėra.');
 quiz={topicId,classId,mode:'practice-g10',blockIds:[...blockIds],items:rows.map(r=>prepareClientQuestion({id:r.attempt_question_id,question:r.question_text,options:Array.isArray(r.options)?r.options:[],correct:null,explanation:'',category:'',difficulty:'',type:'single'})),index:0,answers:Array(rows.length).fill(null),attemptId:rows[0].attempt_id,startMs:Date.now(),last:null,completed:false};
 setCurrentRestore(null,{kind:'practice-quiz',classId,topicId});
 $('quizMode').textContent='PRAKTIKA';$('quizTitle').textContent=topicById(topicId).title;show('quiz');renderQ();
}

let assessmentStartPending=false;
async function startSecureAssessment(topicId,classId,status=null){
 if(status?.practical_required&&status?.theory_submitted_at&&!status?.practical_submitted_at)return openAssessmentPractical(status.attempt_id,topicId,classId);
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
  const firstIncomplete=items.findIndex((q,i)=>!assessmentAnswerComplete(q,answers[i]));
  const savedPosition=Number(sessionStorage.getItem(assessmentQuestionPositionKey(quiz.attemptId)));
  quiz.index=Number.isInteger(savedPosition)&&savedPosition>=0&&savedPosition<items.length&&sessionStorage.getItem(assessmentQuestionPositionKey(quiz.attemptId))!==null?savedPosition:(firstIncomplete>=0?firstIncomplete:0);
  saveAssessmentDraftLocal();
  if(Array.isArray(localAnswers))items.forEach((q,i)=>{if(assessmentAnswerHasValue(q,localAnswers[i])&&!answerEquals(localAnswers[i],serverAnswers[i],qType(q)))queueAssessmentAnswerSave(q,localAnswers[i])});
  setCurrentRestore(null,{kind:'assessment-quiz',classId,topicId});
  $('quizMode').textContent='ATSISKAITYMAS';$('quizTitle').textContent=topicById(topicId).title;show('quiz');renderQ();
 }finally{assessmentStartPending=false}
}

async function startVbeCryptoQuiz(classId){
 const topicId='kriptografija';
 const c=await getStudentClass();
 if(!c||c.id!==classId)return toast('Treniruotė pasiekiama tik savo klasėje.');
 await loadClassTopics(classId);
 const {data:access,error:accessError}=await sb.from('topic_access').select('is_open,practice_open').eq('class_id',classId).eq('topic_id',topicId).maybeSingle();
 if(accessError||!access?.is_open||!access?.practice_open)return toast('Kriptografijos treniruotė dar neatidaryta.');
 if(VBE_CRYPTO.length<10)return toast('Nepakanka egzaminų klausimų 10 klausimų treniruotei.');
 const selected=shuffle([...VBE_CRYPTO]).slice(0,10);
 const {data:attempt,error}=await sb.from('practice_attempts').insert({student_id:me.id,class_id:classId,topic_id:topicId,mode:'practice',total_questions:selected.length}).select('id,started_at').single();
 if(error)return toast(error.message);
 setPresenceContext('VBE kriptografijos žinių treniruotė',topicId);
 quiz={topicId,classId,mode:'practice-vbe-crypto',items:selected.map(prepareClientQuestion),index:0,answers:Array(selected.length).fill(null),attemptId:attempt.id,startMs:Date.now(),last:null,completed:false};
 setCurrentRestore(null,{kind:'practice-quiz',classId,topicId});
 $('quizMode').textContent='VBE PRAKTIKA';
 $('quizTitle').textContent='Kriptografija · ankstesnių egzaminų klausimai';
 show('quiz');renderQ();
}
async function startQuiz(topicId,classId,mode,count){
 setPresenceContext(`Žinių treniruotė: ${topicById(topicId)?.title||topicId}`,topicId);
 if(mode==='assessment')return toast('Šiam atsiskaitymui naudok saugų atsiskaitymo režimą.');
 const pool=PRACTICE.filter(q=>q.topic===topicId);if(!pool.length)return toast('Klausimų bankas tuščias.');
 const n=Math.min(Number(count)||10,pool.length);const selected=pickBalancedQuestions(pool,n);
 const {data:attempt,error}=await sb.from('practice_attempts').insert({student_id:me.id,class_id:classId,topic_id:topicId,mode:'practice',total_questions:n}).select('id,started_at').single();if(error)return toast(error.message);
 quiz={topicId,classId,mode:'practice',items:selected.map(prepareClientQuestion),index:0,answers:Array(n).fill(null),attemptId:attempt.id,startMs:Date.now(),last:null,completed:false};
 setCurrentRestore(null,{kind:'practice-quiz',classId,topicId});
 $('quizMode').textContent='PRAKTIKA';$('quizTitle').textContent=topicById(topicId).title;show('quiz');renderQ();
}
function renderQ(){
 persistPracticeProgress();
 if(quiz.mode==='assessment-secure'&&quiz.attemptId)sessionStorage.setItem(assessmentQuestionPositionKey(quiz.attemptId),String(quiz.index));
 const q=quiz.items[quiz.index];$('quizCounter').textContent=`${quiz.index+1}/${quiz.items.length}`;$('progressBar').style.width=`${(quiz.index+1)/quiz.items.length*100}%`;
 const live=quiz.items.slice(0,quiz.index).reduce((n,item,i)=>n+(item.correct!=null&&answerEquals(quiz.answers[i],item.correct,qType(item))?1:0),0);$('quizScoreLive').textContent=String(quiz.mode).startsWith('practice')?`Teisingai: ${live}`:'';
 $('questionCategory').textContent=[q.category,qTypeLabel(qType(q))].filter(Boolean).join(' · ');$('questionDifficulty').textContent=q.difficulty||'';$('questionText').textContent=q.question;$('feedback').classList.add('hidden');renderQuestionInput(q);
 const isAssessment=quiz.mode==='assessment-secure';$('quitQuiz').textContent=isAssessment?'Išeiti':'Baigti';$('prevQuestion').classList.toggle('hidden',!isAssessment||quiz.index===0);
 if(isAssessment){$('nextQuestion').textContent=quiz.index===quiz.items.length-1?'Baigti I dalį →':'Kitas klausimas →';$('nextQuestion').classList.remove('hidden');setAssessmentSaveStatus(assessmentAnswerHasValue(q,quiz.answers[quiz.index])?'Išsaugota':'Atsakymai išsaugomi automatiškai',assessmentAnswerHasValue(q,quiz.answers[quiz.index])?'saved':'')}
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
  const r=Array.isArray(data)?data[0]:data;q.correct=Number(r.correct_index);q.explanation=r.explanation||'';const ok=r.is_correct===true;quiz.answers[quiz.index]=Number(answer);markPracticeAnswer(q,Number(answer),ok);$('feedback').className='feedback';$('feedback').innerHTML=`<b>${ok?'✓ Teisingai':'✕ Neteisingai'}</b><br>${esc(q.explanation)}`;$('nextQuestion').textContent=quiz.index===quiz.items.length-1?'Baigti bandymą':'Kitas klausimas →';$('nextQuestion').classList.remove('hidden');persistPracticeProgress();return;
 }
 const ok=answerEquals(answer,q.correct,type);quiz.answers[quiz.index]=answer;markPracticeAnswer(q,answer,ok);$('feedback').className='feedback';$('feedback').innerHTML=`<b>${ok?'✓ Teisingai':'✕ Neteisingai'}</b><br>${esc(q.explanation)}`;$('nextQuestion').textContent=quiz.index===quiz.items.length-1?'Baigti bandymą':'Kitas klausimas →';$('nextQuestion').classList.remove('hidden');
 persistPracticeProgress();
 await sb.from('attempt_answers').insert({attempt_id:quiz.attemptId,question_id:q.id,question_type:type,selected_index:(type==='single'||type==='odd')?Number(answer):null,correct_index:(type==='single'||type==='odd')?Number(q.correct):null,selected_answer:normalizeAnswer(answer,type),correct_answer:normalizeAnswer(q.correct,type),is_correct:ok});
}
$('prevQuestion').onclick=()=>{if(quiz.mode==='assessment-secure'&&quiz.index>0){quiz.index--;renderQ()}};
$('nextQuestion').onclick=async()=>{
 if(quiz.mode==='assessment-secure'){
  if(quiz.index<quiz.items.length-1){quiz.index++;renderQ();return}
  const unanswered=quiz.items.reduce((n,q,i)=>n+(assessmentAnswerComplete(q,quiz.answers[i])?0:1),0);
  const msg=unanswered?`Liko neatsakytų arba nebaigtų klausimų: ${unanswered}. Ar tikrai baigti I dalį? Pateikus teoriją jos atsakymų keisti nebegalėsi.`:'Ar tikrai baigti I dalį – teoriją? Pateikus jos atsakymų keisti nebegalėsi.';
  if(!confirm(msg))return;
  try{setAssessmentSaveStatus('Išsaugomi paskutiniai pakeitimai…','saving');await flushAssessmentSaves()}catch(e){toast('Nepavyko išsaugoti paskutinių atsakymų. Patikrink interneto ryšį ir bandyk dar kartą.');return}
  return finishAssessmentTheory();
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

function resetAssessmentQuizState(){
 quiz={topicId:null,classId:null,mode:null,items:[],index:0,answers:[],attemptId:null,startMs:0,last:null,completed:false};
 assessmentAccessToken=null;assessmentDirtyQuestionIds=new Set();assessmentSaveQueue=Promise.resolve();
}
function showAssessmentSubmittedSummary(data={}){
 const seconds=Number(data.duration_seconds||data.theory_duration_seconds||0),focusEvents=Number(data.focus_events||0);
 $('resultPercent').textContent='—';$('scoreCircle').style.setProperty('--score','0%');$('correctCount').textContent='—';$('wrongCount').textContent='—';$('resultGoal').textContent='—';
 $('resultTitle').textContent='Atsiskaitymas pateiktas';$('resultSubtitle').textContent=`Rezultatas bus paskelbtas vėliau.${seconds?` Bendra trukmė: ${fmtDurationDetailed(seconds)}.`:''}${focusEvents?` Teorijos metu užfiksuota išėjimų / fokuso įvykių: ${focusEvents}.`:''}`;
 $('retryQuiz').classList.add('hidden');$('reviewErrors').classList.add('hidden');$('errorsReview').classList.add('hidden');show('results');
}
async function finishAssessmentTheory(){
 if(quiz.mode!=='assessment-secure'||!quiz.attemptId)return;
 try{await flushAssessmentSaves()}catch(e){return toast('Nepavyko išsaugoti paskutinių atsakymų. Teorinė dalis dar nepateikta.')}
 const ctx={attemptId:quiz.attemptId,topicId:quiz.topicId,classId:quiz.classId};
 const {data,error}=await sb.rpc('finish_assessment_theory',{p_attempt_id:ctx.attemptId});if(error)return toast(error.message);
 const r=Array.isArray(data)?data[0]:data||{};quiz.completed=true;clearAssessmentDraftLocal(ctx.attemptId);sessionStorage.removeItem(assessmentQuestionPositionKey(ctx.attemptId));assessmentAccessToken=null;
 if(r.practical_required){resetAssessmentQuizState();return openAssessmentPractical(ctx.attemptId,ctx.topicId,ctx.classId)}
 resetAssessmentQuizState();showAssessmentSubmittedSummary(r);
}
async function openAssessmentPractical(attemptId,topicId,classId){
 assessmentPracticalView={attemptId,topicId,classId};setPresenceContext(`Atsiskaitymo praktinė dalis: ${topicById(topicId)?.title||topicId}`,topicId);
 const {error:startErr}=await sb.rpc('start_assessment_practical',{p_attempt_id:attemptId});if(startErr)return toast(startErr.message);
 const [{data:state,error:stateErr},{data:files,error:fileErr}]=await Promise.all([sb.from('assessment_attempt_practical').select('*').eq('attempt_id',attemptId).single(),sb.from('assessment_practical_files').select('*').eq('attempt_id',attemptId).order('uploaded_at',{ascending:true})]);
 if(stateErr)return toast(stateErr.message);if(fileErr)return toast(fileErr.message);
 const byKind=Object.fromEntries((files||[]).map(f=>[f.file_kind,f])),submitted=!!state.practical_submitted_at;
 const requirementRows=[['Vektoriniai objektai ir geometrinės formos','2 t.'],['Bent viena Bezjė kreivė','2 t.'],['Užpildas, kontūras ir gradientas','2 t.'],['Tekstas','1 t.'],['Kompozicija ir tvarkingumas','2 t.'],['Tinkamai pateikti SVG + PNG','1 t.']];
 const fileCard=(kind,label,accept)=>{const f=byKind[kind];return `<div class="practicalFileCard ${f?'ready':''}"><div class="practicalFileIcon">${kind==='svg'?'◇':'▧'}</div><div class="grow"><b>${label}</b><div class="subtle">${f?`${esc(f.original_name)} · ${fmtFileSize(f.size_bytes)}`:(kind==='svg'?'Vektorinis originalas (.svg)':'Galutinio vaizdo peržiūra (.png)')}</div></div>${f?`<button class="smallBtn" data-practical-download="${f.id}">Atsisiųsti</button>`:''}${submitted?'':`<label class="smallBtn practicalUploadButton">${f?'Pakeisti':'Įkelti'}<input type="file" data-practical-upload="${kind}" accept="${accept}" hidden></label>`}</div>`};
 $('assessmentPracticalContent').innerHTML=`<div class="pageHero"><span class="kicker">ATSISKAITYMAS · II DALIS</span><h1>${esc(state.title||'Logotipo kūrimas')}</h1><p>Teorinė dalis jau pateikta. Praktinės dalies metu gali dirbti „Inkscape“ ar kita vektorinės grafikos programa – išėjimai iš naršyklės čia nefiksuojami.</p></div><div class="assessmentStepBar"><span class="done">1 · Teorija ✓</span><span class="active">2 · Logotipas</span><span>3 · Pateikimas</span></div><div class="contentGrid practicalAssessmentGrid"><div class="stack"><div class="panel"><span class="kicker">UŽDUOTIS</span><h2>Sukurk vektorinį logotipą</h2><p class="muted">${esc(state.instructions||'')}</p><div class="rubricPreview">${requirementRows.map(([n,p])=>`<div><span>${esc(n)}</span><b>${p}</b></div>`).join('')}</div><div class="notice"><b>Kas yra gradientas?</b> Tai tolygus vienos spalvos perėjimas į kitą spalvą ar jos atspalvį, pvz., nuo tamsiai mėlynos į šviesiai mėlyną.</div></div></div><div class="stack"><div class="panel"><span class="kicker">FAILŲ PATEIKIMAS</span><h2>SVG + PNG</h2><p class="muted">Jei darbą atlikai, įkelk SVG originalą ir PNG peržiūrą. Jei nespėjai užbaigti, atsiskaitymą gali pateikti ir be vieno ar abiejų failų.</p>${fileCard('svg','SVG originalas','.svg,image/svg+xml')}${fileCard('png','PNG peržiūra','.png,image/png')}<div class="practicalSubmitStatus">${submitted?'<span class="badge ok">Praktinė dalis pateikta</span>':`<span class="badge ${byKind.svg&&byKind.png?'ok':''}">${byKind.svg&&byKind.png?'Abu failai paruošti':(byKind.svg||byKind.png?'Įkeltas 1 iš 2 failų':'Failai neįkelti')}</span>`}</div>${submitted?'<p class="muted">Atsiskaitymas jau pateiktas. Rezultatas bus paskelbtas vėliau.</p>':`<button class="primary fullWidth" id="submitAssessmentPractical">Pateikti visą atsiskaitymą</button><button class="ghost fullWidth" id="leaveAssessmentPractical">Išeiti ir tęsti vėliau</button>`}</div></div></div>`;
 document.querySelectorAll('[data-practical-download]').forEach(b=>b.onclick=()=>downloadAssessmentPracticalFile(b.dataset.practicalDownload));document.querySelectorAll('[data-practical-upload]').forEach(inp=>inp.onchange=()=>uploadAssessmentPracticalFile(inp.dataset.practicalUpload,inp.files?.[0],byKind[inp.dataset.practicalUpload]||null));
 if($('leaveAssessmentPractical'))$('leaveAssessmentPractical').onclick=()=>navigateTo(()=>renderStudent());if($('submitAssessmentPractical'))$('submitAssessmentPractical').onclick=()=>submitAssessmentPracticalFinal(state,{hasSvg:!!byKind.svg,hasPng:!!byKind.png});
 setCurrentRestore(null,{kind:'assessment-practical',classId,topicId,attemptId});show('assessment-practical');
}
async function uploadAssessmentPracticalFile(kind,file,oldFile){
 if(!file)return;const ctx=assessmentPracticalView,ext=fileExtension(file.name);if(ext!==kind)return toast(kind==='svg'?'Pasirink .svg failą.':'Pasirink .png failą.');if(file.size>25*1024*1024)return toast('Vienas failas gali būti iki 25 MB.');
 const path=`${ctx.classId}/assessment-${ctx.attemptId}/${me.id}/${storageFileName(file.name)}`;toast(`Įkeliamas ${kind.toUpperCase()} failas...`);const {error:upErr}=await sb.storage.from('student-submissions').upload(path,file,storageUploadOptions(file));if(upErr)return toast(upErr.message);
 const payload={attempt_id:ctx.attemptId,class_id:ctx.classId,student_id:me.id,file_kind:kind,storage_path:path,original_name:file.name,mime_type:uploadContentType(file),size_bytes:file.size,uploaded_at:new Date().toISOString()};const {error}=await sb.from('assessment_practical_files').upsert(payload,{onConflict:'attempt_id,file_kind'});if(error){await sb.storage.from('student-submissions').remove([path]);return toast(error.message)}
 if(oldFile?.storage_path&&oldFile.storage_path!==path)await sb.storage.from('student-submissions').remove([oldFile.storage_path]);toast(`${kind.toUpperCase()} failas išsaugotas.`);openAssessmentPractical(ctx.attemptId,ctx.topicId,ctx.classId);
}
async function downloadAssessmentPracticalFile(id){const {data:f,error}=await sb.from('assessment_practical_files').select('*').eq('id',id).single();if(error)return toast(error.message);await downloadOriginalFile('student-submissions',f.storage_path,f.original_name)}
async function submitAssessmentPracticalFinal(state,fileState={}){
 const missing=[];if(!fileState.hasSvg)missing.push('SVG');if(!fileState.hasPng)missing.push('PNG');
 const message=missing.length
  ?`Trūksta ${missing.join(' ir ')} failo${missing.length>1?'ų':''}. Jei nespėjai užbaigti darbo, gali pateikti atsiskaitymą ir dabar.\n\nAr tikrai pateikti? Po pateikimo failų įkelti ar pakeisti nebegalėsi.`
  :'Pateikti II dalį ir užbaigti visą atsiskaitymą? Po pateikimo failų pakeisti nebegalėsi.';
 if(!confirm(message))return;
 const btn=$('submitAssessmentPractical');if(btn)btn.disabled=true;
 const {data,error}=await sb.rpc('finish_assessment_practical',{p_attempt_id:state.attempt_id});
 if(error){if(btn)btn.disabled=false;return toast(error.message)}
 const r=Array.isArray(data)?data[0]:data||{};
 assessmentPracticalView={attemptId:null,topicId:null,classId:null};
 showAssessmentSubmittedSummary(r);
}

async function finishQuiz(){
 if(quiz.mode==='assessment-secure')return finishAssessmentTheory();
 let total=quiz.items.length,correct=quiz.items.reduce((n,q,i)=>n+(q.correct!=null&&answerEquals(quiz.answers[i],q.correct,qType(q))?1:0),0),pct=total?Math.round(correct/total*100):0,seconds=Math.max(1,Math.round((Date.now()-quiz.startMs)/1000)),pass=quiz.mode==='assessment-secure'?CFG.assessmentPassPercent:CFG.practicePassPercent,focusEvents=0,resultsReleased=true,completedStudents=0,totalStudents=0,motivationReward=null;
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
  clearAssessmentDraftLocal(quiz.attemptId);sessionStorage.removeItem(assessmentQuestionPositionKey(quiz.attemptId));
 }else if(quiz.mode==='practice-g10'){
  const {data,error}=await sb.rpc('finish_grade10_practice',{p_attempt_id:quiz.attemptId});if(error)return toast(error.message);const r=Array.isArray(data)?data[0]:data;if(r){total=Number(r.total_questions)||total;correct=Number(r.correct_answers)||0;pct=Number(r.score_percent)||0;seconds=Number(r.duration_seconds)||seconds}
 }else await sb.from('practice_attempts').update({completed_at:new Date().toISOString(),duration_seconds:seconds,correct_answers:correct,score_percent:pct}).eq('id',quiz.attemptId);

 if(String(quiz.mode).startsWith('practice')){sessionStorage.removeItem(practiceProgressKey());motivationReward=await getPracticeReward(quiz.attemptId);}

 setPresenceContext(`Rezultatų peržiūra: ${topicById(quiz.topicId)?.title||quiz.topicId}`,quiz.topicId);
 quiz.last={...quiz,correct,total,pct,seconds,pass,focusEvents,resultsReleased,completedStudents,totalStudents};
 $('errorsReview').classList.add('hidden');
 $('retryQuiz').classList.toggle('hidden',quiz.mode==='assessment-secure');

 if(quiz.mode==='assessment-secure'&&!resultsReleased){
  if($('motivationResult')){$('motivationResult').classList.add('hidden');$('motivationResult').innerHTML=''}
  $('resultPercent').textContent='—';$('scoreCircle').style.setProperty('--score','0%');
  $('correctCount').textContent='—';$('wrongCount').textContent='—';$('resultGoal').textContent='—';
  $('resultTitle').textContent='Atsiskaitymas pateiktas';
  $('resultSubtitle').textContent=`Rezultatas bus paskelbtas vėliau. Tavo trukmė: ${fmtDurationDetailed(seconds)}. Užfiksuoti išėjimo / fokuso įvykiai: ${focusEvents}.`;
  $('reviewErrors').classList.add('hidden');
  show('results');return;
 }

 $('resultPercent').textContent=pct+'%';$('scoreCircle').style.setProperty('--score',pct+'%');$('correctCount').textContent=correct;$('wrongCount').textContent=total-correct;$('resultGoal').textContent=pass+'%';$('resultTitle').textContent=pct>=pass?(pct===100?'Puiku – 100%!':'Tikslas pasiektas!'):'Dar pasipraktikuok';
 $('resultSubtitle').textContent=quiz.mode==='assessment-secure'?`Atsiskaitymo trukmė: ${fmtDurationDetailed(seconds)}. Užfiksuoti išėjimo / fokuso įvykiai: ${focusEvents}.`:`${quiz.mode==='practice-vbe-crypto'?'Ankstesnių egzaminų klausimų treniruotė · ':''}Bandymo trukmė: ${fmtDurationDetailed(seconds)}.`;
 if(String(quiz.mode).startsWith('practice'))renderPracticeMotivationReward(motivationReward,quiz.topicId,pct);
 else if($('motivationResult')){$('motivationResult').classList.add('hidden');$('motivationResult').innerHTML=''}
 if(quiz.mode==='assessment-secure'){
  $('reviewErrors').textContent='Peržiūrėti savo atsakymus';
  $('reviewErrors').classList.remove('hidden');
 }else{
  $('reviewErrors').textContent='Peržiūrėti klaidas';
  $('reviewErrors').classList.remove('hidden');
 }
 show('results');
}
$('retryQuiz').onclick=()=>{const r=quiz.last;if(!r||r.mode==='assessment-secure')return;if(r.mode==='practice-g10')return startGrade10BlockQuiz(r.topicId,r.classId,r.blockIds||[],r.items.length);(r.mode==='practice-vbe-crypto'?startVbeCryptoQuiz(r.classId):startQuiz(r.topicId,r.classId,'practice',r.items.length))};
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
 setCurrentRestore(()=>renderProfile(),{kind:'profile'});
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
  setHeader();
  if(isStudent)profile.name_change_used=true;
  toast('Išsaugota.');
  renderProfile();
 };
}

/* ================= INIT ================= */
async function boot(){
 document.documentElement.dataset.theme=localStorage.getItem('inf11v3_theme')||'light';
 if(!configured){show('setup');return}

 // Supabase recovery nuoroda gali grąžinti laikiną sesiją. Tokiu atveju
 // pirmiausia rodome naujo slaptažodžio formą, o ne mokinio skydelį.
 const initialRecoveryError=recoveryUrlError();
 passwordRecoveryMode=!initialRecoveryError&&isPasswordRecoveryUrl();

 // Supabase autentifikavimo įvykyje nereikia vykdyti asinchroninių DB užklausų:
 // tai gali užblokuoti auth kliento užklausas (deadlock).
 // Pradinę sesiją jau atkuria žemiau esantis getSession() kelias.
 sb.auth.onAuthStateChange((event,session)=>{
  if(event==='INITIAL_SESSION')return;
  setTimeout(async()=>{
   try{
  if(event==='PASSWORD_RECOVERY'){
   passwordRecoveryMode=true;
   me=session?.user||null;
   profile=null;
   setHeader();
   if(session?.user)showPasswordRecovery();
   else{
    passwordRecoveryMode=false;
    setAuthMode('forgotPasswordForm');show('auth');
    authMsg('Atkūrimo nuoroda nebegalioja. Paprašyk naujos nuorodos.',true);
   }
   return;
  }

  if(passwordRecoveryMode)return;

  if(session&&!me){
   if(event==='SIGNED_IN')resetIdleClock();
   else if(idleSessionExpired()){
    await forceIdleLogout('Dėl saugumo ankstesnė sesija užbaigta po 30 min. neaktyvumo.');
    return;
   }else if(!readIdleActivity())resetIdleClock();

   me=session.user;
   await loadProfile();
   setHeader();
   await restoreInitialNavigation();
  }
  if(!session){
   stopTeacherPresenceRefresh();
   stopIdleLogout();
   me=null;profile=null;currentNavView=null;initialViewRestored=false;historyGuardReady=false;history.replaceState(null,'',location.pathname+location.search);
   setHeader();
   setAuthMode('loginForm');
   restoreRememberedLogin();
   show('auth');
  }
   }catch(err){
    console.error('Prisijungimo būsenos apdorojimas:',err);
    if(!profile){
     setAuthMode('loginForm');show('auth');
     authMsg('Nepavyko įkelti paskyros. Pabandyk perkrauti puslapį.',true);
    }
   }
  },0);
 });

 const {data:{session}}=await sb.auth.getSession();

 if(passwordRecoveryMode){
  me=session?.user||null;
  profile=null;
  setHeader();
  if(session?.user)showPasswordRecovery();
  else{
   passwordRecoveryMode=false;
   setAuthMode('forgotPasswordForm');show('auth');
   authMsg('Atkūrimo nuoroda nebegalioja. Paprašyk naujos nuorodos.',true);
  }
  return;
 }
 if(initialRecoveryError){
  history.replaceState(null,'',location.pathname);
  if(session)await sb.auth.signOut();
  passwordRecoveryMode=false;
  me=null;profile=null;
  setHeader();setAuthMode('forgotPasswordForm');show('auth');
  authMsg('Slaptažodžio atkūrimo nuoroda pasibaigė arba yra neteisinga. Paprašyk naujos nuorodos.',true);
  return;
 }

 if(session){
  if(idleSessionExpired()){
   clearIdleClock();
   await sb.auth.signOut();
   setAuthMode('loginForm');
   restoreRememberedLogin();
   show('auth');
   authMsg('Dėl saugumo ankstesnė sesija užbaigta po 30 min. neaktyvumo.');
  }else{
   if(!readIdleActivity())resetIdleClock();
   me=session.user;
   await loadProfile();
   setHeader();
   await restoreInitialNavigation();
  }
 }else{
  clearIdleClock();
  setAuthMode('loginForm');
  restoreRememberedLogin();
  show('auth');
 }
}
boot();


/* Informatikos VBE I dalies mokomoji, nepriklausoma 30 klausimų simuliacija. */
let theoryExamSim=null;
function startTheoryExamSimulation(){
 const bank=window.VBE_THEORY_SIM_QUESTIONS||[];
 if(bank.length!==30)return toast('Neįkelta visa teorijos treniruotės klausimų bazė.');
 theoryExamSim={questions:[...bank],answers:Array(bank.length).fill(null),index:0,started:Date.now()};
 drawTheoryExamSimulation();
}
function drawTheoryExamSimulation(){
 const run=theoryExamSim;if(!run)return;
 const q=run.questions[run.index],i=run.index;
 const current=run.answers[i];
 modal(`<span class="kicker">INFORMATIKOS VBE I DALIS · MOKOMOJI SIMULIACIJA</span>
 <h2>Teorijos egzamino treniruotė</h2>
 <p class="muted">Klausimas ${i+1} iš 30 · ${esc(q.section)}. Atsakymai bus įvertinti pabaigoje.</p>
 <div style="height:8px;background:#e7ebf4;border-radius:8px;overflow:hidden;margin:16px 0"><div style="height:100%;width:${(i+1)/30*100}%;background:#3154eb"></div></div>
 <div style="font-size:1.05rem;font-weight:700;margin:18px 0">${esc(q.question).replace(/\`/g,'')}</div>
 ${q.visual||''}
 <fieldset style="border:none;padding:0;margin:15px 0">
 ${q.options.map((opt,j)=>`<label style="display:flex;gap:12px;align-items:center;border:1px solid #dbe1ec;padding:11px;margin:8px 0;border-radius:10px;cursor:pointer"><input type="radio" name="theorySimAnswer" value="${j}" ${current===j?'checked':''}><span>${esc(opt)}</span></label>`).join('')}
 </fieldset>
 <div style="display:flex;justify-content:space-between;gap:10px;flex-wrap:wrap">
 <button class="ghost" id="theorySimPrev" ${i===0?'disabled':''}>← Ankstesnis</button>
 <button class="primary" id="theorySimNext">${i===29?'Pateikti ir įvertinti':'Kitas →'}</button>
 </div>`);
 document.querySelectorAll('input[name="theorySimAnswer"]').forEach(x=>x.onchange=()=>{run.answers[i]=Number(x.value)});
 $('theorySimPrev').onclick=()=>{if(run.index>0){run.index--;drawTheoryExamSimulation()}};
 $('theorySimNext').onclick=()=>{
  if(run.answers[i]===null)return toast('Pasirink atsakymą.');
  if(i===29)return finishTheoryExamSimulation();
  run.index++;drawTheoryExamSimulation();
 };
}
function finishTheoryExamSimulation(){
 const run=theoryExamSim;if(!run)return;
 const correct=run.questions.reduce((n,q,i)=>n+(run.answers[i]===q.correct?1:0),0);
 const errors=run.questions.map((q,i)=>({q,a:run.answers[i],i})).filter(x=>x.a!==x.q.correct);
 modal(`<span class="kicker">MOKOMOJO TESTO REZULTATAS</span><h2>${correct} / 30 · ${Math.round(correct/30*100)} %</h2>
 <p class="muted">Tai mokomosios simuliacijos įvertinimas, ne oficialus VBE balas.</p>
 <details open><summary>Peržiūrėti klaidas (${errors.length})</summary>
 ${errors.length?errors.map(x=>`<div style="padding:12px 0;border-bottom:1px solid #ddd"><b>${x.i+1}. ${esc(x.q.question)}</b><p>Teisingas: ${esc(x.q.options[x.q.correct])}</p><p class="muted">${esc(x.q.explanation)}</p></div>`).join(''):'<p>Visi atsakymai teisingi!</p>'}
 </details><button class="primary" id="theorySimAgain" style="margin-top:16px">Spręsti iš naujo</button>`);
 $('theorySimAgain').onclick=startTheoryExamSimulation;
}


/* Excel temos mokomosios 20 klausimų treniruotės. */
let currentExcelPractice=null;
function startExcelPractice(setIndex){
 const set=(window.EXCEL_PRACTICE_SETS||[])[setIndex];
 if(!set||set.questions.length!==20)return toast('Nepakanka klausimų pasirinktoje treniruotėje.');
 currentExcelPractice={setIndex,title:set.title,items:[...set.questions],answers:Array(20).fill(null),index:0};
 renderExcelPractice();
}
function renderExcelPractice(){
 const r=currentExcelPractice;if(!r)return;
 const q=r.items[r.index],i=r.index;
 modal(`<span class="kicker">EXCEL ŽINIŲ TRENIRUOTĖ</span><h2>${esc(r.title)}</h2>
 <p class="muted">Klausimas ${i+1} iš 20 · Mokomasis testas, ne oficialus VBE klausimynas</p>
 <div style="height:7px;background:#e9edf8;border-radius:10px;overflow:hidden"><div style="height:100%;width:${(i+1)*5}%;background:#3154eb"></div></div>
 <p style="font-weight:700;white-space:pre-wrap;margin-top:20px">${esc(q.question)}</p>
 ${q.options.map((opt,j)=>`<label style="display:flex;align-items:center;gap:12px;border:1px solid #d8e0ec;border-radius:9px;padding:11px;margin:8px 0;cursor:pointer"><input type="radio" name="excelPracticeAnswer" value="${j}" ${r.answers[i]===j?'checked':''}><span>${esc(opt)}</span></label>`).join('')}
 <div style="display:flex;justify-content:space-between;gap:10px;margin-top:18px">
 <button class="ghost" id="excelPracticePrev" ${i===0?'disabled':''}>← Ankstesnis</button>
 <button class="primary" id="excelPracticeNext">${i===19?'Baigti ir peržiūrėti':'Kitas →'}</button></div>`);
 document.querySelectorAll('input[name="excelPracticeAnswer"]').forEach(inp=>inp.onchange=()=>{r.answers[i]=Number(inp.value)});
 $('excelPracticePrev').onclick=()=>{if(i>0){r.index=i-1;renderExcelPractice()}};
 $('excelPracticeNext').onclick=()=>{if(r.answers[i]===null)return toast('Pasirink atsakymą.');if(i===19)return finishExcelPractice();r.index=i+1;renderExcelPractice()};
}
function finishExcelPractice(){
 const r=currentExcelPractice;
 const n=r.items.reduce((count,q,i)=>count+Number(r.answers[i]===q.correct),0);
 const wrong=r.items.map((q,i)=>({q,i})).filter(({q,i})=>r.answers[i]!==q.correct);
 modal(`<span class="kicker">EXCEL PRAKTIKOS REZULTATAS</span><h2>${esc(r.title)} · ${n}/20 (${n*5} %)</h2>
 <p class="muted">Tai žinių treniruotės, ne atsiskaitymo pažymys.</p>
 <details open><summary>Klaidų peržiūra (${wrong.length})</summary>
 ${wrong.length?wrong.map(({q,i})=>`<div style="border-bottom:1px solid #dee3ed;padding:12px 0"><b>${i+1}. ${esc(q.question)}</b><p>Teisingas atsakymas: ${esc(q.options[q.correct])}</p><p class="muted">${esc(q.explanation)}</p></div>`).join(''):'<p>Visi atsakymai teisingi!</p>'}
 </details><button class="primary" type="button" id="excelPracticeRetry" style="margin-top:16px">Kartoti treniruotę</button>`);
 $('excelPracticeRetry').onclick=()=>startExcelPractice(r.setIndex);
}
