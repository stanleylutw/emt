# IMPLEMENTATION_PLAN.md

## Branch

Before starting implementation, create and switch to the new branch:

```
git checkout -b add_summary_quarter_tab
```

Base branch: `main`

## 背景

紀錄總覽 Summary（[FUNCTION_UI_PLAN.md](../FUNCTION_UI_PLAN.md) 4.7）目前只有「今日／本月／本年／總紀錄」四個分頁，需要新增「本季」分頁，插入在「本月」之後、「本年」之前。

季度定義（不跨年份，只看當年當季）：

- Q1：1-3 月
- Q2：4-6 月
- Q3：7-9 月
- Q4：10-12 月

例如今天是 2026-06-30（屬於 Q2），「本季」範圍是 `2026-04-01 00:00:00` ~ `2026-07-01 00:00:00`（不含）。

實作方式與既有的 `today`/`month`/`year` 完全對稱：前端算好 `startIso`/`endIso`，傳給既有的 `get_duty_summary` RPC（不需要新增/修改 Supabase migration，RPC 已經是用 `p_start`/`p_end` 區間查詢，不需要知道季度概念）。

## 修改範圍

### 1. `index.html`

約第 72-76 行，`#summaryTabs` 區塊。在「本月」按鈕之後、「本年」按鈕之前插入：

```html
<button type="button" class="tab" data-range="quarter">本季</button>
```

完整應變成（順序）：今日 → 本月 → 本季 → 本年 → 總紀錄。

### 2. `app.js`

- 約第 1856-1874 行，`rangeBoundsByType(type)` 函式。在 `month` 分支之後、`year` 分支之前，新增 `quarter` 分支：

```js
if (type === "quarter") {
  const q = Math.floor(now.getMonth() / 3); // 0,1,2,3
  const s = new Date(now.getFullYear(), q * 3, 1);
  const e = new Date(now.getFullYear(), q * 3 + 3, 1);
  return { startIso: s.toISOString(), endIso: e.toISOString() };
}
```

  寫法需與既有的 `today`/`month`/`year` 完全對稱（同樣用 `new Date(year, month, day)` 本地時間建構子 + `.toISOString()`），不要引入額外的時區處理邏輯，維持本檔案現有風格一致。

- 檢查 `state.summaryRange` 相關邏輯（搜尋 `summaryRange`）：`renderSummary()`、`updateSummaryTabsUI()`、tab click handler（約第 4209 行 `el.summaryTabs.addEventListener("click", ...)`）都是用 `tab.dataset.range` 驅動，不需要額外寫死 if/else 判斷分頁種類，新增 `data-range="quarter"` 後應該會自動被既有邏輯處理。**請實際追蹤一次這幾個函式，確認沒有任何地方寫死只認識 `["today","month","year","all"]` 這四種字串而漏掉 `quarter`**（例如某個 switch/if 列舉所有分頁類型的地方），如果有遺漏，一併補上。

### 不在本次範圍內

- 不需要新增 Supabase migration。
- 不修改 `summarizeSessionRows`（這個只服務 `today` 的本機即時計算，季度不需要本機即時計算邏輯）。
- 不修改 `styles.css`，除非新增的 tab 按鈕在現有樣式下出現明顯排版問題（例如五個 tab 擠在一行造成換行/溢出），若有發生才需要微調，且只能微調 `.summary-tabs` 相關既有 class，不要新增新的 class 體系。

## 驗證步驟（必跑）

1. `node --check app.js`
2. `python3 -m http.server 5500`，開啟 `http://localhost:5500/`
3. 手動驗證：
   - 登入後看到 Summary 分頁順序為：今日、本月、本季、本年、總紀錄。
   - 點擊「本季」，確認畫面有正確顯示協勤時數/出勤次數/送醫人數（不是顯示 0 或卡住 loading）。
   - 用瀏覽器 console 印出 `rangeBoundsByType("quarter")` 的結果，確認月份區間符合目前月份所在季度。
4. 檢查瀏覽器 console 是否有新增錯誤。

完成後請依 comm.md「Step 4 完成後摘要格式」把結果寫入 `docs/CODEX_RESULT.md`。
