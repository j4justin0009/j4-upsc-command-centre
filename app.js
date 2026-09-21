const SUBJECTS = [
  {id:'polity',name:'Indian Polity',stage:'prelims',topics:['Constitutional framework','Fundamental Rights','DPSP & Fundamental Duties','Union Executive','Parliament','Judiciary','Federalism & Centre–State relations','Local government','Constitutional & statutory bodies','Emergency & amendments']},
  {id:'history',name:'History',stage:'prelims',topics:['Ancient India','Medieval India','Modern India: 1757–1857','National movement','Post-independence consolidation','Art & culture']},
  {id:'geography',name:'Geography',stage:'prelims',topics:['Geomorphology','Climatology','Oceanography','Indian physiography','Resources & agriculture','Human geography','Maps and locations']},
  {id:'economy',name:'Indian Economy',stage:'prelims',topics:['National income','Inflation & unemployment','Money and banking','Fiscal policy & taxation','External sector','Agriculture','Infrastructure','Inclusive growth']},
  {id:'environment',name:'Environment',stage:'prelims',topics:['Ecology & ecosystems','Biodiversity','Protected areas','Pollution','Climate change','Conventions & institutions','Environmental laws']},
  {id:'science',name:'Science & Technology',stage:'prelims',topics:['Space technology','Biotechnology','Health & diseases','IT, AI & computing','Defence technology','Energy & nuclear science']},
  {id:'current',name:'Current Affairs',stage:'prelims',topics:['National issues','International relations','Economy updates','Environment updates','Science updates','Reports & indices','Government schemes']},
  {id:'csat',name:'CSAT',stage:'csat',topics:['Reading comprehension','Basic numeracy','Percentages & ratios','Averages & mixtures','Time, work & distance','Data interpretation','Logical reasoning','Decision making']},
  {id:'gs1',name:'GS I',stage:'mains',topics:['Indian heritage & culture','Modern Indian history','Post-independence India','World history','Indian society','World physical geography','Indian geography']},
  {id:'gs2',name:'GS II',stage:'mains',topics:['Constitution','Governance','Social justice','Parliament & judiciary','Federalism','International relations']},
  {id:'gs3',name:'GS III',stage:'mains',topics:['Indian economy','Agriculture','Science & technology','Environment','Disaster management','Internal security']},
  {id:'gs4',name:'GS IV Ethics',stage:'mains',topics:['Ethics & human interface','Attitude','Aptitude & foundational values','Emotional intelligence','Public-service values','Probity in governance','Case studies']},
  {id:'essay',name:'Essay',stage:'mains',topics:['Philosophical themes','Society & culture','Polity & governance','Economy & development','Science & environment','Essay structure practice']},
  {id:'soc1',name:'Sociology Optional I',stage:'mains',topics:['Discipline of sociology','Sociology as science','Research methods','Thinkers','Stratification & mobility','Work & economic life','Politics & society','Religion & society','Kinship','Social change']},
  {id:'soc2',name:'Sociology Optional II',stage:'mains',topics:['Perspectives on Indian society','Colonial impact','Rural structure','Caste system','Tribal communities','Class structure','Kinship in India','Religion in India','Social movements','Population dynamics','Challenges of social transformation']}
];

const KEY = 'j4-upsc-command-centre-v1';
const isoDay = (date = new Date()) => date.toISOString().slice(0,10);
const initial = {topics:{},tasks:[],logs:[],revisions:[],mocks:[],answers:[],startedAt:isoDay()};
let state;
try { state = {...initial, ...JSON.parse(localStorage.getItem(KEY) || '{}')}; } catch { state = structuredClone(initial); }
const save = () => { localStorage.setItem(KEY, JSON.stringify(state)); renderAll(); };
const $ = (s, el=document) => el.querySelector(s);
const $$ = (s, el=document) => [...el.querySelectorAll(s)];
const esc = (s) => String(s).replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));
const fmtMinutes = (m) => m >= 60 ? `${Math.floor(m/60)}h ${m%60 ? m%60+'m' : ''}`.trim() : `${m}m`;
const formatDate = (d) => new Date(d+'T00:00:00').toLocaleDateString('en-IN',{day:'numeric',month:'short'});
const toast = (msg) => { const t=$('#toast'); t.textContent=msg;t.classList.add('show');clearTimeout(toast.id);toast.id=setTimeout(()=>t.classList.remove('show'),2200); };

function navigate(id){
  $$('.view').forEach(v=>v.classList.toggle('active',v.id===id));
  $$('[data-view]').forEach(b=>b.classList.toggle('active',b.dataset.view===id));
  const titles={overview:'Mission control',syllabus:'Syllabus tracker',today:"Today's plan",revision:'Revision system',tests:'Mock-test lab',mains:'Mains practice'};
  $('#pageTitle').textContent=titles[id];
  scrollTo({top:0,behavior:'smooth'});
}

function topicStats(subject){
  const done=subject.topics.filter((_,i)=>state.topics[`${subject.id}:${i}`]).length;
  return {done,total:subject.topics.length,pct:Math.round(done/subject.topics.length*100)};
}

function renderProgressCharts(overallPct){
  const overall=$('#overallDonut');
  overall.style.setProperty('--value',overallPct);
  overall.setAttribute('aria-label',`Overall syllabus progress: ${overallPct} percent`);
  $('#overallDonutPct').textContent=overallPct+'%';
  const colors={prelims:'#3767ff',mains:'#2ab889',csat:'#ff9344'};
  $('#subjectDonuts').innerHTML=SUBJECTS.map(subject=>{
    const x=topicStats(subject);
    return `<div class="subject-donut-item" title="${subject.name}: ${x.done} of ${x.total} topics completed"><div class="donut" role="img" aria-label="${subject.name}: ${x.pct} percent complete" style="--value:${x.pct};--ring-color:${colors[subject.stage]}"><span class="mini-donut-value">${x.pct}%</span></div><div class="subject-donut-copy"><strong>${subject.name}</strong><span>${x.done}/${x.total} topics</span></div></div>`;
  }).join('');
}

function renderOverview(){
  const total=SUBJECTS.reduce((n,s)=>n+s.topics.length,0);
  const done=Object.values(state.topics).filter(Boolean).length;
  const overallPct=Math.round(done/total*100);
  $('#overallPct').textContent=overallPct+'%';
  renderProgressCharts(overallPct);
  const todayLogs=state.logs.filter(l=>l.date===isoDay());
  const todayMins=todayLogs.reduce((n,l)=>n+l.minutes,0);
  $('#todayMinutes').textContent=fmtMinutes(todayMins);
  const scores=state.mocks.map(m=>m.accuracy);
  $('#mockAverage').textContent=scores.length?Math.round(scores.reduce((a,b)=>a+b,0)/scores.length)+'%':'—';
  const due=state.revisions.filter(r=>r.next<=isoDay()).length;
  $('#revisionCount').textContent=due;
  const tasks=state.tasks.filter(t=>t.date===isoDay());
  $('#overviewTasks').innerHTML=tasks.length?tasks.map(taskHTML).join(''):'<div class="empty">No priorities yet. Add up to three meaningful tasks.</div>';
  const started=Math.max(1,Math.floor((new Date()-new Date(state.startedAt+'T00:00:00'))/86400000)+1);
  $('#dayNumber').textContent=`Day ${started}`;
  $('#missionTitle').textContent=tasks.length ? (tasks.every(t=>t.done)?'Mission complete':'Finish what matters') : 'Build momentum';
  renderWeek(todayMins);
  if(due){ setNext(`${due} revision${due>1?'s':''} waiting`,'Active recall now prevents expensive relearning later.','revision'); }
  else if(!tasks.length){ setNext('Plan three realistic tasks','A clear daily target removes decision fatigue.','today'); }
  else if(!state.mocks.length){ setNext('Schedule a baseline mock','Your first score gives you a starting point, not a verdict.','tests'); }
  else if(!state.answers.length){ setNext('Write one 10-mark answer','Start answer writing early; quality grows through repetition.','mains'); }
  else { setNext('Complete today’s priorities','Consistency beats an occasional heroic study day.','today'); }
}

function setNext(title,reason,jump){ $('#nextAction').textContent=title;$('#nextActionReason').textContent=reason;$('#nextActionBtn').dataset.jump=jump; }
function taskHTML(t){return `<div class="task-row ${t.done?'done':''}"><input type="checkbox" data-task-toggle="${t.id}" ${t.done?'checked':''} aria-label="Mark task complete"><label>${esc(t.text)}</label><small>${fmtMinutes(t.duration)}</small><button class="icon-btn" data-task-delete="${t.id}" aria-label="Delete task">×</button></div>`;}
function renderWeek(){
  const days=[];for(let i=6;i>=0;i--){const d=new Date();d.setDate(d.getDate()-i);const key=isoDay(d);const mins=state.logs.filter(l=>l.date===key).reduce((n,l)=>n+l.minutes,0);days.push({key,mins,label:d.toLocaleDateString('en-IN',{weekday:'short'}).slice(0,1)});}
  const max=Math.max(120,...days.map(d=>d.mins));
  $('#weekChart').innerHTML=days.map(d=>`<div class="day-bar" title="${fmtMinutes(d.mins)}"><i class="${d.key===isoDay()?'active':''}" style="height:${Math.max(4,d.mins/max*100)}%"></i><small>${d.label}</small></div>`).join('');
  const sum=days.reduce((n,d)=>n+d.mins,0);$('#weekHours').textContent=fmtMinutes(sum);
  const active=days.filter(d=>d.mins>0).length;$('#consistencyMessage').textContent=active>=5?'Strong week—protect the streak.':active?`${active} active day${active>1?'s':''} this week. Aim for five.`:'Log your first study session today.';
}

let activeFilter='all';
function renderSyllabus(){
  const list=SUBJECTS.filter(s=>activeFilter==='all'||s.stage===activeFilter);
  $('#syllabusGrid').innerHTML=list.map(s=>{const x=topicStats(s);return `<article class="subject-card"><div class="subject-card-head"><h3>${s.name}</h3><span class="tag">${s.stage}</span></div><div class="topic-list">${s.topics.map((t,i)=>`<label class="topic-row"><input type="checkbox" data-topic="${s.id}:${i}" ${state.topics[`${s.id}:${i}`]?'checked':''}><span>${t}</span></label>`).join('')}</div><div class="card-progress"><div class="bar"><i style="width:${x.pct}%"></i></div><span>${x.done}/${x.total}</span></div></article>`}).join('');
}

function renderToday(){
  const tasks=state.tasks.filter(t=>t.date===isoDay());
  $('#taskList').innerHTML=tasks.length?tasks.map(taskHTML).join(''):'<div class="empty">Keep the list short. Three priorities are enough.</div>';
  $('#taskProgress').textContent=`${tasks.filter(t=>t.done).length}/${tasks.length}`;
  const logs=state.logs.filter(l=>l.date===isoDay());
  $('#logTotal').textContent=fmtMinutes(logs.reduce((n,l)=>n+l.minutes,0));
  $('#recentLogs').innerHTML=logs.length?logs.slice().reverse().map(l=>`<div class="compact-item"><strong>${esc(l.note)}</strong><span>${esc(l.subject)} · ${fmtMinutes(l.minutes)}</span></div>`).join(''):'<div class="empty">No study sessions logged today.</div>';
}

function renderRevision(){
  const due=state.revisions.filter(r=>r.next<=isoDay()).sort((a,b)=>a.next.localeCompare(b.next));
  const upcoming=state.revisions.filter(r=>r.next>isoDay()).sort((a,b)=>a.next.localeCompare(b.next)).slice(0,12);
  $('#dueBadge').textContent=due.length;$('#dueList').innerHTML=due.length?due.map(revisionHTML).join(''):'<div class="empty">Nothing due. Good time to learn something new.</div>';
  $('#upcomingList').innerHTML=upcoming.length?upcoming.map(revisionHTML).join(''):'<div class="empty">Upcoming reviews will appear here.</div>';
}
function revisionHTML(r){return `<article class="revision-item ${r.next<=isoDay()?'overdue':''}"><div class="revision-info"><strong>${esc(r.topic)}</strong><small>${esc(r.subject)} · Review ${r.level+1}/5 · ${formatDate(r.next)}</small></div>${r.next<=isoDay()?`<button class="revise-btn" data-revised="${r.id}">Revised</button>`:`<button class="icon-btn" data-revision-delete="${r.id}" aria-label="Delete revision">×</button>`}</article>`;}

function renderMocks(){
  $('#mockHistory').innerHTML=state.mocks.length?state.mocks.slice().reverse().map(m=>`<article class="mock-row"><strong>${esc(m.name)}</strong><span>${esc(m.paper)} · ${m.correct} correct · ${m.wrong} wrong · ${m.accuracy}% accuracy</span><div class="score-pill">${m.score}</div></article>`).join(''):'<div class="empty">Log your first mock to establish a baseline.</div>';
  $('#bestScore').textContent=state.mocks.length?`Best ${Math.max(...state.mocks.map(m=>Number(m.score)))}`:'—';
}

function renderAnswers(){
  $('#answerCount').textContent=`${state.answers.length} answer${state.answers.length===1?'':'s'}`;
  $('#answerHistory').innerHTML=state.answers.length?state.answers.slice().reverse().map(a=>`<article class="answer-row"><strong>${esc(a.topic)}</strong><span>${esc(a.paper)} · ${a.marks} marks · ${a.time}m · ${'★'.repeat(a.rating)}${'☆'.repeat(5-a.rating)}</span><button class="icon-btn" data-answer-delete="${a.id}" aria-label="Delete answer">×</button></article>`).join(''):'<div class="empty">Start with one timed 10-mark answer.</div>';
}

function renderAll(){renderOverview();renderSyllabus();renderToday();renderRevision();renderMocks();renderAnswers();}

document.addEventListener('click',e=>{
  const nav=e.target.closest('[data-view]');if(nav)navigate(nav.dataset.view);
  const jump=e.target.closest('[data-jump]');if(jump)navigate(jump.dataset.jump);
  const topic=e.target.closest('[data-topic]');if(topic){state.topics[topic.dataset.topic]=topic.checked;save();}
  const toggle=e.target.closest('[data-task-toggle]');if(toggle){const t=state.tasks.find(x=>x.id===toggle.dataset.taskToggle);if(t)t.done=toggle.checked;save();}
  const del=e.target.closest('[data-task-delete]');if(del){state.tasks=state.tasks.filter(t=>t.id!==del.dataset.taskDelete);save();}
  const revised=e.target.closest('[data-revised]');if(revised){const r=state.revisions.find(x=>x.id===revised.dataset.revised);if(r){const intervals=[1,3,7,14,30];r.level=Math.min(r.level+1,4);const next=new Date();next.setDate(next.getDate()+intervals[r.level]);r.next=isoDay(next);save();toast('Revision recorded. Next review scheduled.');}}
  const rdel=e.target.closest('[data-revision-delete]');if(rdel){state.revisions=state.revisions.filter(r=>r.id!==rdel.dataset.revisionDelete);save();}
  const adel=e.target.closest('[data-answer-delete]');if(adel){state.answers=state.answers.filter(a=>a.id!==adel.dataset.answerDelete);save();}
  const filter=e.target.closest('[data-filter]');if(filter){activeFilter=filter.dataset.filter;$$('[data-filter]').forEach(b=>b.classList.toggle('active',b===filter));renderSyllabus();}
});

$('#taskForm').addEventListener('submit',e=>{e.preventDefault();const todays=state.tasks.filter(t=>t.date===isoDay());if(todays.length>=3){toast('Keep focus: complete or remove a task first.');return;}state.tasks.push({id:crypto.randomUUID(),date:isoDay(),text:$('#taskInput').value.trim(),duration:Number($('#taskDuration').value),done:false});e.target.reset();save();toast('Priority added.');});
$('#logForm').addEventListener('submit',e=>{e.preventDefault();state.logs.push({id:crypto.randomUUID(),date:isoDay(),subject:$('#logSubject').value,minutes:Number($('#logMinutes').value),note:$('#logNote').value.trim()});$('#logNote').value='';save();toast('Study session saved.');});
$('#revisionForm').addEventListener('submit',e=>{e.preventDefault();state.revisions.push({id:crypto.randomUUID(),topic:$('#revisionTopic').value.trim(),subject:$('#revisionSubject').value,level:0,next:isoDay()});e.target.reset();save();toast('Added to today’s revision queue.');});
$('#mockForm').addEventListener('submit',e=>{e.preventDefault();const correct=Number($('#mockCorrect').value),wrong=Number($('#mockWrong').value),skipped=Number($('#mockSkipped').value),marks=Number($('#mockMarks').value);const attempted=correct+wrong;const accuracy=attempted?Math.round(correct/attempted*100):0;const score=(correct*marks-wrong*marks/3).toFixed(2);state.mocks.push({id:crypto.randomUUID(),date:isoDay(),name:$('#mockName').value.trim(),paper:$('#mockPaper').value,correct,wrong,skipped,marks,accuracy,score});e.target.reset();$('#mockMarks').value=2;$('#mockSkipped').value=0;save();toast(`Mock saved: ${score} marks.`);});
$('#answerForm').addEventListener('submit',e=>{e.preventDefault();state.answers.push({id:crypto.randomUUID(),date:isoDay(),paper:$('#answerPaper').value,topic:$('#answerTopic').value.trim(),marks:Number($('#answerMarks').value),time:Number($('#answerTime').value),rating:Number($('#answerRating').value)});e.target.reset();$('#answerTime').value=12;$('#answerRating').value=3;save();toast('Answer practice recorded.');});

let timerSeconds=3000,timerTotal=3000,timerId=null;
function drawTimer(){const m=Math.floor(timerSeconds/60),s=timerSeconds%60;$('#timerDisplay').textContent=`${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;}
$('#timerToggle').addEventListener('click',()=>{if(timerId){clearInterval(timerId);timerId=null;$('#timerToggle').textContent='Resume';return;}$('#timerToggle').textContent='Pause';timerId=setInterval(()=>{timerSeconds--;drawTimer();if(timerSeconds<=0){clearInterval(timerId);timerId=null;$('#timerToggle').textContent='Start';timerSeconds=timerTotal;drawTimer();toast('Focus sprint complete. Log what you finished.');}},1000);});
$('#timerReset').addEventListener('click',()=>{clearInterval(timerId);timerId=null;timerSeconds=timerTotal;drawTimer();$('#timerToggle').textContent='Start';});
$$('[data-minutes]').forEach(b=>b.addEventListener('click',()=>{clearInterval(timerId);timerId=null;timerTotal=Number(b.dataset.minutes)*60;timerSeconds=timerTotal;$$('[data-minutes]').forEach(x=>x.classList.toggle('active',x===b));$('#timerToggle').textContent='Start';drawTimer();}));

$('#resetBtn').addEventListener('click',()=>{if(confirm('Clear every task, session, revision, test and syllabus tick? This cannot be undone.')){state=structuredClone(initial);localStorage.removeItem(KEY);save();toast('Dashboard reset.');}});

const subjectOptions=SUBJECTS.map(s=>`<option value="${s.name}">${s.name}</option>`).join('');
$('#logSubject').innerHTML=subjectOptions;$('#revisionSubject').innerHTML=subjectOptions;
const now=new Date();$('#todayDate').textContent=now.toLocaleDateString('en-IN',{weekday:'long',day:'numeric',month:'long',year:'numeric'});
const target=new Date('2028-05-28T00:00:00');const days=Math.max(0,Math.ceil((target-now)/86400000));$('#daysTarget').textContent=`${days.toLocaleString('en-IN')} days to provisional Prelims target`;
renderAll();

// Optional WebMCP support: lets compatible assistants use the same visible workflows.
function registerAgentTools(){
  const context=document.modelContext;
  if(!context?.registerTool)return;
  const register=(tool)=>{try{void Promise.resolve(context.registerTool(tool)).catch(()=>{});}catch{}}
  register({name:'read_preparation_progress',title:'Read preparation progress',description:'Read the current UPSC syllabus, study, revision, mock-test and answer-writing totals.',inputSchema:{type:'object',properties:{},additionalProperties:false},annotations:{readOnlyHint:true,untrustedContentHint:false},execute:()=>{const total=SUBJECTS.reduce((n,s)=>n+s.topics.length,0),done=Object.values(state.topics).filter(Boolean).length;return{syllabus_percent:Math.round(done/total*100),study_minutes_today:state.logs.filter(l=>l.date===isoDay()).reduce((n,l)=>n+l.minutes,0),revisions_due:state.revisions.filter(r=>r.next<=isoDay()).length,mocks_completed:state.mocks.length,answers_written:state.answers.length};}});
  register({name:'log_study_session',title:'Log study session',description:'Record a completed UPSC study session and update the visible dashboard.',inputSchema:{type:'object',properties:{subject:{type:'string',minLength:1,maxLength:80},minutes:{type:'integer',minimum:5,maximum:600},note:{type:'string',minLength:1,maxLength:100}},required:['subject','minutes','note'],additionalProperties:false},annotations:{readOnlyHint:false,untrustedContentHint:false},execute:(input)=>{if(!input||typeof input.subject!=='string'||typeof input.note!=='string'||!Number.isInteger(input.minutes)||input.minutes<5||input.minutes>600)throw new Error('Invalid study session');const entry={id:crypto.randomUUID(),date:isoDay(),subject:input.subject.trim(),minutes:input.minutes,note:input.note.trim()};if(!entry.subject||!entry.note)throw new Error('Subject and note are required');state.logs.push(entry);save();return{saved:true,date:entry.date,total_minutes_today:state.logs.filter(l=>l.date===isoDay()).reduce((n,l)=>n+l.minutes,0)};}});
  register({name:'add_revision_topic',title:'Add revision topic',description:'Add a UPSC topic to the spaced-repetition queue, due for its first review today.',inputSchema:{type:'object',properties:{topic:{type:'string',minLength:1,maxLength:100},subject:{type:'string',minLength:1,maxLength:80}},required:['topic','subject'],additionalProperties:false},annotations:{readOnlyHint:false,untrustedContentHint:false},execute:(input)=>{if(!input||typeof input.topic!=='string'||typeof input.subject!=='string'||!input.topic.trim()||!input.subject.trim())throw new Error('Topic and subject are required');state.revisions.push({id:crypto.randomUUID(),topic:input.topic.trim().slice(0,100),subject:input.subject.trim().slice(0,80),level:0,next:isoDay()});save();return{saved:true,due:isoDay(),revisions_due:state.revisions.filter(r=>r.next<=isoDay()).length};}});
}
registerAgentTools();
