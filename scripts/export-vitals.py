#!/usr/bin/env python3
"""Export daily vitals from health-tracker into the portfolio.

Reads ~/health-tracker/health.db and writes data/vitals.json.
Publishes ONLY daily aggregates: resting HR, sleep duration/score, last
session. Never presence, wake/bed times, or intraday data.
"""

import json
import sqlite3
from datetime import date
from pathlib import Path

DB = Path.home() / "health-tracker" / "health.db"
OUT = Path(__file__).resolve().parent.parent / "data" / "vitals.json"


def fmt_session(rows: list[tuple[str, int]]) -> str:
    parts = []
    for type_, dur_s in rows:
        label = (type_ or "session").replace("_", " ")
        parts.append(f"{label} {round(dur_s / 60)}m")
    return " + ".join(parts) if parts else "rest day"


def main() -> None:
    con = sqlite3.connect(DB)
    sleep = con.execute(
        "SELECT date, duration_s, resting_hr, score FROM sleep "
        "ORDER BY date DESC LIMIT 1"
    ).fetchone()
    if sleep is None:
        raise SystemExit("no sleep rows in health.db")
    sleep_date, dur_s, resting_hr, score = sleep
    sessions = con.execute(
        "SELECT type, duration_s FROM workouts WHERE date = ? "
        "ORDER BY start_time",
        (sleep_date,),
    ).fetchall()
    con.close()

    vitals = {
        "syncedDate": date.today().isoformat(),
        "restingHr": round(resting_hr),
        "sleep": {"hours": round(dur_s / 3600, 1), "score": round(score)},
        "lastSession": fmt_session(sessions),
        "briefingAt": "06:05",
    }
    OUT.write_text(json.dumps(vitals, indent=2) + "\n")
    print(json.dumps(vitals))


if __name__ == "__main__":
    main()
