# V57 — NAV History Backfill

- Adds official SCBAM NAV historical source for recent NAV history.
- De-duplicates by Fund Code + NAV Date.
- Adds a Google Sheets menu item: `📥 เติม NAV History ย้อนหลัง (SCBAM)`.
- `updateAllNAVs()` also attempts the SCBAM historical backfill after the daily NAV update; failures are logged and do not stop the main NAV update.
- DCA QA continues to require 3 distinct dates and never invents NAV values.

## Important
The historical backfill only covers SCBAM in this version because the source has a documented historical NAV page. TALIS/KKPAM remain on their current NAV feeds until equivalent historical sources are added.
