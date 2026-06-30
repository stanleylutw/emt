English correction: `Please read docs/IMPLEMENTATION_PLAN.md and implement it. If anything is unclear or out of scope, ask before modifying files.`

中文主要回覆：已依照 docs/IMPLEMENTATION_PLAN.md 完成實作，並位於 branch `add_hospital_yadong`。

修改範圍：
- `/Users/stanley/Documents/EMT/index.html`：在醫院下拉選單中，於 `安康耕莘` 後、`其他` 前新增 `<option value="亞東">亞東</option>`。
- `/Users/stanley/Documents/EMT/app.js`：將 `亞東` 加入 `FORM_HOSPITALS_AS_OTHER`，使前端選到 `亞東` 時沿用 `其他` + `hospital_custom='亞東'` 的向下相容儲存模式。
- `/Users/stanley/Documents/EMT/app.js`：在 `parseHospitalForForm(row)` 增加 `hospital='其他'` 且 `hospital_custom='亞東'` 時回填表單值 `亞東` 的分支。
- `/Users/stanley/Documents/EMT/app.js`：將 `亞東` 加入 `parseHospitalForForm(row)` 的 `allowed` 清單，讓歷史資料或既有 row 可正確回填。

驗證：
- 已執行 `node --check app.js`，通過，無輸出。
- 已執行 `git diff --check`，通過，無輸出。
- 已啟動 `python3 -m http.server 5500`。
- 已用 in-app browser 開啟 `http://localhost:5500/?verify=yadong`，頁面標題為 `EMT協勤`。
- 已檢查 DOM：醫院選項順序包含 `安康耕莘`、`亞東`、`其他`，且 `亞東` 正確位於 `安康耕莘` 後、`其他` 前。
- 已檢查瀏覽器 console error logs，未看到新增 error。

限制／未能驗證的部分：
- 未使用實際 Google OAuth 帳號登入，因此未完整手動操作「新增一筆出勤並同步成功」與「從歷史紀錄打開剛剛那筆確認醫院欄位回填亞東」兩個情境。
- 本次未修改 Supabase schema，沒有新增 migration；`亞東` 依 plan 採 `其他` fallback 模式。

工作區狀態：
- 目前 branch：`add_hospital_yadong`
- `git diff --stat` 顯示 `/Users/stanley/Documents/EMT/app.js` 與 `/Users/stanley/Documents/EMT/index.html` 共有 7 行 code 變更，6 insertions、2 deletions。
- `git diff --cached --stat` 顯示 `/Users/stanley/Documents/EMT/FUNCTION_UI_PLAN.md` 已 staged，為本次開始前既有的文件變更；本次未修改該檔。
- `git status --short --branch` 顯示：`M  FUNCTION_UI_PLAN.md`、` M app.js`、` M index.html`、`?? comm.md`、`?? docs/`。
- 本次依要求覆寫 `/Users/stanley/Documents/EMT/docs/CODEX_RESULT.md` 作為完成回報，未修改 `/Users/stanley/Documents/EMT/docs/IMPLEMENTATION_PLAN.md`。
