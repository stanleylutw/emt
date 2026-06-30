# IMPLEMENTATION_PLAN.md

## Branch

Before starting implementation, create and switch to the new branch:

```
git checkout -b perf_cache_bust_and_pending_queue_read
```

Base branch: `main`

## 背景

兩個獨立、範圍很小的小修正，一起做：

1. **Cache-busting**：之前「亞東」上線時發生使用者手機看到舊版 `index.html`/`app.js`（GitHub Pages `cache-control: max-age=600`，沒有 service worker，純靠瀏覽器/CDN 快取擋住）。要讓 `app.js`/`styles.css` 的 URL 帶版本號，這樣每次改版才會強制使用者瀏覽器重新抓取。
2. **`loadPendingQueueCache()` 多餘的 IndexedDB 讀取**（Minor bug）：目前用 `state.pendingQueueCache` 陣列長度判斷「要不要重新讀 IndexedDB」，導致 queue 真的清空為 0 筆之後，每次呼叫都會重新觸發一次 IndexedDB 讀取，浪費 I/O。

`FUNCTION_UI_PLAN.md` 已更新到 v1.8，請依本文件實作 code。

---

## Bug/任務 1：Cache-busting

### 現況

- `app.js:4`：`const APP_VERSION = "1.6";`
- `app.js:5`：`const APP_RELEASE_STAMP = "2604141158";`
- `index.html:10`：`<link rel="stylesheet" href="styles.css" />`
- `index.html:435`：`<script src="app.js"></script>`

本專案沒有 build step（純手動部署到 GitHub Pages），所以無法在 build time 自動把 `APP_RELEASE_STAMP` 注入到 `<script src>`。採用「手動同步維護兩個值」的做法。

### 修法

1. 在 `index.html` 把這兩個 tag 改成帶 query string：

```html
<link rel="stylesheet" href="styles.css?v=2604141158" />
```

```html
<script src="app.js?v=2604141158"></script>
```

   這裡的 `2604141158` 必須跟 `app.js` 裡目前的 `APP_RELEASE_STAMP` 數值完全一致（請直接讀 `app.js` 裡目前的值來填，不要憑空編一個新值）。

2. 在 `README.md` 的 `## Release Notes` 段落（約第 48-53 行），補一條規則：

```markdown
- When bumping `APP_RELEASE_STAMP` in `app.js`, also update the matching `?v=` query string on the `app.js` and `styles.css` tags in `index.html` to the same value — this is what forces browsers/GitHub Pages cache to fetch the new build.
```

   這樣以後每次改 `APP_RELEASE_STAMP` 時，工程師才知道要同步改 `index.html`。

### 不在本次範圍內

- 不引入 service worker、不引入任何 build 工具（例如 webpack/vite）。
- 不需要自動化（例如 git hook 自動同步兩處數值）——目前先用文件規則約束，未來如果常常忘記同步，可以再討論要不要自動化。

---

## Bug/任務 2：`loadPendingQueueCache()` 多餘的 IndexedDB 讀取

### 現況

`app.js:270-282`：

```js
const loadPendingQueueCache = async () => {
  const owner = state.user?.id || "guest";
  if (state.pendingQueueOwner !== owner) {
    state.pendingQueueCache = [];
    state.pendingQueueOwner = owner;
  }
  if (!state.pendingQueueCache || !state.pendingQueueCache.length) {
    const cached = await localDbGet(pendingQueueKey());
    ...
```

`!state.pendingQueueCache.length` 沒辦法區分「這個 owner 從來沒載入過」跟「已經載入過、且目前真的是空陣列」，所以 queue 清空後，下次呼叫還是會重新打一次 IndexedDB。

### 修法

1. 在 `app.js` 第 7 行附近的 `state` 物件，新增一個欄位（找到 `pendingQueueOwner: null,` 那一行，緊接著加在它旁邊）：

```js
pendingQueueLoaded: false,
```

2. 修改 `loadPendingQueueCache()`（約第 270-282 行），用這個旗標取代陣列長度判斷：

```js
const loadPendingQueueCache = async () => {
  const owner = state.user?.id || "guest";
  if (state.pendingQueueOwner !== owner) {
    state.pendingQueueCache = [];
    state.pendingQueueOwner = owner;
    state.pendingQueueLoaded = false;
  }
  if (!state.pendingQueueLoaded) {
    const cached = await localDbGet(pendingQueueKey());
    if (Array.isArray(cached)) {
      state.pendingQueueCache = cached;
      state.pendingQueueLoaded = true;
      addDebugLog("pending.cache.loaded", { count: cached.length });
      return;
    }
    // one-time fallback migration from legacy localStorage queue
    try {
      const legacyRaw = localStorage.getItem(PENDING_SYNC_KEY);
      if (legacyRaw) {
        const legacyParsed = JSON.parse(legacyRaw);
        if (Array.isArray(legacyParsed) && legacyParsed.length) {
          state.pendingQueueCache = legacyParsed.slice(-PENDING_SYNC_MAX);
          state.pendingQueueLoaded = true;
          persistPendingQueueAsync();
          localStorage.removeItem(PENDING_SYNC_KEY);
          addDebugLog("pending.cache.migrated", { count: state.pendingQueueCache.length });
          return;
        }
      }
    } catch {
      // ignore migration failure
    }
    state.pendingQueueLoaded = true;
  }
  state.pendingQueueCache = Array.isArray(state.pendingQueueCache) ? state.pendingQueueCache : [];
};
```

   請先讀完整個函式（含後面接續的程式碼，第 299-300 行左右那段 fallback 賦值），再用上面這個結構整合，不要遺漏任何原本的分支（特別是 legacy localStorage migration 那段）。重點只有一個：**判斷要不要打 IndexedDB，改用 `state.pendingQueueLoaded` 旗標，不要用陣列長度**，而且不管走哪個分支（從 IndexedDB 讀到、migration 讀到、或都沒有），最後都要把 `pendingQueueLoaded` 設成 `true`，避免每次呼叫都重複判斷。

3. 檢查 `clearSignedOutState()`（搜尋這個函式名稱）：登出時除了清空 `state.pendingQueueCache = []`，也要把 `state.pendingQueueLoaded = false` 一併重置，這樣下個使用者登入時才會重新從 IndexedDB 讀一次（而不是誤用上一個使用者「已載入」的旗標、略過讀取）。

4. 檢查 `writePendingQueue(items)`（約第 607-611 行）：寫入新 queue 內容時不需要動 `pendingQueueLoaded`（它只代表「有沒有讀過一次」，不代表內容新鮮度），維持原樣即可。

### 不在本次範圍內

- 不修改 pending queue 的同步邏輯本身（`processPendingQueue`、`enqueuePendingItem` 等），只動「要不要重新讀 IndexedDB」這個判斷式。
- 不修改 IndexedDB schema。

---

## 修改範圍（檔案清單）

- `index.html`：`app.js`/`styles.css` 加上 `?v=` cache-busting query string。
- `README.md`：Release Notes 補一條同步維護規則。
- `app.js`：`state.pendingQueueLoaded` 欄位、`loadPendingQueueCache()` 邏輯調整、`clearSignedOutState()` 補重置。

不要修改其他無關檔案。

## 驗證步驟（必跑）

1. `node --check app.js`
2. `python3 -m http.server 5500`，開啟 `http://localhost:5500/`
3. 確認頁面 Network 面板可看到 `app.js?v=...`、`styles.css?v=...` 有正確帶上版本號，且頁面正常載入運作（醫院下拉、開始/結束協勤都正常）。
4. 手動驗證 pending queue：建立一筆出勤觸發 pending queue，等同步完成清空後，用 console debug log 確認 `pending.cache.loaded` 不會在 queue 已空的情況下被重複觸發（同一個 owner session 內，IndexedDB 讀取只發生一次）。
5. 登出再登入（或切換帳號）後，確認 pending 面板/同步行為正常，沒有沿用前一個使用者殘留的 pending cache。
6. 檢查瀏覽器 console 是否有新增錯誤。

完成後請依 comm.md「Step 4 完成後摘要格式」把結果寫入 `docs/CODEX_RESULT.md`。
