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
function renderAtlas(){
  const el=$("#atlasGrid"); if(!el) return;
  el.innerHTML=professions.map(function(p){
    return '<article class="content-card"><span class="tag">'+p.sector+'</span><h3>'+p.name+'</h3><p>'+(p.description||"")+'</p><div class="skills">'+(p.skills||[]).slice(0,6).map(function(s){return '<span>'+s+'</span>';}).join("")+'</div><p><button class="link-btn" onclick="openProfession(\''+p.slug+'\')">Профессия и маршрут →</button></p></article>';
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
async function getTrajectory(slug,branch){
  if(live){try{return await fetchJSON(API_BASE+"/api/trajectory/"+slug+"?branch="+branch);}catch(e){}}
  const p=findProfession(slug),pr=findProgram(p.program_slug),m=market[p.market_key]||{},creative=["graphic","industrial","ux"].includes(slug);
  return {profession:p.name,program:pr,market:m,education:[
    {kind:"start",title:"Текущая ступень",subtitle:"9–11 класс / СПО / другое образование"},
    {kind:"prep",title:creative?"Подготовка к ЕГЭ и ДВИ":"Подготовка к ЕГЭ",subtitle:"Курсы Московского Политеха"},
    {kind:"gate",title:"ЕГЭ / ДВИ",subtitle:(pr&&pr.exams)||"По правилам приёма"},
    {kind:"degree",title:pr?pr.code+" "+pr.title:"Основная программа",subtitle:pr?(pr.form||"")+" · "+(pr.duration||""):""},
    {kind:"practice",title:"Проекты и стажировки",subtitle:"Портфолио + индустриальный опыт"},
    {kind:"gate",title:"Вступительное испытание в магистратуру",subtitle:"Отдельный переход ДО магистратуры"},
    {kind:"master",title:(pr&&pr.master_title)||"Магистратура",subtitle:(pr&&pr.master_code)||""},
    {kind:"dpo",title:"ДПО",subtitle:"По дефицитам компетенций"}
  ],career:((career[slug]||{})[branch]||[])};
}
async function renderTrajectory(){
  const s=$("#trajectoryProfession"); if(!s || !professions.length) return;
  const slug=s.value||professions[0].slug, chosen=$("#trajectoryBranch").value;
  const data=await Promise.all(["expert","research","manager"].map(function(b){return getTrajectory(slug,b);}));
  const e=data[0],r=data[1],m=data[2],mk=e.market||{},pr=e.program||{};
  const headline=mk.median_salary?"медиана "+fmt(mk.median_salary)+" ₽":mk.salary_min?fmt(mk.salary_min)+"–"+fmt(mk.salary_max)+" ₽":"данные рынка";
  let html='<div class="trajectory-banner"><div><h2>'+e.profession+'</h2><p>'+(pr.code||"")+' '+(pr.title||"")+'</p></div><div class="market-badge"><span>Москва · рынок труда</span><b>'+headline+'</b><small>'+(mk.snapshot||fallback.meta.snapshot)+'</small></div></div>';
  html+='<div class="education-flow">'+e.education.map(function(n,i){return '<div class="edu-node '+n.kind+'"><span class="step">'+(i+1)+'</span><h4>'+n.title+'</h4><p>'+(n.subtitle||"")+'</p></div>';}).join("")+'</div>';
  html+='<div class="branch-label">После образовательного ядра маршрут расходится на три карьерные ветки</div><div class="branches">';
  [["expert","Экспертная","Глубина и специализация",e.career],["research","Исследовательская","R&D и создание нового",r.career],["manager","Управленческая","Команда и направление",m.career]].forEach(function(b){
    html+='<section class="branch '+b[0]+'" style="'+(chosen===b[0]?"outline:3px solid rgba(75,110,185,.15);outline-offset:2px":"")+'"><h3>'+b[1]+'</h3><p class="source">'+b[2]+'</p>';
    html+=(b[3].length?b[3].map(function(n){return '<div class="role"><b>'+n[0]+'</b><small>'+n[1]+'</small>'+(n[2]&&n[2]!=="—"?'<span class="salary">'+n[2]+'</span>':"")+'</div>';}).join(""):'<p class="source">Ветка требует экспертного наполнения.</p>')+'</section>';
  });
  $("#trajectoryMap").innerHTML=html+'</div>';
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