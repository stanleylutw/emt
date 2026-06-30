English correction: `Please read docs/IMPLEMENTATION_PLAN.md and implement it. If anything is unclear or out of scope, ask before modifying files.`

中文主要回覆：已依照 docs/IMPLEMENTATION_PLAN.md 完成實作，並建立/切到 branch `merge_total_and_calendar_button`。

修改範圍：
- `/Users/stanley/Documents/EMT/index.html`：移除 Summary 分頁列中的「總紀錄」文字 tab。
- `/Users/stanley/Documents/EMT/index.html`：在 `#historyToggleBtn` 加上 `data-range="all"`，並將 `aria-label` 改為 `切換歷史紀錄與總紀錄`，讓既有 Summary tab click listener 在點擊 📅 時同步切到 `all`。
- `/Users/stanley/Documents/EMT/index.html`：替三個 Summary label 補上 `sumDutyHoursLabel`、`sumEventCountLabel`、`sumTransportedLabel` id。
- `/Users/stanley/Documents/EMT/app.js`：在 `el` map 新增三個 Summary label DOM reference。
- `/Users/stanley/Documents/EMT/app.js`：在 `setSummaryValues()` 數字更新後，依 `state.summaryRange === "all"` 動態切換 label：`總協勤時數` / `總出勤次數` / `總送醫人數`，其他區間恢復原文字。
- `/Users/stanley/Documents/EMT/app.js`：已檢查 `SUMMARY_RANGE_ORDER`，`all` 已存在，不需修改；已檢查 `toggleHistoryPanel()`，維持原本展開/收合職責，不需修改。

驗證：
- 已執行 `node --check app.js`，通過，無輸出。
- 已執行 `git diff --check`，通過，無輸出。
- 已啟動 `python3 -m http.server 5500`。
- 已用 in-app browser 開啟 `http://localhost:5500/?verify=merge-total-calendar`。
- 已檢查 DOM：Summary 分頁列只剩 `今日`、`本月`、`本季`、`本年`、📅；沒有「總紀錄」文字 tab。
- 已檢查 DOM：📅 button 的 `data-range` 是 `all`，`aria-label` 是 `切換歷史紀錄與總紀錄`。
- 已檢查 DOM：三個 Summary label id 存在，初始文字為 `協勤時數`、`出勤次數`、`送醫人數`。
- 已檢查瀏覽器 console error logs，未看到新增 error。

限制／未能驗證的部分：
- 未使用實際 Google OAuth 帳號登入，因此未完整手動操作「點擊 📅 後遠端總統計數字更新、歷史紀錄面板展開/收合」。
- 未登入狀態下 `#workCard` 是 hidden，browser automation 無法實際點擊 Summary 裡的 📅 button；已透過 DOM 結構與 source diff 確認既有 click bubble 機制會讓 `data-range="all"` 觸發 `switchSummaryRange("all")`，且 `#historyToggleBtn` 原 click listener 仍會觸發 `toggleHistoryPanel()`。
- 未完整手動驗證左右滑動到 `all`，但 `SUMMARY_RANGE_ORDER` 已包含 `all` 且本次未修改 swipe 邏輯。
- 本次未修改 Supabase RPC 或 schema，沒有新增 migration。

工作區狀態：
- 目前 branch：`merge_total_and_calendar_button`
- `git diff --stat` 顯示 `/Users/stanley/Documents/EMT/index.html`、`/Users/stanley/Documents/EMT/app.js`、`/Users/stanley/Documents/EMT/FUNCTION_UI_PLAN.md`、`/Users/stanley/Documents/EMT/docs/IMPLEMENTATION_PLAN.md` 有變更；本次 code 變更只在 `index.html` 與 `app.js`。
- `/Users/stanley/Documents/EMT/FUNCTION_UI_PLAN.md` 與 `/Users/stanley/Documents/EMT/docs/IMPLEMENTATION_PLAN.md` 是本次開始前已存在的 Claude 文件更新，本次未修改其內容。
- 本次依要求覆寫 `/Users/stanley/Documents/EMT/docs/CODEX_RESULT.md` 作為完成回報。
