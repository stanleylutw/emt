# EMT協勤 功能與 UI 維護計畫

本文件是 EMT協勤 專案的功能、介面、資料流與修改準則。之後新增或修改任何功能前，先對照本文件，讓 UI、資料同步、離線邏輯與 Supabase schema 保持一致。

最後更新：2026-06-18
目前主要分支：`v1.5_IndexedDB`
主要檔案：`index.html`、`app.js`、`styles.css`、`supabase/*.sql`

## 1. 專案目標

EMT協勤 是一個手機優先的單頁 Web App，用於救護義消協勤勤務紀錄。

核心目標：

- 快速開始/結束勤務。
- 快速建立出勤與待勤明細。
- 支援離線/網路不穩時本機先存、背景同步。
- 可查詢、編輯、匯出、匯入歷史紀錄。
- 保持 UI 在 iPhone/手機瀏覽器上清楚、穩定、容易操作。

## 2. 技術架構

### 前端

- `index.html`：DOM 結構與靜態 UI。
- `styles.css`：全部視覺樣式、手機版佈局、sheet、timeline、history UI。
- `app.js`：所有狀態、資料流、Supabase 同步、IndexedDB cache、事件處理。

### 後端

- Supabase Auth：Google 登入。
- Supabase Tables：`duty_sessions`、`duty_dispatches`、`profiles`。
- Supabase RLS：使用者只能讀寫自己的資料。

### 本機儲存

- IndexedDB：pending queue、snapshot、profile cache。
- localStorage：舊版 profile fallback、debug logs。

## 3. 主要頁面結構

### 3.1 App Shell

來源：`index.html`

主要區塊：

- `.topbar`：App header，包含 logo、標題、使用者資訊、pending 狀態、頭像按鈕。
- `#authCard`：登入卡片。
- `#workCard`：登入後主要內容。
- `#actionBar`：底部固定操作列。
- `#eventSheet`：編輯/結束出勤 bottom sheet。
- `#profileSheet`：個人資料 bottom sheet。
- `#syncIndicator`：全畫面同步提示。
- `.site-footer`：版本與 build stamp。

規則：

- 所有新 UI 應放在現有語意區塊中，不要直接散落在 body。
- 新增互動元素必須有穩定 id 或 class，並在 `app.js` 的 `el` map 登記。
- 手機優先，避免需要橫向捲動。

## 4. 功能模組

## 4.1 登入與帳號

### 功能

- Google login。
- 登出。
- 登入後讀取 session/profile/pending queue/snapshot。
- token refresh 不應重載大量資料。

### UI

- 未登入：顯示 `#authCard`。
- 已登入：顯示 `#workCard`、頭像、底部 action bar。

### 修改準則

- Auth 狀態變化應保持輕量。
- `SIGNED_IN` 同一使用者不應重複 heavy refresh。
- 修改 auth 流程時必須檢查：初次載入、Google redirect callback、token refresh、登出。

## 4.2 個人資料 Profile

### 欄位

- 帳號：disabled，只顯示 email。
- 頭像：點圖片選檔。
- 分隊/單位。
- 職稱。
- 姓名。
- 聯絡電話。

### 行為

- 左上返回鍵即儲存並關閉。
- 無變更時不更新 server。
- 儲存失敗時寫入 pending queue `profile_upsert`。
- 頭像使用 data URL 存在 profile cache/server。

### UI 規則

- 頭像置中。
- 表單左右留白一致。
- 登出與 debug buttons 與資料欄位保持明顯間距。

### 修改準則

- 新增 profile 欄位時需同步更新：
  - `profiles` schema。
  - `normalizeProfile()`。
  - `saveProfile()` payload。
  - `openProfileSheet()` 表單填值。
  - `applyProfileToUI()` 顯示邏輯。

## 4.3 今日勤務

### 狀態

- 無勤務：顯示「開始協勤」。
- active + standby：可開始出勤或退勤。
- active + event open：可結束出勤。
- completed：顯示今日已完成紀錄，可重新開始協勤。

### Timeline

- 顯示勤務主單與明細。
- 支援新到舊/舊到新排序。
- 主控制列有排序與編輯模式。
- 編輯模式開啟後，明細顯示刪除/編輯操作。

### 跨日規則

- 如果 active session 起始日不是今日，系統應自動將該 session 結束在起始日 23:59。
- 自動結束後應重新載入今日狀態。
- 非今日且已 completed 的 session 不應留在今日勤務 UI。

### 修改準則

- 修改勤務狀態時，必須同步檢查：
  - `actionMode()`。
  - `renderTimeline()`。
  - `applyActionMode()`。
  - `loadSessionAndRows()`。
  - pending queue 的 `session_update`。

## 4.4 出勤/待勤明細

### 明細類型

- standby：待勤、開始協勤、退勤等非送醫片段。
- event：出勤紀錄。
- open event：進行中出勤。

### 表單欄位

- 開始時間。
- 結束時間。
- 醫院。
- 人數。
- 科別。
- 血壓。
- 血氧。
- 脈搏。
- 性別。
- 年齡。
- 血糖。
- 主訴。
- 使用器材。
- 備註。

### 醫院選項順序

- 未選
- 雙和
- 永和耕莘
- 慈濟
- 新店耕莘
- 板醫
- 西園
- 台大
- 安康耕莘
- 其他
- 未送

### DB normalization 規則

Supabase `duty_dispatches` 有 check constraint。前端表單值不可直接假設可寫入 DB。

目前規則：

- 直接 DB hospital：`雙和`、`永和耕莘`、`慈濟`、`新店耕莘`、`板醫`、`西園`、`台大`。
- `未選`、`未送`、`安康耕莘` 可轉為 `hospital='其他'` + `hospital_custom=<原值>`，用於相容舊 DB。
- Production DB 已套用 v1.2 後可接受 `安康耕莘`，但前端仍保持向下相容。
- `case_type='其他'` 必須有 `case_type_custom`。
- `patient_count='0'` 應轉為 `patient_count='其他'` + `patient_count_custom='0'`。

### 修改準則

新增或修改 dropdown 選項時，必須同步檢查：

- `index.html` option。
- `parse*ForForm()`。
- `normalize*ForDb()`。
- Supabase SQL constraint。
- 匯入/匯出格式。
- 歷史摘要 display function。

## 4.5 生命徵象警示

### 欄位

- 血壓：讀取收縮壓。
- 脈搏。
- 血氧。
- 血糖。

### 警示規則

輸入後超過危險範圍時，輸入框淡紅色：

- 收縮壓 > 220 或 < 90。
- 脈搏 > 150 或 < 50。
- 血氧 < 90。
- 血糖 > 500 或 < 60。
- 空白不警示。

### 修改準則

- 警示只做 visual hint，不阻止存檔。
- 空白、非數字、清除欄位時應回到 normal background。
- 新增生命徵象欄位時需同步更新：`parseNote()`、`encodeNote()`、export/import format。

## 4.6 危急度判斷 Guide

### UI

- 位於 `eventSheet` 標題右側 book icon。
- 點擊顯示/關閉危急度判斷文字。
- 只在事件編輯/結束表單需要時顯示。

### 修改準則

- 長文字應放在可收合區，不應影響主要表單操作。
- 若改危急度內容，需保持原段落結構：生命徵象、創傷部位、外傷機轉、特殊情況。

## 4.7 紀錄總覽 Summary

### 分頁

- 今日。
- 本月。
- 本年。
- 總紀錄。
- 歷史紀錄按鈕。

### 統計項目

- 協勤時數。
- 出勤次數。
- 送醫人數。

### 資料規則

- 今日優先用本機 state 即時計算。
- 月/年/總紀錄目前從 Supabase 讀 sessions 與 dispatch rows 後 client-side 聚合。

### 改善方向

- 資料量大時應改為 Supabase RPC/view 聚合。
- 加入 summary cache，避免切 tab 造成頻繁查詢。

## 4.8 歷史紀錄

### 控制列

- 日/月 selector。
- 日期/月 selector。
- 匯入按鈕。

### 卡片內容

- 日期。
- 開始 - 結束 `[HH:MM]`。
- 右上操作：編輯切換、匯出、刪除。
- 明細列：時間範圍 + 摘要文字。
- 明細摘要超過一行使用 ellipsis。

### 編輯模式

- 卡片右上主編輯按鈕控制該 session 是否顯示每列編輯 icon。
- 按列編輯 icon 開啟與今日相同的 event sheet。
- 編輯歷史時暫時切換 state context，關閉後需 restore。

### 刪除規則

- 刪除需輸入 4 位數確認碼。
- 確認碼錯誤顯示「確認碼錯誤，刪除失敗！」。

### 修改準則

- 歷史編輯需小心避免污染今日 state。
- 修改 history card layout 時，必須同時測日模式與月模式。
- 明細列 edit icon 顯示/隱藏不得造成文字間距跳動。

## 4.9 匯出/匯入

### 匯出格式

支援：

- TXT。
- CSV。

匯出包含：

- 人類可讀 summary header。
- 完整 machine-readable protocol rows。

### Header 建議格式

```text
日期: YYYY-MM-DD
時間: HH:mm - HH:mm
勤務時數: HH:MM
單位:
職稱:
姓名:
明細:
- HH:mm - HH:mm  摘要
```

### 匯入規則

- 匯入 TXT/CSV 應轉成 `EMT_SESSION_V1` rows。
- 匯入後建立新 session 與 dispatch rows。
- 匯入前/寫入前必須套用 `normalizeDispatchPayloadForDb()`。

### 修改準則

- 任何格式新增欄位，都要同時更新：
  - `buildSessionExportRows()`。
  - TXT writer。
  - CSV writer。
  - import parser。
  - `normalizeImportedRows()`。
  - `importHistoryRows()`。

## 4.10 Pending Queue / 離線同步

### Queue 類型

- `dispatch_insert`
- `dispatch_update`
- `dispatch_delete`
- `session_update`
- `profile_upsert`

### 行為

- 本機先更新 UI。
- 背景嘗試同步。
- pending queue 存 IndexedDB。
- app online、focus、pageshow、定時器會嘗試 process queue。

### 重要規則

- `dispatch_update` 同一 row 可覆蓋舊 update。
- `session_update` 同一 session 必須 merge payload，不可覆蓋。
- invalid payload 不可靜默刪除；應標記 blocked。
- blocked item 不應阻擋後續正常 item 同步。
- 使用者重新編輯本機新增 row 時，應解除 blocked 並重試。

### UI

- `pendingStatus` 顯示待同步數量。
- 若有 blocked item，顯示「同步異常」。

### 修改準則

- 新增 pending type 時必須更新：
  - `enqueuePendingItem()`。
  - `processPendingQueue()`。
  - `applyPendingMutationsToState()`。
  - debug log event。

## 4.11 Refresh / Timeout / Retry

### 現有規則

- `refresh()` 使用 single-flight，避免重複讀取。
- `讀取勤務主單` timeout 時保留本機畫面。
- timeout retry 使用 backoff：2s、5s、15s、30s。
- 超過上限後停止自動重試，提示使用者手動刷新。

### 修改準則

- 不要恢復固定 interval 無限 retry。
- 成功 refresh 後必須清除 retry timer/count。
- retry 不應影響使用者本機操作。

## 4.12 Debug / Logs

### 功能

- 自動記錄 debug logs。
- Profile 頁可複製/清除偵錯記錄。
- Logs 包含 exportedAt、userId、sessionId、logCount、logs。

### 修改準則

- 任何背景同步、DB query、pending queue、auth 重要事件都應加 debug log。
- 不應記錄 access token、refresh token、個資敏感內容。

## 5. 資料模型摘要

## 5.1 `duty_sessions`

主要欄位：

- `id`
- `user_id`
- `display_name`
- `start_time`
- `task_type`
- `task_type_custom`
- `end_time`
- `status`: `active` 或 `completed`

## 5.2 `duty_dispatches`

主要欄位：

- `id`
- `session_id`
- `seq_no`
- `dispatch_time`
- `vehicle`, `vehicle_custom`
- `case_type`, `case_type_custom`
- `patient_count`, `patient_count_custom`
- `hospital`, `hospital_custom`
- `chief_complaint`
- `bp`
- `spo2`
- `equipment_used`
- `note`

## 5.3 `note` JSON

目前承載：

- `segment`: `event` 或 `standby`
- `transported`
- `memo`
- `open`
- `pulse`
- `gender`
- `ageGroup`
- `glucose`

新增欄位時要保持 backward compatible。

## 5.4 `profiles`

主要欄位：

- `user_id`
- `display_name`
- `unit`
- `title`
- `phone`
- `avatar_data_url`

## 6. UI/UX 設計規則

### 視覺方向

- 手機優先。
- 大按鈕、圓角卡片、淡藍醫療系 UI。
- 重要操作固定在底部 action bar。
- 危險操作使用紅色，且需確認碼。

### 字體與對齊

- 紀錄/時間列使用 tabular numeric 或 monospace 讓時間對齊。
- History date/time 與明細文字大小需一致。
- 超過一行的明細摘要以 ellipsis 顯示。

### Icon 規則

- Header logo 使用 `assets/star-of-life-transparent.png`。
- 圓形 icon button 尺寸需一致。
- 刪除統一使用 `×` icon。
- 編輯使用 `✎`。
- 匯出使用 download icon/text。

### 表單規則

- Bottom sheet 需保持 iPhone 螢幕內可操作。
- 時間欄位同一行顯示。
- numeric 欄位使用 `inputmode="numeric"`。
- 空白欄位不應被警示。

## 7. 修改流程 Checklist

每次修改功能前：

1. 先確認改動屬於哪個模組。
2. 檢查 `index.html` 是否需要新增/修改 DOM。
3. 檢查 `app.js` 的 `el` map 是否要同步。
4. 檢查 state 是否需要新增欄位。
5. 檢查 Supabase schema 是否受影響。
6. 檢查 pending queue 是否需支援新欄位或新操作。
7. 檢查 export/import 是否需同步。
8. 檢查 history UI 是否也要支援。
9. 檢查 debug logs 是否足夠。
10. 跑 `node --check app.js`。

## 8. 測試清單

### 基本登入

- 未登入顯示登入卡。
- Google 登入成功顯示主畫面。
- 登出後清空主畫面 state。

### 勤務流程

- 開始協勤。
- 開始出勤。
- 結束出勤。
- 退勤。
- 忘記退勤跨日，自動結束在 23:59。

### 表單

- 修改開始/結束時間。
- 第一筆開始時間可調整並同步 session start。
- 最後一筆可調整 session end。
- standby row 可編輯時間。
- 醫院選 `安康耕莘` 可同步。
- 科別選 `其他` 不應造成 constraint error。
- 空白生命徵象無紅色警示。

### 歷史紀錄

- 日模式查詢。
- 月模式查詢。
- 明細 edit icon 顯示/隱藏不改變文字間距。
- 歷史明細可編輯。
- 歷史刪除確認碼錯誤/正確流程。

### 匯出/匯入

- TXT 匯出。
- CSV 匯出。
- 匯入 TXT。
- 匯入 CSV。
- 匯入後資料可再次匯出。

### 離線/同步

- 離線新增明細。
- 回 online 後自動同步。
- Constraint error 不應靜默刪除 pending item。
- blocked pending 不應阻止其他 pending 同步。
- 修改 blocked 本機 row 後可解除 blocked。

### 效能/重試

- DB timeout 時顯示本機資料。
- refresh retry 依 backoff 執行。
- retry 上限後停止自動重試。
- summary 切換不造成 query storm。

## 9. 已知改善點 Backlog

### 高優先

- 建立 blocked pending item 的 UI 管理介面：查看錯誤、重試、手動清除。
- Summary 改 Supabase RPC/view 聚合。
- History edit 改成 explicit context，不直接替換全域 `state.session/state.rows`。

### 中優先

- README 補部署與 migration 流程。
- 匯入前顯示 preview 與確認。
- 匯出/匯入格式加正式版本文件。
- 增加簡單 smoke test script。

### 低優先

- 將 `app.js` 拆成 modules：auth、sync、session、history、profile、ui。
- CSS 拆分：base、layout、history、sheet、profile。
- 更完整的 accessibility labels。

## 10. Commit/Deploy 規則

### Commit 前

必跑：

```bash
node --check app.js
```

建議檢查：

```bash
git diff --stat
git status --short
```

### DB schema 改動

- 修改 `supabase/v1_0_init.sql` 只影響新建 DB。
- 既有 production DB 必須新增 migration 檔，例如 `supabase/v1_2_*.sql`。
- migration 套用後記錄在 commit message 或 release note。

### GitHub Pages

- Push 後確認部署 branch。
- 若使用 cache，手機瀏覽器可能需要 hard refresh 或等 GitHub Pages 更新。

