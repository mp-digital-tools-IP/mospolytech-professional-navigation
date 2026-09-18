const STORAGE_KEY = "profnav_diagnostics_v32";

const STEPS = [
  {key:"interests",title:"Профессиональные интересы",short:"Интересы"},
  {key:"values",title:"Рабочие ценности",short:"Ценности"},
  {key:"behavior",title:"Поведенческие паттерны",short:"Поведение"},
  {key:"cognitive",title:"Стиль решения задач",short:"Мышление"},
  {key:"readiness",title:"Учебная готовность",short:"Готовность"},
  {key:"conditions",title:"Образовательные условия",short:"Условия"},
  {key:"work",title:"Рабочий контекст",short:"Работа"}
];

const MODE = {
  quick:{id:"quick",label:"Навигационный скрининг",time:"10–12 минут",count:58,desc:"Быстро определить ведущие интересы, ценности, учебную готовность и рабочие предпочтения.",badge:"Быстрый старт"},
  deep:{id:"deep",label:"Расширенная диагностика",time:"30–40 минут",count:136,desc:"Более глубокий профиль: интересы, ценности, поведенческие паттерны, стиль решения задач и профессиональная среда.",badge:"Глубокий анализ"}
};

const Q_INTERESTS = [
["R","Мне нравится разбираться, как устроены механизмы, техника и физические объекты."],["R","Мне интересны практические задачи с осязаемым результатом."],["R","Мне нравится собирать, настраивать или улучшать устройства."],["R","Я предпочитаю задачу, где можно увидеть конкретный материальный результат."],["R","Мне интересно работать с оборудованием, транспортом или производственными системами."],["R","Я быстрее включаюсь в задачу, если можно что-то проверить на практике."],
["I","Мне нравится искать закономерности, анализировать данные и проверять гипотезы."],["I","Я готов(а) глубоко разбираться в сложной теме."],["I","Мне интересно находить причины явлений, а не только запоминать факты."],["I","Я люблю задачи, где сначала нужно сформулировать вопрос, а потом искать доказательства."],["I","Мне нравится сравнивать несколько объяснений и выбирать наиболее обоснованное."],["I","Мне интересно исследовать новые технологии и непроверенные подходы."],
["A","Мне нравится придумывать визуальные решения, образы, тексты или новые формы."],["A","Мне важно иметь возможность предложить оригинальный вариант."],["A","Мне интересно сочетать функциональность и выразительность."],["A","Мне нравится улучшать то, как выглядит и воспринимается продукт."],["A","Я замечаю композицию, стиль, форму или язык подачи."],["A","Мне нравится создавать несколько концепций, прежде чем выбрать одну."],
["S","Мне нравится объяснять, помогать, консультировать и работать с людьми."],["S","Мне важно видеть пользу моей работы для других."],["S","Мне легко включаться в обсуждение и помогать группе договориться."],["S","Мне интересно обучать, наставлять или объяснять сложное простым языком."],["S","Я обращаю внимание на состояние и потребности людей рядом."],["S","Мне нравится работа, где результат зависит от качества взаимодействия."],
["E","Мне нравится презентовать идеи, договариваться и вести проект к результату."],["E","Я готов(а) брать ответственность за решения и координацию команды."],["E","Мне интересно влиять на выбор и убеждать других аргументами."],["E","Я люблю превращать идею в план действий и добиваться результата."],["E","Мне комфортно принимать решение, когда есть несколько заинтересованных сторон."],["E","Мне интересны продукт, бизнес, управление и развитие проектов."],
["C","Мне нравится структурировать информацию и поддерживать порядок в процессах."],["C","Я внимателен(на) к деталям, правилам и последовательности."],["C","Мне проще работать, когда критерии и этапы заранее понятны."],["C","Я замечаю несоответствия, пропуски и ошибки в данных."],["C","Мне нравится приводить хаотичную информацию к понятной системе."],["C","Я предпочитаю фиксировать договорённости, версии и контрольные точки."]
];

const Q_VALUES = [
["achievement","Мне важно решать сложные задачи и видеть сильный результат."],["achievement","Мне важно постоянно повышать уровень сложности задач."],["achievement","Мне интересно видеть измеримый эффект своей работы."],["achievement","Я хочу работать там, где можно профессионально расти."],
["conditions","Мне важны комфортные условия и разумный баланс нагрузки."],["conditions","Для меня важны предсказуемый график и устойчивый ритм работы."],["conditions","Мне важно иметь время на восстановление вне работы."],["conditions","Я ценю понятные условия оплаты и организации труда."],
["recognition","Мне важно профессиональное признание моего вклада."],["recognition","Мне важно, чтобы сильный результат был заметен другим."],["recognition","Мне интересно становиться экспертом, к которому обращаются за мнением."],["recognition","Статус роли и уровень ответственности для меня значимы."],
["relationships","Мне важна уважительная и доброжелательная рабочая среда."],["relationships","Мне важно чувствовать себя частью сильной команды."],["relationships","Я предпочитаю культуру, где можно открыто обсуждать проблемы."],["relationships","Мне важно качество отношений с коллегами и руководителем."],
["support","Мне нужны понятные правила, обратная связь и поддержка."],["support","Я ценю наставника, особенно при освоении новой области."],["support","Мне важно понимать критерии хорошего результата."],["support","Мне комфортнее, когда можно быстро получить обратную связь."],
["independence","Мне важна самостоятельность в выборе способов работы."],["independence","Я предпочитаю иметь пространство для собственных решений."],["independence","Мне не нравится, когда каждый шаг детально контролируют."],["independence","Я готов(а) сам(а) организовывать свою работу и отвечать за выбор."]
];

const Q_BEHAVIOR = [
["initiative","Если задача сформулирована не полностью, я предлагаю первый рабочий вариант действия.",false],["initiative","Я сам(а) ищу возможность улучшить процесс, даже если меня об этом не просили.",false],["initiative","Перед началом действий мне обычно нужно подробное указание от другого человека.",true],["initiative","Если вижу проблему, стараюсь инициировать её обсуждение.",false],["initiative","Я часто откладываю идею, пока кто-то другой не предложит начать.",true],["initiative","Мне комфортно первым(ой) брать небольшой участок новой задачи.",false],
["persistence","Если решение не получилось с первого раза, я пробую другой подход.",false],["persistence","На длинной задаче я умею сохранять рабочий темп.",false],["persistence","После нескольких неудач мне трудно вернуться к задаче.",true],["persistence","Я обычно довожу начатое до понятного результата.",false],["persistence","Мне сложно продолжать работу, если прогресс долго не виден.",true],["persistence","Я могу разбить большую цель на этапы и двигаться по ним.",false],
["selfreg","Перед сложной задачей я умею определить приоритеты.",false],["selfreg","Если меня отвлекли, я быстро возвращаюсь к основной задаче.",false],["selfreg","Когда задач становится много, я начинаю хвататься за всё сразу.",true],["selfreg","Я стараюсь заранее оценить время и ресурсы.",false],["selfreg","Я замечаю, когда усталость уже ухудшает качество решения.",false],["selfreg","Мне сложно остановиться и перепроверить результат перед сдачей.",true],
["collaboration","В командной задаче я уточняю, кто за что отвечает.",false],["collaboration","Я готов(а) изменить свой вариант, если у коллег есть более сильные аргументы.",false],["collaboration","Мне проще сделать всё самому(ой), чем синхронизироваться с командой.",true],["collaboration","Я делюсь промежуточным результатом, если он влияет на работу других.",false],["collaboration","Я стараюсь понять ограничения коллег, прежде чем требовать результат.",false],["collaboration","Совместная работа обычно сильнее утомляет меня, чем помогает.",true],
["communication","Я могу коротко объяснить, что именно мне нужно от другого человека.",false],["communication","Перед важным разговором я продумываю ключевые аргументы.",false],["communication","Если собеседник не понял меня с первого раза, я теряюсь.",true],["communication","Я умею задавать уточняющие вопросы, не превращая разговор в спор.",false],["communication","Мне комфортно выступить перед небольшой группой.",false],["communication","Я часто предполагаю, что другие и так понимают, что я имею в виду.",true],
["leadership","В группе я готов(а) взять ответственность за общий результат.",false],["leadership","Мне интересно распределять задачи с учётом сильных сторон людей.",false],["leadership","Я предпочитаю не влиять на решения команды, даже если вижу риск.",true],["leadership","Я могу дать корректную обратную связь по результату другого человека.",false],["leadership","Мне интересно удерживать общую цель, когда участники смотрят на неё по-разному.",false],["leadership","Мне некомфортно принимать решение, которое затрагивает других людей.",true]
];

const Q_COGNITIVE = [
["analysis","Перед выводом я стараюсь отделить факты от предположений.",false],["analysis","Если данные противоречат друг другу, я ищу причину расхождения.",false],["analysis","Мне достаточно первого правдоподобного объяснения, чтобы двигаться дальше.",true],["analysis","Я сравниваю альтернативы по критериям, а не только по впечатлению.",false],["analysis","Мне нравится находить слабые места в аргументации.",false],["analysis","Я редко возвращаюсь к исходным данным после того, как принял(а) решение.",true],
["ambiguity","Мне комфортно работать над задачей, где в начале нет единственно правильного ответа.",false],["ambiguity","Я могу временно оставить вопрос открытым, если данных недостаточно.",false],["ambiguity","Неопределённость быстро заставляет меня выбрать хоть какой-то вариант.",true],["ambiguity","Мне интересно исследовать несколько сценариев будущего.",false],["ambiguity","Я спокойно уточняю гипотезу по мере появления новых данных.",false],["ambiguity","Если правила меняются по ходу работы, я надолго теряю рабочий ритм.",true],
["structure","Я стараюсь разложить сложную проблему на независимые части.",false],["structure","Мне помогают схемы, таблицы и критерии сравнения.",false],["structure","Я часто решаю сложную задачу целиком, не выделяя этапов.",true],["structure","Я фиксирую допущения, чтобы потом можно было проверить логику.",false],["structure","Мне важно видеть связи между этапами процесса.",false],["structure","Подробное планирование обычно только мешает мне.",true]
];

const Q_READINESS = [
["math","Мне уверенно даются задачи, где нужно работать с формулами и количественными зависимостями."],["math","Я могу долго разбираться в математической задаче, если понимаю её смысл."],
["physics","Мне интересно объяснять технические явления через физические принципы."],["physics","Я уверенно чувствую себя в задачах на силы, энергию, движение или электричество."],
["it","Я понимаю базовую логику алгоритмов и могу освоить новый цифровой инструмент."],["it","Мне интересно программирование, данные, автоматизация или цифровые системы."],
["russian","Я умею ясно формулировать мысль письменно и редактировать текст."],["russian","Мне легко выделить главное в большом текстовом материале."],
["literature","Я замечаю смысловые оттенки, контекст и авторский замысел."],["literature","Мне нравится интерпретировать тексты и сопоставлять разные точки зрения."],
["art","Мне комфортно работать с композицией, формой, цветом или визуальной подачей."],["art","Я готов(а) регулярно тренировать рисунок, композицию или проектную графику."]
];

function qByDimension(list,perDim){
  const out=[],seen={};
  list.forEach(function(q){seen[q[0]]=seen[q[0]]||0;if(seen[q[0]]<perDim){out.push(q);seen[q[0]]++;}});
  return out;
}
function modeQuestions(key){
  const deep=diagnosis.mode==="deep";
  if(key==="interests") return deep?Q_INTERESTS:qByDimension(Q_INTERESTS,3);
  if(key==="values") return deep?Q_VALUES:qByDimension(Q_VALUES,2);
  if(key==="behavior") return deep?Q_BEHAVIOR:qByDimension(Q_BEHAVIOR,1);
  if(key==="cognitive") return deep?Q_COGNITIVE:qByDimension(Q_COGNITIVE,2);
  if(key==="readiness") return deep?Q_READINESS:qByDimension(Q_READINESS,1);
  return [];
}
function blankState(){
  return {mode:null,step:0,page:0,answers:{interests:{},values:{},behavior:{},cognitive:{},readinessItems:{},conditions:{grade:"11",funding:"both",study:"fulltime",relocation:"yes",dorm:"notimportant",ege:"Математика, русский язык, информатика"},work:{mode:"hybrid",team:"mixed",people:"mixed",autonomy:"medium"}},finished:false};
}
function loadDiagnosis(){try{const s=JSON.parse(localStorage.getItem(STORAGE_KEY)||"null");return s?s:blankState();}catch(e){return blankState();}}
let diagnosis=loadDiagnosis();
function saveDiagnosis(){localStorage.setItem(STORAGE_KEY,JSON.stringify(diagnosis));renderSideProgress();}
function chooseDiagnosticMode(mode){diagnosis=blankState();diagnosis.mode=mode;saveDiagnosis();renderWizard();}
function changeDiagnosticMode(){diagnosis.mode=null;diagnosis.step=0;diagnosis.page=0;saveDiagnosis();renderWizard();}
function resetDiagnosis(){if(confirm("Удалить сохранённые ответы и начать заново?")){const m=diagnosis.mode;diagnosis=blankState();diagnosis.mode=m;saveDiagnosis();renderWizard();refreshRecommendations().then(renderEverything);}}
window.chooseDiagnosticMode=chooseDiagnosticMode;window.changeDiagnosticMode=changeDiagnosticMode;window.resetDiagnosis=resetDiagnosis;

function answerStore(key){if(key==="readiness")return diagnosis.answers.readinessItems;return diagnosis.answers[key]||{};}
function answeredCountFor(key){
  if(key==="conditions") return ["grade","funding","study","relocation","dorm","ege"].filter(k=>String(diagnosis.answers.conditions[k]||"").trim()).length;
  if(key==="work") return ["mode","team","people","autonomy"].filter(k=>diagnosis.answers.work[k]).length;
  const a=answerStore(key),qs=modeQuestions(key);return qs.filter((_,i)=>a[i]!=null).length;
}
function requiredCountFor(key){
  if(key==="conditions")return 6;if(key==="work")return 4;return modeQuestions(key).length;
}
function moduleComplete(key){return answeredCountFor(key)>=requiredCountFor(key);}
function progressStats(){
  const total=STEPS.reduce((n,s)=>n+requiredCountFor(s.key),0),done=STEPS.reduce((n,s)=>n+answeredCountFor(s.key),0);
  return {total,done,pct:total?Math.round(done/total*100):0};
}
function renderSideProgress(){
  const totalSteps=STEPS.length,doneSteps=STEPS.filter(s=>moduleComplete(s.key)).length;
  $("#progressCounter").textContent=doneSteps+" / "+totalSteps;
  $("#sideProgressBar").style.width=(doneSteps/totalSteps*100)+"%";
  $("#sideProgressList").innerHTML=STEPS.map(s=>'<div class="progress-item '+(moduleComplete(s.key)?"done":"")+'"><span class="state">'+(moduleComplete(s.key)?"✓":"")+'</span><span>'+s.title+'</span></div>').join("");
}
function renderModePicker(){
  const picker=$("#diagnosticModePicker"),note=$("#diagnosticMethodNote"),wrap=$("#diagnosticWizardWrap");
  if(!picker||!note||!wrap)return;
  if(diagnosis.mode){picker.classList.add("hidden");note.classList.add("hidden");wrap.classList.remove("hidden");return;}
  wrap.classList.add("hidden");picker.classList.remove("hidden");note.classList.remove("hidden");
  picker.innerHTML=Object.values(MODE).map(m=>'<button class="diagnostic-mode-card '+m.id+'" onclick="chooseDiagnosticMode(\''+m.id+'\')"><span class="mode-badge">'+m.badge+'</span><h2>'+m.label+'</h2><p>'+m.desc+'</p><div class="mode-meta"><span>'+m.time+'</span><b>≈ '+m.count+' ответов</b></div><span class="mode-cta">'+(m.id==="deep"?"Пройти глубокую диагностику →":"Начать скрининг →")+'</span></button>').join("");
  note.innerHTML='<div><span class="eyebrow">МЕТОДИЧЕСКАЯ ОСНОВА</span><h3>Два уровня — одна прозрачная логика</h3></div><p>Базовый слой использует модель профессиональных интересов RIASEC, рабочие ценности, учебную готовность и образовательные ограничения. Расширенный режим добавляет оригинальные шкалы поведенческих паттернов и стиля решения задач. До завершения отдельной психометрической валидизации результаты следует трактовать как навигационные гипотезы, а не как психологический диагноз или доказанную профпригодность.</p>';
}
function scoreRadioQuestion(name,text,value){
  return '<div class="question"><b>'+text+'</b><div class="scale">'+[1,2,3,4,5].map(v=>'<label><input type="radio" name="'+name+'" value="'+v+'" '+(+value===v?"checked":"")+'><span>'+v+'</span><small>'+(v===1?"совсем нет":v===5?"очень да":"")+'</small></label>').join("")+'</div></div>';
}
function selectField(k,l,opts,val){return '<div class="field"><label>'+l+'</label><select id="field_'+k+'">'+opts.map(o=>'<option value="'+o[0]+'" '+(o[0]===val?"selected":"")+'>'+o[1]+'</option>').join("")+'</select></div>';}
function stepBody(key){
  if(["interests","values","behavior","cognitive","readiness"].includes(key)){
    const qs=modeQuestions(key),a=answerStore(key),pageSize=diagnosis.mode==="deep"?8:12,pages=Math.max(1,Math.ceil(qs.length/pageSize)),page=Math.min(diagnosis.page||0,pages-1),from=page*pageSize,to=Math.min(qs.length,from+pageSize);
    const intro={
      interests:"Оцените, насколько вам близки разные типы деятельности.",
      values:"Что для вас действительно важно в будущей работе?",
      behavior:"Оцените, как вы обычно действуете в реальных учебных или проектных ситуациях.",
      cognitive:"Здесь оценивается не интеллект, а привычный стиль решения задач.",
      readiness:"Самооценка текущей учебной готовности по предметным областям."
    }[key];
    let html='<p>'+intro+'</p><div class="question-page-label">Вопросы '+(from+1)+'–'+to+' из '+qs.length+'</div>';
    for(let i=from;i<to;i++)html+=scoreRadioQuestion(key+"_"+i,qs[i][1],a[i]);
    return html;
  }
  if(key==="conditions"){
    const a=diagnosis.answers.conditions;
    return '<div class="field-grid">'+
      selectField("grade","Текущая ступень",[["9","9 класс"],["10","10 класс"],["11","11 класс"],["spo","СПО"],["higher","Уже есть высшее"]],a.grade)+
      '<div class="field"><label>Планируемые ЕГЭ / ДВИ</label><input id="field_ege" type="text" value="'+(a.ege||"")+'"></div>'+
      selectField("funding","Финансирование",[["budget","Только бюджет"],["both","Бюджет и платное"],["paid","Платное возможно"]],a.funding)+
      selectField("study","Форма обучения",[["fulltime","Очная"],["parttime","Очно-заочная"],["any","Любая"]],a.study)+
      selectField("relocation","Переезд",[["yes","Готов(а) к переезду"],["no","Не готов(а) к переезду"]],a.relocation)+
      selectField("dorm","Общежитие",[["important","Важно"],["notimportant","Не критично"],["no","Не требуется"]],a.dorm)+'</div>';
  }
  const a=diagnosis.answers.work;
  return '<div class="field-grid">'+
    selectField("mode","Формат работы",[["office","Очно"],["hybrid","Гибрид"],["remote","Удалённо"]],a.mode)+
    selectField("team","Командность",[["individual","Индивидуально"],["mixed","Смешанно"],["team","Команда"]],a.team)+
    selectField("people","С чем интереснее работать",[["people","С людьми"],["data","С данными"],["tech","С техникой"],["mixed","Смешанно"]],a.people)+
    selectField("autonomy","Самостоятельность",[["low","Нужна структура"],["medium","Баланс"],["high","Высокая"]],a.autonomy)+'</div>';
}
function attachStep(key){
  if(["interests","values","behavior","cognitive","readiness"].includes(key)){
    const qs=modeQuestions(key),a=answerStore(key);
    qs.forEach((_,i)=>$$('input[name="'+key+'_'+i+'"]').forEach(e=>e.onchange=()=>{a[i]=+e.value;saveDiagnosis();renderWizardMetaOnly();}));
  }else if(key==="conditions"){
    ["grade","funding","study","relocation","dorm","ege"].forEach(k=>{const e=$("#field_"+k);if(e)e.onchange=e.oninput=()=>{diagnosis.answers.conditions[k]=e.value;saveDiagnosis();renderWizardMetaOnly();};});
  }else if(key==="work"){
    ["mode","team","people","autonomy"].forEach(k=>{const e=$("#field_"+k);if(e)e.onchange=()=>{diagnosis.answers.work[k]=e.value;saveDiagnosis();renderWizardMetaOnly();};});
  }
}
function currentPageInfo(key){
  const qs=modeQuestions(key);if(!qs.length)return {page:0,pages:1,pageSize:999};
  const pageSize=diagnosis.mode==="deep"?8:12,pages=Math.max(1,Math.ceil(qs.length/pageSize));
  return {page:Math.min(diagnosis.page||0,pages-1),pages,pageSize};
}
function pageComplete(key){
  if(!["interests","values","behavior","cognitive","readiness"].includes(key))return moduleComplete(key);
  const qs=modeQuestions(key),a=answerStore(key),pi=currentPageInfo(key),from=pi.page*pi.pageSize,to=Math.min(qs.length,from+pi.pageSize);
  for(let i=from;i<to;i++)if(a[i]==null)return false;
  return true;
}
function renderWizardMetaOnly(){
  const st=progressStats();$("#wizardQuestionCount").textContent="Заполнено "+st.done+" из "+st.total+" · "+st.pct+"%";$("#wizardProgressBar").style.width=st.pct+"%";
}
function renderWizard(){
  renderModePicker();if(!diagnosis.mode)return;
  const i=Math.max(0,Math.min(STEPS.length-1,diagnosis.step||0)),s=STEPS[i];diagnosis.step=i;
  const pi=currentPageInfo(s.key);
  $("#wizardStepLabel").textContent="Блок "+(i+1)+" из "+STEPS.length+(pi.pages>1?" · страница "+(pi.page+1)+" из "+pi.pages:"");
  $("#wizardTitle").textContent=s.title;$("#wizardModeLabel").textContent=MODE[diagnosis.mode].label+" · "+MODE[diagnosis.mode].time;
  $("#wizardTabs").innerHTML=STEPS.map((x,j)=>'<button class="wizard-tab '+(j===i?"active ":"")+(moduleComplete(x.key)?"done":"")+'" onclick="jumpWizard('+j+')">'+(j+1)+'. '+x.short+'</button>').join("");
  $("#backBtn").disabled=i===0&&pi.page===0;$("#nextBtn").textContent=(i===STEPS.length-1&&pi.page===pi.pages-1)?"Сформировать рекомендации →":"Далее →";
  $("#wizardBody").innerHTML=stepBody(s.key);attachStep(s.key);renderWizardMetaOnly();renderSideProgress();
}
function jumpWizard(i){diagnosis.step=i;diagnosis.page=0;saveDiagnosis();renderWizard();}
function wizardBack(){
  const key=STEPS[diagnosis.step].key,pi=currentPageInfo(key);
  if(pi.page>0){diagnosis.page--;saveDiagnosis();renderWizard();return;}
  if(diagnosis.step>0){diagnosis.step--;const prev=STEPS[diagnosis.step].key;const p=currentPageInfo(prev);diagnosis.page=p.pages-1;saveDiagnosis();renderWizard();}
}
async function wizardNext(){
  const key=STEPS[diagnosis.step].key,pi=currentPageInfo(key);
  if(!pageComplete(key)){alert("Ответьте на все вопросы этой страницы.");return;}
  if(pi.page<pi.pages-1){diagnosis.page++;saveDiagnosis();renderWizard();return;}
  if(!moduleComplete(key)){alert("Заполните все поля этого блока.");return;}
  if(diagnosis.step<STEPS.length-1){diagnosis.step++;diagnosis.page=0;saveDiagnosis();renderWizard();return;}
  diagnosis.finished=true;saveDiagnosis();await refreshRecommendations();renderEverything();showView("results");
}
window.jumpWizard=jumpWizard;window.wizardBack=wizardBack;window.wizardNext=wizardNext;

function dimensionScores(list,answers){
  const sums={},cnt={};list.forEach((q,i)=>{if(answers[i]==null)return;const k=q[0],reverse=!!q[2],v=reverse?6-answers[i]:answers[i];sums[k]=(sums[k]||0)+v;cnt[k]=(cnt[k]||0)+1;});
  const out={};Object.keys(sums).forEach(k=>out[k]=Math.round(((sums[k]/cnt[k])-1)*25));return out;
}
function readinessScores(){
  const scores=dimensionScores(modeQuestions("readiness"),diagnosis.answers.readinessItems||{}),out={};
  Object.keys(subjectLabels).forEach(k=>out[k]=scores[k]!=null?scores[k]:60);return out;
}
function computeProfile(){
  return {
    riasec:dimensionScores(modeQuestions("interests"),diagnosis.answers.interests||{}),
    values:dimensionScores(modeQuestions("values"),diagnosis.answers.values||{}),
    readiness:readinessScores(),
    behavior:dimensionScores(modeQuestions("behavior"),diagnosis.answers.behavior||{}),
    cognitive:dimensionScores(modeQuestions("cognitive"),diagnosis.answers.cognitive||{}),
    context:{work_mode:diagnosis.answers.work.mode,team:diagnosis.answers.work.team},
    top_n:10
  };
}
function consistencyHeuristic(list,answers){
  const grouped={};list.forEach((q,i)=>{if(answers[i]==null)return;const k=q[0],v=q[2]?6-answers[i]:answers[i];(grouped[k]||(grouped[k]=[])).push(v);});
  const vals=Object.values(grouped).filter(a=>a.length>1).map(a=>{const m=a.reduce((x,y)=>x+y,0)/a.length,dev=a.reduce((x,y)=>x+Math.abs(y-m),0)/a.length;return Math.max(0,100-dev/2*100);});
  return vals.length?Math.round(vals.reduce((x,y)=>x+y,0)/vals.length):70;
}
function deepAnalysis(){
  const p=computeProfile(),st=progressStats();
  const b=p.behavior||{},c=p.cognitive||{};
  const expert=Math.round((b.persistence||50)*.3+(b.selfreg||50)*.25+(c.structure||50)*.25+(c.analysis||50)*.2);
  const research=Math.round((c.analysis||50)*.3+(c.ambiguity||50)*.25+(b.persistence||50)*.2+(b.initiative||50)*.15+(c.structure||50)*.1);
  const manager=Math.round((b.leadership||50)*.3+(b.communication||50)*.2+(b.collaboration||50)*.2+(b.initiative||50)*.2+(b.selfreg||50)*.1);
  const consistency=diagnosis.mode==="deep"?Math.round((consistencyHeuristic(Q_BEHAVIOR,diagnosis.answers.behavior||{})+consistencyHeuristic(Q_COGNITIVE,diagnosis.answers.cognitive||{}))/2):null;
  return {mode:diagnosis.mode,completed:st.pct,consistency,branch:{expert,research,manager},behavior:b,cognitive:c};
}
window.deepAnalysis=deepAnalysis;

renderModePicker();
