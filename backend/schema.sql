PRAGMA foreign_keys=ON;

CREATE TABLE IF NOT EXISTS sources(
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  key TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  url TEXT NOT NULL,
  retrieved_at TEXT NOT NULL,
  notes TEXT
);

CREATE TABLE IF NOT EXISTS programs(
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  slug TEXT UNIQUE NOT NULL,
  code TEXT NOT NULL,
  title TEXT NOT NULL,
  level TEXT NOT NULL,
  faculty TEXT,
  form TEXT,
  duration TEXT,
  budget_places INTEGER,
  paid_places INTEGER,
  cost_rub INTEGER,
  passing_score INTEGER,
  passing_score_year INTEGER,
  exams TEXT,
  source_url TEXT NOT NULL,
  catalog_url TEXT,
  disciplines_json TEXT NOT NULL,
  master_title TEXT,
  master_code TEXT,
  master_url TEXT,
  verified_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS professions(
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  sector TEXT NOT NULL,
  program_slug TEXT NOT NULL,
  description TEXT,
  skills_json TEXT NOT NULL,
  riasec_json TEXT NOT NULL,
  values_json TEXT NOT NULL,
  subjects_json TEXT NOT NULL,
  market_key TEXT NOT NULL,
  FOREIGN KEY(program_slug) REFERENCES programs(slug)
);

CREATE TABLE IF NOT EXISTS market_snapshots(
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  profession_slug TEXT NOT NULL,
  source_name TEXT NOT NULL,
  source_url TEXT NOT NULL,
  geography TEXT NOT NULL,
  snapshot TEXT NOT NULL,
  median_salary INTEGER,
  salary_min INTEGER,
  salary_max INTEGER,
  salary_vacancies INTEGER,
  vacancies_total INTEGER,
  yoy_salary INTEGER,
  bands_json TEXT NOT NULL,
  quality TEXT NOT NULL,
  note TEXT,
  FOREIGN KEY(profession_slug) REFERENCES professions(slug)
);

CREATE TABLE IF NOT EXISTS career_paths(
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  profession_slug TEXT NOT NULL,
  branch TEXT NOT NULL,
  nodes_json TEXT NOT NULL,
  UNIQUE(profession_slug, branch),
  FOREIGN KEY(profession_slug) REFERENCES professions(slug)
);

CREATE TABLE IF NOT EXISTS matches(
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  profession_slug TEXT NOT NULL,
  program_slug TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'approved',
  score INTEGER NOT NULL DEFAULT 85,
  evidence_json TEXT NOT NULL,
  verified_at TEXT NOT NULL,
  UNIQUE(profession_slug, program_slug),
  FOREIGN KEY(profession_slug) REFERENCES professions(slug),
  FOREIGN KEY(program_slug) REFERENCES programs(slug)
);

CREATE TABLE IF NOT EXISTS audit_log(
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  actor TEXT NOT NULL,
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_key TEXT NOT NULL,
  payload_json TEXT
);
