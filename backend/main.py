from pathlib import Path
from typing import Dict, List, Optional, Any
import json, math
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from .db import connect, rowdict, rows, DB

ROOT=Path(__file__).resolve().parents[1]

app=FastAPI(
    title="Professional Navigation MVP",
    version="3.0.0",
    description="Explainable professional navigation MVP for Moscow Polytechnic University"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://mp-digital-tools-ip.github.io",
        "http://127.0.0.1:8000",
        "http://localhost:8000",
    ],
    allow_credentials=False,
    allow_methods=["GET","POST","OPTIONS"],
    allow_headers=["*"],
)

R_KEYS=["R","I","A","S","E","C"]
VALUE_KEYS=["achievement","conditions","recognition","relationships","support","independence"]
SUBJECT_KEYS=["math","physics","it","russian","literature","art"]

class Profile(BaseModel):
    riasec: Dict[str,float]=Field(default_factory=lambda:{k:50 for k in R_KEYS})
    values: Dict[str,float]=Field(default_factory=lambda:{k:50 for k in VALUE_KEYS})
    readiness: Dict[str,float]=Field(default_factory=lambda:{k:60 for k in SUBJECT_KEYS})
    context: Dict[str,Any]=Field(default_factory=lambda:{"work_mode":"hybrid","team":"mixed"})
    top_n: int=10

class MatchPatch(BaseModel):
    status: str
    actor: str="methodist-demo"

def clamp(x,a=0,b=100):
    return max(a,min(b,x))

def avg(xs):
    xs=list(xs)
    return sum(xs)/len(xs) if xs else 0

def similarity(a,b,keys):
    return clamp(100-avg(abs(float(a.get(k,50))-float(b.get(k,50))) for k in keys))

def profession_bundle(slug):
    con=connect()
    p=con.execute("SELECT * FROM professions WHERE slug=?",(slug,)).fetchone()
    if not p:
        con.close()
        return None
    p=rowdict(p)
    program=rowdict(con.execute("SELECT * FROM programs WHERE slug=?",(p["program_slug"],)).fetchone())
    market=rowdict(con.execute("SELECT * FROM market_snapshots WHERE profession_slug=? ORDER BY id DESC LIMIT 1",(slug,)).fetchone())
    match=rowdict(con.execute("SELECT * FROM matches WHERE profession_slug=? AND program_slug=?",(slug,p["program_slug"])).fetchone())
    paths=rows(con.execute("SELECT * FROM career_paths WHERE profession_slug=? ORDER BY branch",(slug,)))
    con.close()
    return {"profession":p,"program":program,"market":market,"match":match,"career_paths":paths}

@app.get("/api/health")
def health():
    return {"status":"ok","version":"3.0.0","database":DB.exists()}

@app.get("/api/sources")
def get_sources():
    con=connect()
    result=rows(con.execute("SELECT * FROM sources ORDER BY type,name"))
    con.close()
    return result

@app.get("/api/programs")
def get_programs():
    con=connect()
    result=rows(con.execute("SELECT * FROM programs ORDER BY level,title"))
    con.close()
    return result

@app.get("/api/programs/{slug}")
def get_program(slug:str):
    con=connect()
    r=con.execute("SELECT * FROM programs WHERE slug=?",(slug,)).fetchone()
    con.close()
    if not r:
        raise HTTPException(404,"Program not found")
    return rowdict(r)

@app.get("/api/professions")
def get_professions():
    con=connect()
    result=rows(con.execute("""
       SELECT p.*, m.median_salary, m.salary_min, m.salary_max, m.vacancies_total, m.snapshot, m.quality,
              mt.status AS match_status, mt.score AS match_score
       FROM professions p
       LEFT JOIN market_snapshots m ON m.profession_slug=p.slug
       LEFT JOIN matches mt ON mt.profession_slug=p.slug AND mt.program_slug=p.program_slug
       ORDER BY p.name
    """))
    con.close()
    return result

@app.get("/api/professions/{slug}")
def get_profession(slug:str):
    data=profession_bundle(slug)
    if not data:
        raise HTTPException(404,"Profession not found")
    return data

@app.get("/api/market/{slug}")
def get_market(slug:str):
    con=connect()
    r=con.execute("SELECT * FROM market_snapshots WHERE profession_slug=? ORDER BY id DESC LIMIT 1",(slug,)).fetchone()
    con.close()
    if not r:
        raise HTTPException(404,"Market snapshot not found")
    return rowdict(r)

@app.get("/api/matches")
def get_matches():
    con=connect()
    result=rows(con.execute("""
      SELECT mt.*, p.name AS profession_name, pr.code AS program_code, pr.title AS program_title
      FROM matches mt
      JOIN professions p ON p.slug=mt.profession_slug
      JOIN programs pr ON pr.slug=mt.program_slug
      ORDER BY p.name
    """))
    con.close()
    return result

@app.patch("/api/matches/{match_id}")
def patch_match(match_id:int, payload:MatchPatch):
    if payload.status not in {"approved","review","rejected"}:
        raise HTTPException(400,"status must be approved, review or rejected")
    con=connect()
    row=con.execute("SELECT * FROM matches WHERE id=?",(match_id,)).fetchone()
    if not row:
        con.close()
        raise HTTPException(404,"Match not found")
    con.execute("UPDATE matches SET status=? WHERE id=?",(payload.status,match_id))
    con.execute(
        "INSERT INTO audit_log(actor,action,entity_type,entity_key,payload_json) VALUES(?,?,?,?,?)",
        (payload.actor,"match_status_change","match",str(match_id),json.dumps({"status":payload.status},ensure_ascii=False))
    )
    con.commit()
    updated=rowdict(con.execute("SELECT * FROM matches WHERE id=?",(match_id,)).fetchone())
    con.close()
    return updated

@app.get("/api/audit")
def get_audit(limit:int=50):
    con=connect()
    result=rows(con.execute("SELECT * FROM audit_log ORDER BY id DESC LIMIT ?",(max(1,min(limit,200)),)))
    con.close()
    return result

@app.post("/api/recommendations")
def recommendations(profile:Profile):
    con=connect()
    profs=rows(con.execute("SELECT * FROM professions"))
    markets={x["profession_slug"]:x for x in rows(con.execute("SELECT * FROM market_snapshots"))}
    matches={x["profession_slug"]:x for x in rows(con.execute("SELECT * FROM matches"))}
    con.close()
    out=[]
    for p in profs:
        interest=similarity(profile.riasec,p["riasec"],R_KEYS)
        values=similarity(profile.values,p["values"],VALUE_KEYS)
        required=p["subjects"]
        readiness=avg(profile.readiness.get(s,60) for s in required)
        context=75
        market=markets.get(p["slug"],{})
        vacancies=market.get("vacancies_total") or 0
        median=market.get("median_salary") or 0
        market_score=clamp(35 + min(vacancies,300)/300*35 + min(median,150000)/150000*30)
        total=round(.40*interest+.20*values+.15*readiness+.15*context+.10*market_score)
        confidence="high" if market.get("quality")=="career" else "medium" if market.get("quality") in {"dated","sample"} else "low"
        out.append({
            "slug":p["slug"],"name":p["name"],"sector":p["sector"],"score":total,
            "factors":{
                "interest":round(interest),"values":round(values),"readiness":round(readiness),
                "context":round(context),"market":round(market_score)
            },
            "program_slug":p["program_slug"],
            "match_status":matches.get(p["slug"],{}).get("status","review"),
            "market_confidence":confidence
        })
    out.sort(key=lambda x:x["score"],reverse=True)
    return {"method_version":"3.0-demo","formula":"40% interests + 20% values + 15% readiness + 15% context + 10% market","results":out[:max(1,min(profile.top_n,10))]}

@app.get("/api/trajectory/{slug}")
def trajectory(slug:str, branch:str="expert"):
    if branch not in {"expert","research","manager"}:
        raise HTTPException(400,"branch must be expert, research or manager")
    data=profession_bundle(slug)
    if not data:
        raise HTTPException(404,"Profession not found")
    p=data["profession"]; pr=data["program"]; market=data["market"]
    con=connect()
    path=rowdict(con.execute("SELECT * FROM career_paths WHERE profession_slug=? AND branch=?",(slug,branch)).fetchone())
    con.close()
    creative=slug in {"graphic","industrial","ux"}
    prep_title="Подготовка к ЕГЭ и творческим испытаниям" if creative else "Подготовка к ЕГЭ / внутренним испытаниям"
    prep_url="https://mospolytech.ru/podgotovitelnye-kursy-v-hudojestvennoy-shkole-poligraf/" if creative else "https://mospolytech.ru/dovuzovskoe-obrazovanie-i-podgotovka-k-ege/"
    education=[
        {"kind":"start","title":"Текущая ступень","subtitle":"Школа / СПО / другое образование","meta":"Исходные экзамены, ограничения, мобильность"},
        {"kind":"prep","title":prep_title,"subtitle":"Подготовительный контур Московского Политеха","meta":"До поступления","url":prep_url},
        {"kind":"gate","title":"ЕГЭ / ДВИ / внутренние испытания","subtitle":pr["exams"],"meta":"Контрольная точка до программы"},
        {"kind":"degree","title":f'{pr["code"]} {pr["title"]}',"subtitle":f'{pr["form"]} · {pr["duration"]}',"meta":f'Бюджет: {pr["budget_places"] if pr["budget_places"] is not None else "н/д"} · стоимость: {pr["cost_rub"] if pr["cost_rub"] is not None else "н/д"} ₽/год',"url":pr["source_url"]},
        {"kind":"practice","title":"Проекты, практики, стажировки","subtitle":"Связаны с целевой должностью","meta":"Портфолио + индустриальный опыт"},
        {"kind":"gate","title":"Вступительное испытание в магистратуру","subtitle":"Отдельный переход ДО магистратуры","meta":"Тип экзамена — из правил приёма соответствующего года"},
        {"kind":"master","title":f'{pr["master_code"] or ""} {pr["master_title"] or "Магистратура по профилю"}'.strip(),"subtitle":"Не обязательна для каждой роли","meta":"Добавляется, если усиливает выбранную ветку","url":pr.get("master_url")},
        {"kind":"dpo","title":"ДПО / повышение квалификации","subtitle":"Точечное закрытие дефицитов компетенций","meta":"Не универсальный обязательный шаг","url":"https://mospolytech.ru/povyshenie-kvalifikacii-i-professionalnaya-perepodgotovka/"}
    ]
    return {
        "profession":p["name"],"slug":slug,"branch":branch,
        "program":pr,"market":market,
        "education":education,
        "career":path["nodes"] if path else [],
        "salary_note":"* Зарплатные данные показаны как датированные рыночные ориентиры из источника и не являются гарантией дохода."
    }

@app.get("/")
def root_status():
    return {"service":"Professional Navigation API","status":"ok","docs":"/docs"}
