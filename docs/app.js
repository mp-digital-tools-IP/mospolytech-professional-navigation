const FALLBACK_URL="./fallback-data.json";
const API_BASE=(window.PROFNAV_API_BASE||"").replace(/\/$/,"");
let fallback=null, live=false;
let professions=[], programs=[], market={}, career={}, recommendations=[];
const demoProfile={
  riasec:{R:52,I:82,A:68,S:61,E:47,C:56},
  values:{achievement:82,conditions:65,recognition:62,relationships:66,support:55,independence:80},
  readiness:{math:82,physics:68,it:87,russian:76,literature:62,art:70},
  context:{work_mode:"hybrid",team:"mixed"},top_n:10
};
const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
const fmt=n=>n==null?"н/д":new Intl.NumberFormat("ru-RU").format(n);
const rub=n=>n==null?"н/д":fmt(n)+" ₽";

async function fetchJSON(url,opts={}){
  const r=await fetch(url,{headers:{"Content-Type":"application/json"},...opts});
  if(!r.ok)throw new Error(await r.text());
  return r.json();
}
async function boot(){
  fallback=await fetchJSON(FALLBACK_URL);
  hydrateFallback();
  await tryLive();
  bindNavigation();
  renderAll();
}
function hydrateFallback(){
  professions=fallback.professions||[];
  programs=fallback.programs||[];
  market=fallback.market||{};
  career=fallback.career||{};
  recommendations=rankFallback();
}
async function tryLive(){
  live=false;
  if(API_BASE){
    try{
      const h=await fetchJSON(API_BASE+"/api/health");
      if(h.status==="ok"){
        const [p,pr,recs]=await Promise.all([
          fetchJSON(API_BASE+"/api/professions"),
          fetchJSON(API_BASE+"/api/programs"),
          fetchJSON(API_BASE+"/api/recommendations",{method:"POST",body:JSON.stringify(demoProfile)})
        ]);
        professions=p;programs=pr;recommendations=recs.results||[];live=true;
      }
    }catch(e){console.warn("Live API unavailable",e)}
  }
  $("#serverBanner").classList.toggle("hidden",live);
}
async function retryServer(){await tryLive();renderAll()}
function bindNavigation(){
  $$("#sideNav button").forEach(b=>b.onclick=()=>showView(b.dataset.view));
}
function showView(id){
  $$(".view").forEach(v=>v.classList.toggle("active",v.id===id));
  $$("#sideNav button").forEach(b=>b.classList.toggle("active",b.dataset.view===id));
  if(id==="recommendations")renderRankingFull();
  if(id==="atlas")renderAtlas();
  if(id==="programs")renderPrograms();
  if(id==="trajectory")renderTrajectory();
  if(id==="market")renderMarket();
  window.scrollTo({top:0,behavior:"smooth"});
}
window.showView=showView;window.retryServer=retryServer;

function similarity(a,b,keys){return Math.max(0,100-keys.reduce((s,k)=>s+Math.abs((a[k]??50)-(b[k]??50)),0)/keys.length)}
function avg(a){return a.length?a.reduce((x,y)=>x+y,0)/a.length:0}
function rankFallback(){
  const R=["R","I","A","S","E","C"],V=["achievement","conditions","recognition","relationships","support","independence"];
  return professions.map(p=>{
    const i=similarity(demoProfile.riasec,p.riasec||{},R);
    const v=similarity(demoProfile.values,p.values||{},V);
    const readiness=avg((p.subjects||[]).map(s=>demoProfile.readiness[s]||60));
    const mk=market[p.market_key]||{};
    const marketScore=Math.min(100,35+Math.min(mk.vacancies_total||0,300)/300*35+Math.min(mk.median_salary||0,150000)/150000*30);
    const score=Math.round(.40*i+.20*v+.15*readiness+.15*75+.10*marketScore);
    return {slug:p.slug,name:p.name,sector:p.sector,score,factors:{interest:Math.round(i),values:Math.round(v),readiness:Math.round(readiness),context:75,market:Math.round(marketScore)},program_slug:p.program_slug,market_confidence:mk.quality||"snapshot"}
  }).sort((a,b)=>b.score-a.score).slice(0,10);
}
function findProfession(slug){return professions.find(p=>p.slug===slug)}
function findProgram(slug){return programs.find(p=>p.slug===slug)}
function findMarket(slug){
  if(live){
    const p=findProfession(slug);return p?{median_salary:p.median_salary,salary_min:p.salary_min,salary_max:p.salary_max,vacancies_total:p.vacancies_total,snapshot:p.snapshot,quality:p.quality}:null
  }
  const p=findProfession(slug);return p?market[p.market_key]:null
}
function renderAll(){
  renderTopMini();renderEvents();renderDiagnostics();renderResults();renderMethod();renderPrep();renderDPO();renderRankingFull();renderAtlas();renderPrograms();renderMarket();fillTrajectory();renderTrajectory();
}
function renderTopMini(){
  $("#topMini").innerHTML=recommendations.slice(0,6).map((r,i)=>`<div class="mini-rank"><span class="n">${i+1}</span><span>${r.name}</span><div class="smallbar"><i style="width:${r.score}%"></i></div><span class="score">${r.score}%</span><button class="more" onclick="openProfession('${r.slug}')">Подробнее</button></div>`).join("");
}
function renderEvents(){
  $("#eventsList").innerHTML=(fallback.events||[]).map(e=>`<a class="event-item" href="${e.url}" target="_blank" rel="noopener"><div class="event-date">${e.date.split(" ")[0]}<small>${e.date.split(" ").slice(1).join(" ")}</small></div><div><b>${e.title}</b><p>${e.format}</p></div></a>`).join("");
}
function renderDiagnostics(){
  const items=[["01","Интересы","RIASEC — виды деятельности, которые действительно привлекают."],["02","Ценности","Что важно в будущей работе и профессиональной среде."],["03","Учебная готовность","Предметы, ЕГЭ/ДВИ и текущая ступень образования."],["04","Ограничения","Бюджет, форма, регион, переезд, общежитие."],["05","Рабочие предпочтения","Формат работы, командность, степень самостоятельности."]];
  $("#diagnosticContent").innerHTML=`<div class="diag-grid">${items.map(x=>`<div class="diag-card"><span>${x[0]}</span><b>${x[1]}</b><p>${x[2]}</p></div>`).join("")}</div><p class="source" style="margin-top:14px">В MVP это архитектура методики. Психометрический блок должен пройти отдельную русскоязычную валидацию до промышленного использования.</p>`;
}
function resultBars(obj,labels){return Object.entries(obj).map(([k,v])=>`<div class="result-line"><span>${labels[k]||k}</span><div class="bar"><i style="width:${v}%"></i></div><b>${v}</b></div>`).join("")}
function renderResults(){
  const rlabels={R:"Практический",I:"Исследовательский",A:"Творческий",S:"Социальный",E:"Предпринимательский",C:"Системный"};
  const vlabels={achievement:"Достижения",conditions:"Условия",recognition:"Признание",relationships:"Отношения",support:"Поддержка",independence:"Независимость"};
  $("#resultsContent").innerHTML=`<div class="results-bars"><div><h3>Профессиональные интересы</h3>${resultBars(demoProfile.riasec,rlabels)}</div><div><h3>Рабочие ценности</h3>${resultBars(demoProfile.values,vlabels)}</div></div>`;
}
function renderMethod(){
  $("#methodContent").innerHTML=`<div class="method-formula">Score = 0.40 × InterestFit + 0.20 × ValueFit + 0.15 × Readiness + 0.15 × ContextFit + 0.10 × MarketScore</div>
  <div class="method-columns">
  ${[["40%","Интересы"],["20%","Ценности"],["15%","Учебная готовность"],["15%","Контекст"],["10%","Рынок труда"]].map(x=>`<div class="method-weight"><b>${x[0]}</b><span>${x[1]}</span></div>`).join("")}</div>
  <p class="source" style="margin-top:14px">Итоговый балл — индекс для ранжирования вариантов, а не вероятность успеха, профпригодность или психологический диагноз.</p>`;
}
function renderRankingFull(){
  $("#rankingFull").innerHTML=recommendations.map((r,i)=>`<div class="full-rank"><span class="n">${i+1}</span><div><b>${r.name}</b><br><small>${r.sector||""}</small></div><div class="smallbar"><i style="width:${r.score}%"></i></div><b>${r.score}</b><button onclick="openProfession('${r.slug}')">Почему?</button></div>`).join("");
}
function renderAtlas(){
  $("#atlasGrid").innerHTML=professions.map(p=>`<article class="content-card"><span class="tag">${p.sector}</span><h3>${p.name}</h3><p>${p.description||""}</p><div class="skill-list">${(p.skills||[]).slice(0,6).map(s=>`<span>${s}</span>`).join("")}</div><button class="card-link" onclick="openProfession('${p.slug}')">Профессия и маршрут →</button></article>`).join("");
}
function renderPrograms(){
  $("#programGrid").innerHTML=programs.map(p=>`<article class="content-card"><span class="tag">${p.code}</span><h3>${p.title}</h3><p>${p.faculty||""}</p><div class="kpis"><div class="kpi"><b>${p.budget_places??"н/д"}</b><span>бюджет</span></div><div class="kpi"><b>${p.passing_score??"н/д"}</b><span>проходной ${p.passing_score_year||""}</span></div><div class="kpi"><b>${p.cost_rub?fmt(Math.round(p.cost_rub/1000))+" тыс.":"н/д"}</b><span>₽/год</span></div></div><p class="source"><a href="${p.source_url}" target="_blank">Официальная страница ↗</a></p></article>`).join("");
}
function qualityText(q){return q==="career"?"hh Карьера":q==="low_sample"?"низкая выборка":q==="dated"?"датированный срез":q==="sample"?"выборка":"snapshot"}
async function renderMarket(){
  let items=[];
  if(live){
    for(const p of professions){
      try{items.push({p,m:await fetchJSON(API_BASE+"/api/market/"+p.slug)})}catch(e){}
    }
  }else items=professions.map(p=>({p,m:market[p.market_key]||{}}));
  $("#marketGrid").innerHTML=items.map(({p,m})=>`<article class="content-card"><span class="tag">${m.geography||"Москва"}</span><h3>${p.name}</h3><div class="kpis"><div class="kpi"><b>${m.median_salary?fmt(Math.round(m.median_salary/1000))+" тыс.":"—"}</b><span>медиана</span></div><div class="kpi"><b>${m.vacancies_total??"—"}</b><span>вакансий</span></div><div class="kpi"><b>${m.salary_min?fmt(Math.round(m.salary_min/1000))+"–"+fmt(Math.round(m.salary_max/1000)):"—"}</b><span>тыс. ₽, вилка</span></div></div><p>${m.note||""}</p><p class="source">${m.snapshot||""} · ${qualityText(m.quality)} ${m.source_url?`· <a href="${m.source_url}" target="_blank">источник ↗</a>`:""}</p></article>`).join("");
}
function renderPrep(){
  $("#prepContent").innerHTML=`<div class="prep-grid">
  <div class="info-tile"><h3>Подготовка к ЕГЭ</h3><p>Математика, информатика и ИКТ, физика, русский язык и другие предметы. На официальном сайте набор на курсы в 2026 году указан до 15 октября.</p><a href="https://mospolytech.ru/postupayushchim/" target="_blank">Официальная информация ↗</a></div>
  <div class="info-tile"><h3>Творческие испытания</h3><p>Для творческих программ подготовка и сами ДВИ должны отображаться до поступления отдельными этапами маршрута.</p><a href="https://mospolytech.ru/podgotovitelnye-kursy-v-hudojestvennoy-shkole-poligraf/" target="_blank">Школа «Полиграф» ↗</a></div>
  <div class="info-tile"><h3>Правила приёма</h3><p>Перечень испытаний и минимальные баллы берутся из официальных правил соответствующего года.</p><a href="https://mospolytech.ru/postupayushchim/priem-v-universitet/pravila-priema/" target="_blank">Правила приёма ↗</a></div></div>`;
}
function renderDPO(){
  $("#dpoContent").innerHTML=`<div class="dpo-grid"><div class="info-tile"><h3>Повышение квалификации</h3><p>Короткие программы для точечного закрытия дефицитов компетенций.</p></div><div class="info-tile"><h3>Профессиональная переподготовка</h3><p>Отдельный маршрут для смены или расширения профессиональной специализации.</p></div><div class="info-tile"><h3>Встраивание в карьерный граф</h3><p>ДПО добавляется не автоматически: сервис связывает его с конкретной ролью и дефицитом навыков.</p><a href="https://mospolytech.ru/povyshenie-kvalifikacii-i-professionalnaya-perepodgotovka/" target="_blank">Каталог ДПО ↗</a></div></div>`;
}
function fillTrajectory(){
  const s=$("#trajectoryProfession");if(!s)return;
  const current=s.value;s.innerHTML=professions.map(p=>`<option value="${p.slug}">${p.name}</option>`).join("");if(current&&professions.some(p=>p.slug===current))s.value=current;
  s.onchange=renderTrajectory;$("#trajectoryBranch").onchange=renderTrajectory;
}
async function getTrajectory(slug,branch){
  if(live){
    try{return await fetchJSON(API_BASE+`/api/trajectory/${slug}?branch=${branch}`)}catch(e){}
  }
  const p=findProfession(slug),pr=findProgram(p.program_slug),m=market[p.market_key]||{};
  const creative=["graphic","industrial","ux"].includes(slug);
  const education=[
    {kind:"start",title:"Текущая ступень",subtitle:"9–11 класс / СПО / другое образование"},
    {kind:"prep",title:creative?"Подготовка к ЕГЭ и ДВИ":"Подготовка к ЕГЭ",subtitle:creative?"Курсы + творческие испытания":"Курсы Московского Политеха"},
    {kind:"gate",title:"ЕГЭ / ДВИ",subtitle:pr?.exams||"По правилам приёма"},
    {kind:"degree",title:pr?`${pr.code} ${pr.title}`:"Основная программа",subtitle:pr?`${pr.form||""} · ${pr.duration||""}`:""},
    {kind:"practice",title:"Проекты и стажировки",subtitle:"Портфолио + индустриальный опыт"},
    {kind:"gate",title:"Экзамен в магистратуру",subtitle:"Отдельный переход ДО магистратуры"},
    {kind:"master",title:pr?.master_title||"Магистратура",subtitle:pr?.master_code||""},
    {kind:"dpo",title:"ДПО",subtitle:"По дефицитам компетенций"}
  ];
  return {profession:p.name,program:pr,market:m,education,career:(career[slug]||{})[branch]||[],salary_note:"Зарплатные данные — датированные рыночные ориентиры из указанного источника."};
}
async function renderTrajectory(){
  const slug=$("#trajectoryProfession").value||professions[0]?.slug;if(!slug)return;
  const [e,r,m]=await Promise.all(["expert","research","manager"].map(b=>getTrajectory(slug,b)));
  const selected=$("#trajectoryBranch").value;
  const mk=e.market||{},pr=e.program||{};
  const headline=mk.median_salary?`медиана ${fmt(mk.median_salary)} ₽`:mk.salary_min?`${fmt(mk.salary_min)}–${fmt(mk.salary_max)} ₽`:"данные рынка";
  $("#trajectoryMap").innerHTML=`<div class="trajectory-banner"><div><h2>${e.profession}</h2><p>${pr.code||""} ${pr.title||""}</p></div><div class="trajectory-market"><span>Москва · рынок труда</span><b>${headline}</b><small>${mk.snapshot||fallback.meta.snapshot}</small></div></div>
  <div class="education-ribbon">${e.education.map((n,i)=>`<div class="edu-node ${n.kind}"><span class="step">${i+1}</span><h4>${n.title}</h4><p>${n.subtitle||""}</p><p>${n.meta||""}</p></div>`).join("")}</div>
  <div class="branch-label">После образовательного ядра маршрут расходится на три карьерные ветки</div>
  <div class="branches">${[
    ["expert","Экспертная","Глубина и специализация",e.career],
    ["research","Исследовательская","R&D и создание нового",r.career],
    ["manager","Управленческая","Команда и направление",m.career]
  ].map(([key,title,sub,nodes])=>`<section class="branch ${key}" style="${selected===key?'outline:3px solid rgba(47,111,237,.14);outline-offset:2px':''}"><h3>${title}</h3><p class="source">${sub}</p>${nodes.map(n=>`<div class="role"><b>${n[0]}</b><small>${n[1]}</small>${n[2]&&n[2]!=="—"?`<span class="salary">${n[2]}</span>`:""}</div>`).join("")}</section>`).join("")}</div>
  <p class="source" style="margin-top:10px">${e.salary_note||""} ${mk.source_url?`<a href="${mk.source_url}" target="_blank">Источник ↗</a>`:""}</p>`;
}
async function openProfession(slug){
  let p=findProfession(slug),pr=findProgram(p?.program_slug),m=findMarket(slug),rec=recommendations.find(x=>x.slug===slug);
  if(live){
    try{
      const d=await fetchJSON(API_BASE+"/api/professions/"+slug);p=d.profession;pr=d.program;m=d.market;
    }catch(e){}
  }
  $("#modalBody").innerHTML=`<span class="tag">${p.sector||""}</span><h2>${p.name}</h2><p>${p.description||""}</p><div class="modal-grid">
    <div class="modal-panel"><h4>Почему рекомендация</h4>${Object.entries(rec?.factors||{}).map(([k,v])=>`<div class="result-line"><span>${({interest:"Интересы",values:"Ценности",readiness:"Готовность",context:"Контекст",market:"Рынок"})[k]||k}</span><div class="bar"><i style="width:${v}%"></i></div><b>${v}</b></div>`).join("")}<p class="source">Итоговый индекс: ${rec?.score??"—"}/100.</p></div>
    <div class="modal-panel"><h4>Рынок труда</h4><p><b>${m?.median_salary?rub(m.median_salary):m?.salary_min?`${rub(m.salary_min)}–${rub(m.salary_max)}`:"н/д"}</b></p><p class="source">${m?.geography||"Москва"} · ${m?.snapshot||fallback.meta.snapshot} · ${qualityText(m?.quality)}</p></div>
    <div class="modal-panel"><h4>Программа Московского Политеха</h4><p><b>${pr?.code||""} ${pr?.title||""}</b></p><p class="source">${pr?.form||""} · ${pr?.duration||""}</p>${pr?.source_url?`<a class="source" href="${pr.source_url}" target="_blank">Официальная программа ↗</a>`:""}</div>
    <div class="modal-panel"><h4>Ключевые навыки</h4><div class="skill-list">${(p.skills||[]).map(s=>`<span>${s}</span>`).join("")}</div></div>
  </div><button class="primary" style="margin-top:14px" onclick="closeModal();document.querySelector('#trajectoryProfession').value='${slug}';showView('trajectory');renderTrajectory()">Построить траекторию →</button>`;
  $("#modal").classList.add("open");
}
window.openProfession=openProfession;
function closeModal(){$("#modal").classList.remove("open")}window.closeModal=closeModal;
boot();
