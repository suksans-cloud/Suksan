# V72 Wirocha + Persistent ETF/Stock Logos Fix

- Wirocha asset allocation is classified by canonical fund code and FundMaster official/asset text, so fixed-income funds such as SCBSTMFPLUS-E remain bonds after Sheet refresh.
- E-Saving remains a single reserve bucket for all E-Saving owner rows.
- MarketWatch now persists a `Brand Key` in column T, while known ticker mappings always override stale Sheet brand values.
- Finance and ETF/Stock Watch use the same deterministic ticker -> provider/company logo mapping after refresh.
- MarketWatch ETF detection expanded for common iShares/SPDR/Vanguard/Invesco/Global X/NEOS tickers.
