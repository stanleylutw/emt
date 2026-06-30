English correction: `Please read docs/IMPLEMENTATION_PLAN.md and implement it. If anything is unclear or out of scope, ask before modifying files.`

中文主要回覆：已依照 docs/IMPLEMENTATION_PLAN.md 完成實作，並建立/切到 branch `perf_cache_bust_and_pending_queue_read`。

修改範圍：
- `/Users/stanley/Documents/EMT/index.html`：將 `styles.css` 改為 `styles.css?v=2604141158`，將 `app.js` 改為 `app.js?v=2604141158`；版本值直接取自 `/Users/stanley/Documents/EMT/app.js` 的 `APP_RELEASE_STAMP`。
- `/Users/stanley/Documents/EMT/README.md`：在 `Release Notes` 補上規則，提醒更新 `APP_RELEASE_STAMP` 時必須同步更新 `index.html` 裡 `app.js` / `styles.css` 的 `?v=` query string。
- `/Users/stanley/Documents/EMT/app.js`：在 `state` 新增 `pendingQueueLoaded: false`。
- `/Users/stanley/Documents/EMT/app.js`：調整 `loadPendingQueueCache()`，改用 `state.pendingQueueLoaded` 判斷是否需要讀 IndexedDB，不再用 queue 陣列長度判斷；IndexedDB 讀取成功、legacy localStorage migration 成功、或沒有可載入資料時，都會把 `pendingQueueLoaded` 設為 `true`。
- `/Users/stanley/Documents/EMT/app.js`：在 owner 切換時重設 `state.pendingQueueLoaded = false`，保留原本清空 cache 與 owner 更新行為。
- `/Users/stanley/Documents/EMT/app.js`：在 `clearSignedOutState()` 清空 pending queue 時同步重設 `state.pendingQueueLoaded = false`。

驗證：
- 已執行 `node --check app.js`，通過，無輸出。
- 已執行 `git diff --check`，通過，無輸出。
- 已啟動 `python3 -m http.server 5500`。
- 已用 in-app browser 開啟 `http://localhost:5500/?verify=cache-bust`，頁面標題為 `EMT協勤`。
- 已檢查 DOM：stylesheet 為 `styles.css?v=2604141158`，app script 為 `app.js?v=2604141158`。
- 本地 server request log 顯示實際請求 `GET /styles.css?v=2604141158` 與 `GET /app.js?v=2604141158`。
- 已檢查瀏覽器 console error logs，未看到新增 error。
- 已確認醫院下拉 DOM 仍包含 `亞東`，頁面基本載入正常。

限制／未能驗證的部分：
- 未使用實際 Google OAuth 帳號登入，因此未完整手動操作「開始/結束協勤」、「建立 pending queue 後同步清空」、「登出再登入或切換帳號」。
- 未能在真實登入 session 中觀察 `pending.cache.loaded` debug log 是否只出現一次；已從 code path 確認同一 owner 載入後 `pendingQueueLoaded` 會保持 `true`，queue 清空為空陣列後不會再因長度為 0 重讀 IndexedDB。
- 本次未修改 IndexedDB schema，沒有新增 Supabase migration。

工作區狀態：
- 目前 branch：`perf_cache_bust_and_pending_queue_read`
- `git diff --stat` 顯示 `/Users/stanley/Documents/EMT/index.html`、`/Users/stanley/Documents/EMT/README.md`、`/Users/stanley/Documents/EMT/app.js`、`/Users/stanley/Documents/EMT/FUNCTION_UI_PLAN.md`、`/Users/stanley/Documents/EMT/docs/IMPLEMENTATION_PLAN.md` 有變更。
- `/Users/stanley/Documents/EMT/FUNCTION_UI_PLAN.md` 與 `/Users/stanley/Documents/EMT/docs/IMPLEMENTATION_PLAN.md` 是本次開始前已存在的 Claude 文件更新，本次未修改其內容。
- 本次依要求覆寫 `/Users/stanley/Documents/EMT/docs/CODEX_RESULT.md` 作為完成回報。
