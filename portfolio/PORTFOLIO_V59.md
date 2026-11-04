# V59 — Portfolio Unit Reconciliation

## สิ่งที่เพิ่มจาก V58
- Investments header now explicitly includes `Units` and `Purchase NAV` columns (A:L).
- When `FundNAV_History` gains historical NAV for an existing purchase date, Portfolio automatically fills missing `Purchase NAV` and calculates `Units = Amount / Purchase NAV` without inventing a NAV.
- A successful Sheet pull persists those newly resolved units back to the `Investments` tab.
- Finance `↻ อัปเดต` now refreshes Google Sheets / NAV History before refreshing Market data, then reconciles transaction units.
- Portfolio calculations distinguish money with known units from transactions still waiting for units.
- Existing manually entered purchase NAV / units are preserved; only missing values are auto-filled.

## Calculation rules
- Purchase NAV: exact NAV for the transaction date from `FundNAV_History`.
- Units: `investment amount / purchase NAV` when purchase NAV is known and units are missing.
- Current value: `known units × latest current NAV`.
- P/L: current value minus the investment amount represented by transactions that have known units.
- No missing NAV or purchase date is fabricated.

## Google Sheets
`Investments` is written as 12 columns:
`Transaction ID | Date | Year | Month | Owner | Fund ID | Fund Code | Fund Name | Amount | Note | Units | Purchase NAV`

This remains compatible with the existing A:L read path in the app.
