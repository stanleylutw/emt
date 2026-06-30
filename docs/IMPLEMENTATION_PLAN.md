# IMPLEMENTATION_PLAN.md

## Branch

Before starting implementation, create and switch to the new branch:

```
git checkout -b merge_total_and_calendar_button
```

Base branch: `main`

## 背景

Summary 分頁列（[FUNCTION_UI_PLAN.md](../FUNCTION_UI_PLAN.md) 4.7）目前有獨立的「總紀錄」文字 tab（`data-range="all"`）跟 📅 calendar icon（`#historyToggleBtn`，展開/收合歷史紀錄面板）兩個按鈕。要把這兩個合併成一個：拿掉「總紀錄」文字 tab，改成點擊 📅 icon 時同時做兩件事——切換 `summaryRange` 為 `all`（顯示全部統計）並展開/收合歷史紀錄面板。

另外，當統計區間是「全部」時，三個統計數字標籤要動態加上「總」字首：

- 協勤時數 → 總協勤時數
- 出勤次數 → 總出勤次數
- 送醫人數 → 總送醫人數

`FUNCTION_UI_PLAN.md` 已更新到 v2.0，請依本文件實作 code。

## 修改範圍

### 1. `index.html`

約第 70-90 行，`#summaryCard` / `#summaryTabs` 區塊。

- 刪除這一行（「總紀錄」文字 tab）：

```html
<button type="button" class="tab" data-range="all">總紀錄</button>
```

- 找到 `#historyToggleBtn` 按鈕（緊接在剛刪除的那行之後），加上 `data-range="all"` 屬性：

```html
<button id="historyToggleBtn" type="button" class="tab history-tab" data-range="all" aria-expanded="false" aria-controls="historyPanel" aria-label="切換歷史紀錄與總紀錄">
```

  （`aria-label` 順手改成反映新行為，其餘屬性不變。）

  **重要**：`app.js` 裡 `el.summaryTabs.addEventListener("click", ...)`（搜尋這段）已經會抓 `#summaryTabs` 容器內所有 `.tab` 的點擊事件（含 `#historyToggleBtn`，因為它本來就在 `#summaryTabs` 容器內、也有 `tab` class），並呼叫 `switchSummaryRange(btn.dataset.range)`。所以只要幫 `#historyToggleBtn` 補上 `data-range="all"`，**不需要額外修改這段監聽器**，點擊 calendar icon 就會自動觸發「切到 all range」。`#historyToggleBtn` 自己原本的 click listener（`toggleHistoryPanel()`）維持不變，兩個 listener 都會在同一次點擊觸發，互不衝突。

- 約第 88-90 行，三個統計數字的 `<p>` 標籤，補上 `id`，讓 JS 可以動態改文字：

```html
<article><p id="sumDutyHoursLabel">協勤時數</p><strong id="sumDutyHours">00:00</strong></article>
<article><p id="sumEventCountLabel">出勤次數</p><strong id="sumEventCount">0</strong></article>
<article><p id="sumTransportedLabel">送醫人數</p><strong id="sumTransported">0</strong></article>
```

### 2. `app.js`

- 約第 70-74 行，`el` map（搜尋 `sumDutyHours:`），新增對應的 label 元素：

```js
sumDutyHoursLabel: document.getElementById("sumDutyHoursLabel"),
sumEventCountLabel: document.getElementById("sumEventCountLabel"),
sumTransportedLabel: document.getElementById("sumTransportedLabel"),
```

- 約第 1826-1832 行，`setSummaryValues()` 函式。在更新數字之後，加入標籤文字切換邏輯（依 `state.summaryRange === "all"` 判斷）：

```js
const setSummaryValues = ({ dutyMs = 0, eventCount = 0, transported = 0 }) => {
  ...原本內容（hh/mm 計算、textContent 設定）保留...
  const isAllRange = state.summaryRange === "all";
  if (el.sumDutyHoursLabel) el.sumDutyHoursLabel.textContent = isAllRange ? "總協勤時數" : "協勤時數";
  if (el.sumEventCountLabel) el.sumEventCountLabel.textContent = isAllRange ? "總出勤次數" : "出勤次數";
  if (el.sumTransportedLabel) el.sumTransportedLabel.textContent = isAllRange ? "總送醫人數" : "送醫人數";
};
```

  請先讀完整個函式現有內容，把新邏輯加在尾端，不要動到既有的數字計算/賦值邏輯。

- 檢查 `SUMMARY_RANGE_ORDER`（約第 156 行）：目前是 `["today", "month", "quarter", "year", "all"]`，`all` 已經在裡面，**不需要修改**這個陣列。滑動切換（swipe）邏輯滑到 `all` 時，只會切換統計數字（含標籤文字，因為 `setSummaryValues` 會在 `renderSummary()` 內被呼叫到），不會自動展開歷史面板——這是預期行為，本次不處理「滑動切換到 all 也順便開歷史面板」，範圍只限定在點擊 📅 icon。

- 檢查 `toggleHistoryPanel()`（約第 2809-2825 行）：這個函式本身不需要修改，維持原本「展開/收合歷史面板」的職責，跟 `switchSummaryRange("all")` 是兩個獨立呼叫，靠 index.html 的 `data-range="all"` + 既有 click bubble 機制讓它們在同一次點擊時都被觸發。

### 不在本次範圍內

- 不修改 `styles.css`，除非拿掉「總紀錄」按鈕後 tab 列排版出現明顯問題（例如左右留白不對稱），若有發生才需要微調既有 `.summary-tabs` 相關 class，不要新增新的 class 體系。
- 不修改歷史紀錄面板（`historyPanel`）本身的內容/邏輯。
- 不修改 Supabase RPC 或 schema。

## 驗證步驟（必跑）

1. `node --check app.js`
2. `python3 -m http.server 5500`，開啟 `http://localhost:5500/`
3. 手動驗證：
   - Summary tab 列不再有「總紀錄」文字按鈕，只剩：今日、本月、本季、本年、📅。
   - 點擊 📅，確認：(a) 統計數字切換成全部時間的數字 (b) 三個標籤變成「總協勤時數」「總出勤次數」「總送醫人數」(c) 下方歷史紀錄面板展開。
   - 再點一次 📅，確認歷史面板收合；標籤是否仍維持「總」字首（因為 `summaryRange` 還是 `all`，這是預期行為，不是 bug）。
   - 切回「今日」/「本月」/「本季」/「本年」，確認標籤文字恢復成不帶「總」字的原樣。
   - 左右滑動 Summary 卡片，確認可以滑到 `all`（標籤一樣會變成「總」字首），滑動時不强制展開歷史面板。
4. 檢查瀏覽器 console 是否有新增錯誤。

完成後請依 comm.md「Step 4 完成後摘要格式」把結果寫入 `docs/CODEX_RESULT.md`。
