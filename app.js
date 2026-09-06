
const CFG=window.SITE_CONFIG,PRACTICE=window.PRACTICE_QUESTIONS||[],ASSESSMENT=window.ASSESSMENT_QUESTIONS||[];
const $=id=>document.getElementById(id),topicById=id=>CFG.topics.find(t=>t.id===id);
const shuffle=a=>{a=[...a];for(let i=a.length-1;i>0;i--){let j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a};
const esc=s=>String(s).replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
let state={topicId:null,mode:null,items:[],index:0,answers:[],last:null};

function show(name){document.querySelectorAll('.view').forEach(v=>v.classList.add('hidden'));$('view-'+name).classList.remove('hidden');window.scrollTo({top:0,behavior:'smooth'})}
function getHistory(){return JSON.parse(localStorage.getItem('inf11v2_history')||'[]')}
function saveHistory(x){const h=getHistory();h.unshift(x);localStorage.setItem('inf11v2_history',JSON.stringify(h.slice(0,100)))}
function toast(x){$('toast').textContent=x;$('toast').classList.remove('hidden');clearTimeout(window.__t);window.__t=setTimeout(()=>$('toast').classList.add('hidden'),2300)}

function renderHome(){
 $('openTopicsCount').textContent=CFG.topics.filter(t=>t.open).length;
 $('practiceCount').textContent=PRACTICE.filter(q=>topicById(q.topic)?.practiceOpen).length;
 $('attemptCount').textContent=getHistory().length;
 $('topicsGrid').innerHTML=CFG.topics.map(t=>`<article class="topicCard ${t.open?'open':'locked'}">
 <span class="status ${t.open?'opened':'closed'}">${t.open?(t.current?'● DABAR MOKOMĖS':'ATIDARYTA'):'🔒 UŽRAKINTA'}</span>
 <div class="icon">${t.icon}</div><h3>${esc(t.title)}</h3><p>${esc(t.area)}</p>
 <div class="cardBottom"><span class="pill">${t.code}</span><span class="pill">${t.hours} val.</span>
 <button class="${t.open?'primary':'ghost'}" data-open-topic="${t.id}">${t.open?'Atidaryti':'Užrakinta'}</button></div></article>`).join('');
 bindTopics();
}
function bindTopics(){document.querySelectorAll('[data-open-topic]').forEach(b=>b.onclick=()=>{const t=topicById(b.dataset.openTopic);if(!t.open)return toast('🔒 Šios temos dar nepradėjome.');openTopic(t.id)})}

const vectorGoals=[
'Paaiškinti vektorinės ir taškinės grafikos skirtumus ir jų taikymą.',
'Suprasti vektorinių objektų, mazgų ir Bezjė kreivių principą.',
'Skirti RGB ir CMYK spalvų modelių paskirtį.',
'Naudoti formas, kontūrus, užpildus, gradientus ir tekstą.',
'Suprasti raiškos reikšmę eksportuojant į taškinę grafiką.',
'Skirti pagrindinius vektorinius ir taškinius failų formatus.',
'Pasirinkti tinkamą formatą pagal galutinę naudojimo paskirtį.',
'Kritiškai vertinti kompoziciją, kontrastą, simetriją ir aiškumą.'
];
function openTopic(id){
 const t=topicById(id);if(!t?.open)return toast('Tema užrakinta.');state.topicId=id;
 $('topicHeader').innerHTML=`<div class="topicHero"><div class="topicHeroLine">${t.icon} ${t.code} · ${esc(t.area)} · rekomenduojama ${t.hours} val.</div>
 <h1>${esc(t.title)}</h1><p>Ši tema atidaryta mokymuisi. Praktika prieinama dabar, o atsiskaitymas bus aktyvuotas tik mokytojui jį paskyrus.</p></div>`;
 $('topicGoals').innerHTML=(id==='vektorine-grafika'?vectorGoals:[]).map(x=>`<li>${esc(x)}</li>`).join('');
 $('practiceSize').value=String(CFG.practiceQuestionCount);
 renderResources(t);renderAssessment(t);show('topic');
}
function renderResources(t){
 const arr=CFG.resources?.[t.id]||[];
 $('resourcesList').innerHTML=arr.length?arr.map(r=>`<div class="resourceCard"><div>⬇️</div><div class="resourceText"><b>${esc(r.title)}</b><small>${esc(r.note||'Failas')}</small></div><a class="primary" href="${esc(r.path)}" download>Atsisiųsti</a></div>`).join('')
 :`<div class="empty">📁 Šiai temai mokinių failų dar neįkelta. Svetainė jau paruošta PDF, DOCX, PPTX, ZIP ir kitiems failams pridėti.</div>`;
}
function renderAssessment(t){
 $('assessmentStatus').className=t.assessmentOpen?'openBadge':'lockBadge';
 $('assessmentStatus').textContent=t.assessmentOpen?'Atidaryta':'🔒 Užrakinta';
 if(!t.assessmentOpen){$('assessmentBox').innerHTML=`<div class="lockedBox"><b>🔒 Atsiskaitymas dar neatidarytas.</b><br>Mokytojas jį aktyvuos tada, kai bus paskirtas atsiskaitymas.</div>`;return}
 const n=ASSESSMENT.filter(q=>q.topic===t.id).length;
 $('assessmentBox').innerHTML=n?`<p class="muted">Atsiskaityme bus ${Math.min(CFG.assessmentQuestionCount,n)} klausimų.</p><button id="startAssessment" class="primary">Pradėti atsiskaitymą</button>`:`<div class="lockedBox">Atsiskaitymo klausimų bankas dar neįkeltas.</div>`;
 if(n)$('startAssessment').onclick=()=>startQuiz(t.id,'assessment',CFG.assessmentQuestionCount);
}
function startQuiz(topicId,mode,count){
 const source=mode==='assessment'?ASSESSMENT:PRACTICE,pool=source.filter(q=>q.topic===topicId);if(!pool.length)return toast('Klausimų bankas tuščias.');
 const n=Math.min(Number(count)||10,pool.length);
 state={topicId,mode,items:shuffle(pool).slice(0,n).map(q=>({...q,shown:shuffle(q.options.map((text,original)=>({text,original})))})),index:0,answers:Array(n).fill(null),last:null};
 $('quizMode').textContent=mode==='assessment'?'ATSISKAITYMAS':'PRAKTIKA';$('quizTitle').textContent=topicById(topicId).title;show('quiz');renderQ();
}
function renderQ(){
 const q=state.items[state.index];$('quizCounter').textContent=`${state.index+1}/${state.items.length}`;$('progressBar').style.width=`${state.index/state.items.length*100}%`;
 const live=state.items.slice(0,state.index).reduce((n,q,i)=>n+(state.answers[i]===q.correct),0);$('quizScoreLive').textContent=state.mode==='practice'?`Teisingai: ${live}`:'';
 $('questionCategory').textContent=q.category||'';$('questionDifficulty').textContent=q.difficulty||'';$('questionText').textContent=q.question;$('feedback').classList.add('hidden');$('nextQuestion').classList.add('hidden');
 $('answers').innerHTML=q.shown.map((o,i)=>`<button class="answer" data-v="${o.original}"><b>${String.fromCharCode(65+i)}.</b> ${esc(o.text)}</button>`).join('');
 document.querySelectorAll('.answer').forEach(b=>b.onclick=()=>choose(Number(b.dataset.v)));
}
function choose(v){
 if(state.answers[state.index]!==null)return;const q=state.items[state.index],ok=v===q.correct;state.answers[state.index]=v;
 document.querySelectorAll('.answer').forEach(b=>{const x=Number(b.dataset.v);b.disabled=true;if(x===q.correct)b.classList.add('correct');if(x===v&&!ok)b.classList.add('wrong')});
 $('feedback').className='feedback';$('feedback').innerHTML=`<b>${ok?'✓ Teisingai':'✕ Neteisingai'}</b><br>${esc(q.explanation)}`;$('nextQuestion').textContent=state.index===state.items.length-1?'Baigti bandymą':'Kitas klausimas →';$('nextQuestion').classList.remove('hidden');
}
function next(){if(state.index===state.items.length-1)finish();else{state.index++;renderQ()}}
function finish(){
 const total=state.items.length,correct=state.items.reduce((n,q,i)=>n+(state.answers[i]===q.correct?1:0),0),pct=Math.round(correct/total*100),pass=state.mode==='assessment'?CFG.assessmentPassPercent:CFG.practicePassPercent,t=topicById(state.topicId);
 state.last={items:state.items,answers:[...state.answers],correct,total,pct,pass,mode:state.mode,topicId:state.topicId,title:t.title};
 saveHistory({date:new Date().toISOString(),topicId:t.id,title:t.title,mode:state.mode,pct,correct,total});
 $('resultPercent').textContent=pct+'%';$('scoreCircle').style.setProperty('--score',pct+'%');$('correctCount').textContent=correct;$('wrongCount').textContent=total-correct;$('resultGoal').textContent=pass+'%';
 $('resultTitle').textContent=pct>=pass?(pct===100?'Puiku – 100%!':'Tikslas pasiektas!'):'Dar pasipraktikuok';$('resultSubtitle').textContent=pct>=pass?'Geras darbas. Gali bandyti dar kartą ir siekti dar aukštesnio rezultato.':'Peržiūrėk klaidas ir atlik naują atsitiktinį bandymą.';$('errorsReview').classList.add('hidden');show('results');renderHome();
}
function review(){
 const r=state.last;if(!r)return;const bad=r.items.map((q,i)=>({q,a:r.answers[i]})).filter(x=>x.a!==x.q.correct);
 $('errorsReview').classList.remove('hidden');$('errorsReview').innerHTML=bad.length?`<span class="kicker">PERŽIŪRA</span><h2>Klaidos ir paaiškinimai</h2>`+bad.map((x,i)=>`<div class="errorItem"><b>${i+1}. ${esc(x.q.question)}</b><p>Tavo atsakymas: <b>${x.a===null?'neatsakyta':esc(x.q.options[x.a])}</b><br>Teisingas: <b>${esc(x.q.options[x.q.correct])}</b><br>${esc(x.q.explanation)}</p></div>`).join(''):`<h2>Be klaidų 🎉</h2>`;$('errorsReview').scrollIntoView({behavior:'smooth'});
}
function renderHistory(){const h=getHistory();$('historyList').innerHTML=h.length?h.map(x=>`<div class="historyRow"><div><b>${esc(x.title)}</b><br><small>${new Date(x.date).toLocaleString('lt-LT')} · ${x.mode==='assessment'?'Atsiskaitymas':'Praktika'} · ${x.correct}/${x.total}</small></div><strong>${x.pct}%</strong></div>`).join(''):`<div class="empty">Bandymų istorijos dar nėra.</div>`}
function go(x){if(x==='home'){renderHome();show('home')}if(x==='history'){renderHistory();show('history')}}
document.querySelectorAll('[data-go]').forEach(b=>b.onclick=()=>go(b.dataset.go));$('themeToggle').onclick=()=>{const n=(document.documentElement.dataset.theme||'light')==='dark'?'light':'dark';document.documentElement.dataset.theme=n;localStorage.setItem('inf11v2_theme',n)};
$('startPractice').onclick=()=>{const t=topicById(state.topicId);if(!t.practiceOpen)return toast('Praktika užrakinta.');startQuiz(state.topicId,'practice',Number($('practiceSize').value))};$('nextQuestion').onclick=next;$('quitQuiz').onclick=()=>{if(confirm('Baigti dabartinį bandymą?'))openTopic(state.topicId)};$('retryQuiz').onclick=()=>{const r=state.last;if(r)startQuiz(r.topicId,r.mode,r.mode==='assessment'?CFG.assessmentQuestionCount:CFG.practiceQuestionCount)};$('reviewErrors').onclick=review;$('clearHistory').onclick=()=>{if(confirm('Išvalyti rezultatų istoriją?')){localStorage.removeItem('inf11v2_history');renderHistory();renderHome()}};
(function(){document.documentElement.dataset.theme=localStorage.getItem('inf11v2_theme')||'light';renderHome();bindTopics()})();
