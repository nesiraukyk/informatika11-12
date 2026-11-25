import {legacyTheoryDestination} from './entry-routing.mjs';
import {LABS,MISSIONS,STAGES,LEVELS,initialNetwork} from './missions.mjs';
import {loadProgress,saveProgress,clearProgress,newRecord,recordExperiment} from './progress.mjs';
import {evaluateGoal} from './assessment.mjs';
import {esc} from './icons.mjs';
import {renderNetwork} from './network-ui.mjs';
import {renderPackets} from './packet-ui.mjs';
import {renderIP} from './ip-ui.mjs';
import {renderTheory,renderPrediction,renderQuiz,renderReflection,experimentFooter,hypothesisText} from './learning-ui.mjs';
let storage;try{storage=window.localStorage}catch{storage=null}
const loaded=loadProgress(storage);let progress=loaded.data;const contexts=new Map(),$=id=>document.getElementById(id);
function persist(){const ok=saveProgress(storage,progress);$('storage-notice').textContent=ok?'':'Naršyklė neleidžia išsaugoti pažangos. Šis bandymas veikia atverto puslapio atmintyje.';renderNavigation()}
function currentMission(){return MISSIONS.find(m=>m.id===progress.current)||MISSIONS[0]}
function context(){const mission=currentMission();let record=progress.records[mission.id];if(!record||!Array.isArray(record.network?.devices)||!Array.isArray(record.network?.links)||!Array.isArray(record.observations)){record=newRecord(initialNetwork(mission.id));progress.records[mission.id]=record}
 if(!contexts.has(mission.id))contexts.set(mission.id,{});const ctx=contexts.get(mission.id);Object.assign(ctx,{mission,record,persist,go:stage=>{ctx.stop?.();record.stage=stage;persist();renderStage();$('stage-content').scrollIntoView({block:'start'})},goal:()=>evaluateGoal(mission,record.network,record.observations),changed:()=>{persist();updateGoal()},experiment:observation=>{recordExperiment(record,observation);persist();updateGoal();refreshExperimentNotes()}});return ctx;
}
function renderNavigation(){
 let done=0;const active=currentMission().lab;
 const opened=new Set([...document.querySelectorAll('[data-lab][open]')].map(n=>n.dataset.lab));opened.add(active);
 $('lab-navigation').innerHTML=LABS.map(l=>{const activities=MISSIONS.filter(m=>m.lab===l.id);return `<details class="lab-group" data-lab="${l.id}" ${opened.has(l.id)?'open':''}><summary class="lab-title"><span>${l.number}</span>${l.title}</summary>${activities.map(m=>{const r=progress.records[m.id],completed=r?.score?.percent===100&&r?.observations?.length>0&&evaluateGoal(m,r.network,r.observations).passed;if(completed)done++;return `<button data-mission="${m.id}" ${progress.current===m.id?'aria-current="page"':''}><span class="mission-status">${completed?'✓':'·'}</span>${esc(m.title)}<small>${m.level+1}</small></button>`}).join('')}</details>`}).join('');
 $('overall-progress').textContent=done+' / '+MISSIONS.length+' veiklų su pasiektu praktikos tikslu ir 100 % savikontrole';
 document.querySelectorAll('[data-mission]').forEach(b=>b.onclick=()=>{context().stop?.();progress.current=b.dataset.mission;history.replaceState(null,'','#'+progress.current);persist();render();$('activity').scrollIntoView({block:'start'})});
}
function render(){const ctx=context(),{mission:m}=ctx;$('activity-header').innerHTML=`<div class="activity-kicker"><span>${LABS.find(l=>l.id===m.lab).title}</span><span class="pill">${LEVELS[m.level]}</span></div><h1>${esc(m.title)}</h1><p class="problem">${esc(m.problem)}</p>`;renderNavigation();renderStage()}
function renderStage(){const ctx=context(),{record:r}=ctx;r.stage=Math.max(0,Math.min(4,r.stage||0));$('stage-navigation').innerHTML=STAGES.map((name,i)=>`<button data-stage="${i}" ${i===r.stage?'aria-current="step"':''}><span>0${i+1}</span>${name}</button>`).join('');document.querySelectorAll('[data-stage]').forEach(b=>b.onclick=()=>ctx.go(Number(b.dataset.stage)));const el=$('stage-content');if(r.stage===0)renderTheory(el,ctx);if(r.stage===1)renderPrediction(el,ctx);if(r.stage===2)renderExperiment(el,ctx);if(r.stage===3)renderQuiz(el,ctx);if(r.stage===4)renderReflection(el,ctx);$('stage-footer').innerHTML=`<span>${r.stage+1} iš 5 · gali grįžti neprarasdamas darbo</span><div>${r.stage?'<button class="quiet" id="previous-stage">← Ankstesnis etapas</button>':''}${r.stage<4?`<button class="button" id="next-stage">${STAGES[r.stage+1]} →</button>`:''}</div>`;if($('previous-stage'))$('previous-stage').onclick=()=>ctx.go(r.stage-1);if($('next-stage'))$('next-stage').onclick=()=>ctx.go(r.stage+1)}
function renderExperiment(el,ctx){
 el.innerHTML=`<div class="experiment-top"><div><span class="eyebrow">03 / TYRINĖK</span><p>${esc(ctx.mission.goal)}</p><label class="check"><input type="checkbox" id="free-mode" ${ctx.record.freeMode?'checked':''}>Laisvas tyrinėjimas · mano pasirinkti bandymai</label></div><button class="quiet" id="reset-experiment">Pradėti eksperimentą iš naujo</button></div><div id="goal-status" class="goal-status"></div><div id="simulation"></div><div id="experiment-notes">${experimentFooter(ctx)}</div>`;
 ({builder:renderNetwork,packets:renderPackets,ip:renderIP}[ctx.mission.lab])($('simulation'),ctx);updateGoal();bindNotes();
 $('free-mode').onchange=()=>{ctx.record.freeMode=$('free-mode').checked;persist();updateGoal()};
 $('reset-experiment').onclick=()=>{ctx.stop?.();Object.assign(ctx.record,{network:initialNetwork(ctx.mission.id),observations:[],lastResult:null,packetRun:null,packetConfig:null,ipChecks:{},conclusion:''});ctx.ui={};persist();renderExperiment(el,ctx)};
}
function updateGoal(){if(!$('goal-status'))return;const ctx=context(),g=ctx.goal();$('goal-status').innerHTML=ctx.record.freeMode?'<span>Laisvas režimas: keisk sąlygas ir registruok savo bandymus. Grįžus į užduoties režimą tikslas bus vertinamas pagal tikrą būseną.</span>':g.checks.map(c=>`<span class="${c.passed?'good':''}">${c.passed?'✓':'○'} ${esc(c.label)}</span>`).join('')}

function bindNotes(){const ctx=context();if($('conclusion'))$('conclusion').oninput=e=>{ctx.record.conclusion=e.target.value;persist()};if($('next-hint'))$('next-hint').onclick=()=>{ctx.record.hints=Math.min(3,ctx.record.hints+1);persist();refreshExperimentNotes()}}
function refreshExperimentNotes(){if($('experiment-notes')){$('experiment-notes').innerHTML=experimentFooter(context());bindNotes()}}
$('clear-progress').onclick=()=>{$('clear-confirm').innerHTML='<p>Bus išvalyti tik šių tyrinėjimo laboratorijų vietiniai bandymai.</p><button class="quiet" id="confirm-clear">Taip, išvalyti</button>';$('confirm-clear').onclick=()=>{context().stop?.();clearProgress(storage);progress={version:1,current:'lan-print',records:{}};contexts.clear();$('clear-confirm').innerHTML='';render()}};
const legacyDestination=legacyTheoryDestination(location.href);
if(legacyDestination){location.replace(legacyDestination)}else{
 if(location.hash){const wanted=location.hash.slice(1);if(MISSIONS.some(m=>m.id===wanted))progress.current=wanted}
 render();if(!loaded.persistent)$('storage-notice').textContent='Ankstesnės pažangos nepavyko perskaityti. Gali pradėti naują bandymą.';
}
