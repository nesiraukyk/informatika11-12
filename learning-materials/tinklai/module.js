(function(){
 'use strict';
 const Core=window.NGGNetworkCore,content=window.NGG_NETWORK_CONTENT,specs=window.NGG_NETWORK_ACTIVITIES;
 const $=id=>document.getElementById(id);
 const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const rich=v=>esc(v).replace(/`([^`]+)`/g,'<code>$1</code>');
 const options=(list,empty='Pasirinkite')=>`<option value="">${esc(empty)}</option>`+list.map(v=>`<option value="${esc(v)}">${esc(v)}</option>`).join('');
 const taskId=id=>'praktika-'+id.replace('.','-');
 function fields(spec){
  if(spec.kind==='sequence')return spec.steps.map((_,i)=>`<label>${i+1} žingsnis<select data-sequence="${i}"><option value="">Pasirinkite</option>${spec.steps.map(s=>`<option value="${s[0]}">${esc(s)}</option>`).join('')}</select></label>`).join('');
  return (spec.fields||[]).map((f,i)=>f.type==='multi'?`<fieldset><legend>${esc(f.label)}</legend>${f.options.map(v=>`<label class="check-label"><input type="checkbox" data-field="${i}" value="${esc(v)}"><span>${esc(v)}</span></label>`).join('')}</fieldset>`:`<label>${esc(f.label)}${f.type==='select'?`<select data-field="${i}">${options(f.options)}</select>`:`<input type="text" data-field="${i}" autocomplete="off" spellcheck="false" maxlength="200" placeholder="Įrašykite atsakymą">`}</label>`).join('');
 }
 function practice(){
  $('practice-nav').innerHTML=content.lessons.map(l=>`<a href="#praktika-${l.number}-1">${l.number} pamoka</a>`).join('');
  $('practice-list').innerHTML=content.lessons.map(l=>`<section class="practice-group"><h3>${l.number} pamoka · ${esc(l.title)}</h3>${content.activities.filter(a=>a.lesson===l.number).map(task=>{
   const spec=specs[task.id];
   return `<details class="task" id="${taskId(task.id)}"><summary>${task.id} · ${esc(task.title)} <span>3 tšk. · mokymuisi</span></summary><div class="task-body"><p class="task-prompt">${rich(task.prompt)}</p>${spec.lab?`<a href="#lab-${spec.lab}" class="button secondary">Atidaryti laboratoriją ${spec.lab.toUpperCase()} ↗</a>`:''}${spec.kind==='mail'?'<div class="mail-path">Siuntėjo programa → Siuntėjo serveris → Gavėjo serveris ↔ Gavėjo programa</div>':''}<div class="task-fields">${fields(spec)}</div>${spec.kind==='lan'?'<div class="diagram-scroll" role="region" tabindex="0" aria-label="Jūsų mokyklos LAN schema"><div class="lan-drawing"></div></div>':''}${spec.explain?`<label>${esc(spec.explain)}<textarea class="task-explanation" rows="3" maxlength="6000" placeholder="Jūsų paaiškinimas…"></textarea></label>`:''}<div class="action-row"><button type="button" class="button check-task" data-task="${task.id}">Pasitikrinti</button><a href="#pamoka-${task.lesson}" class="text-button">Pakartoti teoriją</a></div><div class="task-feedback" role="status"></div></div></details>`;
  }).join('')}</section>`).join('');
  document.querySelectorAll('.check-task').forEach(button=>button.onclick=()=>{
   const task=button.closest('.task'),spec=specs[button.dataset.task],feedback=task.querySelector('.task-feedback');
   const answers=(spec.fields||[]).map((f,i)=>f.type==='multi'?[...task.querySelectorAll(`[data-field="${i}"]:checked`)].map(el=>el.value):task.querySelector(`[data-field="${i}"]`).value);
   const seq=[...task.querySelectorAll('[data-sequence]')].map(el=>el.value);
   const written=task.querySelector('textarea')?.value.trim();
   if(!answers.some(v=>Array.isArray(v)?v.length:v)&&!seq.some(Boolean)&&!written){feedback.innerHTML='<p class="feedback error">Pirmiausia pateikite bent dalį savo atsakymo.</p>';return}
   const checked=Core.practiceCheck(spec,answers),sequence=spec.kind==='sequence'?Core.sequenceScore(seq):null;
   feedback.innerHTML=`${checked.length?`<ul class="auto-results">${checked.map(r=>`<li class="${r.ok?'correct':'incorrect'}">${r.ok?'✓':'↺'} ${esc(r.label)} · ${r.ok?'teisingai':`pasitikrinkite: ${esc(r.expected)}`}</li>`).join('')}</ul><p class="muted">Teisingų automatiškai tikrinamų pasirinkimų: ${checked.filter(r=>r.ok).length}/${checked.length}. Tai nėra visos užduoties taškai.</p>`:''}${sequence!==null?`<p class="feedback ${sequence===2?'':'error'}">Už veiksmų seką: <b>${sequence}/2</b>. ${sequence===2?'Teisingai.':sequence===1?'Sukeisti du gretimi žingsniai.':'Palyginkite žingsnių tvarką su kriterijais.'}</p>`:''}<div class="criteria"><h4>Palyginkite savo darbą su kriterijais</h4><ul>${spec.criteria.map(c=>`<li>${rich(c)}</li>`).join('')}</ul><p>Atviri paaiškinimai automatiškai nevertinami. ${spec.kind==='sequence'?'Už teisingą abiejų protokolų paaiškinimą galima dar 1 tšk.':'Kiekvienas iš trijų kriterijų vertas iki 1 mokomojo taško.'} Tai savikontrolė, ne pažymys.</p></div>`;
  });
  document.querySelectorAll('.task').forEach(task=>task.addEventListener('input',()=>{task.querySelector('.task-feedback').innerHTML='';if(task.querySelector('.lan-drawing'))drawLan(task)}));
  drawLan($(taskId('1.3')));
 }
 function drawLan(task){
  const items=['PC 1','PC 2','PC 3','PC 4','Spausdintuvas'];
  const border=task.querySelector('[data-field="5"]').value==='Taip';
  task.querySelector('.lan-drawing').innerHTML=`<svg class="lan-mini" viewBox="0 0 600 220" role="img" aria-label="Keturių kompiuterių ir spausdintuvo schema. Jungtys rodomos pagal jūsų pasirinkimus.">${border?'<rect class="boundary" x="5" y="5" width="590" height="210" rx="12"/><text x="35" y="28">LAN</text>':''}<rect x="235" y="35" width="130" height="38" rx="6"/><text x="300" y="59">Komutatorius</text>${items.map((name,i)=>{const x=60+i*120,connected=task.querySelector(`[data-field="${i}"]`).value==='Komutatorius';return `${connected?`<line x1="300" y1="73" x2="${x}" y2="150"/>`:''}<rect x="${x-52}" y="150" width="104" height="40" rx="5"/><text x="${x}" y="175">${name}</text>`}).join('')}</svg>`;
 }
 let edges=[],ispOn=true;
 const names=new Map(Core.nodes.map(n=>[n.id,n.label]));
 const points={isp:[380,42],ont:[380,112],wan:[380,184],lan:[380,252],switch:[220,340],ap:[610,340],pc1:[85,450],pc2:[250,450],printer:[415,450],phone:[610,450]};
 function drawNetwork(){
  $('network-diagram').innerHTML=`<svg class="network-svg" viewBox="0 0 760 500" role="img" aria-labelledby="network-title"><title id="network-title">Vaizdinė jūsų tinklo schema. Visos jungtys prieinamos ir žemiau esančiame sąraše.</title><rect class="wan-zone" x="250" y="1" width="260" height="219" rx="12"/><text class="area-label" x="380" y="14">TIEKĖJO PUSĖ</text><rect class="lan-zone" x="8" y="225" width="744" height="267" rx="12"/><text class="area-label" x="55" y="246">LAN</text><line class="router-internal" x1="380" y1="184" x2="380" y2="252"/>${edges.map(e=>{const a=points[e.a],b=points[e.b];return `<line class="${Core.edgeValid(e)?e.type==='wifi'?'wifi':'wire':'invalid'} ${!ispOn&&[e.a,e.b].includes('isp')?'disconnected':''}" x1="${a[0]}" y1="${a[1]}" x2="${b[0]}" y2="${b[1]}"/>`}).join('')}${Core.nodes.map(n=>{const [x,y]=points[n.id];return `<g><rect class="node" x="${x-78}" y="${y-22}" width="156" height="44" rx="8"/><text x="${x}" y="${y+5}">${esc(n.label)}</text></g>`}).join('')}</svg>`;
  $('edge-list').innerHTML=edges.length?edges.map((e,i)=>`<div class="edge-row"><span>${esc(names.get(e.a))} ↔ ${esc(names.get(e.b))} · ${e.type==='wifi'?'Wi-Fi':'laidinis'}</span><button type="button" data-remove-edge="${i}" aria-label="Pašalinti jungtį ${esc(names.get(e.a))} ir ${esc(names.get(e.b))}">Šalinti</button></div>`).join(''):'<p class="muted">Jungčių dar nėra. Pasirinkite abu galus ir ryšio tipą.</p>';
  document.querySelectorAll('[data-remove-edge]').forEach(button=>button.onclick=()=>{edges.splice(Number(button.dataset.removeEdge),1);$('network-feedback').innerHTML='';drawNetwork()});
  $('isp-toggle').textContent=ispOn?'Atjungti tiekėją':'Prijungti tiekėją';$('isp-toggle').setAttribute('aria-pressed',String(!ispOn));
 }
 function networkFeedback(){
  const r=Core.checkNetwork(edges,ispOn);
  $('network-feedback').innerHTML=`<b>${r.complete?'Visos šios užduoties jungtys tinkamos.':`Tinkamų reikiamų jungčių: ${Core.required.length-r.missing.length}/${Core.required.length}.`}</b>${r.invalid.length?`<p class="incorrect">Netinkamos jungtys šiai užduočiai:</p><ul>${r.invalid.map(e=>`<li>${esc(names.get(e.a))} ↔ ${esc(names.get(e.b))}: ${[e.a,e.b].includes('phone')?'telefoną junkite Wi-Fi prie prieigos taško.':'patikrinkite priskirtus WAN / LAN galus ir rinkitės laidinį ryšį.'}</li>`).join('')}</ul>`:''}${r.missing.length?`<details><summary>Kurių jungčių dar trūksta?</summary><ul>${r.missing.map(e=>`<li>${esc(names.get(e.a))} ↔ ${esc(names.get(e.b))} · ${e.type==='wifi'?'Wi-Fi':'laidinis'}</li>`).join('')}</ul></details>`:''}<div class="network-status"><p>A → spausdintuvas: <b>${r.printer?'veikia':'neveikia'}</b></p><p>A → internetas: <b>${r.internet?'veikia':'neveikia'}</b></p><p>Telefonas → spausdintuvas: <b>${r.phone?'veikia':'neveikia'}</b></p></div><p>${!ispOn?'Tiekėjo jungtis atjungta. ':'Tiekėjo jungtis įjungta. '}Vietinio spausdinimo kelias nepriklauso nuo tiekėjo; jis veikia, kai sujungtas LAN ir tinkamai sukonfigūruoti įrenginiai.</p>`;
 }
 function network(){
  const opts=Core.nodes.map(n=>`<option value="${n.id}">${esc(n.label)}</option>`).join('');$('edge-from').innerHTML=opts;$('edge-to').innerHTML=opts;$('edge-to').value='ont';
  $('edge-add').onclick=()=>{
   const e={a:$('edge-from').value,b:$('edge-to').value,type:$('edge-type').value};
   if(e.a===e.b){$('edge-message').textContent='Pasirinkite du skirtingus įrenginius / prievadus.';return}
   if(edges.some(x=>Core.pair(x.a,x.b)===Core.pair(e.a,e.b))){$('edge-message').textContent='Ši jungtis jau yra. Norėdami pakeisti tipą, pirmiausia ją pašalinkite.';return}
   edges.push(e);$('edge-message').textContent=Core.edgeValid(e)?'Jungtis pridėta.':'Jungtis pridėta ir pažymėta punktyru: ji neatitinka šios užduoties. Spauskite „Patikrinti tinklą“.';$('network-feedback').innerHTML='';drawNetwork();
  };
  $('network-check').onclick=networkFeedback;
  $('isp-toggle').onclick=()=>{ispOn=!ispOn;drawNetwork();networkFeedback()};
  $('network-reset').onclick=()=>{edges=[];ispOn=true;$('edge-message').textContent='Atkurta tuščia mokomoji schema.';$('network-feedback').innerHTML='';drawNetwork()};drawNetwork();
 }
 let packetResent=false;
 function resetPackets(){packetResent=false;$('packet-missing').value='';$('packet-resend').disabled=true;$('packet-order').hidden=true;$('packet-feedback').textContent='';$('packet-story').textContent='Atvyko 3 ir 1 dalys. Duomenų srautas dar nebaigtas.';[1,2,3].forEach(i=>$('packet-pos-'+i).value='');drawPackets([3,1])}
 function drawPackets(ids){$('packet-tray').innerHTML=ids.map(id=>`<div class="packet">Duomenų dalis<b>${id}</b></div>`).join('')}
 function ipPackets(){
  const check=()=>{const result=Core.validateC($('ip-c').value);$('ip-feedback').textContent=result.message;$('ip-feedback').classList.toggle('error',!result.ok)};
  $('ip-check').onclick=check;$('ip-c').oninput=()=>$('ip-feedback').textContent='';
  $('ip-dhcp').onclick=()=>{$('ip-c').value=Core.dhcpAddress();check();$('ip-feedback').textContent+=' DHCP simuliacija parinko laisvą adresą. Tikro įrenginio nustatymai nepakeisti.'};
  $('ip-reset').onclick=()=>{$('ip-c').value='192.168.10.12';$('ip-feedback').textContent='Atkurta pradinė situacija. Patikrinkite B ir C adresus.'};
  $('packet-check').onclick=()=>{if(packetResent){$('packet-feedback').textContent='Visos dalys jau gautos. Atkurkite seką arba pradėkite iš naujo.';return}const ok=$('packet-missing').value==='2';$('packet-resend').disabled=!ok;$('packet-feedback').textContent=ok?'Teisingai, trūksta 2 dalies. Dabar inicijuokite pakartotinį siuntimą.':'Palyginkite gautas dalis 3 ir 1 su reikalingomis 1, 2, 3.'};
  $('packet-missing').onchange=()=>{if(!packetResent)$('packet-resend').disabled=true};
  $('packet-resend').onclick=()=>{packetResent=true;drawPackets([3,1,2]);$('packet-order').hidden=false;$('packet-resend').disabled=true;$('packet-story').textContent='Pakartotinai atvyko 2 dalis. Atvykimo tvarka – 3, 1, 2; atkurkite pradinę duomenų tvarką.';$('packet-feedback').textContent=''};
  $('packet-order-check').onclick=()=>{const ok=[1,2,3].every(i=>$('packet-pos-'+i).value===String(i));$('packet-feedback').textContent=ok?'Teisingai: 1–2–3. TCP atkuria patikimą, eilės tvarką išlaikantį srautą. IP rūpinasi adresavimu ir paketų nukreipimu.':'Kiekvieną dalį naudokite vieną kartą. Pradinė seka prasideda 1, tada 2 ir 3.';if(ok)drawPackets([1,2,3])};
  $('packet-reset').onclick=resetPackets;resetPackets();
 }
 let investigated=new Set();
 function resetDiagnostic(){investigated=new Set();$('diagnostic-clue').textContent=Core.scenarios[$('diagnostic-scenario').value].clue;$('terminal').textContent='Pasirinkite komandą. Tai nėra tikra Windows komandų eilutė.';$('diagnostic-history').textContent='Atlikite bent dvi skirtingas patikras.';$('diagnostic-answer').value='';$('diagnostic-reason').value='';$('diagnostic-feedback').textContent=''}
 function diagnostics(){
  $('diagnostic-scenario').innerHTML=Object.entries(Core.scenarios).map(([id,s])=>`<option value="${id}">${esc(s.title)}</option>`).join('');
  $('diagnostic-command').innerHTML=Core.commands.map(([id,label])=>`<option value="${id}">${esc(label)}</option>`).join('');
  $('diagnostic-scenario').onchange=resetDiagnostic;$('diagnostic-reset').onclick=resetDiagnostic;
  $('diagnostic-answer').onchange=()=>$('diagnostic-feedback').textContent='';
  $('diagnostic-reason').oninput=()=>$('diagnostic-feedback').textContent='';
  $('diagnostic-run').onclick=()=>{const cmd=$('diagnostic-command').value;investigated.add(cmd);$('terminal').textContent=Core.diagnostic($('diagnostic-scenario').value,cmd);$('diagnostic-history').textContent='Atliktos patikros: '+[...investigated].map(id=>Core.commands.find(c=>c[0]===id)[1]).join(' · ')};
  $('diagnostic-check').onclick=()=>{
   const target=$('diagnostic-feedback'),scenario=Core.scenarios[$('diagnostic-scenario').value];
   if(investigated.size<2||!$('diagnostic-answer').value||!$('diagnostic-reason').value.trim()){target.textContent='Atlikite bent dvi skirtingas patikras, pasirinkite priežastį ir užrašykite savo pagrindimą.';return}
   const ok=$('diagnostic-answer').value===scenario.answer;
   target.innerHTML=`<b>${ok?'Tikėtiną priežastį parinkote teisingai.':'Palyginkite išvadą su scenarijaus požymiais.'}</b><p>${esc(scenario.why)}</p><p>Pagrindimą įsivertinkite: ar palyginote bent dvi patikras, atskyrėte vietinį ryšį, IP pasiekiamumą ir DNS / paslaugą? Vien ping nesėkmės ar tracert žvaigždutės diagnozei nepakanka. Atviro paaiškinimo programa automatiškai nevertina.</p>`;
  };resetDiagnostic();
 }
 let quiz=null;
 function focusQuiz(){const h=$('quiz-player').querySelector('h3');h.tabIndex=-1;h.focus()}
 function quizSetup(){
  $('quiz-player').innerHTML='<div class="quiz-start"><div><h3>10 klausimų. Naujas bandymas.</h3><p>Atsitiktinė atranka iš 24 uždarų klausimų. Kiekvienas vertas vieno taško. Galite grįžti prie ankstesnio klausimo; paaiškinimai pateikiami baigus.</p></div><div class="action-row"><button class="button" id="quiz-start">Pradėti 10 klausimų</button><button class="button secondary" id="quiz-all">Atlikti visus 24</button></div></div>';
  function start(count){quiz={questions:Core.pick(content.questions,count),answers:{},index:0};renderQuiz();focusQuiz()}
  $('quiz-start').onclick=()=>start(10);$('quiz-all').onclick=()=>start(24);
 }
 function renderQuiz(){
  const q=quiz.questions[quiz.index];
  $('quiz-player').innerHTML=`<div class="quiz-card"><div class="quiz-top"><span>Klausimas ${quiz.index+1} iš ${quiz.questions.length} · banko Nr. ${q.id}</span><span>1 taškas</span></div><h3>${rich(q.prompt)}</h3><fieldset class="quiz-options"><legend>Pasirinkite vieną atsakymą</legend>${q.options.map((option,i)=>`<label class="choice"><input type="radio" name="quiz-answer" value="${i}" ${quiz.answers[q.id]===i?'checked':''}><span class="choice-letter">${String.fromCharCode(65+i)}</span><span>${rich(option)}</span></label>`).join('')}</fieldset><div class="action-row"><button class="button secondary" id="quiz-prev" ${quiz.index===0?'disabled':''}>← Ankstesnis</button><button class="button secondary" id="quiz-next" ${quiz.index===quiz.questions.length-1?'disabled':''}>Kitas →</button></div><nav class="quiz-nav" aria-label="Savikontrolės klausimai">${quiz.questions.map((item,i)=>`<button data-quiz-index="${i}" ${i===quiz.index?'aria-current="step"':''} class="${Number.isInteger(quiz.answers[item.id])?'answered':''}" aria-label="Klausimas ${i+1}${Number.isInteger(quiz.answers[item.id])?', atsakytas':''}">${i+1}</button>`).join('')}</nav><p id="quiz-progress" class="muted" aria-live="polite"></p><button id="quiz-finish" class="button">Baigti ir peržiūrėti rezultatą</button><div id="quiz-confirm" role="status"></div></div>`;
  const progress=()=>$('quiz-progress').textContent=`Atsakyta ${Object.keys(quiz.answers).length}/${quiz.questions.length}. Žalsvai pažymėti atsakyti klausimai.`;
  document.querySelectorAll('[name="quiz-answer"]').forEach(input=>input.onchange=()=>{quiz.answers[q.id]=Number(input.value);const button=document.querySelector(`[data-quiz-index="${quiz.index}"]`);button.classList.add('answered');button.setAttribute('aria-label',`Klausimas ${quiz.index+1}, atsakytas`);$('quiz-confirm').innerHTML='';progress()});
  const jump=i=>{quiz.index=i;renderQuiz();focusQuiz()};$('quiz-prev').onclick=()=>jump(quiz.index-1);$('quiz-next').onclick=()=>jump(quiz.index+1);
  document.querySelectorAll('[data-quiz-index]').forEach(button=>button.onclick=()=>jump(Number(button.dataset.quizIndex)));
  $('quiz-finish').onclick=()=>{
   const missing=quiz.questions.filter(item=>!Number.isInteger(quiz.answers[item.id])).length;
   if(!missing){quizResults();return}
   $('quiz-confirm').innerHTML=`<p class="feedback">Liko neatsakyta: ${missing}. Neatsakyti klausimai gaus 0 taškų.</p><button class="button secondary" id="quiz-confirm-finish">Baigti su neatsakytais klausimais</button>`;$('quiz-confirm-finish').onclick=quizResults;
  };progress();
 }
 function quizResults(){
  const result=Core.score(quiz.questions,quiz.answers);
  $('quiz-player').innerHTML=`<div class="quiz-results"><div class="eyebrow">JŪSŲ MOKOMASIS REZULTATAS</div><h3 class="quiz-score">${result.correct} / ${result.total} <small>· ${result.percent} %</small></h3><p>Teisingų atsakymų: ${result.correct}. Klaidingų arba neatsakytų: ${result.wrong.length}. Tai savikontrolė, ne pažymys.</p>${result.lessons.length?`<p>Verta pakartoti:</p><nav class="chip-nav" aria-label="Rekomenduojamos pamokos">${result.lessons.map(n=>`<a href="#pamoka-${n}">${n} pamoka · ${esc(content.lessons[n-1].title)}</a>`).join('')}</nav>`:'<p class="correct">Visi šio bandymo atsakymai teisingi. Toliau išbandykite atviruosius klausimus.</p>'}${quiz.questions.map((q,i)=>{const ok=quiz.answers[q.id]===q.correct;return `<details class="quiz-result" ${ok?'':'open'}><summary><span class="${ok?'correct':'incorrect'}">${ok?'✓':'↺'} ${i+1}.</span> ${rich(q.prompt)}</summary><p>Jūsų atsakymas: ${rich(q.options[quiz.answers[q.id]]??'Neatsakyta')}</p><p><b>Teisingas:</b> ${rich(q.options[q.correct])}</p><p>${esc(q.explanation)}</p><a href="#pamoka-${q.lesson}">Pakartoti ${q.lesson} pamoką →</a></details>`}).join('')}<div class="action-row"><button id="quiz-again" class="button">Kartoti savikontrolę</button></div></div>`;
  $('quiz-again').onclick=()=>{quizSetup();focusQuiz()};focusQuiz();
 }
 function openQuestions(){
  $('open-questions').innerHTML=content.questions.filter(q=>!q.options).map(q=>`<details class="open-question" id="klausimas-${q.id}"><summary>${q.id}. ${rich(q.prompt)} <span>2 tšk.</span></summary><div class="task-body"><label>Jūsų atsakymas<textarea rows="4" maxlength="6000" placeholder="Paaiškinkite savais žodžiais…"></textarea></label><div class="action-row"><button data-open-check="${q.id}" class="button secondary">Palyginti su kriterijais</button><a href="#pamoka-${q.lesson}" class="text-button">Pakartoti teoriją</a></div><div class="open-feedback" role="status"></div></div></details>`).join('');
  document.querySelectorAll('[data-open-check]').forEach(button=>button.onclick=()=>{
   const card=button.closest('.open-question'),output=card.querySelector('.open-feedback');
   if(!card.querySelector('textarea').value.trim()){output.innerHTML='<p class="feedback error">Pirmiausia įrašykite savo bandymą.</p>';return}
   output.innerHTML=`<div class="criteria"><h4>Du kriterijai · po 1 mokomąjį tašką</h4><ul>${window.NGG_NETWORK_OPEN_CRITERIA[button.dataset.openCheck].map(c=>`<li>${rich(c)}</li>`).join('')}</ul><p>Priimami lygiaverčiai teisingi paaiškinimai. Savo atsakymą įsivertinkite arba aptarkite su mokytoju; automatinio įvertinimo nėra.</p></div>`;
  });
 }
 const aliases={'tinklo-esme':'pamoka-1','iranga':'pamoka-2','paketai':'pamoka-3','ip':'pamoka-3','dns':'pamoka-4','protokolai':'pamoka-5','sauga':'pamoka-5','diagnostika':'pamoka-6','veiklos':'praktika','savikontrole':'pasitikrink','atmintine':'saltiniai'};
 function route(scroll=true){
  let hash;try{hash=decodeURIComponent(location.hash.slice(1))}catch{hash='ivadas'}
  const id=aliases[hash]||hash||'ivadas';let target=$(id);
  const current=document.querySelector('[data-section][aria-current="page"]')?.dataset.section;
  const section=id==='turinys'?$(current||'teorija'):target?.closest('.module-section')||$('teorija');
  document.querySelectorAll('.module-section').forEach(el=>el.hidden=el!==section);
  $('ivadas').hidden=id!=='ivadas';$('course-facts').hidden=id!=='ivadas';
  document.querySelectorAll('[data-section]').forEach(link=>{const current=link.dataset.section===section.id;link.classList.toggle('active',current);if(current)link.setAttribute('aria-current','page');else link.removeAttribute('aria-current')});
  if(target?.tagName==='DETAILS')target.open=true;
  if(id==='turinys')target=section;
  if(!target)target=section;
  if(scroll){target.scrollIntoView({block:'start'});const focus=target.matches('details')?target.querySelector('summary'):target.querySelector('h2,h3,h1')||target;focus.tabIndex=-1;focus.focus({preventScroll:true})}
 }
 practice();network();ipPackets();diagnostics();quizSetup();openQuestions();route(!!location.hash);
 window.addEventListener('hashchange',()=>route());
 document.addEventListener('click',event=>{const link=event.target.closest('a[href^="#"]');if(link&&link.hash===location.hash){event.preventDefault();route()}});
 let printState=[];
 window.addEventListener('beforeprint',()=>{printState=[...document.querySelectorAll('.lesson')].map(el=>[el,el.open]);printState.forEach(([el])=>el.open=true)});
 window.addEventListener('afterprint',()=>{printState.forEach(([el,open])=>el.open=open);printState=[]});
 $('print-module').onclick=()=>window.print();
})();
