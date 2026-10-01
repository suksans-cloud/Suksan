# Portfolio V67 — Production Final

V67 is the production-only Portfolio/My Funds build. QA/demo controls from the development iterations are removed from the Finance UI and their handlers are removed from the page script.

## Production features

- My Funds is sourced from the real portfolio records (`DATA.funds`).
- Real transactions come from `Investments` and require actual Units for portfolio valuation.
- Purchase NAV is resolved from `FundNAV_History` for the transaction date when available; Units are calculated as Amount / Purchase NAV.
- Current value is Units × latest NAV.
- P/L is Current Value − invested amount for transactions with actual Units.
- Portfolio return is P/L / invested amount × 100.
- PlanMaster is displayed separately as planned investment and is never included in real portfolio value/P&L.
- Portfolio overview aggregates all funds with actual Units and keeps incomplete funds visible as pending.
- Portfolio History can be viewed for all funds together or filtered to any fund that has actual Units.
- Portfolio History uses real transactions + real NAV History only. It starts at the first real purchase and does not invent holdings before that date.
- NAV History is a separate production view and can be selected by fund.
- Real Transaction view shows the transaction-level source of the portfolio calculation.
- Refresh pulls Google Sheets data, NAV/Market data, and reconciles purchase NAV/Units when historical NAV is available.

## Portfolio History rules

1. Only `Investments` transactions with `Units > 0` are included.
2. Only NAV values present in `FundNAV_History` (or an exact-date live NAV) are used.
3. A day is left without Portfolio Value when a held position has no real NAV for that day; the application does not fabricate a value.
4. NAV can be carried forward from the most recent real NAV for non-NAV calendar days, such as weekends/holidays, because no new NAV is being invented.
5. Planned investment from `PlanMaster` is shown separately and never changes Portfolio Value, P/L, or Return.

## Deployment

- Static web app: publish the `portfolio/index.html` included in this build.
- Google Apps Script: keep `Code.gs` and `NAV_Updater.gs` in the same Apps Script project.
- NAV updater changes require saving the Apps Script project; Web App deployment is only required when the Web App endpoint itself changes.
- Keep the existing Google Sheets tabs: `Funds`, `FundMaster`, `FundNAV_History`, `PlanMaster`, `Investments`, `MarketWatch`, and `NAV_Update_Log`.

## Important data integrity rule

The app never creates a historical holding merely because historical NAV exists. A Portfolio History point represents assets actually held according to `Investments`.


## V68 Mobile fixes
- Finance Portfolio History selector now lists every fund in My funds, not only funds with real units.
- Funds without real units show the production empty-state instead of disappearing from the selector.
- Mobile Finance header/actions are responsive and cannot force horizontal overflow.
- Portfolio History fund selector is width-constrained on mobile and long labels are handled safely.


## Mobile hardening
- Final responsive override covers mobile/coarse-pointer browsers even when viewport reporting is wider than expected.
- Finance action buttons use a 2-column mobile grid with the refresh action on a full row.
- History selector, stats, and chart are constrained to the viewport.
- Portfolio and shell service-worker cache versions were bumped and old caches are removed on activation to prevent stale mobile CSS/HTML.


## Separation fix — My Funds vs ETF / Stock
- My Funds is the only tab that renders Portfolio Summary, Portfolio History, NAV History, and Real Transactions controls.
- ETF and Stock are Market Watch views only.
- PlanMaster, Investments, Units, Portfolio Value, P/L, and Portfolio History are not rendered in ETF/Stock tabs.
- This prevents portfolio data from visually appearing under ETF/Stock.

## V70 fixes — 2026-09-29
- Removed “Consolidated” from the Portfolio header and aligned the title with the B mark.
- Finance refresh button stays on the same header row as “Finance” on mobile.
- Retirement calculations are self-contained: no automatic Portfolio-value injection. The latest explicitly saved/calculated experiment is stored locally and restored after reload.
- ETF / Stock tabs clear and hide all My Funds portfolio-only DOM immediately, preventing stale My Funds summary/history from persisting after tab switches.
- Service-worker cache versions bumped so the fixes can replace the previous mobile build.


## V71 fixes — 2026-09-29
- Retirement hero now matches the main Portfolio hero visual system and removes the explanatory subtitle line.
- Settings Auto Sync toggle uses a real clickable switch and explicit change handler.
- Monthly email report adds system check and stronger backend validation for Sheet access, email quota, and trigger installation.
- Google Drive is explicitly scoped to My Bookshelf; added a Drive API connection test. Google Sheets remains the system database.
- Home notifications now include pending offline sync, Auto Sync disabled, monthly email setup, and saved retirement experiment.
- Cache versions bumped.


## V72 — PlanMaster Display Name Fix
- Monthly investment table now displays `PlanMaster` column D (`Display Name`) as the authoritative fund name for the selected year.
- `↻ ดึงจาก Master` / Google Sheets pull reads and stores the PlanMaster display name.
- Smart Sync/write-back preserves that PlanMaster display name instead of replacing it from `FundMaster`.
- FundMaster remains the global fund/NAV master; dashboard/Finance fund names are unchanged.
- Portfolio service-worker cache bumped to `mff-portfolio-v7-v72`.
