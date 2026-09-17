from pathlib import Path
import sqlite3, json
ROOT=Path(__file__).resolve().parents[1]
DB=ROOT/"data"/"profnav.db"

def connect():
    con=sqlite3.connect(DB)
    con.row_factory=sqlite3.Row
    con.execute("PRAGMA foreign_keys=ON")
    return con

def rowdict(row):
    if row is None:
        return None
    d=dict(row)
    for k in list(d):
        if k.endswith("_json") and d[k] is not None:
            nk=k[:-5]
            try:
                d[nk]=json.loads(d[k])
            except Exception:
                d[nk]=d[k]
            del d[k]
    return d

def rows(cur):
    return [rowdict(x) for x in cur.fetchall()]
