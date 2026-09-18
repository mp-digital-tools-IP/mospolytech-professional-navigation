const API_BASE=(window.PROFNAV_API_BASE||"").replace(/\/$/,"");
const FALLBACK_URL="./fallback-data.json";
const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
const fmt=n=>n==null?"н/д":new Intl.NumberFormat("ru-RU").format(n);
const rub=n=>n==null?"н/д":fmt(n)+" ₽";
let fallback=null,live=false,professions=[],programs=[],market={},career={},recommendations=[];
const riaLabels={R:"Практический",I:"Исследовательский",A:"Творческий",S:"Социальный",E:"Предпринимательский",C:"Системный"};
const valueLabels={achievement:"Достижения",conditions:"Условия",recognition:"Признание",relationships:"Отношения",support:"Поддержка",independence:"Независимость"};
const subjectLabels={math:"Математика",physics:"Физика",it:"Информатика",russian:"Русский язык",literature:"Литература",art:"Рисунок / композиция"};
async function fetchJSON(url,opts={}){const r=await fetch(url,{headers:{"Content-Type":"application/json"},...opts});if(!r.ok)throw new Error(await r.text());return r.json()}
function hydrateFallback(){professions=fallback.professions||[];programs=fallback.programs||[];market=fallback.market||{};career=fallback.career||{}}
async function tryLive(){
  live=false;
  if(API_BASE){
    try{
      const h=await fetchJSON(API_BASE+"/api/health");
      if(h.status==="ok"){
        [professions,programs]=await Promise.all([
          fetchJSON(API_BASE+"/api/professions"),
          fetchJSON(API_BASE+"/api/programs")
        ]);
        live=true;
      }
    }catch(e){
      console.warn("Live API unavailable; using bundled snapshot.",e);
    }
  }
}
async function retryServer(){await tryLive();await refreshRecommendations();renderEverything()}window.retryServer=retryServer;
function bindNavigation(){$$("#nav button").forEach(b=>b.onclick=()=>showView(b.dataset.view))}
function showView(id){$$(".view").forEach(v=>v.classList.toggle("active",v.id===id));$$("#nav button").forEach(b=>b.classList.toggle("active",b.dataset.view===id));if(id==="diagnostics")renderWizard();if(id==="results")renderResults();if(id==="recommendations")renderRecommendationsFull();if(id==="trajectory")renderTrajectory();if(id==="market")renderMarket();scrollTo({top:0,behavior:"smooth"})}window.showView=showView;
function avg(a){return a.length?a.reduce((x,y)=>x+y,0)/a.length:0}function sim(a,b,keys){return Math.max(0,100-avg(keys.map(k=>Math.abs((a[k]??50)-(b[k]??50)))))}
function fallbackRank(profile){const rk=Object.keys(riaLabels),vk=Object.keys(valueLabels);return professions.map(p=>{const i=sim(profile.riasec,p.riasec||{},rk),v=sim(profile.values,p.values||{},vk),rd=avg((p.subjects||[]).map(s=>profile.readiness[s]||60)),mk=market[p.market_key]||{},ms=Math.min(100,35+Math.min(mk.vacancies_total||0,300)/300*35+Math.min(mk.median_salary||0,150000)/150000*30),score=Math.round(.4*i+.2*v+.15*rd+.15*75+.1*ms);return {slug:p.slug,name:p.name,sector:p.sector,score,factors:{interest:Math.round(i),values:Math.round(v),readiness:Math.round(rd),context:75,market:Math.round(ms)},program_slug:p.program_slug,market_confidence:mk.quality||"snapshot"}}).sort((a,b)=>b.score-a.score).slice(0,10)}
async function refreshRecommendations(){const profile=computeProfile();if(live){try{const r=await fetchJSON(API_BASE+"/api/recommendations",{method:"POST",body:JSON.stringify(profile)});recommendations=r.results||[];return}catch(e){}}recommendations=fallbackRank(profile)}
function findProfession(slug){return professions.find(p=>p.slug===slug)}function findProgram(slug){return programs.find(p=>p.slug===slug)}function findMarket(slug){const p=findProfession(slug);if(!p)return null;if(live&&p.median_salary!==undefined)return {median_salary:p.median_salary,salary_min:p.salary_min,salary_max:p.salary_max,vacancies_total:p.vacancies_total,snapshot:p.snapshot,quality:p.quality};return market[p.market_key]||null}
function qualityText(q){return q==="career"?"hh Карьера":q==="low_sample"?"низкая выборка":q==="dated"?"датированный срез":q==="sample"?"выборка":"snapshot"}
async function boot(){fallback=await fetchJSON(FALLBACK_URL);hydrateFallback();await tryLive();bindNavigation();renderWizard();await refreshRecommendations();renderEverything();fillTrajectory()}