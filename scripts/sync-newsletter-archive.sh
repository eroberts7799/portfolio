#!/usr/bin/env bash
# Refresh data/newsletter.json from HubSpot (sent editions + public preview links).
# Auth: runs inside the gstack headless browser holding the HubSpot session,
# importing cookies from the cet.vc Chrome profile when the session has lapsed.
# Usage: scripts/sync-newsletter-archive.sh   (from ~/portfolio)
set -euo pipefail
cd "$(dirname "$0")/.."
export PATH="$HOME/.bun/bin:$PATH"
B="$HOME/.claude/skills/gstack/browse/dist/browse"
HOST=https://app-eu1.hubspot.com
PORTAL=144542782
PROFILE="${HUBSPOT_CHROME_PROFILE:-Profile 1}"
TMP="$(mktemp -d)"

FETCH='(async()=>{const csrf=(document.cookie.match(/hubspotapi-csrf=([^;]+)/)||[])[1]||"";let all=[];let off=0;while(true){const r=await fetch("'$HOST'/api/cosemail/v1/emails?portalId='$PORTAL'&limit=100&offset="+off+"&orderBy=-publishDate",{credentials:"include",headers:{"X-HubSpot-CSRF-hubspotapi":csrf,"Accept":"application/json"}});if(r.status!==200)return "STATUS "+r.status;const j=await r.json();all=all.concat(j.objects||[]);if(!j.objects||j.objects.length<100||all.length>=j.total)break;off+=100;}return JSON.stringify({objects:all})})()'

probe() {
  "$B" goto "$HOST/email/$PORTAL/manage/all" >/dev/null 2>&1 || true
  "$B" js "$FETCH" > "$TMP/dump.json" 2>/dev/null || true
  grep -q '"objects"' "$TMP/dump.json"
}
if ! probe; then
  echo "[newsletter-archive] HubSpot session lapsed, importing cookies from Chrome ($PROFILE)…" >&2
  "$B" cookie-import-browser chrome --domain .hubspot.com --profile "$PROFILE" >/dev/null
  probe || { echo "Not logged into HubSpot in Chrome profile '$PROFILE'." >&2; exit 1; }
fi
python3 -I scripts/newsletter-filter.py "$TMP/dump.json" data/newsletter.json
rm -rf "$TMP"
