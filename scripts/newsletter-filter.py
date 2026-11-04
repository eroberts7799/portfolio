#!/usr/bin/env python3
"""Turn a HubSpot cosemail list dump into data/newsletter.json.

Keeps only real newsletter editions: sent to the subscriber list (42), named like
an edition, deduped by subject (latest send wins, so V1/V2 test sends drop out).
Usage: python3 -I newsletter-filter.py <dump.json> <out.json>
"""
import datetime
import json
import re
import sys

SUBSCRIBER_LIST = 42
EDITION_NAME = re.compile(r"^(Newsletter\b|[A-Z][a-z]+ \d{1,2}(st|nd|rd|th)?(\s?,? \d{4})?\s*[-—])")
# Editions whose HubSpot name doesn't follow the convention (e.g. left as "New email").
EXTRA_IDS = {402425281763}

raw = open(sys.argv[1], encoding="utf8").read()
raw = raw[raw.index("{"):]
objs = json.loads(raw)["objects"]

by_subject = {}
for o in objs:
    if o.get("state") != "PUBLISHED":
        continue
    if SUBSCRIBER_LIST not in (o.get("mailingListsIncluded") or []):
        continue
    if o["id"] not in EXTRA_IDS and not EDITION_NAME.match(o.get("name") or ""):
        continue
    subject = (o.get("subject") or "").strip()
    if not subject or "personalization_token" in subject:
        continue
    prev = by_subject.get(subject)
    if prev and prev["publishDate"] >= (o.get("publishDate") or 0):
        continue
    by_subject[subject] = {
        "id": str(o["id"]),
        "publishDate": o.get("publishDate") or 0,
        "subject": subject,
        "url": f"{o['url']}?hs_preview={o['previewKey']}-{o['id']}",
    }

editions = sorted(by_subject.values(), key=lambda e: e["publishDate"], reverse=True)
out = [
    {
        "id": e["id"],
        "date": datetime.datetime.fromtimestamp(e["publishDate"] / 1000, datetime.timezone.utc).date().isoformat(),
        "title": e["subject"],
        "url": e["url"],
    }
    for e in editions
]
json.dump(out, open(sys.argv[2], "w", encoding="utf8"), indent=2, ensure_ascii=False)
open(sys.argv[2], "a").write("\n")
print(f"{len(out)} editions, {out[-1]['date']} → {out[0]['date']}")
