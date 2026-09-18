function profileNarrative(){
  const top=Object.entries(computeProfile().riasec).sort(function(a,b){return b[1]-a[1];}).slice(0,3);
  const code=top.map(function(x){return x[0];}).join("–");
  const names=top.map(function(x){return riaLabels[x[0]].toLowerCase();});
  let name="Сбалансированный профессиональный профиль";
  if(top[0][0]==="I" && top.some(function(x){return x[0]==="A";})) name="Исследователь с творческим уклоном";
  else if(top[0][0]==="R" && top.some(function(x){return x[0]==="I";})) name="Инженерно-исследовательский профиль";
  else if(top[0][0]==="A") name="Творческий проектировщик";
  else if(top[0][0]==="E") name="Предпринимательский организатор";
  else if(top[0][0]==="S") name="Социально-коммуникационный профиль";
  return {top:top,code:code,name:name,text:"Наиболее выражены "+names.join(", ")+" интересы. Это ориентир для исследования профессий, а не психологический диагноз."};
}
function drawRadar(svg,data){
  if(!svg) return;
  const cx=180,cy=132,R=92,keys=["R","I","A","S","E","C"],labels=["Практический","Исследовательский","Творческий","Социальный","Предпринимательский","Системный"];
  const pt=function(i,r){const a=-Math.PI/2+i*Math.PI/3;return [cx+Math.cos(a)*r,cy+Math.sin(a)*r];};
  let h="";
  [1,.75,.5,.25].forEach(function(f){h+='<polygon points="'+keys.map(function(_,i){return pt(i,R*f).join(",");}).join(" ")+'" fill="none" stroke="#dfe4ec"/>';});
  keys.forEach(function(_,i){const p=pt(i,R);h+='<line x1="'+cx+'" y1="'+cy+'" x2="'+p[0]+'" y2="'+p[1]+'" stroke="#e4e8ef"/>';});
  h+='<polygon points="'+keys.map(function(k,i){return pt(i,R*(data[k]||0)/100).join(",");}).join(" ")+'" fill="rgba(75,110,185,.28)" stroke="#4b6eb9" stroke-width="2.5"/>';
  keys.forEach(function(_,i){const p=pt(i,R+29);h+='<text x="'+p[0]+'" y="'+p[1]+'" font-size="11" fill="#4b5567" text-anchor="middle" dominant-baseline="middle">'+labels[i]+'</text>';});
  svg.innerHTML=h;
}
function renderEverything(){
  renderSideProgress(); renderHome(); renderResults(); renderRecommendationsFull(); renderAtlas(); renderPrograms(); renderEvents(); renderPrep(); renderDPO(); renderMarket(); fillTrajectory(); renderTrajectory();
}
function renderHome(){
  const n=profileNarrative(),p=computeProfile();
  $("#homeProfileCode").textContent=n.code;
  $("#homeProfileName").textContent=n.name;
  $("#homeProfileText").textContent=n.text;
  $("#homeProfileChips").innerHTML=n.top.map(function(x){return '<span>'+riaLabels[x[0]]+': '+x[1]+'</span>';}).join("");
  drawRadar($("#homeRadar"),p.riasec);
  $("#homeTop").innerHTML=recommendations.slice(0,6).map(function(r,i){
    return '<div class="mini-rank"><span class="num">'+(i+1)+'</span><span>'+r.name+'</span><div class="bar"><i style="width:'+r.score+'%"></i></div><span class="score">'+r.score+'</span><button onclick="openProfession(\''+r.slug+'\')">Подробнее</button></div>';
  }).join("");
}
function resultLines(obj,labels){
  return Object.entries(obj).map(function(entry){
    return '<div class="result-line"><span>'+labels[entry[0]]+'</span><div class="bar"><i style="width:'+entry[1]+'%"></i></div><b>'+entry[1]+'</b></div>';
  }).join("");
}
function renderResults(){
  const el=$("#resultsContent"); if(!el) return;
  const p=computeProfile(),n=profileNarrative();
  el.innerHTML='<div class="results-grid"><div class="card results-card"><h2>Профессиональные интересы</h2><svg id="resultsRadar" viewBox="0 0 360 270" style="width:100%;height:270px"></svg>'+resultLines(p.riasec,riaLabels)+'</div>'+
  '<div class="card profile-big"><span class="eyebrow">ВАШ ПРОФИЛЬ</span><h2>'+n.code+' · <span>'+n.name+'</span></h2><p>'+n.text+'</p><h3>Рабочие ценности</h3>'+resultLines(p.values,valueLabels)+'<button class="btn btn-primary" onclick="showView(\'recommendations\')">Перейти к TOP‑10 →</button></div></div>';
  drawRadar($("#resultsRadar"),p.riasec);
}
function renderRecommendationsFull(){
  const el=$("#recommendationsFull"); if(!el) return;
  el.innerHTML=recommendations.map(function(r,i){
    const f=r.factors||{};
    return '<div class="full-rank"><span class="num">'+(i+1)+'</span><div><b>'+r.name+'</b><br><small>'+(r.sector||"")+' · интересы '+(f.interest||"—")+' · ценности '+(f.values||"—")+' · готовность '+(f.readiness||"—")+'</small></div><div class="bar"><i style="width:'+r.score+'%"></i></div><b>'+r.score+'</b><button onclick="openProfession(\''+r.slug+'\')">Почему?</button></div>';
  }).join("");
}
const atlasClusters=[
  {id:"all",label:"Все направления",short:"Все",description:"Все профессии, которые уже наполнены в текущем MVP."},
  {id:"it",label:"Информационные технологии",short:"IT",description:"Разработка цифровых продуктов, данные, искусственный интеллект и информационная безопасность."},
  {id:"art",label:"Арт, дизайн и медиа",short:"Арт",description:"Дизайн, визуальные коммуникации, интерфейсы, медиа и креативные индустрии."},
  {id:"urban",label:"Урбанистика",short:"Город",description:"Городская среда, инфраструктура, цифровые и инженерные системы современного города."},
  {id:"business",label:"Бизнес",short:"Бизнес",description:"Маркетинг, продукт, управление, экономика и развитие бизнес-процессов."},
  {id:"transport",label:"Транспорт, инженерия, логистика",short:"Транспорт",description:"Транспортные системы, робототехника, автономные технологии, логистика и инженерные решения."},
  {id:"production",label:"Технологии, материалы и производство",short:"Производство",description:"Проектирование, машиностроение, материалы, производственные технологии и индустриальная инженерия."},
  {id:"life",label:"Экология и технологии жизни",short:"Life",description:"Экология, химические и биотехнологии, технологии качества жизни и устойчивого развития."}
];
let atlasCategory="all";
const atlasPrimaryCluster={
  ai:"it", data:"it", cyber:"it",
  graphic:"art", industrial:"art", ux:"art",
  product:"business", marketing:"business",
  robot:"transport", engineer:"production"
};
const atlasSubcategory={
  ai:"Искусственный интеллект", data:"Данные и аналитика", cyber:"Информационная безопасность",
  graphic:"Графический дизайн", industrial:"Промышленный дизайн", ux:"Цифровой продукт и UX",
  product:"Продукт и управление", marketing:"Маркетинг и коммуникации",
  robot:"Робототехника", engineer:"Машиностроение"
};
function setAtlasCategory(id){
  atlasCategory=id;
  renderAtlas();
}
window.setAtlasCategory=setAtlasCategory;
function renderAtlas(){
  const el=$("#atlasGrid"); if(!el) return;
  const cats=$("#atlasCategories"),note=$("#atlasClusterNote"),count=$("#atlasCount"),search=$("#atlasSearch");
  if(search && !search.dataset.bound){
    search.dataset.bound="1";
    search.addEventListener("input",renderAtlas);
  }
  const q=(search&&search.value||"").trim().toLowerCase();
  const counts={};
  atlasClusters.forEach(function(c){counts[c.id]=0;});
  professions.forEach(function(p){const c=atlasPrimaryCluster[p.slug]||"all";counts[c]=(counts[c]||0)+1;counts.all++;});
  if(cats) cats.innerHTML=atlasClusters.map(function(c){
    const n=counts[c.id]||0;
    return '<button class="atlas-category '+(atlasCategory===c.id?"active":"")+' '+(!n&&c.id!=="all"?"empty":"")+'" onclick="setAtlasCategory(\''+c.id+'\')"><span>'+c.short+'</span><b>'+c.label+'</b><small>'+n+'</small></button>';
  }).join("");
  const active=atlasClusters.find(function(c){return c.id===atlasCategory;})||atlasClusters[0];
  if(note) note.innerHTML='<div><b>'+active.label+'</b><span>'+active.description+'</span></div><a href="https://mospolytech.ru/news/priemnaya-kampaniya-v-moskovskiy-politekh-postupilo-svyshe-8000-zayavleniy-ot-bolee-chem-2000-chelov/" target="_blank">Структура направлений — приёмная кампания 2026 →</a>';
  const filtered=professions.filter(function(p){
    const cluster=atlasPrimaryCluster[p.slug]||"all";
    if(atlasCategory!=="all" && cluster!==atlasCategory) return false;
    if(!q) return true;
    const hay=[p.name,p.sector,p.description,atlasSubcategory[p.slug]].concat(p.skills||[]).join(" ").toLowerCase();
    return hay.includes(q);
  });
  if(count) count.textContent=filtered.length+" "+(filtered.length===1?"профессия":filtered.length>=2&&filtered.length<=4?"профессии":"профессий");
  if(!filtered.length){
    el.innerHTML='<div class="atlas-empty card"><b>Профессии этого направления пока дополняются</b><p>Категория уже заложена в структуру Атласа. В текущем MVP контент ещё не наполнен или не совпал с поиском.</p></div>';
    return;
  }
  el.innerHTML=filtered.map(function(p){
    const cluster=atlasClusters.find(function(c){return c.id===(atlasPrimaryCluster[p.slug]||"all");});
    return '<article class="content-card atlas-card"><div class="atlas-card-top"><span class="tag">'+(atlasSubcategory[p.slug]||p.sector)+'</span><span class="atlas-cluster-mini">'+(cluster?cluster.short:"")+'</span></div><h3>'+p.name+'</h3><p>'+(p.description||"")+'</p><div class="skills">'+(p.skills||[]).slice(0,6).map(function(s){return '<span>'+s+'</span>';}).join("")+'</div><div class="atlas-card-footer"><span>'+p.sector+'</span><button class="link-btn" onclick="openProfession(\''+p.slug+'\')">Профессия и маршрут →</button></div></article>';
  }).join("");
}
function renderPrograms(){
  const el=$("#programGrid"); if(!el) return;
  el.innerHTML=programs.map(function(p){
    return '<article class="content-card"><span class="tag">'+p.code+'</span><h3>'+p.title+'</h3><p>'+(p.faculty||"")+'</p><div class="kpis"><div class="kpi"><b>'+(p.budget_places==null?"н/д":p.budget_places)+'</b><span>бюджет</span></div><div class="kpi"><b>'+(p.passing_score==null?"н/д":p.passing_score)+'</b><span>проходной '+(p.passing_score_year||"")+'</span></div><div class="kpi"><b>'+(p.cost_rub?fmt(Math.round(p.cost_rub/1000))+" тыс.":"н/д")+'</b><span>₽/год</span></div></div><p class="source">'+(p.form||"")+' · '+(p.duration||"")+'</p>'+(p.source_url?'<a class="source" href="'+p.source_url+'" target="_blank">Официальная страница →</a>':"")+'</article>';
  }).join("");
}
async function renderMarket(){
  const el=$("#marketGrid"); if(!el) return;
  let items=[];
  if(live){
    for(const p of professions){try{items.push({p:p,m:await fetchJSON(API_BASE+"/api/market/"+p.slug)});}catch(e){}}
  } else items=professions.map(function(p){return {p:p,m:market[p.market_key]||{}};});
  el.innerHTML=items.map(function(x){
    const p=x.p,m=x.m;
    return '<article class="content-card"><span class="tag">'+(m.geography||"Москва")+'</span><h3>'+p.name+'</h3><div class="kpis"><div class="kpi"><b>'+(m.median_salary?fmt(Math.round(m.median_salary/1000))+" тыс.":"—")+'</b><span>медиана</span></div><div class="kpi"><b>'+(m.vacancies_total==null?"—":m.vacancies_total)+'</b><span>вакансий</span></div><div class="kpi"><b>'+(m.salary_min?fmt(Math.round(m.salary_min/1000))+"–"+fmt(Math.round(m.salary_max/1000)):"—")+'</b><span>тыс. ₽, вилка</span></div></div><p>'+(m.note||"")+'</p><p class="source">'+(m.snapshot||fallback.meta.snapshot)+' · '+qualityText(m.quality)+(m.source_url?' · <a href="'+m.source_url+'" target="_blank">источник →</a>':"")+'</p></article>';
  }).join("");
}
function renderEvents(){
  $("#eventsList").innerHTML=(fallback.events||[]).map(function(e){
    const d=e.date.split(" ");
    return '<a class="event-item" href="'+e.url+'" target="_blank"><div class="event-date">'+d[0]+'<small>'+d.slice(1).join(" ")+'</small></div><div><b>'+e.title+'</b><p>'+e.format+'</p></div></a>';
  }).join("");
}
function renderPrep(){
  $("#prepContent").innerHTML='<div class="card info-card"><h3>Подготовка к ЕГЭ</h3><p>Курсы Московского Политеха входят в маршрут до поступления и связываются с выбранной программой.</p><a href="https://mospolytech.ru/dovuzovskoe-obrazovanie-i-podgotovka-k-ege/" target="_blank">Официальная информация →</a></div>'+
  '<div class="card info-card"><h3>Творческие испытания</h3><p>Для дизайнерских направлений подготовка к ДВИ отображается отдельным этапом раньше основной программы.</p><a href="https://mospolytech.ru/podgotovitelnye-kursy-v-hudojestvennoy-shkole-poligraf/" target="_blank">Школа «Полиграф» →</a></div>'+
  '<div class="card info-card"><h3>Правила приёма</h3><p>Перечень испытаний и минимальные баллы всегда привязаны к году поступления.</p><a href="https://mospolytech.ru/postupayushchim/priem-v-universitet/pravila-priema/" target="_blank">Правила приёма →</a></div>';
}
function renderDPO(){
  $("#dpoContent").innerHTML='<div class="card info-card"><h3>Повышение квалификации</h3><p>Короткие программы под конкретный дефицит компетенций.</p></div>'+
  '<div class="card info-card"><h3>Профессиональная переподготовка</h3><p>Маршрут для смены или расширения специализации.</p></div>'+
  '<div class="card info-card"><h3>ДПО в карьерной карте</h3><p>ДПО предлагается только там, где оно усиливает выбранную роль.</p><a href="https://mospolytech.ru/povyshenie-kvalifikacii-i-professionalnaya-perepodgotovka/" target="_blank">Каталог ДПО →</a></div>';
}
function fillTrajectory(){
  const s=$("#trajectoryProfession"); if(!s) return;
  const cur=s.value;
  s.innerHTML=professions.map(function(p){return '<option value="'+p.slug+'">'+p.name+'</option>';}).join("");
  if(cur && professions.some(function(p){return p.slug===cur;})) s.value=cur;
  s.onchange=renderTrajectory;
  $("#trajectoryBranch").onchange=renderTrajectory;
}

function trajectoryBranchMeta(branch){
  const map={
    expert:{
      title:"Экспертная",
      subtitle:"Углубление в профессии",
      purpose:"Решать самые сложные профессиональные задачи самому и становиться носителем глубокой экспертизы.",
      education:"Магистратура — по необходимости. ДПО и сертификации — точечно под технологический дефицит.",
      outcome:"Сложное профессиональное решение",
      responsibility:"Качество решения и экспертная глубина",
      accent:"expert"
    },
    research:{
      title:"Исследовательская",
      subtitle:"R&D и создание нового",
      purpose:"Не только применять готовые подходы, а создавать и проверять новые методы, технологии и решения.",
      education:"Магистратура становится базовой частью маршрута; затем возможна аспирантура и работа в лаборатории/R&D.",
      outcome:"Новое знание, метод, прототип, публикация или R&D-результат",
      responsibility:"Методика, воспроизводимость и доказательность",
      accent:"research"
    },
    manager:{
      title:"Управленческая",
      subtitle:"Команда и направление",
      purpose:"Перейти от личного выполнения задач к ответственности за команду, проект, продукт или направление.",
      education:"Магистратура не обязательна. Важнее управленческое ДПО: проекты, экономика, команда, коммуникации.",
      outcome:"Результат команды, проекта или направления",
      responsibility:"Люди, сроки, бюджет и KPI",
      accent:"manager"
    }
  };
  return map[branch];
}
function branchEducation(branch,pr){
  if(branch==="research") return [
    ["research-project","Исследовательский проект","Работа с гипотезой, экспериментом, данными или прототипом."],
    ["gate","Вступительное испытание в магистратуру","Отдельная контрольная точка ДО магистратуры."],
    ["master",(pr&&pr.master_title)||"Профильная магистратура","Углублённые методы, research-практика, лаборатория."],
    ["lab","Лаборатория / R&D","Исследовательская роль, публикации, прототипы, индустриальные R&D-задачи."],
    ["phd","Аспирантура — опционально","Для академической и глубокой научно-исследовательской траектории."]
  ];
  if(branch==="manager") return [
    ["first-role","Первая профессиональная роль","Сначала нужна предметная база — управлять тем, чего не понимаешь, нельзя."],
    ["project","Ответственность за небольшой проект","Координация сроков, участников и результата."],
    ["dpo","ДПО: управление проектами и командой","Экономика проекта, коммуникации, планирование, управление рисками."],
    ["lead","Руководитель команды / продукта","Ответственность уже не только за свою задачу, но и за общий результат."],
    ["management-master","Магистратура — опционально","Может усиливать управленческий трек, но не является обязательной ступенью."]
  ];
  return [
    ["specialization","Профессиональная специализация","Углубление в инструменты и задачи выбранной профессии."],
    ["practice-deep","Сложные индустриальные проекты","Рост через портфолио, ответственность и сложность решаемых задач."],
    ["dpo","ДПО / сертификация — по необходимости","Закрывает конкретный дефицит компетенций, а не является обязательной ступенью."],
    ["expert-level","Экспертный уровень","Senior / Lead / Principal / главный специалист в своей предметной области."]
  ];
}
function roleTask(branch,index){
  if(branch==="research"){
    return [
      "Помогает в исследованиях, собирает данные, воспроизводит эксперименты.",
      "Формулирует гипотезы, проектирует эксперимент, создаёт прототипы.",
      "Ведёт самостоятельную R&D-задачу и отвечает за методическую корректность.",
      "Определяет исследовательскую программу и координирует R&D-команду."
    ][Math.min(index,3)];
  }
  if(branch==="manager"){
    return [
      "Сохраняет предметную роль и начинает брать ответственность за небольшой участок.",
      "Координирует команду или проект: сроки, зависимости, коммуникации.",
      "Отвечает за результат направления, ресурсы и развитие команды.",
      "Формирует стратегию, портфель инициатив и ключевые показатели."
    ][Math.min(index,3)];
  }
  return [
    "Осваивает профессиональные инструменты и работает под наставничеством.",
    "Самостоятельно решает типовые и часть сложных профессиональных задач.",
    "Берёт наиболее сложные задачи, определяет стандарты качества, наставляет коллег.",
    "Определяет архитектуру/подходы и выступает главным носителем экспертизы."
  ][Math.min(index,3)];
}
async function getTrajectory(slug,branch){
  let p=findProfession(slug),pr=findProgram(p&&p.program_slug),m=(p&&market[p.market_key])||{};
  let backendCareer=null;
  if(live){
    try{
      const d=await fetchJSON(API_BASE+"/api/trajectory/"+slug+"?branch="+branch);
      pr=d.program||pr; m=d.market||m; backendCareer=d.career||null;
    }catch(e){}
  }
  const creative=["graphic","industrial","ux"].includes(slug);
  const common=[
    {kind:"start",title:"Текущая ступень",subtitle:"9–11 класс / СПО / другое образование"},
    {kind:"prep",title:creative?"Подготовка к ЕГЭ и ДВИ":"Подготовка к ЕГЭ",subtitle:creative?"ЕГЭ + творческие испытания":"Курсы Московского Политеха"},
    {kind:"gate",title:"ЕГЭ / ДВИ",subtitle:(pr&&pr.exams)||"По правилам приёма соответствующего года"},
    {kind:"degree",title:pr?pr.code+" "+pr.title:"Основная программа",subtitle:pr?(pr.form||"")+" · "+(pr.duration||""):""},
    {kind:"practice",title:"Проекты, практика, стажировки",subtitle:"Общее образовательное ядро до карьерной развилки"}
  ];
  const fallbackCareer=((career[slug]||{})[branch]||[]);
  return {
    profession:p?p.name:"",
    slug:slug,
    program:pr,
    market:m,
    common:common,
    branchEducation:branchEducation(branch,pr),
    career:(backendCareer&&backendCareer.length?backendCareer:fallbackCareer),
    meta:trajectoryBranchMeta(branch)
  };
}
function branchSelectorCard(branch,data,chosen){
  const m=data.meta;
  const selected=branch===chosen?" selected":"";
  return '<button class="branch-choice '+m.accent+selected+'" onclick="document.querySelector(\'#trajectoryBranch\').value=\''+branch+'\';renderTrajectory()">'+
    '<span class="branch-choice-kicker">'+m.title+'</span>'+
    '<b>'+m.subtitle+'</b>'+
    '<small>'+m.purpose+'</small>'+
    '<span class="branch-choice-more">Показать маршрут →</span>'+
  '</button>';
}
function laneNodeHtml(node,branch,index){
  return '<div class="lane-node '+branch+'"><span class="lane-index">'+(index+1)+'</span><div><b>'+node[0]+'</b><small>'+node[1]+'</small><p>'+roleTask(branch,index)+'</p>'+(node[2]&&node[2]!=="—"?'<span class="salary">'+node[2]+'</span>':"")+'</div></div>';
}
async function renderTrajectory(){
  const s=$("#trajectoryProfession"); if(!s || !professions.length) return;
  const slug=s.value||professions[0].slug, chosen=$("#trajectoryBranch").value||"expert";
  const arr=await Promise.all(["expert","research","manager"].map(function(b){return getTrajectory(slug,b);}));
  const data={expert:arr[0],research:arr[1],manager:arr[2]}, base=data.expert, current=data[chosen];
  const mk=base.market||{},pr=base.program||{};
  const headline=mk.median_salary?"медиана "+fmt(mk.median_salary)+" ₽":mk.salary_min?fmt(mk.salary_min)+"–"+fmt(mk.salary_max)+" ₽":"датированный рынок";
  let html='<div class="trajectory-banner"><div><span class="eyebrow" style="color:#b9c7ea">КАРТА РАЗВИТИЯ</span><h2>'+base.profession+'</h2><p>'+(pr.code||"")+' '+(pr.title||"")+'</p></div><div class="market-badge"><span>Москва · рынок труда</span><b>'+headline+'</b><small>'+(mk.snapshot||fallback.meta.snapshot)+'</small></div></div>';

  html+='<div class="route-section-title"><div><b>1. Общий маршрут до развилки</b><span>Эти этапы нужны независимо от того, какой карьерный трек человек выберет дальше.</span></div></div>';
  html+='<div class="route-common">'+base.common.map(function(n,i){
    return '<div class="common-step '+n.kind+'"><span class="step">'+(i+1)+'</span><div><b>'+n.title+'</b><small>'+n.subtitle+'</small></div></div>';
  }).join("")+'</div>';

  html+='<div class="split-hub"><span class="split-line"></span><div class="split-point"><b>ТОЧКА РАЗВИЛКИ</b><small>После базовой профессиональной подготовки траектории начинают реально отличаться.</small></div><span class="split-line"></span></div>';

  html+='<div class="branch-choice-grid">'+branchSelectorCard("expert",data.expert,chosen)+branchSelectorCard("research",data.research,chosen)+branchSelectorCard("manager",data.manager,chosen)+'</div>';

  html+='<div class="branch-difference card"><div class="difference-head"><span class="branch-pill '+current.meta.accent+'">'+current.meta.title+'</span><div><h3>Что меняется в этой ветке</h3><p>'+current.meta.purpose+'</p></div></div><div class="difference-grid">'+
    '<div><span>Образование</span><b>'+current.meta.education+'</b></div>'+
    '<div><span>Главный результат</span><b>'+current.meta.outcome+'</b></div>'+
    '<div><span>Тип ответственности</span><b>'+current.meta.responsibility+'</b></div>'+
  '</div></div>';

  html+='<div class="route-section-title"><div><b>2. Дополнительные этапы именно этой ветки</b><span>Поэтому исследовательская, экспертная и управленческая траектории — не одно и то же.</span></div></div>';
  html+='<div class="branch-education-flow '+chosen+'">'+current.branchEducation.map(function(n,i){
    return '<div class="branch-edu-node '+n[0]+'"><span class="step">'+(i+1)+'</span><b>'+n[1]+'</b><small>'+n[2]+'</small></div>';
  }).join("")+'</div>';

  html+='<div class="route-section-title"><div><b>3. Должностная траектория — все три варианта рядом</b><span>Сравните, как меняется не только название должности, но и характер работы.</span></div></div>';
  html+='<div class="career-lanes">';
  ["expert","research","manager"].forEach(function(branch){
    const d=data[branch], active=branch===chosen?" active":"";
    html+='<section class="career-lane '+branch+active+'"><div class="lane-header"><span>'+d.meta.title+'</span><b>'+d.meta.subtitle+'</b><small>'+d.meta.outcome+'</small></div><div class="lane-track">'+
      (d.career.length?d.career.map(function(node,i){return laneNodeHtml(node,branch,i);}).join(""):'<div class="lane-empty">Нужно экспертное наполнение по конкретной профессии.</div>')+
    '</div></section>';
  });
  html+='</div>';

  html+='<div class="trajectory-note"><b>Как читать карту:</b> эксперт растёт за счёт глубины профессиональной задачи; исследователь — за счёт R&D, магистратуры и методической новизны; руководитель — за счёт перехода от личной задачи к ответственности за людей, ресурсы и результат направления.</div>';
  $("#trajectoryMap").innerHTML=html;
}

async function openProfession(slug){
  let p=findProfession(slug),pr=findProgram(p&&p.program_slug),m=findMarket(slug),rec=recommendations.find(function(x){return x.slug===slug;});
  if(live){try{const d=await fetchJSON(API_BASE+"/api/professions/"+slug);p=d.profession;pr=d.program;m=d.market;}catch(e){}}
  const factors=(rec&&rec.factors)||{};
  let factorHtml=Object.entries(factors).map(function(x){
    const label={interest:"Интересы",values:"Ценности",readiness:"Готовность",context:"Контекст",market:"Рынок"}[x[0]]||x[0];
    return '<div class="result-line"><span>'+label+'</span><div class="bar"><i style="width:'+x[1]+'%"></i></div><b>'+x[1]+'</b></div>';
  }).join("");
  $("#modalBody").innerHTML='<span class="tag">'+(p.sector||"")+'</span><h2>'+p.name+'</h2><p>'+(p.description||"")+'</p><div class="modal-grid">'+
  '<div class="modal-panel"><h4>Почему рекомендация</h4>'+factorHtml+'<p class="source">Индекс: '+((rec&&rec.score)||"—")+'/100. Не вероятность успеха.</p></div>'+
  '<div class="modal-panel"><h4>Рынок труда</h4><p><b>'+(m&&m.median_salary?rub(m.median_salary):m&&m.salary_min?rub(m.salary_min)+"–"+rub(m.salary_max):"н/д")+'</b></p><p class="source">'+((m&&m.geography)||"Москва")+' · '+((m&&m.snapshot)||fallback.meta.snapshot)+' · '+qualityText(m&&m.quality)+'</p></div>'+
  '<div class="modal-panel"><h4>Программа Московского Политеха</h4><p><b>'+((pr&&pr.code)||"")+' '+((pr&&pr.title)||"")+'</b></p><p class="source">'+((pr&&pr.form)||"")+' · '+((pr&&pr.duration)||"")+'</p>'+(pr&&pr.source_url?'<a class="source" href="'+pr.source_url+'" target="_blank">Официальная программа →</a>':"")+'</div>'+
  '<div class="modal-panel"><h4>Ключевые навыки</h4><div class="skills">'+(p.skills||[]).map(function(s){return '<span>'+s+'</span>';}).join("")+'</div></div></div>'+
  '<button class="btn btn-primary" style="margin-top:14px" onclick="closeModal();document.querySelector(\'#trajectoryProfession\').value=\''+slug+'\';showView(\'trajectory\');renderTrajectory()">Построить траекторию →</button>';
  $("#modal").classList.add("open");
}
window.openProfession=openProfession;
function closeModal(){ $("#modal").classList.remove("open"); }
window.closeModal=closeModal;
if(document.readyState==="loading") window.addEventListener("DOMContentLoaded",boot); else boot();