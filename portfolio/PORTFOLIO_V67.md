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
