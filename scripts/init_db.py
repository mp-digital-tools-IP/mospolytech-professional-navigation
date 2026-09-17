from pathlib import Path
import sqlite3, json

ROOT=Path(__file__).resolve().parents[1]
DB=ROOT/"data"/"profnav.db"
SEED=ROOT/"docs"/"fallback-data.json"
SCHEMA=ROOT/"backend"/"schema.sql"

def dumps(x):
    return json.dumps(x,ensure_ascii=False)

def init():
    data=json.loads(SEED.read_text(encoding="utf-8"))
    retrieved_at=data.get("meta",{}).get("snapshot","2026-09-18").replace(".","-")
    DB.parent.mkdir(exist_ok=True)
    if DB.exists():
        DB.unlink()
    con=sqlite3.connect(DB)
    con.executescript(SCHEMA.read_text(encoding="utf-8"))
    cur=con.cursor()

    for s in data.get("sources",[]):
        cur.execute(
            "INSERT INTO sources(key,name,type,url,retrieved_at,notes) VALUES(?,?,?,?,?,?)",
            (s["key"],s["name"],s["type"],s["url"],s.get("retrieved_at",retrieved_at),s.get("notes"))
        )

    for p in data["programs"]:
        cur.execute(
            "INSERT INTO programs(slug,code,title,level,faculty,form,duration,budget_places,paid_places,cost_rub,passing_score,passing_score_year,exams,source_url,catalog_url,disciplines_json,master_title,master_code,master_url,verified_at) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)",
            (
                p["slug"],p["code"],p["title"],p["level"],p.get("faculty"),p.get("form"),p.get("duration"),
                p.get("budget_places"),p.get("paid_places"),p.get("cost_rub"),p.get("passing_score"),p.get("passing_score_year"),
                p.get("exams"),p["source_url"],p.get("catalog_url"),dumps(p.get("disciplines",[])),p.get("master_title"),
                p.get("master_code"),p.get("master_url"),retrieved_at
            )
        )

    for p in data["professions"]:
        cur.execute(
            "INSERT INTO professions(slug,name,sector,program_slug,description,skills_json,riasec_json,values_json,subjects_json,market_key) VALUES(?,?,?,?,?,?,?,?,?,?)",
            (
                p["slug"],p["name"],p["sector"],p["program_slug"],p.get("description"),dumps(p.get("skills",[])),
                dumps(p.get("riasec",{})),dumps(p.get("values",{})),dumps(p.get("subjects",[])),p["market_key"]
            )
        )
        pr=next(x for x in data["programs"] if x["slug"]==p["program_slug"])
        evidence=(pr.get("disciplines") or p.get("skills") or [pr["title"]])[:5]
        cur.execute(
            "INSERT INTO matches(profession_slug,program_slug,status,score,evidence_json,verified_at) VALUES(?,?,?,?,?,?)",
            (p["slug"],p["program_slug"],"approved",88,dumps(evidence),retrieved_at)
        )

    for slug,m in data["market"].items():
        cur.execute(
            "INSERT INTO market_snapshots(profession_slug,source_name,source_url,geography,snapshot,median_salary,salary_min,salary_max,salary_vacancies,vacancies_total,yoy_salary,bands_json,quality,note) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?)",
            (
                slug,m.get("source_name","public source"),m.get("source_url",""),m.get("geography","Москва"),m.get("snapshot",retrieved_at),
                m.get("median_salary"),m.get("salary_min"),m.get("salary_max"),m.get("salary_vacancies"),m.get("vacancies_total"),
                m.get("yoy_salary"),dumps(m.get("bands",{})),m.get("quality","snapshot"),m.get("note")
            )
        )

    for slug,branches in data["career"].items():
        for branch,nodes in branches.items():
            cur.execute(
                "INSERT INTO career_paths(profession_slug,branch,nodes_json) VALUES(?,?,?)",
                (slug,branch,dumps(nodes))
            )

    con.commit()
    con.close()
    print(DB)

if __name__=="__main__":
    init()
