const STORAGE_KEY = "profnav_diagnostics_v31";
const steps = [
  { key:"interests", title:"Профессиональные интересы", short:"Интересы" },
  { key:"values", title:"Рабочие ценности", short:"Ценности" },
  { key:"readiness", title:"Учебная готовность", short:"Готовность" },
  { key:"conditions", title:"Образовательные условия", short:"Условия" },
  { key:"work", title:"Предпочтения к работе", short:"Работа" }
];

const interestQuestions = [
  ["R","Мне нравится разбираться, как устроены механизмы, техника и физические объекты."],
  ["R","Мне интересны практические задачи с осязаемым результатом."],
  ["I","Мне нравится искать закономерности, анализировать данные и проверять гипотезы."],
  ["I","Я готов(а) глубоко разбираться в сложной теме."],
  ["A","Мне нравится придумывать визуальные решения, образы, тексты или новые формы."],
  ["A","Мне важно иметь возможность предложить оригинальный вариант."],
  ["S","Мне нравится объяснять, помогать, консультировать и работать с людьми."],
  ["S","Мне важно видеть пользу моей работы для других."],
  ["E","Мне нравится презентовать идеи, договариваться и вести проект к результату."],
  ["E","Я готов(а) брать ответственность за решения и координацию команды."],
  ["C","Мне нравится структурировать информацию и поддерживать порядок в процессах."],
  ["C","Я внимателен(на) к деталям, правилам и последовательности."]
];

const valueQuestions = [
  ["achievement","Мне важно решать сложные задачи и видеть сильный результат."],
  ["conditions","Мне важны комфортные условия и разумный баланс нагрузки."],
  ["recognition","Мне важно профессиональное признание моего вклада."],
  ["relationships","Мне важна уважительная и доброжелательная рабочая среда."],
  ["support","Мне нужны понятные правила, обратная связь и поддержка."],
  ["independence","Мне важна самостоятельность в выборе способов работы."]
];

function blankState(){
  return {
    step:0,
    answers:{
      interests:{},
      values:{},
      readiness:{ math:3, physics:3, it:3, russian:3, literature:3, art:3 },
      conditions:{ grade:"11", funding:"both", study:"fulltime", relocation:"yes", ege:"Математика, русский язык, информатика" },
      work:{ mode:"hybrid", team:"mixed", people:"mixed", autonomy:"medium" }
    },
    finished:false
  };
}
function loadDiagnosis(){
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null");
    return saved ? saved : blankState();
  } catch(e) { return blankState(); }
}
let diagnosis = loadDiagnosis();

function saveDiagnosis(){
  localStorage.setItem(STORAGE_KEY, JSON.stringify(diagnosis));
  renderSideProgress();
}
function resetDiagnosis(){
  if(confirm("Удалить сохранённые ответы и начать диагностику заново?")){
    diagnosis = blankState();
    saveDiagnosis();
    renderWizard();
    refreshRecommendations().then(renderEverything);
  }
}
window.resetDiagnosis = resetDiagnosis;

function moduleComplete(key){
  const a = diagnosis.answers[key] || {};
  if(key==="interests") return interestQuestions.every(function(_,i){ return a[i] != null; });
  if(key==="values") return valueQuestions.every(function(_,i){ return a[i] != null; });
  if(key==="readiness") return Object.keys(subjectLabels).every(function(k){ return a[k] != null; });
  if(key==="conditions") return ["grade","funding","study","relocation","ege"].every(function(k){ return String(a[k] || "").trim().length > 0; });
  if(key==="work") return ["mode","team","people","autonomy"].every(function(k){ return !!a[k]; });
  return false;
}
function renderSideProgress(){
  const done = steps.filter(function(s){ return moduleComplete(s.key); }).length;
  $("#progressCounter").textContent = done + " / 5";
  $("#sideProgressBar").style.width = (done*20) + "%";
  $("#sideProgressList").innerHTML = steps.map(function(s){
    const ok = moduleComplete(s.key);
    return '<div class="progress-item '+(ok?'done':'')+'"><span class="state">'+(ok?'✓':'')+'</span><span>'+s.title+'</span></div>';
  }).join("");
}
function scaleQuestion(name,text,value){
  let html = '<div class="question"><b>'+text+'</b><div class="scale">';
  [1,2,3,4,5].forEach(function(v){
    html += '<label><input type="radio" name="'+name+'" value="'+v+'" '+(+value===v?'checked':'')+'><span>'+v+'</span><small>'+(v===1?'совсем нет':v===5?'очень да':'')+'</small></label>';
  });
  return html + '</div></div>';
}
function selectField(key,label,options,value){
  return '<div class="field"><label>'+label+'</label><select id="field_'+key+'">'+options.map(function(o){
    return '<option value="'+o[0]+'" '+(o[0]===value?'selected':'')+'>'+o[1]+'</option>';
  }).join("")+'</select></div>';
}
function wizardBody(key){
  if(key==="interests"){
    return '<p>Оцените утверждения от 1 — «совсем не про меня» до 5 — «очень про меня».</p>'+
      interestQuestions.map(function(q,i){ return scaleQuestion("int_"+i,q[1],diagnosis.answers.interests[i]); }).join("");
  }
  if(key==="values"){
    return '<p>Насколько это важно для вашей будущей работы?</p>'+
      valueQuestions.map(function(q,i){ return scaleQuestion("val_"+i,q[1],diagnosis.answers.values[i]); }).join("");
  }
  if(key==="readiness"){
    return '<p>Самооценка предметной готовности — не экзамен и не оценка способностей.</p><div class="field-grid">'+
      Object.entries(subjectLabels).map(function(entry){
        const k=entry[0], label=entry[1], v=diagnosis.answers.readiness[k] || 3;
        return '<div class="field"><label>'+label+' <b id="read_'+k+'_value">'+v+'/5</b></label><input id="read_'+k+'" type="range" min="1" max="5" value="'+v+'"></div>';
      }).join("")+'</div>';
  }
  if(key==="conditions"){
    const a=diagnosis.answers.conditions;
    return '<div class="field-grid">'+
      selectField("grade","Текущая ступень",[["9","9 класс"],["10","10 класс"],["11","11 класс"],["spo","СПО"],["higher","Уже есть высшее"]],a.grade)+
      '<div class="field"><label>Планируемые ЕГЭ / испытания</label><input id="field_ege" type="text" value="'+(a.ege || "")+'"></div>'+
      selectField("funding","Финансирование",[["budget","Только бюджет"],["both","Бюджет и платное"],["paid","Платное возможно"]],a.funding)+
      selectField("study","Форма обучения",[["fulltime","Очная"],["parttime","Очно-заочная"],["any","Любая"]],a.study)+
      selectField("relocation","Переезд",[["yes","Готов(а) к переезду"],["no","Не готов(а) к переезду"]],a.relocation)+
      '</div>';
  }
  const a=diagnosis.answers.work;
  return '<div class="field-grid">'+
    selectField("mode","Формат работы",[["office","Очно"],["hybrid","Гибрид"],["remote","Удалённо"]],a.mode)+
    selectField("team","Командность",[["individual","Индивидуально"],["mixed","Смешанно"],["team","Команда"]],a.team)+
    selectField("people","С чем интереснее работать",[["people","С людьми"],["data","С данными"],["tech","С техникой"],["mixed","Смешанно"]],a.people)+
    selectField("autonomy","Самостоятельность",[["low","Нужна структура"],["medium","Баланс"],["high","Высокая"]],a.autonomy)+
    '</div>';
}
function renderWizard(){
  const i = Math.max(0,Math.min(4,diagnosis.step || 0));
  diagnosis.step = i;
  const s=steps[i];
  $("#wizardStepLabel").textContent = "Шаг "+(i+1)+" из 5";
  $("#wizardTitle").textContent = s.title;
  $("#wizardProgressBar").style.width = ((i+1)*20)+"%";
  $("#wizardTabs").innerHTML = steps.map(function(x,j){
    return '<button class="wizard-tab '+(j===i?'active ':'')+(moduleComplete(x.key)?'done':'')+'" onclick="jumpWizard('+j+')">'+(j+1)+'. '+x.short+'</button>';
  }).join("");
  $("#backBtn").disabled = i===0;
  $("#nextBtn").textContent = i===4 ? "Сформировать рекомендации →" : "Далее →";
  $("#wizardBody").innerHTML = wizardBody(s.key);
  attachWizard(s.key);
  renderSideProgress();
}
function attachWizard(key){
  if(key==="interests") interestQuestions.forEach(function(_,i){ $$('input[name="int_'+i+'"]').forEach(function(e){ e.onchange=function(){ diagnosis.answers.interests[i]=+e.value; saveDiagnosis(); }; }); });
  if(key==="values") valueQuestions.forEach(function(_,i){ $$('input[name="val_'+i+'"]').forEach(function(e){ e.onchange=function(){ diagnosis.answers.values[i]=+e.value; saveDiagnosis(); }; }); });
  if(key==="readiness") Object.keys(subjectLabels).forEach(function(k){ const e=$("#read_"+k); e.oninput=function(){ $("#read_"+k+"_value").textContent=e.value+"/5"; diagnosis.answers.readiness[k]=+e.value; saveDiagnosis(); }; });
  if(key==="conditions") ["grade","funding","study","relocation","ege"].forEach(function(k){ const e=$("#field_"+k); e.onchange=e.oninput=function(){ diagnosis.answers.conditions[k]=e.value; saveDiagnosis(); }; });
  if(key==="work") ["mode","team","people","autonomy"].forEach(function(k){ const e=$("#field_"+k); e.onchange=function(){ diagnosis.answers.work[k]=e.value; saveDiagnosis(); }; });
}
function jumpWizard(i){ diagnosis.step=i; saveDiagnosis(); renderWizard(); }
function wizardBack(){ if(diagnosis.step>0){ diagnosis.step--; saveDiagnosis(); renderWizard(); } }
async function wizardNext(){
  const key=steps[diagnosis.step].key;
  if(!moduleComplete(key)){ alert("Заполните все поля этого шага."); return; }
  if(diagnosis.step<4){ diagnosis.step++; saveDiagnosis(); renderWizard(); return; }
  diagnosis.finished=true; saveDiagnosis();
  await refreshRecommendations();
  renderEverything();
  showView("results");
}
window.jumpWizard=jumpWizard; window.wizardBack=wizardBack; window.wizardNext=wizardNext;

function computeProfile(){
  const sums={R:0,I:0,A:0,S:0,E:0,C:0}, cnt={R:0,I:0,A:0,S:0,E:0,C:0};
  interestQuestions.forEach(function(q,i){
    const v=diagnosis.answers.interests[i];
    if(v!=null){ sums[q[0]]+=+v; cnt[q[0]]++; }
  });
  const riasec={};
  Object.keys(sums).forEach(function(k){ riasec[k]=cnt[k]?Math.round((sums[k]/cnt[k]-1)*25):50; });
  const values={};
  valueQuestions.forEach(function(q,i){
    const v=diagnosis.answers.values[i];
    values[q[0]]=v!=null?Math.round((v-1)*25):50;
  });
  const readiness={};
  Object.keys(subjectLabels).forEach(function(k){ readiness[k]=(diagnosis.answers.readiness[k] || 3)*20; });
  return { riasec:riasec, values:values, readiness:readiness, context:{work_mode:diagnosis.answers.work.mode,team:diagnosis.answers.work.team}, top_n:10 };
}