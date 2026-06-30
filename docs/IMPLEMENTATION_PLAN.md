# IMPLEMENTATION_PLAN.md

## Branch

Before starting implementation, create and switch to the new branch:

```
git checkout -b add_hospital_yadong
```

Base branch: `v1.5_IndexedDB`

## 背景

新增「亞東」作為醫院欄位的新選項，採用與「安康耕莘」完全相同的處理模式（向下相容 fallback，不直接修改 Supabase check constraint）。`FUNCTION_UI_PLAN.md` 已更新到 v1.7，本任務只需同步 code。

## 修改範圍

### 1. `index.html`

約第 233-244 行，醫院 `<select id="hospital">`。在 `安康耕莘` 的 `<option>` 之後、`其他` 之前插入：

```html
<option value="亞東">亞東</option>
```

### 2. `app.js`

- 約第 832 行，`FORM_HOSPITALS_AS_OTHER`：把 `"亞東"` 加進這個 Set。

```js
const FORM_HOSPITALS_AS_OTHER = new Set(["未送", "未選", "安康耕莘", "亞東"]);
```

- 約第 2846-2864 行，`parseHospitalForForm`：在 `安康耕莘` 那個 if 分支之後，新增對稱的 `亞東` 分支：

```js
if (row.hospital === "其他" && row.hospital_custom === "亞東") {
  return "亞東";
}
```

- 同一個函式內，`allowed` 陣列（約第 2859 行）加入 `"亞東"`：

```js
const allowed = ["未選", "雙和", "永和耕莘", "慈濟", "新店耕莘", "板醫", "西園", "台大", "安康耕莘", "亞東", "其他", "未送"];
```

`normalizeHospitalForDb` 不需要額外修改 ——`FORM_HOSPITALS_AS_OTHER` 更新後，`raw === "亞東"` 會自動走第 847 行那個分支，轉成 `{ hospital: "其他", hospital_custom: "亞東" }`，跟 `安康耕莘` 邏輯一致。

### 不在本次範圍內

- 不需要新增 Supabase migration（`亞東` 不是直接 DB enum 值，走 `其他` fallback，現有 check constraint 已經涵蓋 `其他`）。
- 不修改 `DB_DIRECT_HOSPITALS`。
- 不修改其他無關 code。

## 驗證步驟（必跑）

1. `node --check app.js`
2. `python3 -m http.server 5500`，開啟 `http://localhost:5500/`
3. 手動驗證：
   - 醫院下拉選單可看到「亞東」選項，位置在「安康耕莘」之後、「其他」之前。
   - 新增一筆出勤，醫院選「亞東」，儲存後同步成功（不會被 check constraint 擋掉）。
   - 從歷史紀錄打開剛剛那筆，確認醫院欄位正確顯示回「亞東」（不是顯示成「其他」）。
4. 檢查瀏覽器 console 是否有新增錯誤。

完成後請依 comm.md「Step 4 完成後摘要格式」把結果寫入 `docs/CODEX_RESULT.md`。
