# Professional Navigation MVP V3 — Московский Политех

Публичный MVP сервиса профессиональной навигации Московского Политеха.

## Что уже работает

- интерфейс GitHub Pages в структуре согласованного dashboard-референса;
- TOP-10 рекомендуемых профессий;
- объяснимый recommendation score;
- атлас профессий;
- реальные программы Московского Политеха из официальных источников;
- подготовка к ЕГЭ и ДВИ как отдельный довузовский этап;
- отдельный вступительный экзамен **до** магистратуры;
- ДПО как самостоятельный слой траектории;
- три карьерные ветки: экспертная / исследовательская / управленческая;
- датированные данные рынка труда и предупреждения о малой выборке;
- offline fallback для GitHub Pages без технического баннера;
- адаптивный мобильный интерфейс с drawer-меню и нижней навигацией;
- локальный FastAPI backend + SQLite;
- временное подключение backend через Cloudflare Tunnel.

## Публичный режим

Frontend размещается в `docs/` и публикуется через GitHub Pages.

Поведение:
- **backend доступен** → сайт использует live API;
- **backend недоступен** → интерфейс автоматически и без технических предупреждений использует `docs/fallback-data.json`.

## Версии интерфейса

- `main` — актуальная адаптивная версия для desktop + mobile.
- `desktop-v3.4-snapshot` — зафиксированный снимок desktop-версии до мобильной переработки.

На телефоне используется тот же URL GitHub Pages: layout переключается адаптивно по ширине экрана.

URL backend хранится в:

`docs/api-config.js`

Пример:

```js
window.PROFNAV_API_BASE = "https://example.trycloudflare.com";
```

## Быстрый локальный запуск на Windows

Скачайте репозиторий ZIP, распакуйте и дважды кликните:

`START_ALL.bat`

Скрипт откроет два окна:

1. **ProfNav Backend** — FastAPI + SQLite;
2. **ProfNav Tunnel** — временный HTTPS Cloudflare Tunnel.

В окне Tunnel появится адрес вида:

`https://xxxxx.trycloudflare.com`

Его нужно записать в `docs/api-config.js` или прислать в ChatGPT для обновления публичной Pages-версии.

Можно запускать процессы отдельно:

- `start_backend.bat`
- `start_tunnel.bat`

Подробнее: [LOCAL_DEMO.md](LOCAL_DEMO.md)

## Ручной запуск backend

```bash
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
python scripts/init_db.py
uvicorn backend.main:app --host 127.0.0.1 --port 8000
```

API:
- `GET /api/health`
- `GET /api/professions`
- `GET /api/programs`
- `GET /api/market/{slug}`
- `POST /api/recommendations`
- `GET /api/trajectory/{slug}?branch=expert|research|manager`
- `GET /api/matches`

## Методика рекомендации

`Score = 0.40 × InterestFit + 0.20 × ValueFit + 0.15 × Readiness + 0.15 × ContextFit + 0.10 × MarketScore`

Score — индекс ранжирования, а не вероятность успеха, профпригодность или психодиагностическое заключение.

## Данные

Snapshot MVP: **18.09.2026**.

Основной источник образовательных данных — официальный сайт Московского Политеха.

Рыночные данные в snapshot сопровождаются:
- источником;
- датой;
- географией;
- размером/качеством выборки там, где он доступен;
- отдельным предупреждением, если выборка мала.

## Структура

```
backend/             FastAPI API
scripts/             инициализация SQLite
docs/                GitHub Pages frontend + fallback snapshot
.github/workflows/   CI/deploy Pages
START_ALL.bat        запуск backend + tunnel
start_backend.bat    запуск backend
start_tunnel.bat     запуск tunnel
```

## Важно

MVP не является готовым психодиагностическим инструментом. Перед промышленным использованием диагностический модуль должен пройти отдельную русскоязычную психометрическую валидацию.

Для production-эксплуатации backend предполагается перенести с локального компьютера на сервер Московского Политеха.
