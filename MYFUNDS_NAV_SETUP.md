# My Funds — NAV Auto Update V41

## Google Sheets
1. ใช้ Spreadsheet เดิมของ My Funds
2. Extensions → Apps Script
3. ใส่ `portfolio/NAV_Updater.gs`
4. Run `setupNAVAutoUpdate()` 1 ครั้งและอนุญาตสิทธิ์
5. จะมี `FundNAV_History` เพิ่มอัตโนมัติ

## Sources
- SCBAM official NAV feed
- TALIS official NAV summary
- KKP NAV table on Krungsri mutual-fund NAV page

## สำคัญ
My Funds ใช้ `FundMaster` เป็น NAV ปัจจุบัน และ v41 ป้องกันไม่ให้การกด Sync/Save จากเว็บเขียนทับ NAV ที่ Apps Script เพิ่งอัปเดต

Trigger จะรัน `updateAllNAVs()` วันละครั้งประมาณ 19:00 ตาม Time zone ของ Apps Script.


## V49 additions
- Investment form auto-fills exact purchase NAV from FundNAV_History when the investment date matches.
- Units auto-calculate from amount / purchase NAV.
- Live FundMaster NAV is used only when its published NAV date exactly matches the investment date.
- Apps Script menu includes a manual snapshot action for the current FundMaster NAV into FundNAV_History.
