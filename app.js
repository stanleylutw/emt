const SUPABASE_URL = "https://iysshfoqqzdwkfeqnsda.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_9Tts206qgN5G3toPwcYv2g_V1Ct-W44";
const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);
const APP_VERSION = "1.6";
const APP_RELEASE_STAMP = "2604141158";

const state = {
  user: null,
  session: null,
  rows: [],
  busy: false,
  modeOverride: null,
  editRowId: null,
  editRowIsOpen: false,
  editRowIsStandby: false,
  editOriginalStartInput: "",
  editOriginalEndInput: "",
  eventSheetMode: "final",
  summaryRange: "today",
  summaryTouchStartX: null,
  processingPendingQueue: false,
  pendingQueueTimer: null,
  profile: {
    displayName: "",
    unit: "",
    title: "",
    phone: "",
    avatarDataUrl: ""
  },
  profileDraftAvatarDataUrl: "",
  availableHistoryDates: [],
  availableHistoryMonths: [],
  historyGranularity: "day",
  timelineOrder: "desc",
  healingStandbyRows: false,
  timelineEditMode: false,
  profileLoadPromise: null,
  refreshPromise: null,
  refreshRetryTimer: null,
  refreshRetryDelayMs: null,
  refreshRetryCount: 0,
  summaryPromise: null,
  summaryPromiseRange: null,
  liveUiTimer: null,
  liveUiLastMinute: null,
  pendingQueueCache: [],
  pendingQueueOwner: null,
  historyRenderCache: {},
  historyRowEditModeBySession: {},
  historyEditBackup: null,
  editingFromHistory: false,
  actionLocks: {},
  historyLoadingCount: 0,
  pendingPanelOpen: false
};

const el = {
  profileBtn: document.getElementById("profileBtn"),
  profileAvatar: document.getElementById("profileAvatar"),
  brandMeta: document.getElementById("brandMeta"),
  pendingStatus: document.getElementById("pendingStatus"),
  pendingPanel: document.getElementById("pendingPanel"),
  pendingPanelList: document.getElementById("pendingPanelList"),
  pendingPanelCloseBtn: document.getElementById("pendingPanelCloseBtn"),
  authCard: document.getElementById("authCard"),
  workCard: document.getElementById("workCard"),
  actionBar: document.getElementById("actionBar"),
  googleLoginBtn: document.getElementById("googleLoginBtn"),
  logoutBtn: document.getElementById("logoutBtn"),

  sumDutyHours: document.getElementById("sumDutyHours"),
  sumEventCount: document.getElementById("sumEventCount"),
  sumTransported: document.getElementById("sumTransported"),
  summaryCard: document.getElementById("summaryCard"),
  summaryTabs: document.getElementById("summaryTabs"),
  summaryHistory: document.getElementById("summaryHistory"),
  historyToggleBtn: document.getElementById("historyToggleBtn"),
  historyPanel: document.getElementById("historyPanel"),
  historyGranularity: document.getElementById("historyGranularity"),
  historyDateList: document.getElementById("historyDateList"),
  historyImportBtn: document.getElementById("historyImportBtn"),
  historyImportFile: document.getElementById("historyImportFile"),
  historyLoading: document.getElementById("historyLoading"),
  historyList: document.getElementById("historyList"),

  startShiftBtn: document.getElementById("startShiftBtn"),
  resumeShiftBtn: document.getElementById("resumeShiftBtn"),
  todayResumeWrap: document.getElementById("todayResumeWrap"),
  todayEmpty: document.getElementById("todayEmpty"),
  sessionForm: document.getElementById("sessionForm"),
  displayName: document.getElementById("displayName"),
  startTime: document.getElementById("startTime"),
  fillStartNowBtn: document.getElementById("fillStartNowBtn"),
  taskType: document.getElementById("taskType"),
  taskTypeCustomWrap: document.getElementById("taskTypeCustomWrap"),
  taskTypeCustom: document.getElementById("taskTypeCustom"),
  deleteTodayBtn: document.getElementById("deleteTodayBtn"),
  sortTimelineBtn: document.getElementById("sortTimelineBtn"),
  sessionStatus: document.getElementById("sessionStatus"),

  timelineList: document.getElementById("timelineList"),
  startEventBtn: document.getElementById("startEventBtn"),
  finishEventBtn: document.getElementById("finishEventBtn"),

  eventSheet: document.getElementById("eventSheet"),
  eventSheetTitle: document.getElementById("eventSheetTitle"),
  eventGuideToggleBtn: document.getElementById("eventGuideToggleBtn"),
  eventCriticalGuide: document.getElementById("eventCriticalGuide"),
  eventForm: document.getElementById("eventForm"),
  saveDraftBtn: document.getElementById("saveDraftBtn"),
  confirmFinishBtn: document.getElementById("confirmFinishBtn"),
  eventStartTime: document.getElementById("eventStartTime"),
  fillEventStartNowBtn: document.getElementById("fillEventStartNowBtn"),
  eventFinishTime: document.getElementById("eventFinishTime"),
  fillEventNowBtn: document.getElementById("fillEventNowBtn"),
  cancelEventBtn: document.getElementById("cancelEventBtn"),
  hospital: document.getElementById("hospital"),
  patientCount: document.getElementById("patientCount"),
  caseType: document.getElementById("caseType"),
  gender: document.getElementById("gender"),
  ageGroup: document.getElementById("ageGroup"),
  glucose: document.getElementById("glucose"),
  chiefComplaint: document.getElementById("chiefComplaint"),
  gcsEye: document.getElementById("gcsEye"),
  gcsVerbal: document.getElementById("gcsVerbal"),
  gcsMotor: document.getElementById("gcsMotor"),
  gcsSummary: document.getElementById("gcsSummary"),
  bp: document.getElementById("bp"),
  spo2: document.getElementById("spo2"),
  pulse: document.getElementById("pulse"),
  equipmentItems: Array.from(document.querySelectorAll("input[name='equipmentItem']")),
  memo: document.getElementById("memo"),
  eventStatus: document.getElementById("eventStatus"),

  profileSheet: document.getElementById("profileSheet"),
  profileForm: document.getElementById("profileForm"),
  profileBackBtn: document.getElementById("profileBackBtn"),
  profileEmail: document.getElementById("profileEmail"),
  profileDisplayName: document.getElementById("profileDisplayName"),
  profileUnit: document.getElementById("profileUnit"),
  profileTitle: document.getElementById("profileTitle"),
  profilePhone: document.getElementById("profilePhone"),
  profileAvatarPickBtn: document.getElementById("profileAvatarPickBtn"),
  profileAvatarFile: document.getElementById("profileAvatarFile"),
  profileAvatarPreview: document.getElementById("profileAvatarPreview"),
  copyDebugLogBtn: document.getElementById("copyDebugLogBtn"),
  clearDebugLogBtn: document.getElementById("clearDebugLogBtn"),
  profileStatus: document.getElementById("profileStatus"),
  syncIndicator: document.getElementById("syncIndicator"),
  syncText: document.getElementById("syncText"),
  appVersionText: document.getElementById("appVersionText"),
  appBuildTimeText: document.getElementById("appBuildTimeText")
};

const DEFAULT_AVATAR = "assets/star-of-life-transparent.png";
const SUMMARY_RANGE_ORDER = ["today", "month", "year", "all"];
const SUMMARY_RPC_NAME = "get_duty_summary";
const DB_TIMEOUT_MS = 12000;
const DB_MAX_ATTEMPTS = 3;
const DB_RETRY_BASE_MS = 700;
const DB_READ_TIMEOUT_MS = 8000;
const DB_READ_ATTEMPTS = 2;
const DB_WRITE_TIMEOUT_MS = 8000;
const DB_WRITE_ATTEMPTS = 2;
const DRAFT_WRITE_TIMEOUT_MS = 5000;
const DRAFT_WRITE_ATTEMPTS = 1;
const PENDING_SYNC_TIMEOUT_MS = 15000;
const PENDING_SYNC_ATTEMPTS = 2;
const REFRESH_TIMEOUT_RETRY_DELAYS_MS = [2000, 5000, 15000, 30000];
const DEBUG_LOG_KEY = "emt_debug_logs_v1";
const DEBUG_LOG_MAX = 300;
const PENDING_SYNC_KEY = "emt_pending_sync_v1";
const PENDING_SYNC_MAX = 200;
const PROFILE_TABLE = "profiles";
const LOCAL_DB_NAME = "emt_local_db";
const LOCAL_DB_VERSION = 1;
const LOCAL_DB_STORE_KV = "kv";

const pad2 = (n) => String(n).padStart(2, "0");

let localDbOpenPromise = null;

const hasIndexedDb = () => typeof window !== "undefined" && "indexedDB" in window;

const openLocalDb = async () => {
  if (!hasIndexedDb()) return null;
  if (localDbOpenPromise) return localDbOpenPromise;
  localDbOpenPromise = new Promise((resolve, reject) => {
    const req = window.indexedDB.open(LOCAL_DB_NAME, LOCAL_DB_VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(LOCAL_DB_STORE_KV)) {
        db.createObjectStore(LOCAL_DB_STORE_KV, { keyPath: "k" });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error || new Error("IndexedDB open failed"));
  }).catch((err) => {
    addDebugLog("localdb.open.error", { message: String(err?.message || "") }, "warn");
    localDbOpenPromise = Promise.resolve(null);
    return null;
  });
  return localDbOpenPromise;
};

const localDbGet = async (key) => {
  try {
    const db = await openLocalDb();
    if (!db) return null;
    return await new Promise((resolve, reject) => {
      const tx = db.transaction(LOCAL_DB_STORE_KV, "readonly");
      const st = tx.objectStore(LOCAL_DB_STORE_KV);
      const req = st.get(key);
      req.onsuccess = () => resolve(req.result?.v ?? null);
      req.onerror = () => reject(req.error || new Error("IndexedDB get failed"));
    });
  } catch (err) {
    addDebugLog("localdb.get.error", { key, message: String(err?.message || "") }, "warn");
    return null;
  }
};

const localDbSet = async (key, value) => {
  try {
    const db = await openLocalDb();
    if (!db) return false;
    await new Promise((resolve, reject) => {
      const tx = db.transaction(LOCAL_DB_STORE_KV, "readwrite");
      const st = tx.objectStore(LOCAL_DB_STORE_KV);
      st.put({ k: key, v: value, updatedAt: new Date().toISOString() });
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error || new Error("IndexedDB set failed"));
      tx.onabort = () => reject(tx.error || new Error("IndexedDB set aborted"));
    });
    return true;
  } catch (err) {
    addDebugLog("localdb.set.error", { key, message: String(err?.message || "") }, "warn");
    return false;
  }
};

const localDbRemove = async (key) => {
  try {
    const db = await openLocalDb();
    if (!db) return false;
    await new Promise((resolve, reject) => {
      const tx = db.transaction(LOCAL_DB_STORE_KV, "readwrite");
      const st = tx.objectStore(LOCAL_DB_STORE_KV);
      st.delete(key);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error || new Error("IndexedDB remove failed"));
      tx.onabort = () => reject(tx.error || new Error("IndexedDB remove aborted"));
    });
    return true;
  } catch (err) {
    addDebugLog("localdb.remove.error", { key, message: String(err?.message || "") }, "warn");
    return false;
  }
};

const pendingQueueKey = () => `pendingQueue:${state.user?.id || "guest"}`;
const snapshotKey = () => `snapshot:${state.user?.id || "guest"}`;
const profileCacheKey = () => `profile:${state.user?.id || "guest"}`;

const persistPendingQueueAsync = () => {
  const payload = Array.isArray(state.pendingQueueCache) ? state.pendingQueueCache.slice(-PENDING_SYNC_MAX) : [];
  localDbSet(pendingQueueKey(), payload).catch(() => {});
};

const loadPendingQueueCache = async () => {
  const owner = state.user?.id || "guest";
  if (state.pendingQueueOwner !== owner) {
    state.pendingQueueCache = [];
    state.pendingQueueOwner = owner;
  }
  if (!state.pendingQueueCache || !state.pendingQueueCache.length) {
    const cached = await localDbGet(pendingQueueKey());
    if (Array.isArray(cached)) {
      state.pendingQueueCache = cached;
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
          persistPendingQueueAsync();
          localStorage.removeItem(PENDING_SYNC_KEY);
          addDebugLog("pending.cache.migrated", { count: state.pendingQueueCache.length });
          return;
        }
      }
    } catch {
      // ignore migration failure
    }
  }
  state.pendingQueueCache = Array.isArray(state.pendingQueueCache) ? state.pendingQueueCache : [];
};

const saveSnapshotToLocal = async () => {
  if (!state.user) return;
  const payload = {
    session: state.session || null,
    rows: Array.isArray(state.rows) ? state.rows : [],
    savedAt: new Date().toISOString()
  };
  await localDbSet(snapshotKey(), payload);
};

const loadSnapshotFromLocal = async () => {
  if (!state.user) return false;
  const cached = await localDbGet(snapshotKey());
  if (!cached || typeof cached !== "object") return false;
  state.session = cached.session || null;
  state.rows = Array.isArray(cached.rows) ? cached.rows : [];
  addDebugLog("snapshot.loaded", { rows: state.rows.length, hasSession: Boolean(state.session) });
  return true;
};

const toBuildStamp = (date = new Date()) => {
  const yy = String(date.getFullYear()).slice(-2);
  const mm = pad2(date.getMonth() + 1);
  const dd = pad2(date.getDate());
  const hh = pad2(date.getHours());
  const min = pad2(date.getMinutes());
  return `${yy}${mm}${dd}${hh}${min}`;
};

const resolveBuildStamp = () => {
  const lastModifiedRaw = String(document.lastModified || "").trim();
  if (lastModifiedRaw) {
    const parsed = new Date(lastModifiedRaw);
    if (!Number.isNaN(parsed.getTime())) {
      return toBuildStamp(parsed);
    }
  }
  return APP_RELEASE_STAMP;
};

const toInput24h = (date = new Date()) => {
  const y = date.getFullYear();
  const m = pad2(date.getMonth() + 1);
  const d = pad2(date.getDate());
  const hh = pad2(date.getHours());
  const mm = pad2(date.getMinutes());
  return `${y}-${m}-${d} ${hh}:${mm}`;
};

const parseInput24h = (text) => {
  const v = (text || "").trim();
  const m = v.match(/^(\d{4})-(\d{2})-(\d{2})\s+(\d{2}):(\d{2})$/);
  if (!m) return null;
  const year = Number(m[1]);
  const month = Number(m[2]);
  const day = Number(m[3]);
  const hour = Number(m[4]);
  const minute = Number(m[5]);
  if (month < 1 || month > 12) return null;
  if (day < 1 || day > 31) return null;
  if (hour < 0 || hour > 23) return null;
  if (minute < 0 || minute > 59) return null;
  const dt = new Date(year, month - 1, day, hour, minute, 0, 0);
  if (
    dt.getFullYear() !== year ||
    dt.getMonth() !== month - 1 ||
    dt.getDate() !== day ||
    dt.getHours() !== hour ||
    dt.getMinutes() !== minute
  ) {
    return null;
  }
  return dt;
};

const formatDateTime = (iso) => {
  if (!iso) return "-";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString("zh-TW", {
    hour12: false,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit"
  });
};

const formatHm = (iso) => {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "--:--";
  return d.toLocaleTimeString("zh-TW", { hour12: false, hour: "2-digit", minute: "2-digit" });
};

const formatDurationHm = (ms) => {
  const safeMs = Number.isFinite(ms) ? Math.max(0, ms) : 0;
  const totalMin = Math.floor(safeMs / 60000);
  const hh = String(Math.floor(totalMin / 60)).padStart(2, "0");
  const mm = String(totalMin % 60).padStart(2, "0");
  return `${hh}:${mm}`;
};

const toDateInput = (date = new Date()) => {
  const y = date.getFullYear();
  const m = pad2(date.getMonth() + 1);
  const d = pad2(date.getDate());
  return `${y}-${m}-${d}`;
};

const isoToDateKey = (iso) => {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return toDateInput(d);
};

const isoToMonthKey = (iso) => {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const y = d.getFullYear();
  const m = pad2(d.getMonth() + 1);
  return `${y}-${m}`;
};

const formatMonthDay = (iso) => {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "--/--";
  return `${pad2(d.getMonth() + 1)}/${pad2(d.getDate())}`;
};

const dayBounds = () => {
  const n = new Date();
  const s = new Date(n.getFullYear(), n.getMonth(), n.getDate());
  const e = new Date(n.getFullYear(), n.getMonth(), n.getDate() + 1);
  return { startIso: s.toISOString(), endIso: e.toISOString() };
};

const isSessionStartToday = (session) => {
  if (!session?.start_time) return false;
  const start = new Date(session.start_time);
  if (Number.isNaN(start.getTime())) return false;
  const { startIso, endIso } = dayBounds();
  return start >= new Date(startIso) && start < new Date(endIso);
};

const profileStorageKey = () => (state.user ? `emt_profile_${state.user.id}` : "");

const readLocalProfile = () => {
  if (!state.user) return null;
  try {
    const raw = localStorage.getItem(profileStorageKey());
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return {
      displayName: parsed.displayName || "",
      unit: parsed.unit || "",
      title: parsed.title || "",
      phone: parsed.phone || "",
      avatarDataUrl: parsed.avatarDataUrl || ""
    };
  } catch {
    return null;
  }
};

const writeLocalProfile = (profile) => {
  if (!state.user) return;
  try {
    localStorage.setItem(profileStorageKey(), JSON.stringify(profile));
  } catch {
    // ignore local cache failure
  }
};

const normalizeProfile = (profile) => ({
  displayName: profile?.displayName || "",
  unit: profile?.unit || "",
  title: profile?.title || "",
  phone: profile?.phone || "",
  avatarDataUrl: profile?.avatarDataUrl || ""
});

const readCachedProfile = async () => {
  if (!state.user) return null;
  const fromIdb = await localDbGet(profileCacheKey());
  if (fromIdb && typeof fromIdb === "object") {
    return normalizeProfile(fromIdb);
  }
  return readLocalProfile();
};

const writeCachedProfile = async (profile) => {
  if (!state.user) return;
  const normalized = normalizeProfile(profile);
  writeLocalProfile(normalized);
  await localDbSet(profileCacheKey(), normalized);
};

const getEffectiveDisplayName = () =>
  state.profile.displayName || state.user?.user_metadata?.full_name || state.user?.email || "使用者";

const getEffectiveAvatar = () => state.profile.avatarDataUrl || DEFAULT_AVATAR;

const setHint = (target, msg) => {
  if (!target) return;
  target.textContent = msg || "";
};

const triggerDownload = (filename, content, mimeType = "text/plain;charset=utf-8") => {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 300);
};

const toCsvCell = (value) => {
  const s = String(value ?? "");
  if (/[",\n\r]/.test(s)) {
    return `"${s.replace(/"/g, "\"\"")}"`;
  }
  return s;
};

const confirmDeleteByCode = (labelText = "刪除") => {
  const code = String(Math.floor(Math.random() * 10000)).padStart(4, "0");
  const input = window.prompt(`請輸入 4 位數確認碼以${labelText}：${code}`);
  if (input === null) return false;
  return input.trim() === code;
};

const readDebugLogs = () => {
  try {
    const raw = localStorage.getItem(DEBUG_LOG_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const writeDebugLogs = (rows) => {
  try {
    localStorage.setItem(DEBUG_LOG_KEY, JSON.stringify(rows.slice(-DEBUG_LOG_MAX)));
  } catch {
    // ignore write failure
  }
};

const addDebugLog = (event, meta = {}, level = "info") => {
  const row = {
    ts: new Date().toISOString(),
    level,
    event,
    online: navigator.onLine,
    ...meta
  };
  const next = [...readDebugLogs(), row].slice(-DEBUG_LOG_MAX);
  writeDebugLogs(next);
  if (level === "error") {
    console.error("[EMT-DEBUG]", row);
  } else if (level === "warn") {
    console.warn("[EMT-DEBUG]", row);
  } else {
    console.log("[EMT-DEBUG]", row);
  }
};

const applyFooterVersion = () => {
  if (el.appVersionText) {
    el.appVersionText.textContent = APP_VERSION;
  }
  if (el.appBuildTimeText) {
    el.appBuildTimeText.textContent = resolveBuildStamp();
  }
};

const exportDebugLogsText = () => {
  const logs = readDebugLogs();
  return JSON.stringify(
    {
      exportedAt: new Date().toISOString(),
      userId: state.user?.id || null,
      sessionId: state.session?.id || null,
      logCount: logs.length,
      logs
    },
    null,
    2
  );
};

const readPendingQueue = () => {
  if (!Array.isArray(state.pendingQueueCache)) {
    state.pendingQueueCache = [];
  }
  return state.pendingQueueCache;
};

const writePendingQueue = (items) => {
  state.pendingQueueOwner = state.user?.id || "guest";
  state.pendingQueueCache = Array.isArray(items) ? items.slice(-PENDING_SYNC_MAX) : [];
  persistPendingQueueAsync();
};

const purgePendingQueueBySessionIds = (sessionIds) => {
  const idSet = new Set((Array.isArray(sessionIds) ? sessionIds : []).map((id) => String(id)).filter(Boolean));
  if (!idSet.size) return;
  const items = readPendingQueue();
  const kept = items.filter((item) => {
    const sid = item?.sessionId || item?.payload?.session_id;
    return !(sid && idSet.has(String(sid)));
  });
  if (kept.length !== items.length) {
    writePendingQueue(kept);
    updatePendingStatusUI();
    addDebugLog("pending.purge_by_session", { removed: items.length - kept.length, sessions: idSet.size });
  }
};

const pendingTypeLabel = (item) => {
  const type = item?.type || "unknown";
  const labels = {
    dispatch_insert: "新增勤務明細",
    dispatch_update: "更新勤務明細",
    dispatch_delete: "刪除勤務明細",
    session_update: "更新勤務主單",
    profile_upsert: "儲存個人資料"
  };
  return labels[type] || type;
};

const pendingItemMeta = (item) => {
  const parts = [];
  if (item?.rowId) parts.push(`row:${item.rowId}`);
  if (item?.localRowId) parts.push(`local:${item.localRowId}`);
  if (item?.sessionId || item?.payload?.session_id) parts.push(`session:${item.sessionId || item.payload.session_id}`);
  if (item?.createdAt) parts.push(`建立:${formatDateTime(item.createdAt)}`);
  if (item?.lastTriedAt) parts.push(`上次:${formatDateTime(item.lastTriedAt)}`);
  if (Number(item?.tries || 0) > 0) parts.push(`重試:${Number(item.tries)}`);
  return parts.join(" / ");
};

const renderPendingPanel = () => {
  const blocked = readPendingQueue().filter((x) => x?.blocked);
  if (el.pendingStatus) {
    el.pendingStatus.setAttribute("aria-expanded", String(state.pendingPanelOpen && blocked.length > 0));
  }
  if (!el.pendingPanel || !el.pendingPanelList) return;
  if (!blocked.length || !state.pendingPanelOpen) {
    el.pendingPanel.classList.add("hidden");
    el.pendingPanelList.innerHTML = "";
    if (!blocked.length) state.pendingPanelOpen = false;
    return;
  }

  el.pendingPanel.classList.remove("hidden");
  el.pendingPanelList.innerHTML = blocked
    .map(
      (item) => `
        <article class="pending-item">
          <div class="pending-item-title">
            <span>${escapeHtml(pendingTypeLabel(item))}</span>
            <span>${escapeHtml(item.id || "")}</span>
          </div>
          <p class="pending-item-meta">${escapeHtml(pendingItemMeta(item) || "無額外資訊")}</p>
          <p class="pending-error">${escapeHtml(item.lastError || "同步失敗，請重試。")}</p>
          <div class="pending-item-actions">
            <button type="button" class="ghost" data-pending-action="retry" data-pending-id="${escapeHtml(item.id || "")}">重試</button>
            <button type="button" class="ghost" data-pending-action="clear" data-pending-id="${escapeHtml(item.id || "")}">清除</button>
          </div>
        </article>
      `
    )
    .join("");
};

const updatePendingStatusUI = () => {
  const items = readPendingQueue();
  const count = items.length;
  const blockedCount = items.filter((x) => x?.blocked).length;
  if (el.pendingStatus) {
    if (!count) {
      el.pendingStatus.classList.add("hidden");
      el.pendingStatus.textContent = "";
    } else {
      el.pendingStatus.classList.remove("hidden");
      el.pendingStatus.textContent = blockedCount ? `待同步 ${count} 筆（同步異常 ${blockedCount} 筆）` : `待同步 ${count} 筆`;
    }
  }
  renderPendingPanel();
};

const enqueuePendingItem = (item) => {
  const current = readPendingQueue();
  const row = {
    id: `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    createdAt: new Date().toISOString(),
    tries: 0,
    ...item
  };
  // update row payload should overwrite old pending update for same row
  if (row.type === "dispatch_update" && row.rowId) {
    row.payload = normalizeDispatchPayloadForDb(row.payload);
    const filtered = current.filter((x) => !(x.type === "dispatch_update" && x.rowId === row.rowId));
    writePendingQueue([...filtered, row]);
  } else if (row.type === "session_update" && row.sessionId) {
    const existing = current.find((x) => x.type === "session_update" && x.sessionId === row.sessionId);
    if (existing) {
      const merged = {
        ...existing,
        payload: { ...(existing.payload || {}), ...(row.payload || {}) },
        tries: 0,
        blocked: false,
        lastError: null,
        lastTriedAt: null
      };
      writePendingQueue(current.map((x) => (x.id === existing.id ? merged : x)));
    } else {
      writePendingQueue([...current, row]);
    }
  } else if (row.type === "profile_upsert") {
    const filtered = current.filter((x) => x.type !== "profile_upsert");
    writePendingQueue([...filtered, row]);
  } else if (row.type === "dispatch_insert") {
    row.payload = normalizeDispatchPayloadForDb(row.payload);
    const rowTimeMs = new Date(row.payload?.dispatch_time || "").getTime();
    const rowSegment = parseNote(row.payload?.note).segment || "event";
    const rowSessionId = String(row.payload?.session_id || "");
    const hasNearDuplicate = current.some((x) => {
      if (x.type !== "dispatch_insert") return false;
      const xSessionId = String(x.payload?.session_id || "");
      if (xSessionId !== rowSessionId) return false;
      const xSegment = parseNote(x.payload?.note).segment || "event";
      if (xSegment !== rowSegment) return false;
      const xTimeMs = new Date(x.payload?.dispatch_time || "").getTime();
      if (!Number.isFinite(rowTimeMs) || !Number.isFinite(xTimeMs)) return false;
      return Math.abs(rowTimeMs - xTimeMs) <= 20 * 1000;
    });
    if (hasNearDuplicate) {
      addDebugLog("pending.enqueue.skip_near_duplicate", {
        type: row.type,
        segment: rowSegment,
        sessionId: rowSessionId
      });
      return null;
    }

    const key = [
      row.payload?.session_id || "",
      row.payload?.dispatch_time || "",
      row.payload?.note || "",
      row.payload?.hospital || "",
      row.payload?.hospital_custom || "",
      row.payload?.patient_count || "",
      row.payload?.patient_count_custom || "",
      row.payload?.case_type || "",
      row.payload?.case_type_custom || "",
      row.payload?.chief_complaint || ""
    ].join("|");
    const exists = current.some((x) => {
      if (x.type !== "dispatch_insert") return false;
      const xKey = [
        x.payload?.session_id || "",
        x.payload?.dispatch_time || "",
        x.payload?.note || "",
        x.payload?.hospital || "",
        x.payload?.hospital_custom || "",
        x.payload?.patient_count || "",
        x.payload?.patient_count_custom || "",
        x.payload?.case_type || "",
        x.payload?.case_type_custom || "",
        x.payload?.chief_complaint || ""
      ].join("|");
      return xKey === key;
    });
    if (exists) {
      addDebugLog("pending.enqueue.skip_duplicate", { type: row.type });
      return null;
    }
    writePendingQueue([...current, row]);
  } else {
    writePendingQueue([...current, row]);
  }
  updatePendingStatusUI();
  addDebugLog("pending.enqueue", { type: row.type, rowId: row.rowId || null });
  return row.id;
};

const removePendingItem = (id) => {
  writePendingQueue(readPendingQueue().filter((x) => x.id !== id));
  updatePendingStatusUI();
};

const updatePendingItem = (id, patch) => {
  const next = readPendingQueue().map((x) => (x.id === id ? { ...x, ...patch } : x));
  writePendingQueue(next);
  updatePendingStatusUI();
};

const retryBlockedPendingItem = async (id) => {
  const item = readPendingQueue().find((x) => x.id === id);
  if (!item) return;
  updatePendingItem(id, {
    blocked: false,
    lastError: null,
    lastTriedAt: null
  });
  setHint(el.sessionStatus, "已解除同步異常，正在重試。");
  await processPendingQueue();
};

const clearBlockedPendingItem = (id) => {
  const item = readPendingQueue().find((x) => x.id === id);
  if (!item) return;
  if (!confirmDeleteByCode("清除此筆同步異常")) {
    setHint(el.sessionStatus, "確認碼錯誤或已取消，未清除。");
    return;
  }
  removePendingItem(id);
  setHint(el.sessionStatus, "已清除一筆同步異常。");
};

const DB_DIRECT_HOSPITALS = new Set(["雙和", "永和耕莘", "慈濟", "新店耕莘", "板醫", "西園", "台大"]);
const FORM_HOSPITALS_AS_OTHER = new Set(["未送", "未選", "安康耕莘"]);
const DB_DIRECT_CASE_TYPES = new Set(["外科", "內科", "火警"]);

const normalizeHospitalForDb = (hospitalValue, hospitalCustomValue = "") => {
  const raw = String(hospitalValue ?? "").trim();
  const custom = String(hospitalCustomValue ?? "").trim();

  if (DB_DIRECT_HOSPITALS.has(raw)) {
    return { hospital: raw, hospital_custom: null };
  }

  if (raw === "其他") {
    return { hospital: "其他", hospital_custom: custom || "其他" };
  }

  if (FORM_HOSPITALS_AS_OTHER.has(raw)) {
    return { hospital: "其他", hospital_custom: raw };
  }

  if (custom) {
    return { hospital: "其他", hospital_custom: custom };
  }

  return { hospital: "其他", hospital_custom: "未選" };
};

const normalizeCaseTypeForDb = (caseTypeValue, caseTypeCustomValue = "") => {
  const raw = String(caseTypeValue ?? "").trim();
  const custom = String(caseTypeCustomValue ?? "").trim();

  if (DB_DIRECT_CASE_TYPES.has(raw)) {
    return { case_type: raw, case_type_custom: null };
  }

  return { case_type: "其他", case_type_custom: custom || raw || "其他" };
};

const normalizeDispatchPayloadForDb = (payload) => {
  if (!payload || typeof payload !== "object") return payload;
  const next = { ...payload };
  const normalizedHospital = normalizeHospitalForDb(next.hospital, next.hospital_custom);
  next.hospital = normalizedHospital.hospital;
  next.hospital_custom = normalizedHospital.hospital_custom;

  const normalizedCaseType = normalizeCaseTypeForDb(next.case_type, next.case_type_custom);
  next.case_type = normalizedCaseType.case_type;
  next.case_type_custom = normalizedCaseType.case_type_custom;

  const rawCount = String(next.patient_count ?? "").trim();
  const rawCustom = String(next.patient_count_custom ?? "").trim();
  const allowed = new Set(["1", "2", "其他"]);

  if (rawCount === "0") {
    next.patient_count = "其他";
    next.patient_count_custom = rawCustom || "0";
    return next;
  }

  if (allowed.has(rawCount)) {
    if (rawCount !== "其他") {
      next.patient_count_custom = null;
    } else if (!rawCustom) {
      next.patient_count_custom = "1";
    }
    return next;
  }

  const asNum = Number(rawCount);
  if (Number.isFinite(asNum)) {
    if (asNum <= 0) {
      next.patient_count = "其他";
      next.patient_count_custom = rawCustom || "0";
      return next;
    }
    if (asNum === 1) {
      next.patient_count = "1";
      next.patient_count_custom = null;
      return next;
    }
    if (asNum >= 2) {
      next.patient_count = "2";
      next.patient_count_custom = null;
      return next;
    }
  }

  next.patient_count = "1";
  next.patient_count_custom = null;
  return next;
};

const isLocalRowId = (id) => typeof id === "string" && id.startsWith("local_");

const makeLocalRowId = () => `local_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

const getPendingInsertByLocalRowId = (localRowId) =>
  readPendingQueue().find((x) => x.type === "dispatch_insert" && x.localRowId === localRowId) || null;

const updatePendingInsertPayloadByLocalRowId = (localRowId, patchPayload) => {
  const item = getPendingInsertByLocalRowId(localRowId);
  if (!item) return false;
  const nextPayload = normalizeDispatchPayloadForDb({ ...(item.payload || {}), ...(patchPayload || {}) });
  updatePendingItem(item.id, {
    payload: nextPayload,
    blocked: false,
    tries: 0,
    lastError: null,
    lastTriedAt: null
  });
  return true;
};

const removePendingInsertByLocalRowId = (localRowId) => {
  const item = getPendingInsertByLocalRowId(localRowId);
  if (!item) return false;
  removePendingItem(item.id);
  return true;
};

const upsertLocalRowFromPayload = (rowId, payload) => {
  const idx = state.rows.findIndex((r) => String(r.id) === String(rowId));
  const merged = {
    ...(idx >= 0 ? state.rows[idx] : {}),
    ...payload,
    id: rowId
  };
  if (idx >= 0) {
    state.rows.splice(idx, 1, merged);
  } else {
    state.rows.push(merged);
  }
  state.rows.sort((a, b) => new Date(a.dispatch_time) - new Date(b.dispatch_time));
};

const applyLocalUiAfterMutation = () => {
  renderTimeline();
  renderAuth();
  updatePendingStatusUI();
  if (state.summaryRange === "today" && state.session) {
    setSummaryValues(summarizeSessionRows(state.session, state.rows || []));
  } else {
    renderSummary().catch(() => {});
  }
  saveSnapshotToLocal().catch(() => {});
};

const acquireActionLock = (key, ms = 1200) => {
  const now = Date.now();
  const until = Number(state.actionLocks?.[key] || 0);
  if (until > now) return false;
  state.actionLocks[key] = now + ms;
  return true;
};

const setSyncing = (on, text = "資料同步中...") => {
  state.busy = on;
  if (on) {
    el.syncText.textContent = text;
  }
  el.syncIndicator.setAttribute("aria-busy", on ? "true" : "false");
  el.syncIndicator.classList.toggle("hidden", !on);
  [
    el.startShiftBtn,
    el.resumeShiftBtn,
    el.startEventBtn,
    el.finishEventBtn,
    el.saveDraftBtn,
    el.confirmFinishBtn,
    el.cancelEventBtn,
    el.profileBackBtn,
    el.deleteTodayBtn
  ].forEach((btn) => {
    if (!btn) return;
    btn.disabled = on;
  });
  renderAuth();
};

const setHistoryLoading = (on, text = "讀取中...") => {
  if (!el.historyLoading) return;
  state.historyLoadingCount = Math.max(0, (state.historyLoadingCount || 0) + (on ? 1 : -1));
  const show = state.historyLoadingCount > 0;
  el.historyLoading.textContent = text;
  el.historyLoading.classList.toggle("hidden", !show);
};

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const withTimeout = (promiseFactory, timeoutMs, label = "資料庫請求") =>
  new Promise((resolve, reject) => {
    const controller = new AbortController();
    const timer = setTimeout(() => {
      controller.abort();
      const err = new Error(`${label} 逾時（${Math.round(timeoutMs / 1000)} 秒）`);
      err.isTimeout = true;
      reject(err);
    }, timeoutMs);
    Promise.resolve()
      .then(() => promiseFactory(controller.signal))
      .then((value) => {
        clearTimeout(timer);
        resolve(value);
      })
      .catch((err) => {
        clearTimeout(timer);
        reject(err);
      });
  });

const isRetryableDbError = (err) => {
  if (!err) return false;
  if (err.isTimeout) return true;
  const msg = String(err.message || "").toLowerCase();
  const code = String(err.code || "");
  if (code.startsWith("23")) return false; // constraints/duplicates are business errors
  const keywords = [
    "failed to fetch",
    "network",
    "timeout",
    "timed out",
    "fetch",
    "503",
    "504",
    "ecconnreset",
    "etimedout"
  ];
  return keywords.some((k) => msg.includes(k));
};

const dbQuery = async (queryFactory, options = {}) => {
  const {
    label = "資料庫請求",
    timeoutMs = DB_TIMEOUT_MS,
    attempts = DB_MAX_ATTEMPTS,
    retryBaseMs = DB_RETRY_BASE_MS,
    onRetryText
  } = options;

  const qStart = performance.now();
  addDebugLog("db.query.start", { label, attempts, timeoutMs });
  let lastErr = null;
  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    const aStart = performance.now();
    try {
      const result = await withTimeout(queryFactory, timeoutMs, label);
      addDebugLog("db.query.success", {
        label,
        attempt,
        elapsedMs: Math.round(performance.now() - aStart),
        totalMs: Math.round(performance.now() - qStart)
      });
      return result;
    } catch (err) {
      lastErr = err;
      const canRetry = attempt < attempts && isRetryableDbError(err);
      addDebugLog(
        "db.query.error",
        {
          label,
          attempt,
          canRetry,
          elapsedMs: Math.round(performance.now() - aStart),
          totalMs: Math.round(performance.now() - qStart),
          code: err?.code || null,
          message: String(err?.message || "unknown error")
        },
        canRetry ? "warn" : "error"
      );
      if (!canRetry) break;
      if (state.busy && typeof onRetryText === "function") {
        const msg = onRetryText(attempt + 1, attempts);
        if (msg) el.syncText.textContent = msg;
      }
      await sleep(retryBaseMs * 2 ** (attempt - 1));
    }
  }
  addDebugLog(
    "db.query.failed",
    {
      label,
      attempts,
      totalMs: Math.round(performance.now() - qStart),
      code: lastErr?.code || null,
      message: String(lastErr?.message || "unknown error")
    },
    "error"
  );
  throw lastErr || new Error(`${label} 失敗`);
};

const processPendingQueue = async () => {
  if (!state.user || state.processingPendingQueue || state.busy) return;
  state.processingPendingQueue = true;
  try {
    await loadPendingQueueCache();
    const items = readPendingQueue().filter((x) => !x?.blocked);
    if (!items.length) return;
    addDebugLog("pending.process.start", { count: items.length });
    let hadSuccess = false;
    for (const item of items) {
      try {
        if (item.type === "dispatch_update") {
          const normalizedPayload = normalizeDispatchPayloadForDb(item.payload || {});
          if (JSON.stringify(normalizedPayload) !== JSON.stringify(item.payload || {})) {
            updatePendingItem(item.id, { payload: normalizedPayload });
          }
          const { error } = await dbQuery(
            (signal) =>
              supabaseClient
                .from("duty_dispatches")
                .update(normalizedPayload)
                .eq("id", item.rowId)
                .abortSignal(signal),
            {
              label: "待同步補送：更新出勤紀錄",
              attempts: PENDING_SYNC_ATTEMPTS,
              timeoutMs: PENDING_SYNC_TIMEOUT_MS
            }
          );
          if (error) throw error;
        } else if (item.type === "dispatch_insert") {
          const normalizedPayload = normalizeDispatchPayloadForDb(item.payload || {});
          if (JSON.stringify(normalizedPayload) !== JSON.stringify(item.payload || {})) {
            updatePendingItem(item.id, { payload: normalizedPayload });
          }
          await insertDispatch(normalizedPayload, "待同步補送");
        } else if (item.type === "dispatch_delete") {
          const { error } = await dbQuery(
            (signal) =>
              supabaseClient
                .from("duty_dispatches")
                .delete()
                .eq("id", item.rowId)
                .abortSignal(signal),
            {
              label: "待同步補送：刪除勤務明細",
              attempts: PENDING_SYNC_ATTEMPTS,
              timeoutMs: PENDING_SYNC_TIMEOUT_MS
            }
          );
          if (error) throw error;
        } else if (item.type === "session_update") {
          const { error } = await dbQuery(
            (signal) =>
              supabaseClient
                .from("duty_sessions")
                .update(item.payload)
                .eq("id", item.sessionId)
                .abortSignal(signal),
            {
              label: "待同步補送：更新勤務主單",
              attempts: PENDING_SYNC_ATTEMPTS,
              timeoutMs: PENDING_SYNC_TIMEOUT_MS
            }
          );
          if (error) throw error;
        } else if (item.type === "profile_upsert") {
          const payload = item.payload || {};
          const { error } = await dbQuery(
            (signal) =>
              supabaseClient
                .from(PROFILE_TABLE)
                .upsert(payload, { onConflict: "user_id" })
                .abortSignal(signal),
            {
              label: "待同步補送：儲存個人資料",
              attempts: PENDING_SYNC_ATTEMPTS,
              timeoutMs: PENDING_SYNC_TIMEOUT_MS
            }
          );
          if (error) throw error;
        } else {
          removePendingItem(item.id);
          continue;
        }
        removePendingItem(item.id);
        hadSuccess = true;
        addDebugLog("pending.process.success", { id: item.id, type: item.type });
      } catch (err) {
        const errMsg = String(err?.message || "");
        const lowerMsg = errMsg.toLowerCase();
        const isPoisonPayload =
          lowerMsg.includes("violates check constraint") ||
          lowerMsg.includes("invalid input syntax") ||
          lowerMsg.includes("value too long");
        if (isPoisonPayload) {
          updatePendingItem(item.id, {
            blocked: true,
            tries: Number(item.tries || 0) + 1,
            lastError: errMsg || "invalid payload",
            lastTriedAt: new Date().toISOString()
          });
          addDebugLog(
            "pending.process.block_invalid",
            { id: item.id, type: item.type, message: errMsg },
            "warn"
          );
          continue;
        }
        updatePendingItem(item.id, {
          tries: Number(item.tries || 0) + 1,
          lastError: errMsg || "unknown error",
          lastTriedAt: new Date().toISOString()
        });
        addDebugLog(
          "pending.process.error",
          { id: item.id, type: item.type, message: errMsg },
          "warn"
        );
        break;
      }
    }
    if (hadSuccess && !state.busy) {
      try {
        await refresh({ showLoading: false, deferSummary: true });
      } catch {
        // ignore refresh failure here; queue processing already succeeded partially
      }
    }
  } finally {
    state.processingPendingQueue = false;
    updatePendingStatusUI();
  }
};

const loadProfile = async () => {
  if (state.profileLoadPromise) {
    addDebugLog("profile.load.join");
    return state.profileLoadPromise;
  }
  const runner = async () => {
  if (!state.user) return;
  try {
    const { data, error } = await dbQuery(
      (signal) =>
        supabaseClient
          .from(PROFILE_TABLE)
          .select("display_name, unit, title, phone, avatar_data_url")
          .eq("user_id", state.user.id)
          .maybeSingle()
          .abortSignal(signal),
      { label: "讀取個人資料", attempts: 2, timeoutMs: 8000 }
    );
    if (error) throw error;
    if (data) {
      state.profile = {
        displayName: data.display_name || "",
        unit: data.unit || "",
        title: data.title || "",
        phone: data.phone || "",
        avatarDataUrl: data.avatar_data_url || ""
      };
      await writeCachedProfile(state.profile);
      return;
    }
  } catch (err) {
    addDebugLog(
      "profile.load.remote.error",
      { code: err?.code || null, message: String(err?.message || "") },
      "warn"
    );
  }

  const local = await readCachedProfile();
  if (local) {
    state.profile = local;
  }
  };
  const task = runner();
  state.profileLoadPromise = task;
  try {
    return await task;
  } finally {
    if (state.profileLoadPromise === task) {
      state.profileLoadPromise = null;
    }
  }
};

const saveProfile = async () => {
  if (!state.user) return { remote: false };
  const normalized = normalizeProfile(state.profile);
  const cachedBefore = await readCachedProfile();
  if (cachedBefore && JSON.stringify(normalized) === JSON.stringify(normalizeProfile(cachedBefore))) {
    return { remote: false, skipped: true, noChange: true };
  }
  const payload = {
    user_id: state.user.id,
    display_name: normalized.displayName || null,
    unit: normalized.unit || null,
    title: normalized.title || null,
    phone: normalized.phone || null,
    avatar_data_url: normalized.avatarDataUrl || null
  };
  await writeCachedProfile(normalized);
  try {
    const { error } = await dbQuery(
      (signal) =>
        supabaseClient
          .from(PROFILE_TABLE)
          .upsert(payload, { onConflict: "user_id" })
          .abortSignal(signal),
      { label: "儲存個人資料", attempts: DB_WRITE_ATTEMPTS, timeoutMs: DB_WRITE_TIMEOUT_MS }
    );
    if (error) throw error;
    return { remote: true };
  } catch (err) {
    addDebugLog(
      "profile.save.remote.error",
      { code: err?.code || null, message: String(err?.message || "") },
      "warn"
    );
    enqueuePendingItem({ type: "profile_upsert", payload });
    return { remote: false, queued: true, error: err };
  }
};

const applyProfileToUI = () => {
  el.profileAvatar.src = getEffectiveAvatar();
  if (el.displayName) el.displayName.value = getEffectiveDisplayName();
  const parts = [state.profile.unit, state.profile.title, getEffectiveDisplayName()]
    .map((x) => (x || "").trim())
    .filter(Boolean);
  el.brandMeta.textContent = parts.join(" ");
};

const parseNote = (note) => {
  if (!note) {
    return {
      segment: "event",
      transported: false,
      memo: "",
      open: false,
      pulse: "",
      gender: "不明",
      ageGroup: "不明",
      glucose: "",
      gcsEye: "",
      gcsVerbal: "",
      gcsMotor: ""
    };
  }
  try {
    const parsed = JSON.parse(note);
    return {
      segment: parsed.segment || "event",
      transported: Boolean(parsed.transported),
      memo: parsed.memo || "",
      open: Boolean(parsed.open),
      pulse: String(parsed.pulse || ""),
      gender: parsed.gender || "不明",
      ageGroup: parsed.ageGroup || "不明",
      glucose: String(parsed.glucose || ""),
      gcsEye: String(parsed.gcsEye || ""),
      gcsVerbal: String(parsed.gcsVerbal || ""),
      gcsMotor: String(parsed.gcsMotor || "")
    };
  } catch {
    return {
      segment: "event",
      transported: false,
      memo: note,
      open: false,
      pulse: "",
      gender: "不明",
      ageGroup: "不明",
      glucose: "",
      gcsEye: "",
      gcsVerbal: "",
      gcsMotor: ""
    };
  }
};

const encodeNote = (obj) => JSON.stringify(obj);

const isStandby = (row) => parseNote(row.note).segment === "standby";
const isOpenEvent = (row) => !isStandby(row) && parseNote(row.note).open === true;

const buildGcsInfo = (note) => {
  const eye = Number(note?.gcsEye || 0);
  const verbal = Number(note?.gcsVerbal || 0);
  const motor = Number(note?.gcsMotor || 0);
  if (![eye, verbal, motor].every((n) => Number.isInteger(n) && n > 0)) return null;
  const total = eye + verbal + motor;
  return {
    eye,
    verbal,
    motor,
    total,
    text: `GCS E${eye}V${verbal}M${motor} = ${total}`,
    isCritical: total < 14
  };
};

const updateGcsSummary = () => {
  if (!el.gcsSummary) return;
  const info = buildGcsInfo({
    gcsEye: el.gcsEye?.value || "",
    gcsVerbal: el.gcsVerbal?.value || "",
    gcsMotor: el.gcsMotor?.value || ""
  });
  el.gcsSummary.textContent = info ? info.text : "未評估";
  el.gcsSummary.classList.toggle("gcs-alert", Boolean(info?.isCritical));
};

const actionMode = () => {
  if (state.modeOverride) return state.modeOverride;
  if (!state.session || state.session.status !== "active") return "none";
  const last = latestRow();
  if (!last) return "standby";
  return isStandby(last) ? "standby" : "event";
};

const setButtonState = (btn, enabled) => {
  btn.disabled = !enabled;
  btn.setAttribute("aria-disabled", enabled ? "false" : "true");
};

const applyActionMode = (mode) => {
  if (mode === "none") {
    setButtonState(el.startEventBtn, false);
    setButtonState(el.finishEventBtn, false);
    el.finishEventBtn.textContent = "退勤";
    el.finishEventBtn.classList.remove("primary");
    el.finishEventBtn.classList.add("danger-soft");
    return;
  }

  if (mode === "standby") {
    setButtonState(el.startEventBtn, true);
    setButtonState(el.finishEventBtn, true);
    el.finishEventBtn.textContent = "退勤";
    el.finishEventBtn.classList.remove("primary");
    el.finishEventBtn.classList.add("danger-soft");
    return;
  }

  setButtonState(el.startEventBtn, false);
  setButtonState(el.finishEventBtn, true);
  el.finishEventBtn.textContent = "結束出勤";
  el.finishEventBtn.classList.remove("danger-soft");
  el.finishEventBtn.classList.add("primary");
};

const setModeOverride = (mode) => {
  state.modeOverride = mode;
  applyActionMode(actionMode());
};

const customToggle = (selectEl, wrapEl, inputEl, triggerValue = "其他") => {
  if (!selectEl || !wrapEl || !inputEl) return;
  const on = selectEl.value === triggerValue;
  wrapEl.classList.toggle("hidden", !on);
  inputEl.required = on;
  if (!on) inputEl.value = "";
};

const normalizeEquipmentArray = (value) => {
  if (Array.isArray(value)) {
    return value.map((x) => String(x || "").trim()).filter(Boolean);
  }
  if (typeof value === "string") {
    return value
      .split(/[、,，\s]+/)
      .map((x) => x.trim())
      .filter(Boolean);
  }
  return [];
};

const setEquipmentSelections = (value) => {
  const selected = new Set(normalizeEquipmentArray(value));
  (el.equipmentItems || []).forEach((input) => {
    input.checked = selected.has(input.value);
  });
};

const getSelectedEquipment = () =>
  (el.equipmentItems || []).filter((input) => input.checked).map((input) => input.value);

const latestRow = () => (state.rows.length ? state.rows[state.rows.length - 1] : null);

const standbyPayload = (sessionId, isoTime, standbyMemo = "") => ({
  session_id: sessionId,
  seq_no: 1,
  dispatch_time: isoTime,
  vehicle: "其他",
  vehicle_custom: "待勤",
  case_type: "其他",
  case_type_custom: "待勤",
  patient_count: "其他",
  patient_count_custom: "0",
  hospital: "其他",
  hospital_custom: "待勤",
  chief_complaint: "待勤",
  bp: null,
  spo2: null,
  equipment_used: [],
  note: encodeNote({ segment: "standby", transported: false, memo: standbyMemo })
});

const nextSeq = async () => {
  if (!state.rows?.length) return 1;
  const maxSeq = state.rows.reduce((max, row) => {
    const n = Number(row.seq_no || 0);
    return Number.isFinite(n) ? Math.max(max, n) : max;
  }, 0);
  return maxSeq + 1;
};

const isSameDispatchPayload = (row, payload) => {
  if (!row || !payload) return false;
  return (
    String(row.session_id || "") === String(payload.session_id || "") &&
    String(row.dispatch_time || "") === String(payload.dispatch_time || "") &&
    String(row.vehicle || "") === String(payload.vehicle || "") &&
    String(row.vehicle_custom || "") === String(payload.vehicle_custom || "") &&
    String(row.case_type || "") === String(payload.case_type || "") &&
    String(row.case_type_custom || "") === String(payload.case_type_custom || "") &&
    String(row.patient_count || "") === String(payload.patient_count || "") &&
    String(row.patient_count_custom || "") === String(payload.patient_count_custom || "") &&
    String(row.hospital || "") === String(payload.hospital || "") &&
    String(row.hospital_custom || "") === String(payload.hospital_custom || "") &&
    String(row.chief_complaint || "") === String(payload.chief_complaint || "") &&
    String(row.note || "") === String(payload.note || "")
  );
};

const findExistingDispatchByPayload = async (payload) => {
  if (!payload?.session_id || !payload?.dispatch_time) return null;
  const { data, error } = await dbQuery(
    (signal) =>
      supabaseClient
        .from("duty_dispatches")
        .select("*")
        .eq("session_id", payload.session_id)
        .eq("dispatch_time", payload.dispatch_time)
        .abortSignal(signal),
    { label: "查找已存在勤務明細", attempts: 1, timeoutMs: 5000 }
  );
  if (error) throw error;
  const rows = Array.isArray(data) ? data : [];
  return rows.find((x) => isSameDispatchPayload(x, payload)) || null;
};

const insertDispatch = async (payload, retryTextPrefix = "新增勤務明細同步中") => {
  const normalizedPayload = normalizeDispatchPayloadForDb(payload || {});
  const existsBefore = await findExistingDispatchByPayload(normalizedPayload);
  if (existsBefore) {
    addDebugLog("dispatch.insert.idempotent.hit", { rowId: existsBefore.id || null });
    return existsBefore;
  }

  let seq = await nextSeq();
  let attempts = 0;
  while (attempts < 5) {
    const { error } = await dbQuery(
      (signal) => supabaseClient.from("duty_dispatches").insert([{ ...normalizedPayload, seq_no: seq }]).abortSignal(signal),
      {
        label: "新增勤務明細",
        attempts: DB_WRITE_ATTEMPTS,
        timeoutMs: DB_WRITE_TIMEOUT_MS,
        onRetryText: (n, total) => `${retryTextPrefix}（重試 ${n}/${total}）...`
      }
    );
    if (!error) return;
    if (!String(error.message || "").includes("uq_duty_dispatches_session_seq")) throw error;

    const existsAfterConflict = await findExistingDispatchByPayload(normalizedPayload);
    if (existsAfterConflict) {
      addDebugLog("dispatch.insert.idempotent.hit_after_conflict", { rowId: existsAfterConflict.id || null });
      return existsAfterConflict;
    }

    seq += 1;
    attempts += 1;
  }
  throw new Error("序號衝突過多，請重試。");
};

const applyPendingMutationsToState = async () => {
  if (!state.session) return;
  await loadPendingQueueCache();
  const items = readPendingQueue();
  if (!items.length) return;

  let rows = Array.isArray(state.rows) ? [...state.rows] : [];
  for (const item of items) {
    if (item.type === "dispatch_delete" && item.rowId) {
      rows = rows.filter((r) => String(r.id) !== String(item.rowId));
      continue;
    }
    if (item.type === "dispatch_update" && item.rowId && item.payload) {
      rows = rows.map((r) => (String(r.id) === String(item.rowId) ? { ...r, ...item.payload } : r));
      continue;
    }
    if (item.type === "dispatch_insert" && item.payload) {
      if (String(item.payload.session_id || "") !== String(state.session.id)) continue;
      const exists = rows.some(
        (r) =>
          (item.localRowId && String(r.id) === String(item.localRowId)) ||
          isSameDispatchPayload(r, item.payload)
      );
      if (!exists) {
        rows.push({
          id: item.localRowId || `pending_${item.id}`,
          ...item.payload
        });
      }
      continue;
    }
    if (item.type === "session_update" && item.sessionId && item.payload) {
      if (String(item.sessionId) === String(state.session.id)) {
        state.session = { ...state.session, ...item.payload };
      }
    }
  }
  rows.sort((a, b) => new Date(a.dispatch_time) - new Date(b.dispatch_time));
  state.rows = rows;
};

const loadSessionAndRows = async () => {
  if (!state.user) return;
  const { startIso, endIso } = dayBounds();
  let { data: sessions, error: sesErr } = await dbQuery(
    (signal) =>
      supabaseClient
        .from("duty_sessions")
        .select("*")
        .eq("user_id", state.user.id)
        .gte("start_time", startIso)
        .lt("start_time", endIso)
        .order("start_time", { ascending: false })
        .limit(1)
        .abortSignal(signal),
    { label: "讀取勤務主單", attempts: DB_READ_ATTEMPTS, timeoutMs: DB_READ_TIMEOUT_MS }
  );
  if (sesErr) throw sesErr;

  state.session = sessions && sessions.length ? sessions[0] : null;
  if (!state.session) {
    const { data: activeSessions, error: activeErr } = await dbQuery(
      (signal) =>
        supabaseClient
          .from("duty_sessions")
          .select("*")
          .eq("user_id", state.user.id)
          .eq("status", "active")
          .order("start_time", { ascending: false })
          .limit(1)
          .abortSignal(signal),
      { label: "讀取跨日進行中勤務", attempts: DB_READ_ATTEMPTS, timeoutMs: DB_READ_TIMEOUT_MS }
    );
    if (activeErr) throw activeErr;
    state.session = activeSessions && activeSessions.length ? activeSessions[0] : null;
  }
  if (!state.session) {
    state.rows = [];
    saveSnapshotToLocal().catch(() => {});
    return;
  }

  const { data: rows, error: rowErr } = await dbQuery(
    (signal) =>
      supabaseClient
        .from("duty_dispatches")
        .select("*")
        .eq("session_id", state.session.id)
        .order("dispatch_time", { ascending: true })
        .abortSignal(signal),
    { label: "讀取勤務明細", attempts: DB_READ_ATTEMPTS, timeoutMs: DB_READ_TIMEOUT_MS }
  );
  if (rowErr) throw rowErr;
  state.rows = rows || [];
  await applyPendingMutationsToState();
  if (state.session && state.session.status !== "active" && !isSessionStartToday(state.session)) {
    state.session = null;
    state.rows = [];
    saveSnapshotToLocal().catch(() => {});
    return;
  }
  await autoHealConsecutiveStandbyRows();
  saveSnapshotToLocal().catch(() => {});
};

const mergeStandbyMemoText = (leftMemo, rightMemo) => {
  const parts = [
    ...String(leftMemo || "")
      .split("/")
      .map((x) => x.trim())
      .filter(Boolean),
    ...String(rightMemo || "")
      .split("/")
      .map((x) => x.trim())
      .filter(Boolean)
  ];
  const uniq = [];
  parts.forEach((p) => {
    if (!uniq.includes(p)) uniq.push(p);
  });
  return uniq.join(" / ");
};

const autoHealConsecutiveStandbyRows = async () => {
  if (!state.user || !state.session || state.healingStandbyRows) return;
  if (!Array.isArray(state.rows) || state.rows.length < 2) return;

  const deleteIds = [];
  const updateOps = [];

  for (let i = 0; i < state.rows.length - 1; i += 1) {
    const a = state.rows[i];
    const b = state.rows[i + 1];
    if (!isStandby(a) || !isStandby(b)) continue;

    const aNote = parseNote(a.note);
    const bNote = parseNote(b.note);
    const mergedMemo = mergeStandbyMemoText(aNote.memo, bNote.memo);
    const mergedNote = encodeNote({ ...aNote, memo: mergedMemo });
    if (mergedNote !== String(a.note || "")) {
      updateOps.push({ id: a.id, note: mergedNote });
    }
    deleteIds.push(b.id);
  }

  if (!deleteIds.length && !updateOps.length) return;

  state.healingStandbyRows = true;
  addDebugLog("standby.heal.start", {
    updates: updateOps.length,
    deletes: deleteIds.length
  });

  try {
    for (const op of updateOps) {
      const { error } = await dbQuery(
        (signal) => supabaseClient.from("duty_dispatches").update({ note: op.note }).eq("id", op.id).abortSignal(signal),
        {
          label: "修復待勤註記",
          attempts: DB_WRITE_ATTEMPTS,
          timeoutMs: DB_WRITE_TIMEOUT_MS
        }
      );
      if (error) throw error;
    }

    if (deleteIds.length) {
      const { error } = await dbQuery(
        (signal) => supabaseClient.from("duty_dispatches").delete().in("id", deleteIds).abortSignal(signal),
        {
          label: "刪除重複待勤",
          attempts: DB_WRITE_ATTEMPTS,
          timeoutMs: DB_WRITE_TIMEOUT_MS
        }
      );
      if (error) throw error;
    }

    const { data: fixedRows, error: fixedErr } = await dbQuery(
      (signal) =>
        supabaseClient
          .from("duty_dispatches")
          .select("*")
          .eq("session_id", state.session.id)
          .order("dispatch_time", { ascending: true })
          .abortSignal(signal),
      { label: "重讀勤務明細（修復後）", attempts: DB_READ_ATTEMPTS, timeoutMs: DB_READ_TIMEOUT_MS }
    );
    if (fixedErr) throw fixedErr;
    state.rows = fixedRows || [];
    addDebugLog("standby.heal.success", { rows: state.rows.length });
  } catch (err) {
    addDebugLog("standby.heal.error", { message: String(err?.message || "") }, "warn");
  } finally {
    state.healingStandbyRows = false;
  }
};

const transportedUnits = (row) => {
  if (isStandby(row)) return 0;
  if (row.hospital === "其他" && row.hospital_custom === "未送") return 0;
  if (row.patient_count === "1") return 1;
  if (row.patient_count === "2") return 2;
  if (row.patient_count === "0") return 0;
  const n = Number(row.patient_count_custom || 0);
  return Number.isFinite(n) ? Math.max(0, n) : 0;
};

const setSummaryValues = ({ dutyMs = 0, eventCount = 0, transported = 0 }) => {
  const totalMin = Math.floor(dutyMs / 60000);
  const hh = String(Math.floor(totalMin / 60)).padStart(2, "0");
  const mm = String(totalMin % 60).padStart(2, "0");
  el.sumDutyHours.textContent = `${hh}:${mm}`;
  el.sumEventCount.textContent = String(eventCount);
  el.sumTransported.textContent = String(transported);
};

const summarizeSessionRows = (session, rows) => {
  const arr = Array.isArray(rows) ? rows : [];
  let dutyMs = 0;
  let eventCount = 0;
  let transported = 0;
  for (let i = 0; i < arr.length; i += 1) {
    const cur = arr[i];
    const next = arr[i + 1];
    const start = new Date(cur.dispatch_time).getTime();
    const end = next
      ? new Date(next.dispatch_time).getTime()
      : session?.end_time
        ? new Date(session.end_time).getTime()
        : Date.now();
    dutyMs += Math.max(0, end - start);

    // 規則：出勤次數/送醫人數僅在「該事件已結束」後才統計
    const segmentClosed = Boolean(next || session?.end_time);
    if (!isStandby(cur) && segmentClosed) {
      eventCount += 1;
      transported += transportedUnits(cur);
    }
  }
  return { dutyMs, eventCount, transported };
};

const rangeBoundsByType = (type) => {
  const now = new Date();
  if (type === "today") {
    const s = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const e = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
    return { startIso: s.toISOString(), endIso: e.toISOString() };
  }
  if (type === "month") {
    const s = new Date(now.getFullYear(), now.getMonth(), 1);
    const e = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    return { startIso: s.toISOString(), endIso: e.toISOString() };
  }
  if (type === "year") {
    const s = new Date(now.getFullYear(), 0, 1);
    const e = new Date(now.getFullYear() + 1, 0, 1);
    return { startIso: s.toISOString(), endIso: e.toISOString() };
  }
  return null;
};

const updateSummaryTabsUI = () => {
  const tabs = el.summaryTabs.querySelectorAll(".tab");
  tabs.forEach((tab) => {
    tab.classList.toggle("active", tab.dataset.range === state.summaryRange);
  });
};

const buildSessionRowsMap = (rows) => {
  const map = new Map();
  rows.forEach((r) => {
    if (!map.has(r.session_id)) map.set(r.session_id, []);
    map.get(r.session_id).push(r);
  });
  map.forEach((arr) => arr.sort((a, b) => new Date(a.dispatch_time) - new Date(b.dispatch_time)));
  return map;
};

const fetchSummaryViaRpc = async (summaryRange) => {
  const bounds = rangeBoundsByType(summaryRange);
  const { data, error } = await dbQuery(
    (signal) =>
      supabaseClient
        .rpc(SUMMARY_RPC_NAME, {
          p_start: bounds?.startIso || null,
          p_end: bounds?.endIso || null
        })
        .abortSignal(signal),
    {
      label: "讀取摘要統計",
      attempts: DB_READ_ATTEMPTS,
      timeoutMs: DB_READ_TIMEOUT_MS
    }
  );
  if (error) throw error;
  const row = Array.isArray(data) ? data[0] : data;
  return {
    dutyMs: Number(row?.duty_ms || 0),
    eventCount: Number(row?.event_count || 0),
    transported: Number(row?.transported || 0)
  };
};

const renderSummary = async () => {
  if (!state.user) {
    setSummaryValues({});
    return;
  }

  // 今日優先用本地資料即時計算，避免畫面短暫顯示 00:00 或遠端延遲造成不一致。
  // 這段即使有遠端摘要查詢進行中，也要立即更新畫面。
  if (state.summaryRange === "today" && state.session) {
    const localSummary = summarizeSessionRows(state.session, state.rows || []);
    setSummaryValues(localSummary);
    return;
  }

  if (state.summaryPromise && state.summaryPromiseRange === state.summaryRange) {
    addDebugLog("summary.join", { range: state.summaryRange });
    return state.summaryPromise;
  }

  const summaryUserId = state.user?.id || null;
  const summaryRange = state.summaryRange;
  const runner = async () => {
    const bounds = rangeBoundsByType(summaryRange);
    try {
      const values = await fetchSummaryViaRpc(summaryRange);
      if (state.user?.id !== summaryUserId || state.summaryRange !== summaryRange) {
        addDebugLog("summary.rpc.stale.discard", { summaryRange });
        return;
      }
      setSummaryValues(values);
      return;
    } catch (rpcErr) {
      addDebugLog("summary.rpc.fallback", { message: String(rpcErr?.message || "") }, "warn");
    }

    let query = supabaseClient
      .from("duty_sessions")
      .select("id, end_time, status, start_time")
      .eq("user_id", summaryUserId)
      .order("start_time", { ascending: false });

    if (bounds) {
      query = query.gte("start_time", bounds.startIso).lt("start_time", bounds.endIso);
    }

    const { data: sessions, error: sesErr } = await dbQuery((signal) => query.abortSignal(signal), {
      label: "讀取摘要主單",
      attempts: 2
    });
    if (sesErr) {
      if (state.user?.id === summaryUserId && state.summaryRange === summaryRange) {
        setHint(el.sessionStatus, `摘要讀取失敗：${sesErr.message}`);
      }
      return;
    }
    if (!sessions || !sessions.length) {
      if (state.user?.id === summaryUserId && state.summaryRange === summaryRange) {
        setSummaryValues({});
      }
      return;
    }

    const ids = sessions.map((s) => s.id);
    const { data: rows, error: rowErr } = await dbQuery(
      (signal) =>
        supabaseClient
          .from("duty_dispatches")
          .select("session_id, dispatch_time, hospital, hospital_custom, patient_count, patient_count_custom, note")
          .in("session_id", ids)
          .abortSignal(signal),
      { label: "讀取摘要明細", attempts: 2 }
    );
    if (rowErr) {
      if (state.user?.id === summaryUserId && state.summaryRange === summaryRange) {
        setHint(el.sessionStatus, `摘要讀取失敗：${rowErr.message}`);
      }
      return;
    }

    const map = buildSessionRowsMap(rows || []);
    let dutyMs = 0;
    let eventCount = 0;
    let transported = 0;
    sessions.forEach((s) => {
      const part = summarizeSessionRows(s, map.get(s.id) || []);
      dutyMs += part.dutyMs;
      eventCount += part.eventCount;
      transported += part.transported;
    });

    // 若查詢完成時使用者或區間已切換，丟棄舊結果避免覆蓋新畫面。
    if (state.user?.id !== summaryUserId || state.summaryRange !== summaryRange) {
      addDebugLog("summary.stale.discard", { summaryRange });
      return;
    }
    setSummaryValues({ dutyMs, eventCount, transported });
  };

  const task = runner();
  state.summaryPromise = task;
  state.summaryPromiseRange = summaryRange;
  try {
    return await task;
  } finally {
    if (state.summaryPromise === task) {
      state.summaryPromise = null;
      state.summaryPromiseRange = null;
    }
  }
};

const switchSummaryRange = async (nextRange) => {
  if (!SUMMARY_RANGE_ORDER.includes(nextRange)) return;
  state.summaryRange = nextRange;
  updateSummaryTabsUI();
  await renderSummary();
};

const rowSummary = (row) => {
  if (isStandby(row)) {
    const note = parseNote(row.note);
    const prefix = (note.memo || "").trim();
    return prefix ? `${prefix} / 待勤` : "待勤";
  }
  const hospital = row.hospital === "其他" ? row.hospital_custom || "其他" : row.hospital;
  const count = row.patient_count === "其他" ? row.patient_count_custom : row.patient_count;
  const caseText = displayCaseType(row) || "其他";
  const note = parseNote(row.note);
  const memo = note.memo ? `，${note.memo}` : "";
  const complaint = (row.chief_complaint || "").trim();
  const complaintText = complaint ? `，${complaint}` : "";
  const gcsInfo = buildGcsInfo(note);
  const gcsText = gcsInfo ? `，${gcsInfo.text}` : "";
  return `${hospital || "未填"} ${count || "?"}人 ${caseText}${complaintText}${gcsText}${memo}`;
};

const displayHospital = (row) =>
  (row.hospital === "其他" ? row.hospital_custom || "其他" : row.hospital) || "";
const displayPatientCount = (row) => (row.patient_count === "其他" ? row.patient_count_custom : row.patient_count) || "";
const displayCaseType = (row) => (row.case_type === "其他" ? row.case_type_custom : row.case_type) || "";

const buildSessionExportRows = (session, rows) => {
  const list = Array.isArray(rows) ? rows : [];
  const summary = summarizeSessionRows(session, list);
  return list.map((row, idx) => {
    const next = list[idx + 1];
    const rowEndIso = next ? next.dispatch_time : session.end_time || session.start_time;
    const note = parseNote(row.note);
    return {
      format_version: "EMT_SESSION_V1",
      record_type: "dispatch",
      session_id: session.id,
      session_start_iso: session.start_time || "",
      session_end_iso: session.end_time || "",
      date_key: isoToDateKey(session.start_time),
      duty_minutes: Math.floor(summary.dutyMs / 60000),
      duty_hhmm: formatDurationHm(summary.dutyMs),
      row_id: row.id || "",
      row_index: idx + 1,
      row_start_iso: row.dispatch_time || "",
      row_end_iso: rowEndIso || "",
      row_start_hm: formatHm(row.dispatch_time),
      row_end_hm: formatHm(rowEndIso),
      segment: note.segment || "",
      is_open: note.open ? "1" : "0",
      hospital: row.hospital || "",
      hospital_custom: row.hospital_custom || "",
      hospital_display: displayHospital(row),
      patient_count: row.patient_count || "",
      patient_count_custom: row.patient_count_custom || "",
      patient_count_display: displayPatientCount(row),
      case_type: row.case_type || "",
      case_type_custom: row.case_type_custom || "",
      case_type_display: displayCaseType(row),
      chief_complaint: row.chief_complaint || "",
      memo: note.memo || "",
      bp: row.bp || "",
      spo2: row.spo2 || "",
      pulse: note.pulse || "",
      gender: note.gender || "不明",
      age_group: note.ageGroup || "不明",
      glucose: note.glucose || "",
      gcs_eye: note.gcsEye || "",
      gcs_verbal: note.gcsVerbal || "",
      gcs_motor: note.gcsMotor || "",
      gcs_total: buildGcsInfo(note)?.total || "",
      equipment_used_json: JSON.stringify(Array.isArray(row.equipment_used) ? row.equipment_used : []),
      note_json: row.note || ""
    };
  });
};

const exportHistorySession = (sessionId, fmt) => {
  const key = String(sessionId || "");
  const cache = state.historyRenderCache?.[key];
  if (!cache) {
    setHint(el.sessionStatus, "找不到可匯出的資料。");
    return;
  }
  const { session, rows } = cache;
  if (!["txt", "csv"].includes(fmt)) {
    setHint(el.sessionStatus, "匯出格式錯誤。");
    return;
  }

  const exportRows = buildSessionExportRows(session, rows);
  const endText = session.end_time ? formatHm(session.end_time) : "進行中";
  const summary = summarizeSessionRows(session, rows || []);
  const summaryDate = formatMonthDay(session.start_time);
  const summaryTime = `${formatHm(session.start_time)} - ${endText}`;
  const summaryDuty = formatDurationHm(summary.dutyMs);
  const summaryUnit = String(state.profile?.unit || "").trim();
  const summaryTitle = String(state.profile?.title || "").trim();
  const summaryDisplayName = String(
    state.profile?.displayName || session.display_name || getEffectiveDisplayName()
  ).trim();
  const summaryDetailLines = (rows || []).map((row, idx, arr) => {
    const next = arr[idx + 1];
    const rowEnd = next ? next.dispatch_time : session.end_time || session.start_time;
    return `${formatHm(row.dispatch_time)} - ${formatHm(rowEnd)}  ${rowSummary(row)}`;
  });
  const baseDate = isoToDateKey(session.start_time).replaceAll("-", "");
  const filenameBase = `emt_session_${baseDate}_${session.id}`;

  if (fmt === "csv") {
    const headers = [
      "format_version",
      "record_type",
      "session_id",
      "session_start_iso",
      "session_end_iso",
      "date_key",
      "duty_minutes",
      "duty_hhmm",
      "row_id",
      "row_index",
      "row_start_iso",
      "row_end_iso",
      "row_start_hm",
      "row_end_hm",
      "segment",
      "is_open",
      "hospital",
      "hospital_custom",
      "hospital_display",
      "patient_count",
      "patient_count_custom",
      "patient_count_display",
      "case_type",
      "case_type_custom",
      "case_type_display",
      "chief_complaint",
      "memo",
      "bp",
      "spo2",
      "pulse",
      "gender",
      "age_group",
      "glucose",
      "gcs_eye",
      "gcs_verbal",
      "gcs_motor",
      "gcs_total",
      "equipment_used_json",
      "note_json"
    ];
    const lines = [
      `# 摘要日期,${toCsvCell(summaryDate)}`,
      `# 摘要時間,${toCsvCell(summaryTime)}`,
      `# 勤務時數,${toCsvCell(summaryDuty)}`,
      `# 單位,${toCsvCell(summaryUnit)}`,
      `# 職稱,${toCsvCell(summaryTitle)}`,
      `# 姓名,${toCsvCell(summaryDisplayName)}`,
      ...summaryDetailLines.map((line) => `# 明細,${toCsvCell(line)}`),
      "",
      headers.join(","),
      ...exportRows.map((row) => headers.map((h) => toCsvCell(row[h])).join(","))
    ];
    triggerDownload(`${filenameBase}.csv`, lines.join("\n"), "text/csv;charset=utf-8");
    setHint(el.sessionStatus, "已匯出 CSV。");
    return;
  }

  const txtLines = [];
  txtLines.push("=== 簡易摘要 ===");
  txtLines.push(`日期: ${summaryDate}`);
  txtLines.push(`時間: ${summaryTime}`);
  txtLines.push(`勤務時數: ${summaryDuty}`);
  txtLines.push(`單位: ${summaryUnit}`);
  txtLines.push(`職稱: ${summaryTitle}`);
  txtLines.push(`姓名: ${summaryDisplayName}`);
  txtLines.push("明細:");
  summaryDetailLines.forEach((line) => {
    txtLines.push(`- ${line}`);
  });
  txtLines.push("");
  txtLines.push("=== 協定資料 EMT_SESSION_V1 ===");
  txtLines.push("EMT_EXPORT_FORMAT=EMT_SESSION_V1");
  txtLines.push("EXPORT_SCOPE=session");
  txtLines.push(`SESSION_ID=${session.id}`);
  txtLines.push(`DATE=${isoToDateKey(session.start_time)}`);
  txtLines.push(`SESSION_START_ISO=${session.start_time || ""}`);
  txtLines.push(`SESSION_END_ISO=${session.end_time || ""}`);
  txtLines.push(`DUTY_HHMM=${formatDurationHm(summary.dutyMs)}`);
  txtLines.push(`DUTY_MINUTES=${Math.floor(summary.dutyMs / 60000)}`);
  txtLines.push(`ROW_COUNT=${exportRows.length}`);
  exportRows.forEach((row) => {
    txtLines.push("");
    txtLines.push(`[ROW_${row.row_index}]`);
    Object.entries(row).forEach(([k, v]) => {
      txtLines.push(`${k}=${String(v ?? "").replace(/\n/g, "\\n")}`);
    });
  });
  triggerDownload(`${filenameBase}.txt`, txtLines.join("\n"), "text/plain;charset=utf-8");
  setHint(el.sessionStatus, "已匯出 TXT。");
};

const parseImportedCsv = (text) => {
  const lines = String(text || "").replace(/\r/g, "").split("\n");
  const dataLines = lines.filter((line) => line.trim() && !line.trim().startsWith("#"));
  if (!dataLines.length) return [];
  const parseCsvLine = (line) => {
    const out = [];
    let cur = "";
    let inQuote = false;
    for (let i = 0; i < line.length; i += 1) {
      const ch = line[i];
      if (inQuote) {
        if (ch === '"' && line[i + 1] === '"') {
          cur += '"';
          i += 1;
        } else if (ch === '"') {
          inQuote = false;
        } else {
          cur += ch;
        }
      } else if (ch === '"') {
        inQuote = true;
      } else if (ch === ",") {
        out.push(cur);
        cur = "";
      } else {
        cur += ch;
      }
    }
    out.push(cur);
    return out;
  };
  const header = parseCsvLine(dataLines[0]).map((h, idx) => {
    const trimmed = h.trim();
    return idx === 0 ? trimmed.replace(/^\uFEFF/, "") : trimmed;
  });
  return dataLines.slice(1).map((line) => {
    const cells = parseCsvLine(line);
    const obj = {};
    header.forEach((h, idx) => {
      obj[h] = cells[idx] ?? "";
    });
    return obj;
  });
};

const parseImportedTxt = (text) => {
  const lines = String(text || "").replace(/\r/g, "").split("\n");
  const rows = [];
  let cur = null;
  lines.forEach((raw) => {
    const line = raw.trim();
    if (!line) return;
    if (/^\[ROW_\d+\]$/i.test(line)) {
      if (cur) rows.push(cur);
      cur = {};
      return;
    }
    const eq = line.indexOf("=");
    if (eq <= 0) return;
    const key = line.slice(0, eq).trim();
    const value = line.slice(eq + 1).replace(/\\n/g, "\n");
    if (!cur) cur = {};
    cur[key] = value;
  });
  if (cur) rows.push(cur);
  return rows;
};

const normalizeImportedRows = (rawRows) => {
  const rows = (rawRows || []).filter(Boolean).filter((r) => String(r.format_version || "EMT_SESSION_V1") === "EMT_SESSION_V1");
  return rows
    .map((r) => ({
      session_start_iso: r.session_start_iso || "",
      session_end_iso: r.session_end_iso || "",
      row_start_iso: r.row_start_iso || "",
      row_end_iso: r.row_end_iso || "",
      segment: r.segment || "event",
      is_open: String(r.is_open || "0") === "1",
      hospital: r.hospital || "其他",
      hospital_custom: r.hospital_custom || null,
      patient_count: r.patient_count || "1",
      patient_count_custom: r.patient_count_custom || null,
      case_type: r.case_type || "外科",
      case_type_custom: r.case_type_custom || null,
      chief_complaint: r.chief_complaint || "",
      memo: r.memo || "",
      bp: r.bp || null,
      spo2: r.spo2 || null,
      pulse: r.pulse || "",
      gender: r.gender || "不明",
      age_group: r.age_group || "不明",
      glucose: r.glucose || "",
      gcs_eye: r.gcs_eye || "",
      gcs_verbal: r.gcs_verbal || "",
      gcs_motor: r.gcs_motor || "",
      equipment_used_json: r.equipment_used_json || "[]",
      note_json: r.note_json || ""
    }))
    .filter((r) => r.row_start_iso);
};

const importHistoryRows = async (rows) => {
  if (!state.user) throw new Error("尚未登入");
  if (!rows.length) throw new Error("找不到可匯入明細");

  const sorted = [...rows].sort((a, b) => new Date(a.row_start_iso) - new Date(b.row_start_iso));
  const first = sorted[0];
  const startIso = first.session_start_iso || first.row_start_iso;
  const endIso = first.session_end_iso || "";

  const sessionPayload = {
    user_id: state.user.id,
    display_name: state.profile.displayName || getEffectiveDisplayName(),
    start_time: startIso,
    task_type: "協勤",
    task_type_custom: null,
    status: endIso ? "completed" : "active",
    end_time: endIso || null
  };

  const { data: newSession, error: sessionErr } = await dbQuery(
    (signal) =>
      supabaseClient
        .from("duty_sessions")
        .insert([sessionPayload])
        .select("*")
        .single()
        .abortSignal(signal),
    { label: "匯入勤務主單", attempts: DB_WRITE_ATTEMPTS, timeoutMs: DB_WRITE_TIMEOUT_MS }
  );
  if (sessionErr || !newSession?.id) throw sessionErr || new Error("匯入主單失敗");

  for (const row of sorted) {
    let equipmentUsed = [];
    try {
      const parsed = JSON.parse(String(row.equipment_used_json || "[]"));
      equipmentUsed = Array.isArray(parsed) ? parsed : [];
    } catch {
      equipmentUsed = [];
    }
    let note = row.note_json;
    if (!note) {
      note = encodeNote({
        segment: row.segment || "event",
        memo: row.memo || "",
        open: Boolean(row.is_open),
        pulse: row.pulse || "",
        gender: row.gender || "不明",
        ageGroup: row.age_group || "不明",
        glucose: row.glucose || "",
        gcsEye: row.gcs_eye || "",
        gcsVerbal: row.gcs_verbal || "",
        gcsMotor: row.gcs_motor || ""
      });
    }
    const dispatchPayload = {
      session_id: newSession.id,
      dispatch_time: row.row_start_iso,
      vehicle: "其他",
      vehicle_custom: "未填",
      case_type: row.case_type || "外科",
      case_type_custom: row.case_type_custom || null,
      patient_count: row.patient_count || "1",
      patient_count_custom: row.patient_count_custom || null,
      hospital: row.hospital || "其他",
      hospital_custom: row.hospital_custom || null,
      chief_complaint: row.chief_complaint || "",
      bp: row.bp || null,
      spo2: row.spo2 || null,
      equipment_used: equipmentUsed,
      note
    };
    await insertDispatch(dispatchPayload, "匯入勤務明細");
  }
};

const onHistoryImportClick = () => {
  if (!el.historyImportFile || state.busy) return;
  el.historyImportFile.value = "";
  el.historyImportFile.click();
};

const onHistoryImportFileChange = async () => {
  const file = el.historyImportFile?.files?.[0];
  if (!file) return;
  const name = String(file.name || "").toLowerCase();
  const text = await file.text();
  let rawRows = [];
  if (name.endsWith(".csv")) {
    rawRows = parseImportedCsv(text);
  } else if (name.endsWith(".txt")) {
    rawRows = parseImportedTxt(text);
  } else {
    setHint(el.sessionStatus, "僅支援匯入 txt/csv。");
    return;
  }
  const rows = normalizeImportedRows(rawRows);
  if (!rows.length) {
    setHint(el.sessionStatus, "檔案中沒有可匯入的 EMT_SESSION_V1 明細。");
    return;
  }
  try {
    setSyncing(true, "匯入中...");
    await importHistoryRows(rows);
    await refresh({ showLoading: false, deferSummary: true });
    await loadAvailableHistoryDates();
    await loadHistoryRecords();
    setHint(el.sessionStatus, `匯入完成，共 ${rows.length} 筆明細。`);
  } catch (err) {
    setHint(el.sessionStatus, `匯入失敗：${String(err?.message || err || "")}`);
  } finally {
    setSyncing(false);
  }
};

const rowTimelineLine2 = (row) => {
  if (isStandby(row)) {
    return "待勤";
  }
  const hospital = row.hospital === "其他" ? row.hospital_custom || "其他" : row.hospital;
  const count = row.patient_count === "其他" ? row.patient_count_custom : row.patient_count;
  const caseType = row.case_type === "其他" ? row.case_type_custom : row.case_type;
  const complaint = (row.chief_complaint || "").trim() || "-";
  return `${hospital || "未填"} ${count || "?"}人 ${caseType || "未填"} ${complaint}`;
};

const escapeHtml = (text) =>
  String(text ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

const standbyLineIcon = () => `
  <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <circle cx="12" cy="12" r="8.5" stroke="currentColor" stroke-width="2"></circle>
    <path d="M12 7.8v4.6l2.9 1.9" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path>
  </svg>
`;

const rowTimelineLine2Html = (row) => {
  const text = escapeHtml(rowTimelineLine2(row));
  if (isStandby(row)) {
    return `
      <span class="item-note-icon standby" aria-hidden="true">${standbyLineIcon()}</span>
      <span class="item-note-text">${text}</span>
    `;
  }
  return `
    <span class="item-note-icon event" aria-hidden="true">🚑</span>
    <span class="item-note-text">${text}</span>
  `;
};

const groupRowsBySession = (rows) => {
  const map = new Map();
  (rows || []).forEach((r) => {
    if (!map.has(r.session_id)) map.set(r.session_id, []);
    map.get(r.session_id).push(r);
  });
  map.forEach((arr) => arr.sort((a, b) => new Date(a.dispatch_time) - new Date(b.dispatch_time)));
  return map;
};

const updateHistoryDateAvailabilityUI = () => {
  if (!el.historyDateList) return;
  const granularity = state.historyGranularity === "month" ? "month" : "day";
  const selected = el.historyDateList.value || "";
  const availableSet = new Set(
    granularity === "month" ? state.availableHistoryMonths || [] : state.availableHistoryDates || []
  );
  const isAvailable = availableSet.has(selected);
  const pool = granularity === "month" ? state.availableHistoryMonths || [] : state.availableHistoryDates || [];
  if (!selected && pool.length) {
    el.historyDateList.value = pool[0];
    return;
  }
  if (selected && !isAvailable && pool.length) {
    el.historyDateList.value = pool[0];
  }
};

const renderHistoryDateList = () => {
  if (!el.historyDateList) return;
  const granularity = state.historyGranularity === "month" ? "month" : "day";
  const optionsPool = granularity === "month" ? state.availableHistoryMonths || [] : state.availableHistoryDates || [];
  const emptyText = granularity === "month" ? "無紀錄月份" : "無紀錄日期";
  if (!optionsPool.length) {
    el.historyDateList.innerHTML = `<option value="">${emptyText}</option>`;
    return;
  }
  const options = optionsPool
    .map((d) => `<option value="${d}">${d}</option>`)
    .join("");
  el.historyDateList.innerHTML = options;
};

const loadAvailableHistoryDates = async () => {
  if (!state.user) return;
  setHistoryLoading(true, "讀取可查日期中...");
  try {
    const { data, error } = await dbQuery(
      (signal) =>
        supabaseClient
          .from("duty_sessions")
          .select("start_time")
          .eq("user_id", state.user.id)
          .order("start_time", { ascending: false })
          .abortSignal(signal),
      { label: "讀取可查日期", attempts: DB_READ_ATTEMPTS, timeoutMs: DB_READ_TIMEOUT_MS }
    );
    if (error) throw error;
    const uniq = Array.from(
      new Set((data || []).map((row) => isoToDateKey(row.start_time)).filter(Boolean))
    ).sort((a, b) => (a < b ? 1 : -1));
    const uniqMonths = Array.from(
      new Set((data || []).map((row) => isoToMonthKey(row.start_time)).filter(Boolean))
    ).sort((a, b) => (a < b ? 1 : -1));
    state.availableHistoryDates = uniq;
    state.availableHistoryMonths = uniqMonths;
    renderHistoryDateList();
    if (el.historyDateList) {
      const pool = state.historyGranularity === "month" ? uniqMonths : uniq;
      if (!el.historyDateList.value || !pool.includes(el.historyDateList.value)) {
        el.historyDateList.value = pool[0] || "";
      }
    }
    updateHistoryDateAvailabilityUI();
  } finally {
    setHistoryLoading(false);
  }
};

const renderHistoryList = (sessions, rowsBySession) => {
  if (!el.historyList) return;
  el.historyList.innerHTML = "";
  state.historyRenderCache = {};
  sessions.forEach((session) => {
    const card = document.createElement("article");
    card.className = "history-session";

    const head = document.createElement("div");
    head.className = "history-session-head";
    head.classList.add("with-date");
    const sessionRows = rowsBySession.get(session.id) || [];
    state.historyRenderCache[String(session.id)] = {
      session: { ...session },
      rows: [...sessionRows]
    };
    const summary = summarizeSessionRows(session, sessionRows);
    const dutyText = formatDurationHm(summary.dutyMs);
    const endText = session.end_time ? formatHm(session.end_time) : "進行中";
    head.innerHTML = `
      <div class="history-session-head-main">
        <span class="history-session-date">${formatMonthDay(session.start_time)}</span>
        <div class="history-session-subline">
          <span class="history-session-time">${formatHm(session.start_time)} - ${endText}</span>
          <span class="history-session-duty">[ ${dutyText} ]</span>
        </div>
      </div>
    `;
    card.appendChild(head);
    const actions = document.createElement("div");
    actions.className = "history-session-actions";
    const rowEditOn = Boolean(state.historyRowEditModeBySession[String(session.id)]);
    actions.innerHTML = `
      <button
        type="button"
        class="history-edit-toggle-btn ${rowEditOn ? "active" : ""}"
        data-session-id="${session.id}"
        aria-label="切換明細編輯按鈕"
        title="編輯明細"
      >✎</button>
      <button
        type="button"
        class="history-export-btn history-export-toggle"
        data-session-id="${session.id}"
        aria-label="匯出這筆歷史紀錄"
        title="匯出"
      >⤓</button>
      <div class="history-export-menu hidden" data-session-id="${session.id}">
        <button type="button" class="history-export-item" data-format="txt" data-session-id="${session.id}">TXT</button>
        <button type="button" class="history-export-item" data-format="csv" data-session-id="${session.id}">CSV</button>
      </div>
      <button
        type="button"
        class="history-delete-btn"
        data-session-id="${session.id}"
        data-session-status="${session.status || ""}"
        aria-label="刪除此筆歷史紀錄"
        title="刪除"
      >×</button>
    `;
    card.appendChild(actions);

    const rows = sessionRows;
    rows.forEach((row, idx) => {
      const line = document.createElement("div");
      line.className = "history-row";
      const next = rows[idx + 1];
      const rowEnd = next ? next.dispatch_time : session.end_time || session.start_time;
      const canEdit = rowEditOn;
      line.innerHTML = `
        <span class="history-row-time">${formatHm(row.dispatch_time)} - ${formatHm(rowEnd)}</span>
        <span class="history-row-text">${escapeHtml(rowSummary(row))}</span>
        ${
          canEdit
            ? `<button type="button" class="history-row-edit-btn" data-session-id="${session.id}" data-row-id="${row.id}" aria-label="編輯這筆紀錄" title="編輯">✎</button>`
            : `<span class="history-row-edit-placeholder"></span>`
        }
      `;
      card.appendChild(line);
    });

    if (!rows.length) {
      const empty = document.createElement("div");
      empty.className = "history-row";
      empty.innerHTML = `
        <span class="history-row-time">--:-- - --:--</span>
        <span class="history-row-text">無明細</span>
      `;
      card.appendChild(empty);
    }

    el.historyList.appendChild(card);
  });
};

const openHistoryRowEditor = (sessionId, rowId) => {
  const cache = state.historyRenderCache[String(sessionId)];
  if (!cache || !cache.session || !Array.isArray(cache.rows)) return;
  const row = cache.rows.find((r) => String(r.id) === String(rowId));
  if (!row) return;
  state.historyEditBackup = {
    session: state.session ? { ...state.session } : null,
    rows: Array.isArray(state.rows) ? state.rows.map((x) => ({ ...x })) : [],
    modeOverride: state.modeOverride
  };
  state.editingFromHistory = true;
  state.modeOverride = null;
  state.session = { ...cache.session };
  state.rows = cache.rows.map((x) => ({ ...x }));
  openEventSheetByRowId(rowId);
};

const deleteHistorySession = async (sessionId, sessionStatus = "") => {
  if (!state.user || !sessionId) return;
  const codeOk = confirmDeleteByCode("刪除這筆歷史紀錄");
  if (!codeOk) {
    setHint(el.sessionStatus, "確認碼錯誤，刪除失敗！");
    return;
  }
  try {
    setSyncing(true, "刪除歷史紀錄中...");
    const { error: delDispatchErr } = await dbQuery(
      (signal) => supabaseClient.from("duty_dispatches").delete().eq("session_id", sessionId).abortSignal(signal),
      { label: "刪除歷史明細", attempts: DB_WRITE_ATTEMPTS, timeoutMs: DB_WRITE_TIMEOUT_MS }
    );
    if (delDispatchErr) throw delDispatchErr;

    const { error: delSessionErr } = await dbQuery(
      (signal) =>
        supabaseClient
          .from("duty_sessions")
          .delete()
          .eq("id", sessionId)
          .eq("user_id", state.user.id)
          .abortSignal(signal),
      { label: "刪除歷史主單", attempts: DB_WRITE_ATTEMPTS, timeoutMs: DB_WRITE_TIMEOUT_MS }
    );
    if (delSessionErr) throw delSessionErr;

    purgePendingQueueBySessionIds([sessionId]);
    await refresh({ showLoading: false, deferSummary: true });
    await loadAvailableHistoryDates();
    await loadHistoryRecords();
    setHint(el.sessionStatus, "已刪除。");
  } catch (err) {
    setHint(el.sessionStatus, `刪除失敗：${err.message}`);
  } finally {
    setSyncing(false);
  }
};

const loadHistoryRecords = async () => {
  if (!state.user || !el.historyDateList?.value) return;
  setHistoryLoading(true, "讀取歷史紀錄中...");
  try {
    if (!state.availableHistoryDates.length) {
      await loadAvailableHistoryDates();
    }
    const granularity = state.historyGranularity === "month" ? "month" : "day";
    const dateText = el.historyDateList.value;
    const availablePool = granularity === "month" ? state.availableHistoryMonths || [] : state.availableHistoryDates || [];
    if (!availablePool.includes(dateText)) {
      el.historyList.innerHTML = "";
      updateHistoryDateAvailabilityUI();
      return;
    }
    let start = null;
    let end = null;
    if (granularity === "month") {
      const m = String(dateText || "").match(/^(\d{4})-(\d{2})$/);
      if (!m) {
        setHint(el.sessionStatus, "月份格式錯誤。");
        return;
      }
      const y = Number(m[1]);
      const mon = Number(m[2]);
      start = new Date(y, mon - 1, 1);
      end = new Date(y, mon, 1);
    } else {
      start = new Date(`${dateText}T00:00:00`);
      end = new Date(start);
      end.setDate(end.getDate() + 1);
    }
    if (Number.isNaN(start?.getTime()) || Number.isNaN(end?.getTime())) {
      setHint(el.sessionStatus, "日期格式錯誤。");
      return;
    }

    const sessionAscending = granularity === "month";
    const { data: sessions, error: sesErr } = await dbQuery(
      (signal) =>
        supabaseClient
          .from("duty_sessions")
          .select("id,start_time,end_time,status")
          .eq("user_id", state.user.id)
          .gte("start_time", start.toISOString())
          .lt("start_time", end.toISOString())
          .order("start_time", { ascending: sessionAscending })
          .abortSignal(signal),
      { label: "讀取歷史主單", attempts: DB_READ_ATTEMPTS, timeoutMs: DB_READ_TIMEOUT_MS }
    );
    if (sesErr) throw sesErr;
    if (!sessions?.length) {
      el.historyList.innerHTML = "";
      return;
    }

    const ids = sessions.map((x) => x.id);
    const { data: rows, error: rowErr } = await dbQuery(
      (signal) =>
        supabaseClient
          .from("duty_dispatches")
          .select("*")
          .in("session_id", ids)
          .order("dispatch_time", { ascending: true })
          .abortSignal(signal),
      { label: "讀取歷史明細", attempts: DB_READ_ATTEMPTS, timeoutMs: DB_READ_TIMEOUT_MS }
    );
    if (rowErr) throw rowErr;

    const rowsBySession = groupRowsBySession(rows || []);
    renderHistoryList(sessions, rowsBySession);
  } catch (err) {
    setHint(el.sessionStatus, `讀取歷史紀錄失敗：${err.message}`);
  } finally {
    setHistoryLoading(false);
  }
};

const toggleHistoryPanel = async (forceOpen = null) => {
  if (!el.historyPanel || !el.historyToggleBtn) return;
  const isOpen = !el.historyPanel.classList.contains("hidden");
  const nextOpen = forceOpen === null ? !isOpen : Boolean(forceOpen);
  el.historyPanel.classList.toggle("hidden", !nextOpen);
  el.historyToggleBtn.classList.toggle("expanded", nextOpen);
  el.historyToggleBtn.setAttribute("aria-expanded", nextOpen ? "true" : "false");
  if (el.summaryHistory) {
    el.summaryHistory.classList.toggle("expanded", nextOpen);
  }
  if (nextOpen) {
    if (!state.availableHistoryDates.length) {
      await loadAvailableHistoryDates();
    }
    await loadHistoryRecords();
  }
};

const rowEndIso = (row) => {
  const idx = state.rows.findIndex((r) => r.id === row.id);
  const next = idx >= 0 ? state.rows[idx + 1] : null;
  return next ? next.dispatch_time : state.session?.end_time || new Date().toISOString();
};

const isCrossDayActiveSession = (session) => {
  if (!session || session.status !== "active" || !session.start_time) return false;
  const start = new Date(session.start_time);
  if (Number.isNaN(start.getTime())) return false;
  const now = new Date();
  return (
    start.getFullYear() !== now.getFullYear() ||
    start.getMonth() !== now.getMonth() ||
    start.getDate() !== now.getDate()
  );
};

const autoCloseCrossDaySessionIfNeeded = async () => {
  if (!state.user || !state.session || !isCrossDayActiveSession(state.session)) return false;
  const s = new Date(state.session.start_time);
  const end = new Date(s.getFullYear(), s.getMonth(), s.getDate(), 23, 59, 0, 0);
  const payload = { end_time: end.toISOString(), status: "completed" };
  enqueuePendingItem({ type: "session_update", sessionId: state.session.id, payload });
  state.session = { ...state.session, ...payload };
  addDebugLog("session.auto.closed.cross_day", { sessionId: state.session.id, endTime: payload.end_time }, "warn");
  processPendingQueue().catch(() => {});
  return true;
};

const parseHospitalForForm = (row) => {
  if (row.hospital === "其他" && row.hospital_custom === "未送") {
    return "未送";
  }
  if (row.hospital === "其他" && row.hospital_custom === "未選") {
    return "未選";
  }
  if (row.hospital === "其他" && row.hospital_custom === "安康耕莘") {
    return "安康耕莘";
  }
  if (row.hospital === "其他" && (!row.hospital_custom || row.hospital_custom === "未填")) {
    return "其他";
  }
  const allowed = ["未選", "雙和", "永和耕莘", "慈濟", "新店耕莘", "板醫", "西園", "台大", "安康耕莘", "其他", "未送"];
  if (allowed.includes(row.hospital)) {
    return row.hospital;
  }
  return "未選";
};

const parsePatientCountForForm = (row) => {
  const n =
    row.patient_count === "其他" ? Number(row.patient_count_custom || 1) : Number(row.patient_count || 1);
  if (n <= 0) return "0";
  if (n >= 2) return "2";
  return "1";
};

const parseCaseTypeForForm = (row) => {
  const allowed = ["外科", "內科", "火警", "其他"];
  return allowed.includes(row.case_type) ? row.case_type : "外科";
};

const syncPatientCountByHospital = () => {
  if (!el.hospital || !el.patientCount) return;
  const isNoTransport = el.hospital.value === "未送";
  if (isNoTransport) {
    el.patientCount.value = "0";
  } else if (el.patientCount.value === "0") {
    el.patientCount.value = "1";
  }
  el.patientCount.disabled = isNoTransport;
};

const fillEventForm = (row) => {
  const note = parseNote(row.note);

  el.eventFinishTime.value = toInput24h();
  el.hospital.value = parseHospitalForForm(row);
  el.patientCount.value = parsePatientCountForForm(row);
  el.caseType.value = parseCaseTypeForForm(row);
  if (el.chiefComplaint) {
    el.chiefComplaint.value = row.chief_complaint || "";
  }
  el.bp.value = row.bp || "";
  el.spo2.value = row.spo2 || "";
  if (el.pulse) {
    el.pulse.value = note.pulse || "";
  }
  if (el.gender) {
    el.gender.value = note.gender || "不明";
  }
  if (el.ageGroup) {
    el.ageGroup.value = note.ageGroup || "不明";
  }
  if (el.glucose) {
    el.glucose.value = note.glucose || "";
  }
  if (el.gcsEye) el.gcsEye.value = note.gcsEye || "";
  if (el.gcsVerbal) el.gcsVerbal.value = note.gcsVerbal || "";
  if (el.gcsMotor) el.gcsMotor.value = note.gcsMotor || "";
  setEquipmentSelections(row.equipment_used || []);
  el.memo.value = note.memo || "";
  syncPatientCountByHospital();
  updateGcsSummary();
  updateVitalAlertState();
};

const setEventGuideOpen = (open) => {
  const isOpen = Boolean(open);
  if (el.eventCriticalGuide) {
    el.eventCriticalGuide.classList.toggle("hidden", !isOpen);
  }
  if (el.eventGuideToggleBtn) {
    el.eventGuideToggleBtn.setAttribute("aria-expanded", isOpen ? "true" : "false");
  }
};

const setEventSheetMode = (mode) => {
  state.eventSheetMode = mode;
  if (el.eventForm) {
    el.eventForm.classList.toggle("edit-mode", mode === "edit");
    el.eventForm.classList.toggle("standby-time-only", mode === "edit" && state.editRowIsStandby);
  }
  if (mode === "final") {
    el.eventSheetTitle.textContent = "確認結束出勤（可再檢查）";
    el.saveDraftBtn.classList.add("hidden");
    el.confirmFinishBtn.classList.remove("hidden");
    if (el.eventStartTime) el.eventStartTime.disabled = true;
    el.eventFinishTime.disabled = false;
    if (el.fillEventStartNowBtn) el.fillEventStartNowBtn.disabled = true;
    if (el.fillEventNowBtn) el.fillEventNowBtn.disabled = false;
    setEventDetailDisabled(false);
    if (el.eventGuideToggleBtn) el.eventGuideToggleBtn.classList.add("hidden");
    setEventGuideOpen(false);
    return;
  }

  el.eventSheetTitle.textContent = "編輯紀錄";
  el.saveDraftBtn.classList.remove("hidden");
  el.confirmFinishBtn.classList.add("hidden");
  if (el.eventGuideToggleBtn) el.eventGuideToggleBtn.classList.remove("hidden");
  if (el.eventStartTime) el.eventStartTime.disabled = false;
  el.eventFinishTime.disabled = false;
  if (el.fillEventStartNowBtn) el.fillEventStartNowBtn.disabled = false;
  if (el.fillEventNowBtn) el.fillEventNowBtn.disabled = false;
  if (state.editRowIsStandby) {
    setEventDetailDisabled(true);
  } else {
    setEventDetailDisabled(false);
  }
};

const buildEventUpdatePayload = (open) => {
  const hospitalValue = el.hospital.value;
  const { hospital, hospital_custom: hospitalCustom } = normalizeHospitalForDb(hospitalValue);
  const { case_type: caseType, case_type_custom: caseTypeCustom } = normalizeCaseTypeForDb(el.caseType.value);
  const isNoTransport = hospitalValue === "未送";
  const patientCountValue = isNoTransport ? "其他" : el.patientCount.value;
  const patientCountCustom = isNoTransport ? "0" : null;

  return {
    vehicle: "其他",
    vehicle_custom: "未填",
    case_type: caseType,
    case_type_custom: caseTypeCustom,
    patient_count: patientCountValue,
    patient_count_custom: patientCountCustom,
    hospital,
    hospital_custom: hospitalCustom,
    chief_complaint: el.chiefComplaint ? el.chiefComplaint.value.trim() : "",
    bp: el.bp.value.trim() || null,
    spo2: el.spo2.value.trim() || null,
    equipment_used: getSelectedEquipment(),
    note: encodeNote({
      segment: "event",
      memo: el.memo.value.trim(),
      open,
      pulse: el.pulse ? el.pulse.value.trim() : "",
      gender: el.gender ? el.gender.value : "不明",
      ageGroup: el.ageGroup ? el.ageGroup.value : "不明",
      glucose: el.glucose ? el.glucose.value.trim() : "",
      gcsEye: el.gcsEye ? el.gcsEye.value : "",
      gcsVerbal: el.gcsVerbal ? el.gcsVerbal.value : "",
      gcsMotor: el.gcsMotor ? el.gcsMotor.value : ""
    })
  };
};

const resolveStandbyInsertIso = (eventRow, finishDate) => {
  const base = finishDate instanceof Date && !Number.isNaN(finishDate.getTime()) ? finishDate : new Date();
  const eventStartMs = new Date(eventRow.dispatch_time).getTime();
  const finishMs = base.getTime();
  if (!Number.isFinite(eventStartMs)) return base.toISOString();
  if (finishMs > eventStartMs) return base.toISOString();
  // Keep flow unblocked: if finish time is not after start, auto-shift to start+1s.
  return new Date(eventStartMs + 1000).toISOString();
};

const DETAIL_FIELD_KEYS = [
  "hospital",
  "patientCount",
  "caseType",
  "gender",
  "ageGroup",
  "glucose",
  "gcsEye",
  "gcsVerbal",
  "gcsMotor",
  "chiefComplaint",
  "bp",
  "spo2",
  "pulse",
  "memo"
];

const setEventDetailDisabled = (disabled) => {
  DETAIL_FIELD_KEYS.forEach((k) => {
    const node = el[k];
    if (!node) return;
    node.disabled = Boolean(disabled);
  });
  if (Array.isArray(el.equipmentItems)) {
    el.equipmentItems.forEach((x) => {
      x.disabled = Boolean(disabled);
    });
  }
};

const renderTimeline = () => {
  el.timelineList.innerHTML = "";
  const noRows = !state.rows.length;
  const hasActive = Boolean(state.session && state.session.status === "active");
  if (el.sortTimelineBtn) {
    const isDesc = state.timelineOrder === "desc";
    el.sortTimelineBtn.textContent = isDesc ? "↓" : "↑";
    el.sortTimelineBtn.setAttribute("aria-label", `切換排序（目前：${isDesc ? "新到舊" : "舊到新"}）`);
    el.sortTimelineBtn.title = isDesc ? "目前：新到舊" : "目前：舊到新";
  }
  if (el.deleteTodayBtn) {
    const editOn = Boolean(state.timelineEditMode);
    el.deleteTodayBtn.classList.toggle("active", editOn);
    el.deleteTodayBtn.setAttribute("aria-label", `切換編輯模式（目前：${editOn ? "開啟" : "關閉"}）`);
    el.deleteTodayBtn.title = editOn ? "編輯模式：開啟" : "編輯模式：關閉";
  }
  if (el.todayEmpty) {
    el.todayEmpty.classList.toggle("hidden", !noRows);
  }
  if (el.todayResumeWrap) {
    const showResume = !noRows && !hasActive;
    el.todayResumeWrap.classList.toggle("hidden", !showResume);
  }
  if (!state.rows.length) {
    if (el.startShiftBtn) {
      el.startShiftBtn.disabled = state.busy || Boolean(state.session && state.session.status === "active");
    }
    if (el.resumeShiftBtn) {
      el.resumeShiftBtn.disabled = true;
    }
    return;
  }
  if (el.resumeShiftBtn) {
    el.resumeShiftBtn.disabled = state.busy || hasActive;
  }

  const rowsForRender = state.timelineOrder === "desc" ? [...state.rows].reverse() : [...state.rows];
  const rowIndexById = new Map(state.rows.map((row, idx) => [row.id, idx]));

  rowsForRender.forEach((row) => {
    const sourceIdx = rowIndexById.get(row.id);
    const next = typeof sourceIdx === "number" ? state.rows[sourceIdx + 1] : null;
    const end = next ? next.dispatch_time : state.session?.end_time || new Date().toISOString();
    const item = document.createElement("article");
    item.className = "item";
    item.dataset.rowId = String(row.id);
    const isCurrent = Boolean(state.session?.status === "active" && sourceIdx === state.rows.length - 1);
    if (isCurrent) {
      item.classList.add("current-task");
      item.classList.add(isStandby(row) ? "current-standby" : "current-event");
    }
    const canCardEdit = !isStandby(row) && (isCurrent || state.timelineEditMode);
    if (canCardEdit) {
      item.classList.add("editable");
    }
    item.innerHTML = `
      <div class="item-top">
        <div class="item-time">${formatHm(row.dispatch_time)} - ${formatHm(end)}</div>
        <div class="item-actions">
          ${
            isCurrent
              ? `<span class="current-status ${isStandby(row) ? "standby" : "event"}">${isStandby(row) ? "待勤中" : "出勤中"}<span class="dots" aria-hidden="true"><span>.</span><span>.</span><span>.</span></span></span>`
              : state.timelineEditMode
                ? `
                  <button type="button" class="action-icon edit row-action-btn" data-action="edit" data-row-id="${row.id}" aria-label="編輯">✎</button>
                  <button type="button" class="action-icon delete row-action-btn" data-action="delete" data-row-id="${row.id}" aria-label="刪除">×</button>
                `
                : ""
          }
        </div>
      </div>
      <div class="item-note">${rowTimelineLine2Html(row)}</div>
    `;
    el.timelineList.appendChild(item);
  });
};

const toggleTimelineEditMode = () => {
  state.timelineEditMode = !state.timelineEditMode;
  renderTimeline();
};

const deleteDispatchRow = async (rowId) => {
  if (!state.user || rowId === undefined || rowId === null || state.busy) return;
  if (!acquireActionLock(`deleteDispatchRow:${String(rowId)}`, 1500)) {
    addDebugLog("action.lock.blocked", { action: "deleteDispatchRow", rowId: String(rowId) }, "warn");
    return;
  }
  const row = (state.rows || []).find((x) => String(x.id) === String(rowId));
  if (!row) return;
  const codeOk = confirmDeleteByCode("刪除這筆紀錄");
  if (!codeOk) {
    setHint(el.sessionStatus, "確認碼錯誤，刪除失敗！");
    return;
  }
  if (isLocalRowId(row.id)) {
    removePendingInsertByLocalRowId(row.id);
  } else {
    enqueuePendingItem({ type: "dispatch_delete", rowId: row.id });
  }
  state.rows = (state.rows || []).filter((x) => String(x.id) !== String(row.id));
  applyLocalUiAfterMutation();
  setHint(el.sessionStatus, "已本機刪除，背景同步中。");
  processPendingQueue().catch(() => {});
};

const renderAuth = () => {
  const loggedIn = Boolean(state.user);
  el.authCard.classList.toggle("hidden", loggedIn);
  el.workCard.classList.toggle("hidden", !loggedIn);
  el.profileBtn.classList.toggle("hidden", !loggedIn);
  if (!loggedIn) {
    el.actionBar.classList.add("hidden");
    return;
  }
  applyProfileToUI();

  el.actionBar.classList.remove("hidden");
  applyActionMode(actionMode());
  updatePendingStatusUI();
};

const refreshLiveTimelineClock = ({ force = false } = {}) => {
  const hasActive = Boolean(state.session?.status === "active" && (state.rows || []).length);
  if (!hasActive) {
    state.liveUiLastMinute = null;
    return;
  }
  if (document.hidden) return;
  const nowMinute = Math.floor(Date.now() / 60000);
  if (!force && state.liveUiLastMinute === nowMinute) return;
  state.liveUiLastMinute = nowMinute;
  renderTimeline();
  if (state.summaryRange === "today" && state.session) {
    setSummaryValues(summarizeSessionRows(state.session, state.rows || []));
  }
};

const isSessionReadTimeoutError = (err) => {
  const msg = String(err?.message || "");
  return msg.includes("讀取勤務主單") && msg.includes("逾時");
};

const scheduleRefreshRetry = () => {
  if (state.refreshRetryTimer) return state.refreshRetryDelayMs;
  const idx = Math.min(state.refreshRetryCount, REFRESH_TIMEOUT_RETRY_DELAYS_MS.length - 1);
  const delayMs = REFRESH_TIMEOUT_RETRY_DELAYS_MS[idx];
  state.refreshRetryCount += 1;
  state.refreshRetryDelayMs = delayMs;
  state.refreshRetryTimer = window.setTimeout(() => {
    state.refreshRetryTimer = null;
    state.refreshRetryDelayMs = null;
    refresh({ showLoading: false, deferSummary: true }).catch(() => {});
  }, delayMs);
  return delayMs;
};

const refresh = async (opts = {}) => {
  if (state.refreshPromise) {
    addDebugLog("refresh.join");
    return state.refreshPromise;
  }
  const runner = async () => {
  const { showLoading = false, loadingText = "資料載入中...", deferSummary = true } = opts;
  const canShow = showLoading && !state.busy;
  const rfStart = performance.now();
  addDebugLog("refresh.start", { showLoading, loadingText, deferSummary });
  if (canShow) {
    setSyncing(true, loadingText);
  }
  try {
    await loadSessionAndRows();
    const autoClosedCrossDay = await autoCloseCrossDaySessionIfNeeded();
    if (autoClosedCrossDay) {
      await loadSessionAndRows();
    }
    state.refreshRetryCount = 0;
    if (state.refreshRetryTimer) {
      window.clearTimeout(state.refreshRetryTimer);
      state.refreshRetryTimer = null;
    }
    state.refreshRetryDelayMs = null;
    state.modeOverride = null;
    renderTimeline();
    renderAuth();
    updatePendingStatusUI();
    if (deferSummary) {
      window.setTimeout(async () => {
        try {
          await renderSummary();
          addDebugLog("refresh.summary.done");
        } catch (err) {
          addDebugLog("refresh.summary.error", { message: String(err?.message || "") }, "warn");
        }
      }, 0);
    } else {
      await renderSummary();
    }
    addDebugLog("refresh.success", { elapsedMs: Math.round(performance.now() - rfStart) });
  } catch (err) {
    if (isSessionReadTimeoutError(err)) {
      const retryDelayMs =
        state.refreshRetryCount < REFRESH_TIMEOUT_RETRY_DELAYS_MS.length ? scheduleRefreshRetry() : null;
      // 容錯：勤務主單逾時時保留目前畫面與快取資料，避免整頁變成錯誤狀態。
      addDebugLog(
        "refresh.fallback.keep_state",
        {
          elapsedMs: Math.round(performance.now() - rfStart),
          message: String(err?.message || "unknown error"),
          retryDelayMs
        },
        "warn"
      );
      state.modeOverride = null;
      renderTimeline();
      renderAuth();
      updatePendingStatusUI();
      setHint(
        el.sessionStatus,
        retryDelayMs
          ? `勤務資料讀取較慢，已先顯示本機資料，${Math.round(retryDelayMs / 1000)} 秒後背景重試。`
          : "勤務資料讀取持續逾時，已停止自動重試；請稍後手動重新整理。"
      );
      return;
    }
    addDebugLog(
      "refresh.error",
      {
        elapsedMs: Math.round(performance.now() - rfStart),
        code: err?.code || null,
        message: String(err?.message || "unknown error")
      },
      "error"
    );
    throw err;
  } finally {
    if (canShow) {
      setSyncing(false);
    }
  }
  };
  const task = runner();
  state.refreshPromise = task;
  try {
    return await task;
  } finally {
    if (state.refreshPromise === task) {
      state.refreshPromise = null;
    }
  }
};

const startShift = async (e) => {
  if (e?.preventDefault) e.preventDefault();
  setHint(el.sessionStatus, "");
  if (state.session && state.session.status === "active") {
    setHint(el.sessionStatus, "已有進行中的勤務。");
    return;
  }

  let st = new Date();
  if (el.startTime?.value) {
    const parsed = parseInput24h(el.startTime.value);
    if (!parsed) {
      setHint(el.sessionStatus, "起始時間格式錯誤，請用 YYYY-MM-DD HH:mm。");
      return;
    }
    st = parsed;
  }

  try {
    setSyncing(true, "建立勤務中...");
    const taskType = el.taskType?.value || "協勤";
    const displayName = (el.displayName?.value || getEffectiveDisplayName()).trim();
    const payload = {
      user_id: state.user.id,
      display_name: displayName,
      start_time: st.toISOString(),
      task_type: taskType,
      task_type_custom: taskType === "其他" ? (el.taskTypeCustom?.value || "").trim() : null,
      status: "active"
    };
    const { data, error } = await dbQuery(
      (signal) =>
        supabaseClient.from("duty_sessions").insert([payload]).select("*").single().abortSignal(signal),
      {
        label: "建立勤務主單",
        attempts: DB_WRITE_ATTEMPTS,
        timeoutMs: DB_WRITE_TIMEOUT_MS,
        onRetryText: (n, total) => `建立勤務中（重試 ${n}/${total}）...`
      }
    );
    if (error) throw error;
    state.session = data;
    await insertDispatch(standbyPayload(state.session.id, payload.start_time, "開始協勤"), "建立勤務同步中");
    await refresh();
    await loadAvailableHistoryDates();
    setHint(el.sessionStatus, "");
  } catch (err) {
    setHint(el.sessionStatus, `開始勤務失敗：${err.message}`);
  } finally {
    setSyncing(false);
  }
};

const startEvent = async () => {
  if (actionMode() !== "standby") return;
  if (state.busy) return;
  if (state.processingPendingQueue) {
    setHint(el.sessionStatus, "背景同步中，請稍候再按。");
    return;
  }
  if (!acquireActionLock("startEvent", 6000)) {
    addDebugLog("action.lock.blocked", { action: "startEvent" }, "warn");
    return;
  }
  if (!state.session || state.session.status !== "active") return;
  const last = latestRow();
  if (last && !isStandby(last)) return;
  const nowIso = new Date().toISOString();
  const eventPayload = {
    session_id: state.session.id,
    dispatch_time: nowIso,
    vehicle: "其他",
    vehicle_custom: "未填",
    case_type: "外科",
    case_type_custom: null,
    patient_count: "1",
    patient_count_custom: null,
    hospital: "其他",
    hospital_custom: "未選",
    chief_complaint: "",
    bp: null,
    spo2: null,
    equipment_used: [],
    note: encodeNote({ segment: "event", transported: false, memo: "", open: true })
  };

  setModeOverride("event");
  const localRowId = makeLocalRowId();
  const opId = enqueuePendingItem({ type: "dispatch_insert", payload: eventPayload, localRowId });
  if (!opId) {
    setHint(el.sessionStatus, "此出勤已在待同步佇列。");
    setModeOverride(null);
    return;
  }
  upsertLocalRowFromPayload(localRowId, {
    id: localRowId,
    ...eventPayload,
    seq_no: Number(await nextSeq())
  });
  applyLocalUiAfterMutation();
  setModeOverride(null);
  setHint(el.sessionStatus, "已本機建立出勤，背景同步中。");
  processPendingQueue().catch(() => {});
};

const openEventSheet = () => {
  if (actionMode() !== "event") return;
  const last = latestRow();
  if (!last || isStandby(last)) return;
  state.editRowId = last.id;
  state.editRowIsOpen = true;
  state.editRowIsStandby = false;
  fillEventForm(last);
  if (el.eventStartTime) {
    el.eventStartTime.value = toInput24h(new Date(last.dispatch_time));
  }
  el.eventFinishTime.value = toInput24h();
  setEventSheetMode("final");
  setHint(el.eventStatus, "");
  el.eventSheet.classList.remove("hidden");
  const sheetBody = el.eventSheet.querySelector(".sheet-body");
  if (sheetBody) sheetBody.scrollTop = 0;
};

const onSecondaryAction = async () => {
  const mode = actionMode();
  if (mode === "event") {
    openEventSheet();
    return;
  }
  if (mode === "standby") {
    await checkout();
  }
};

const openEventSheetByRowId = (rowId) => {
  const row = state.rows.find((r) => String(r.id) === String(rowId));
  if (!row) return;
  state.editRowId = row.id;
  state.editRowIsOpen = isOpenEvent(row);
  state.editRowIsStandby = isStandby(row);
  fillEventForm(row);
  el.eventStartTime.value = toInput24h(new Date(row.dispatch_time));
  el.eventFinishTime.value = toInput24h(new Date(rowEndIso(row)));
  state.editOriginalStartInput = el.eventStartTime.value;
  state.editOriginalEndInput = el.eventFinishTime.value;
  setHint(el.eventStatus, "");
  setEventSheetMode("edit");
  const isActiveLast =
    state.session?.status === "active" && latestRow() && String(latestRow().id) === String(row.id);
  if (isActiveLast) {
    el.eventFinishTime.disabled = true;
    if (el.fillEventNowBtn) el.fillEventNowBtn.disabled = true;
  }
  el.eventSheet.classList.remove("hidden");
  const sheetBody = el.eventSheet.querySelector(".sheet-body");
  if (sheetBody) sheetBody.scrollTop = 0;
};

const restoreHistoryEditContext = () => {
  if (!state.editingFromHistory) return;
  const backup = state.historyEditBackup || {};
  state.session = backup.session ? { ...backup.session } : null;
  state.rows = Array.isArray(backup.rows) ? backup.rows.map((x) => ({ ...x })) : [];
  state.modeOverride = backup.modeOverride || null;
  state.historyEditBackup = null;
  state.editingFromHistory = false;
  renderTimeline();
  renderAuth();
  updatePendingStatusUI();
};

const closeEventSheet = (force = false) => {
  if (state.busy && !force) return;
  state.editRowId = null;
  state.editRowIsOpen = false;
  state.editRowIsStandby = false;
  state.editOriginalStartInput = "";
  state.editOriginalEndInput = "";
  state.eventSheetMode = "final";
  el.eventForm.reset();
  setEquipmentSelections([]);
  if (el.hospital) el.hospital.value = "未選";
  if (el.patientCount) {
    el.patientCount.value = "1";
    el.patientCount.disabled = false;
  }
  if (el.caseType) el.caseType.value = "外科";
  if (el.gender) el.gender.value = "不明";
  if (el.ageGroup) el.ageGroup.value = "不明";
  if (el.glucose) el.glucose.value = "";
  if (el.gcsEye) el.gcsEye.value = "";
  if (el.gcsVerbal) el.gcsVerbal.value = "";
  if (el.gcsMotor) el.gcsMotor.value = "";
  if (el.eventStartTime) {
    el.eventStartTime.value = "";
    el.eventStartTime.disabled = false;
  }
  el.eventFinishTime.disabled = false;
  if (el.fillEventStartNowBtn) el.fillEventStartNowBtn.disabled = false;
  if (el.fillEventNowBtn) el.fillEventNowBtn.disabled = false;
  setEventDetailDisabled(false);
  el.saveDraftBtn.classList.add("hidden");
  el.confirmFinishBtn.classList.remove("hidden");
  updateGcsSummary();
  updateVitalAlertState();
  if (el.eventGuideToggleBtn) el.eventGuideToggleBtn.classList.add("hidden");
  setEventGuideOpen(false);
  el.eventSheet.classList.add("hidden");
  restoreHistoryEditContext();
};

const finishEvent = async (e) => {
  e.preventDefault();
  if (state.eventSheetMode !== "final") return;
  if (state.busy) return;
  if (state.processingPendingQueue) {
    setHint(el.eventStatus, "背景同步中，請稍候再按。");
    return;
  }
  if (!acquireActionLock("finishEvent", 6000)) {
    addDebugLog("action.lock.blocked", { action: "finishEvent" }, "warn");
    return;
  }
  const rowId = state.editRowId || latestRow()?.id;
  const row = state.rows.find((r) => r.id === rowId);
  if (!row || isStandby(row)) return;

  const finish = parseInput24h(el.eventFinishTime.value);
  if (state.editRowIsOpen && !finish) {
    setHint(el.eventStatus, "結束時間格式錯誤，請用 YYYY-MM-DD HH:mm。");
    return;
  }
  // Temporarily disabled by request:
  // allow finish time earlier than start time during field operations.

  setModeOverride("standby");
  const payload = buildEventUpdatePayload(false);
  const noteOpen = parseNote(row.note).open === true;

  if (noteOpen) {
    if (isLocalRowId(row.id)) {
      updatePendingInsertPayloadByLocalRowId(row.id, payload);
    } else {
      enqueuePendingItem({ type: "dispatch_update", rowId: row.id, payload });
    }
    upsertLocalRowFromPayload(row.id, { ...row, ...payload });
  }

  const standbyIso = resolveStandbyInsertIso(row, finish);
  if (state.editRowIsOpen) {
    const standbyRowId = makeLocalRowId();
    const sp = standbyPayload(state.session.id, standbyIso);
    enqueuePendingItem({ type: "dispatch_insert", payload: sp, localRowId: standbyRowId });
    upsertLocalRowFromPayload(standbyRowId, { id: standbyRowId, ...sp, seq_no: Number(await nextSeq()) });
  }

  closeEventSheet(true);
  applyLocalUiAfterMutation();
  setModeOverride(null);
  setHint(el.sessionStatus, "已本機結束出勤，背景同步中。");
  processPendingQueue().catch(() => {});
};

const saveEventDraft = async () => {
  if (state.eventSheetMode !== "edit") return;
  if (state.busy) return;
  if (!acquireActionLock("saveEventDraft", 3000)) {
    addDebugLog("action.lock.blocked", { action: "saveEventDraft" }, "warn");
    return;
  }
  const rowId = state.editRowId || latestRow()?.id;
  const row = state.rows.find((r) => String(r.id) === String(rowId));
  if (!row || !state.session) return;
  const editingFromHistory = Boolean(state.editingFromHistory);

  const rowIdx = state.rows.findIndex((r) => String(r.id) === String(row.id));
  if (rowIdx < 0) return;
  const prevRow = rowIdx > 0 ? state.rows[rowIdx - 1] : null;
  const nextRow = rowIdx < state.rows.length - 1 ? state.rows[rowIdx + 1] : null;
  const nextNextRow = rowIdx < state.rows.length - 2 ? state.rows[rowIdx + 2] : null;

  const startInput = String(el.eventStartTime.value || "").trim();
  const endInput = String(el.eventFinishTime.value || "").trim();
  const startDate = parseInput24h(startInput);
  const endDate = parseInput24h(endInput);
  if (!startDate || !endDate) {
    setHint(el.eventStatus, "開始/結束時間格式錯誤，請用 YYYY-MM-DD HH:mm。");
    return;
  }
  const startChanged = startInput !== String(state.editOriginalStartInput || "");
  const endChanged = endInput !== String(state.editOriginalEndInput || "");
  const changedTime = startChanged || endChanged;

  const MIN_GAP_MS = 60 * 1000;
  const startMs = startDate.getTime();
  const endMs = endDate.getTime();
  if (changedTime) {
    if (endMs - startMs < MIN_GAP_MS) {
      setHint(el.eventStatus, "時間區間過短，至少需 1 分鐘。");
      return;
    }

    if (prevRow) {
      const prevStartMs = new Date(prevRow.dispatch_time).getTime();
      if (Number.isFinite(prevStartMs) && startMs < prevStartMs + MIN_GAP_MS) {
        setHint(el.eventStatus, "開始時間過早，會影響前一筆以上紀錄（不合法）。");
        return;
      }
    }

    if (nextRow) {
      if (nextNextRow) {
        const nextNextMs = new Date(nextNextRow.dispatch_time).getTime();
        if (Number.isFinite(nextNextMs) && endMs > nextNextMs - MIN_GAP_MS) {
          setHint(el.eventStatus, "結束時間過晚，會影響超過相鄰一筆（不合法）。");
          return;
        }
      } else if (state.session.status === "active") {
        if (endMs > Date.now() - MIN_GAP_MS) {
          setHint(el.eventStatus, "結束時間過晚，已超過目前可調整範圍。");
          return;
        }
      } else if (state.session.end_time) {
        const sessionEndMs = new Date(state.session.end_time).getTime();
        if (Number.isFinite(sessionEndMs) && endMs > sessionEndMs - MIN_GAP_MS) {
          setHint(el.eventStatus, "結束時間超過勤務結束時間（不合法）。");
          return;
        }
      }
    } else if (state.session.status === "active") {
      const currentEndMs = new Date(rowEndIso(row)).getTime();
      if (Math.abs(endMs - currentEndMs) > 30 * 1000) {
        setHint(el.eventStatus, "進行中最後一筆不可調整結束時間。");
        return;
      }
    }
  }

  const basePayload = state.editRowIsStandby ? {} : buildEventUpdatePayload(state.editRowIsOpen);
  const payload = changedTime
    ? {
        ...basePayload,
        dispatch_time: new Date(startMs).toISOString()
      }
    : { ...basePayload };

  if (Object.keys(payload).length) {
    if (isLocalRowId(row.id)) {
      updatePendingInsertPayloadByLocalRowId(row.id, payload);
    } else {
      enqueuePendingItem({ type: "dispatch_update", rowId: row.id, payload });
    }
    upsertLocalRowFromPayload(row.id, { ...row, ...payload });
  }

  // 第一筆開始時間允許往前/往後調整，需同步更新勤務主單開始時間。
  if (changedTime && startChanged && !prevRow) {
    const sessionStartPayload = { start_time: new Date(startMs).toISOString() };
    enqueuePendingItem({ type: "session_update", sessionId: state.session.id, payload: sessionStartPayload });
    state.session = { ...state.session, ...sessionStartPayload };
  }

  if (changedTime && nextRow) {
    const nextPayload = { dispatch_time: new Date(endMs).toISOString() };
    if (isLocalRowId(nextRow.id)) {
      updatePendingInsertPayloadByLocalRowId(nextRow.id, nextPayload);
    } else {
      enqueuePendingItem({ type: "dispatch_update", rowId: nextRow.id, payload: nextPayload });
    }
    upsertLocalRowFromPayload(nextRow.id, { ...nextRow, ...nextPayload });
  } else if (changedTime && state.session.status === "completed") {
    const sessionPayload = { end_time: new Date(endMs).toISOString() };
    enqueuePendingItem({ type: "session_update", sessionId: state.session.id, payload: sessionPayload });
    state.session = { ...state.session, ...sessionPayload };
  }

  closeEventSheet(true);
  if (editingFromHistory) {
    loadHistoryRecords().catch(() => {});
  }
  applyLocalUiAfterMutation();
  setHint(el.sessionStatus, "已本機存檔，背景同步中。");
  processPendingQueue().catch(() => {});
};

const checkout = async () => {
  if (actionMode() !== "standby") return;
  if (state.busy) return;
  if (state.processingPendingQueue) {
    setHint(el.sessionStatus, "背景同步中，請稍候再按。");
    return;
  }
  if (!acquireActionLock("checkout", 7000)) {
    addDebugLog("action.lock.blocked", { action: "checkout" }, "warn");
    return;
  }
  if (!state.session || state.session.status !== "active") return;
  const last = latestRow();
  if (last && !isStandby(last)) {
    setHint(el.sessionStatus, "請先按「結束出勤」，再退勤。");
    return;
  }
  const ok = window.confirm("確認退勤？");
  if (!ok) return;

  setModeOverride("none");
  const now = new Date().toISOString();
  if (last && isStandby(last)) {
    const standbyNote = parseNote(last.note);
    const memo = String(standbyNote.memo || "").trim();
    const nextMemo = memo.includes("退勤") ? memo : memo ? `${memo} / 退勤` : "退勤";
    const notePayload = encodeNote({ ...standbyNote, memo: nextMemo });
    if (isLocalRowId(last.id)) {
      updatePendingInsertPayloadByLocalRowId(last.id, { note: notePayload });
    } else {
      enqueuePendingItem({ type: "dispatch_update", rowId: last.id, payload: { note: notePayload } });
    }
    upsertLocalRowFromPayload(last.id, { ...last, note: notePayload });
  }
  enqueuePendingItem({
    type: "session_update",
    sessionId: state.session.id,
    payload: { end_time: now, status: "completed" }
  });
  state.session = { ...state.session, end_time: now, status: "completed" };
  applyLocalUiAfterMutation();
  setModeOverride(null);
  setHint(el.sessionStatus, "退勤已本機完成，背景同步中。");
  processPendingQueue().catch(() => {});
};

const deleteTodayRecords = async () => {
  if (!state.user || state.busy) return;
  const codeOk = confirmDeleteByCode("刪除今日全部紀錄");
  if (!codeOk) {
    setHint(el.sessionStatus, "確認碼錯誤，刪除失敗！");
    return;
  }

  setHint(el.sessionStatus, "");
  addDebugLog("deleteToday.start");

  try {
    setSyncing(true, "刪除今日紀錄中...");
    setModeOverride("none");
    const { startIso, endIso } = dayBounds();
    const { data: sessions, error: sesErr } = await dbQuery(
      (signal) =>
        supabaseClient
          .from("duty_sessions")
          .select("id")
          .eq("user_id", state.user.id)
          .gte("start_time", startIso)
          .lt("start_time", endIso)
          .abortSignal(signal),
      { label: "讀取今日主單（刪除）", attempts: DB_READ_ATTEMPTS, timeoutMs: DB_READ_TIMEOUT_MS }
    );
    if (sesErr) throw sesErr;

    const ids = (sessions || []).map((s) => s.id).filter(Boolean);
    if (!ids.length) {
      addDebugLog("deleteToday.empty");
      setHint(el.sessionStatus, "今日無可刪除紀錄。");
      return;
    }

    const { error: delDispatchErr } = await dbQuery(
      (signal) => supabaseClient.from("duty_dispatches").delete().in("session_id", ids).abortSignal(signal),
      { label: "刪除今日明細", attempts: DB_WRITE_ATTEMPTS, timeoutMs: DB_WRITE_TIMEOUT_MS }
    );
    if (delDispatchErr) throw delDispatchErr;

    const { error: delSessionErr } = await dbQuery(
      (signal) =>
        supabaseClient
          .from("duty_sessions")
          .delete()
          .in("id", ids)
          .eq("user_id", state.user.id)
          .abortSignal(signal),
      { label: "刪除今日主單", attempts: DB_WRITE_ATTEMPTS, timeoutMs: DB_WRITE_TIMEOUT_MS }
    );
    if (delSessionErr) throw delSessionErr;

    purgePendingQueueBySessionIds(ids);
    closeEventSheet(true);
    state.session = null;
    state.rows = [];
    await refresh({ showLoading: false });
    await loadAvailableHistoryDates();
    addDebugLog("deleteToday.success", { count: ids.length });
    setHint(el.sessionStatus, `已刪除今日 ${ids.length} 筆主單與相關明細。`);
  } catch (err) {
    addDebugLog("deleteToday.error", { message: String(err?.message || "") }, "error");
    setHint(el.sessionStatus, `刪除失敗：${err.message}`);
  } finally {
    setSyncing(false);
  }
};

const login = async () => {
  await supabaseClient.auth.signInWithOAuth({
    provider: "google",
    options: { redirectTo: `${window.location.origin}${window.location.pathname}` }
  });
};

const clearSignedOutState = () => {
  state.user = null;
  state.session = null;
  state.rows = [];
  state.pendingQueueCache = [];
  state.availableHistoryDates = [];
  state.availableHistoryMonths = [];
  state.historyRenderCache = {};
  state.profile = { displayName: "", unit: "", title: "", phone: "", avatarDataUrl: "" };
  state.timelineEditMode = false;
  closeEventSheet(true);
  if (el.profileSheet) {
    el.profileSheet.classList.add("hidden");
  }
  renderTimeline();
  renderAuth();
  updatePendingStatusUI();
};

const logout = async () => {
  // Optimistic UI: switch to login view immediately even if auth event is delayed.
  clearSignedOutState();
  setHint(el.sessionStatus, "");
  try {
    await supabaseClient.auth.signOut({ scope: "local" });
  } catch (err) {
    addDebugLog("auth.logout.error", { message: String(err?.message || "") }, "warn");
  }
  await renderSummary();
};

const openProfileSheet = () => {
  if (!state.user) return;
  state.profileDraftAvatarDataUrl = state.profile.avatarDataUrl || "";
  el.profileEmail.value = state.user.email || "";
  el.profileDisplayName.value = state.profile.displayName || "";
  el.profileUnit.value = state.profile.unit || "";
  el.profileTitle.value = state.profile.title || "";
  el.profilePhone.value = state.profile.phone || "";
  el.profileAvatarFile.value = "";
  el.profileAvatarPreview.src = state.profileDraftAvatarDataUrl || DEFAULT_AVATAR;
  setHint(el.profileStatus, "");
  el.profileSheet.classList.remove("hidden");
};

const closeProfileSheet = (force = false) => {
  if (state.busy && !force) return;
  setHint(el.profileStatus, "");
  el.profileSheet.classList.add("hidden");
};

const onProfileAvatarFileChange = async () => {
  const file = el.profileAvatarFile.files?.[0];
  if (!file) return;
  if (!["image/jpeg", "image/png"].includes(file.type)) {
    setHint(el.profileStatus, "只支援 JPG/PNG。");
    el.profileAvatarFile.value = "";
    return;
  }
  const reader = new FileReader();
  reader.onload = () => {
    state.profileDraftAvatarDataUrl = String(reader.result || "");
    el.profileAvatarPreview.src = state.profileDraftAvatarDataUrl || DEFAULT_AVATAR;
    setHint(el.profileStatus, "新頭像已載入。");
  };
  reader.readAsDataURL(file);
};

const submitProfile = async (e) => {
  if (e?.preventDefault) e.preventDefault();
  state.profile = {
    displayName: el.profileDisplayName.value.trim(),
    unit: el.profileUnit.value.trim(),
    title: el.profileTitle.value.trim(),
    phone: el.profilePhone.value.trim(),
    avatarDataUrl: state.profileDraftAvatarDataUrl || state.profile.avatarDataUrl || ""
  };
  const result = await saveProfile();
  applyProfileToUI();
  if (result.noChange) {
    setHint(el.profileStatus, "無變更。");
  } else {
    setHint(el.profileStatus, result.remote ? "已儲存。" : "已儲存（本機，雲端稍後再試）。");
  }
  return result;
};

const saveAndCloseProfileSheet = async () => {
  if (!state.user || state.busy) return;
  try {
    setSyncing(true, "儲存個人資料中...");
    await submitProfile();
    closeProfileSheet(true);
  } catch (err) {
    setHint(el.profileStatus, `儲存失敗：${String(err?.message || err || "")}`);
  } finally {
    setSyncing(false);
  }
};

const pickProfileAvatar = () => {
  if (!el.profileAvatarFile || state.busy) return;
  el.profileAvatarFile.click();
};

const onProfileBack = async () => {
  await saveAndCloseProfileSheet();
};

const onProfileFormSubmit = async (event) => {
  if (event?.preventDefault) event.preventDefault();
  await onProfileBack();
};

const onProfileLogout = async () => {
  if (!state.busy) {
    closeProfileSheet();
  }
  await logout();
};

const copyDebugLogs = async () => {
  const text = exportDebugLogsText();
  try {
    await navigator.clipboard.writeText(text);
    setHint(el.profileStatus, `偵錯記錄已複製（${readDebugLogs().length} 筆）。`);
  } catch {
    setHint(el.profileStatus, "複製失敗，請改用瀏覽器主控台貼給我。");
    console.log("[EMT-DEBUG-EXPORT]\n" + text);
  }
};

const clearDebugLogs = () => {
  writeDebugLogs([]);
  setHint(el.profileStatus, "偵錯記錄已清除。");
};

const normalizeBpInput = (value) => {
  const text = String(value || "");
  if (!text.trim()) return "";

  if (text.includes("/")) {
    const [leftRaw = "", rightRaw = ""] = text.split("/");
    const left = leftRaw.replace(/\D/g, "").slice(0, 3);
    const right = rightRaw.replace(/\D/g, "").slice(0, 3);
    if (!left && !right) return "";
    if (!left) return right;
    if (!right) return left;
    return `${left}/${right}`;
  }

  const digits = text.replace(/\D/g, "").slice(0, 6);
  if (!digits) return "";
  if (digits.length <= 3) return digits;
  // Keep systolic at 3 digits once diastolic starts (e.g. 12160 -> 121/60).
  const leftLen = 3;
  const left = digits.slice(0, leftLen);
  const right = digits.slice(leftLen, leftLen + 3);
  return right ? `${left}/${right}` : left;
};

const normalizeDigitsOnly = (value, max = 3) => String(value || "").replace(/\D/g, "").slice(0, max);

const normalizeDateTimeInput = (value) => {
  const digits = String(value || "").replace(/\D/g, "").slice(0, 12);
  if (!digits) return "";
  let out = digits.slice(0, 4);
  if (digits.length > 4) out += `-${digits.slice(4, 6)}`;
  if (digits.length > 6) out += `-${digits.slice(6, 8)}`;
  if (digits.length > 8) out += ` ${digits.slice(8, 10)}`;
  if (digits.length > 10) out += `:${digits.slice(10, 12)}`;
  return out;
};

const parseIntOrNull = (value) => {
  const raw = String(value || "").trim();
  if (!raw) return null;
  const n = Number(raw);
  if (!Number.isFinite(n)) return null;
  return Math.floor(n);
};

const parseSystolicFromBp = (value) => {
  const left = String(value || "")
    .split("/")[0]
    .replace(/\D/g, "");
  if (!left) return null;
  return parseIntOrNull(left);
};

const setInputAlertState = (node, alertOn) => {
  if (!node) return;
  const on = Boolean(alertOn);
  node.classList.toggle("input-alert", on);
  node.setAttribute("aria-invalid", on ? "true" : "false");
};

const updateVitalAlertState = () => {
  const systolic = parseSystolicFromBp(el.bp?.value || "");
  const spo2 = parseIntOrNull(el.spo2?.value || "");
  const pulse = parseIntOrNull(el.pulse?.value || "");
  const glucose = parseIntOrNull(el.glucose?.value || "");

  setInputAlertState(el.bp, Number.isFinite(systolic) && (systolic < 90 || systolic > 220));
  setInputAlertState(el.pulse, Number.isFinite(pulse) && (pulse < 50 || pulse > 150));
  setInputAlertState(el.spo2, Number.isFinite(spo2) && spo2 < 90);
  setInputAlertState(el.glucose, Number.isFinite(glucose) && (glucose < 60 || glucose > 500));
};

const bind = () => {
  if (el.startTime) el.startTime.value = toInput24h();
  if (el.fillStartNowBtn && el.startTime) {
    el.fillStartNowBtn.addEventListener("click", () => {
      el.startTime.value = toInput24h();
    });
  }
  if (el.fillEventStartNowBtn && el.eventStartTime) {
    el.fillEventStartNowBtn.addEventListener("click", () => {
      el.eventStartTime.value = toInput24h();
    });
  }
  if (el.fillEventNowBtn && el.eventFinishTime) {
    el.fillEventNowBtn.addEventListener("click", () => {
      el.eventFinishTime.value = toInput24h();
    });
  }
  if (el.eventStartTime) {
    el.eventStartTime.addEventListener("input", () => {
      const normalized = normalizeDateTimeInput(el.eventStartTime.value);
      if (normalized !== el.eventStartTime.value) {
        el.eventStartTime.value = normalized;
      }
    });
  }
  if (el.eventFinishTime) {
    el.eventFinishTime.addEventListener("input", () => {
      const normalized = normalizeDateTimeInput(el.eventFinishTime.value);
      if (normalized !== el.eventFinishTime.value) {
        el.eventFinishTime.value = normalized;
      }
    });
  }

  if (el.taskType) {
    el.taskType.addEventListener("change", () => {
      customToggle(el.taskType, el.taskTypeCustomWrap, el.taskTypeCustom, "其他");
    });
  }
  if (el.hospital) {
    el.hospital.addEventListener("change", () => {
      syncPatientCountByHospital();
    });
  }
  if (el.bp) {
    el.bp.addEventListener("focus", () => {
      window.setTimeout(() => {
        el.bp.select();
      }, 0);
    });
    el.bp.addEventListener("input", () => {
      const normalized = normalizeBpInput(el.bp.value);
      if (normalized !== el.bp.value) {
        el.bp.value = normalized;
      }
      updateVitalAlertState();
    });
    el.bp.addEventListener("blur", () => {
      const normalized = normalizeBpInput(el.bp.value);
      if (normalized !== el.bp.value) {
        el.bp.value = normalized;
      }
      updateVitalAlertState();
    });
  }
  if (el.spo2) {
    el.spo2.addEventListener("focus", () => {
      window.setTimeout(() => {
        el.spo2.select();
      }, 0);
    });
    el.spo2.addEventListener("input", () => {
      const normalized = normalizeDigitsOnly(el.spo2.value, 3);
      if (normalized !== el.spo2.value) {
        el.spo2.value = normalized;
      }
      updateVitalAlertState();
    });
    el.spo2.addEventListener("blur", () => {
      const normalized = normalizeDigitsOnly(el.spo2.value, 3);
      if (normalized !== el.spo2.value) {
        el.spo2.value = normalized;
      }
      updateVitalAlertState();
    });
  }
  if (el.glucose) {
    el.glucose.addEventListener("focus", () => {
      window.setTimeout(() => {
        el.glucose.select();
      }, 0);
    });
    el.glucose.addEventListener("input", () => {
      const normalized = normalizeDigitsOnly(el.glucose.value, 4);
      if (normalized !== el.glucose.value) {
        el.glucose.value = normalized;
      }
      updateVitalAlertState();
    });
    el.glucose.addEventListener("blur", () => {
      const normalized = normalizeDigitsOnly(el.glucose.value, 4);
      if (normalized !== el.glucose.value) {
        el.glucose.value = normalized;
      }
      updateVitalAlertState();
    });
  }
  [el.gcsEye, el.gcsVerbal, el.gcsMotor].forEach((select) => {
    if (!select) return;
    select.addEventListener("change", updateGcsSummary);
  });
  if (el.pulse) {
    el.pulse.addEventListener("focus", () => {
      window.setTimeout(() => {
        el.pulse.select();
      }, 0);
    });
    el.pulse.addEventListener("input", () => {
      const normalized = normalizeDigitsOnly(el.pulse.value, 3);
      if (normalized !== el.pulse.value) {
        el.pulse.value = normalized;
      }
      updateVitalAlertState();
    });
    el.pulse.addEventListener("blur", () => {
      const normalized = normalizeDigitsOnly(el.pulse.value, 3);
      if (normalized !== el.pulse.value) {
        el.pulse.value = normalized;
      }
      updateVitalAlertState();
    });
  }
  if (el.eventGuideToggleBtn) {
    el.eventGuideToggleBtn.addEventListener("click", () => {
      const isOpen = el.eventGuideToggleBtn.getAttribute("aria-expanded") === "true";
      setEventGuideOpen(!isOpen);
    });
  }

  el.googleLoginBtn.addEventListener("click", login);
  el.profileBtn.addEventListener("click", openProfileSheet);
  el.logoutBtn.addEventListener("click", onProfileLogout);
  if (el.startShiftBtn) el.startShiftBtn.addEventListener("click", startShift);
  if (el.resumeShiftBtn) el.resumeShiftBtn.addEventListener("click", startShift);
  if (el.sessionForm) el.sessionForm.addEventListener("submit", startShift);
  if (el.deleteTodayBtn) el.deleteTodayBtn.addEventListener("click", toggleTimelineEditMode);
  if (el.sortTimelineBtn) {
    el.sortTimelineBtn.addEventListener("click", () => {
      state.timelineOrder = state.timelineOrder === "desc" ? "asc" : "desc";
      renderTimeline();
    });
  }
  el.startEventBtn.addEventListener("click", startEvent);
  el.finishEventBtn.addEventListener("click", onSecondaryAction);
  el.saveDraftBtn.addEventListener("click", saveEventDraft);
  el.eventForm.addEventListener("submit", finishEvent);
  el.cancelEventBtn.addEventListener("click", closeEventSheet);
  el.profileForm.addEventListener("submit", onProfileFormSubmit);
  if (el.profileBackBtn) el.profileBackBtn.addEventListener("click", onProfileBack);
  if (el.profileAvatarPickBtn) el.profileAvatarPickBtn.addEventListener("click", pickProfileAvatar);
  el.profileAvatarFile.addEventListener("change", onProfileAvatarFileChange);
  if (el.copyDebugLogBtn) el.copyDebugLogBtn.addEventListener("click", copyDebugLogs);
  if (el.clearDebugLogBtn) el.clearDebugLogBtn.addEventListener("click", clearDebugLogs);
  if (el.pendingStatus) {
    el.pendingStatus.addEventListener("click", () => {
      state.pendingPanelOpen = !state.pendingPanelOpen;
      renderPendingPanel();
    });
  }
  if (el.pendingPanelCloseBtn) {
    el.pendingPanelCloseBtn.addEventListener("click", () => {
      state.pendingPanelOpen = false;
      renderPendingPanel();
    });
  }
  if (el.pendingPanelList) {
    el.pendingPanelList.addEventListener("click", (event) => {
      const btn = event.target.closest("[data-pending-action]");
      if (!btn) return;
      const id = btn.dataset.pendingId || "";
      if (!id) return;
      if (btn.dataset.pendingAction === "retry") {
        retryBlockedPendingItem(id).catch((err) => {
          setHint(el.sessionStatus, `重試失敗：${String(err?.message || err || "")}`);
        });
        return;
      }
      if (btn.dataset.pendingAction === "clear") {
        clearBlockedPendingItem(id);
      }
    });
  }
  el.summaryTabs.addEventListener("click", async (event) => {
    const btn = event.target.closest(".tab");
    if (!btn) return;
    await switchSummaryRange(btn.dataset.range);
  });
  el.summaryCard.addEventListener("touchstart", (event) => {
    state.summaryTouchStartX = event.changedTouches?.[0]?.clientX ?? null;
  }, { passive: true });
  el.summaryCard.addEventListener("touchend", async (event) => {
    const startX = state.summaryTouchStartX;
    const endX = event.changedTouches?.[0]?.clientX ?? null;
    state.summaryTouchStartX = null;
    if (startX === null || endX === null) return;
    const dx = endX - startX;
    if (Math.abs(dx) < 40) return;
    const idx = SUMMARY_RANGE_ORDER.indexOf(state.summaryRange);
    if (idx < 0) return;
    if (dx < 0 && idx < SUMMARY_RANGE_ORDER.length - 1) {
      await switchSummaryRange(SUMMARY_RANGE_ORDER[idx + 1]);
      return;
    }
    if (dx > 0 && idx > 0) {
      await switchSummaryRange(SUMMARY_RANGE_ORDER[idx - 1]);
    }
  }, { passive: true });
  el.timelineList.addEventListener("click", (event) => {
    const actionBtn = event.target.closest(".row-action-btn");
    if (actionBtn) {
      const rowId = actionBtn.dataset.rowId;
      if (!rowId) return;
      if (actionBtn.dataset.action === "delete") {
        deleteDispatchRow(rowId);
        return;
      }
      const row = (state.rows || []).find((x) => String(x.id) === String(rowId));
      if (!row) return;
      openEventSheetByRowId(rowId);
      return;
    }
    const target = event.target.closest(".item.editable");
    if (!target) return;
    const rowId = target.dataset.rowId;
    if (!rowId) return;
    openEventSheetByRowId(rowId);
  });
  if (el.historyToggleBtn) {
    el.historyToggleBtn.addEventListener("click", () => {
      toggleHistoryPanel().catch((err) => {
        setHint(el.sessionStatus, `讀取失敗：${err.message}`);
      });
    });
  }
  if (el.historyList) {
    document.addEventListener("click", (event) => {
      if (!event.target.closest(".history-session-actions")) {
        document.querySelectorAll(".history-export-menu").forEach((m) => m.classList.add("hidden"));
      }
    });
    el.historyList.addEventListener("click", (event) => {
      const editToggleBtn = event.target.closest(".history-edit-toggle-btn");
      if (editToggleBtn) {
        const sessionId = Number(editToggleBtn.dataset.sessionId || "");
        if (!Number.isFinite(sessionId)) return;
        const key = String(sessionId);
        state.historyRowEditModeBySession[key] = !Boolean(state.historyRowEditModeBySession[key]);
        const sessions = Object.values(state.historyRenderCache || {})
          .map((x) => x?.session)
          .filter(Boolean);
        const rowsBySession = new Map();
        Object.entries(state.historyRenderCache || {}).forEach(([sid, cache]) => {
          rowsBySession.set(Number(sid), Array.isArray(cache?.rows) ? cache.rows : []);
        });
        renderHistoryList(sessions, rowsBySession);
        return;
      }
      const editBtn = event.target.closest(".history-row-edit-btn");
      if (editBtn) {
        const sessionId = Number(editBtn.dataset.sessionId || "");
        const rowId = String(editBtn.dataset.rowId || "");
        if (!Number.isFinite(sessionId) || !rowId) return;
        openHistoryRowEditor(sessionId, rowId);
        return;
      }
      const exportBtn = event.target.closest(".history-export-toggle");
      if (exportBtn) {
        const actions = exportBtn.closest(".history-session-actions");
        const menu = actions?.querySelector(".history-export-menu");
        if (!menu) return;
        const willOpen = menu.classList.contains("hidden");
        document.querySelectorAll(".history-export-menu").forEach((m) => m.classList.add("hidden"));
        menu.classList.toggle("hidden", !willOpen);
        return;
      }
      const exportItem = event.target.closest(".history-export-item");
      if (exportItem) {
        const sessionId = Number(exportItem.dataset.sessionId || "");
        const fmt = String(exportItem.dataset.format || "").toLowerCase();
        if (!Number.isFinite(sessionId) || !["txt", "csv"].includes(fmt)) return;
        document.querySelectorAll(".history-export-menu").forEach((m) => m.classList.add("hidden"));
        exportHistorySession(sessionId, fmt);
        return;
      }
      const btn = event.target.closest(".history-delete-btn");
      if (!btn) return;
      const sessionId = Number(btn.dataset.sessionId || "");
      const sessionStatus = btn.dataset.sessionStatus || "";
      if (!Number.isFinite(sessionId)) return;
      deleteHistorySession(sessionId, sessionStatus);
    });
  }
  if (el.historyDateList) {
    el.historyDateList.addEventListener("change", () => {
      updateHistoryDateAvailabilityUI();
      loadHistoryRecords();
    });
  }
  if (el.historyImportBtn) {
    el.historyImportBtn.addEventListener("click", onHistoryImportClick);
  }
  if (el.historyImportFile) {
    el.historyImportFile.addEventListener("change", () => {
      onHistoryImportFileChange().catch((err) => {
        setHint(el.sessionStatus, `匯入失敗：${String(err?.message || err || "")}`);
      });
    });
  }
  if (el.historyGranularity) {
    el.historyGranularity.addEventListener("change", () => {
      state.historyGranularity = el.historyGranularity.value === "month" ? "month" : "day";
      renderHistoryDateList();
      updateHistoryDateAvailabilityUI();
      loadHistoryRecords();
    });
  }
};

const initAuth = async () => {
  addDebugLog("initAuth.start");
  let firstInitialSessionHandled = false;
  let hadSessionFromGetSession = false;
  let authBootstrapDone = false;
  let authStateQueue = Promise.resolve();

  const handleAuthStateChange = async (evt, session) => {
    addDebugLog("authState.changed", { evt, hasSession: Boolean(session) });
    const prevUserId = state.user?.id || null;
    const nextUserId = session?.user?.id || null;
    if (!authBootstrapDone) {
      state.user = session?.user || state.user || null;
      renderAuth();
      addDebugLog("authState.bootstrap.skipHeavy", { evt, hasUser: Boolean(state.user) });
      return;
    }
    // Supabase emits INITIAL_SESSION after subscription.
    // Only skip it if we already got a valid session from getSession(),
    // otherwise Safari may stay on login page until user clicks login again.
    if (evt === "INITIAL_SESSION" && !firstInitialSessionHandled) {
      firstInitialSessionHandled = true;
      if (hadSessionFromGetSession) {
        addDebugLog("authState.initialSession.skipped");
        return;
      }
      addDebugLog("authState.initialSession.processed");
    }
    if (evt === "SIGNED_IN" && prevUserId && prevUserId === nextUserId) {
      addDebugLog("authState.signedIn.sameUser.skipRefresh", { userId: nextUserId });
      state.user = session?.user || null;
      renderAuth();
      return;
    }

    state.user = session?.user || null;
    if (!state.user) {
      clearSignedOutState();
      await renderSummary();
      return;
    }
    await loadPendingQueueCache();

    // Switch to work view immediately; load data in background.
    renderAuth();

    // Token refresh is frequent and does not require reloading all app data.
    // Skipping avoids occasional long stalls from background auth recovery.
    if (evt === "TOKEN_REFRESHED") {
      addDebugLog("authState.tokenRefreshed.skipRefresh");
      return;
    }

    const profileTask = loadProfile()
      .then(() => {
        renderAuth();
      })
      .catch((err) => {
        addDebugLog("authState.profile.error", { message: String(err?.message || "") }, "warn");
      });
    try {
      await refresh({ showLoading: false, loadingText: "資料載入中..." });
      await processPendingQueue();
    } catch (err) {
      setHint(el.sessionStatus, `資料讀取失敗：${err.message}`);
      addDebugLog("authState.refresh.error", { message: String(err?.message || "") }, "error");
    }
    await profileTask;
  };

  // Register listener first to avoid missing the first OAuth callback event on iOS Safari.
  supabaseClient.auth.onAuthStateChange((evt, session) => {
    authStateQueue = authStateQueue
      .then(() => handleAuthStateChange(evt, session))
      .catch((err) => {
        addDebugLog("authState.handler.error", { message: String(err?.message || "") }, "error");
      });
  });

  let authData = null;
  try {
    const { data } = await dbQuery(() => supabaseClient.auth.getSession(), {
      label: "讀取登入狀態",
      attempts: 2,
      timeoutMs: 8000
    });
    authData = data;
    addDebugLog("initAuth.getSession.success", { hasSession: Boolean(data?.session) });
  } catch {
    addDebugLog("initAuth.getSession.error", {}, "error");
    authData = null;
  }

  state.user = authData?.session?.user || state.user || null;
  hadSessionFromGetSession = Boolean(authData?.session || state.user);
  await loadPendingQueueCache();
  renderAuth();
  if (state.user) {
    const hasSnapshot = await loadSnapshotFromLocal();
    if (hasSnapshot) {
      renderTimeline();
      renderAuth();
      if (state.summaryRange === "today") {
        setSummaryValues(summarizeSessionRows(state.session, state.rows || []));
      }
    }
  }
  authBootstrapDone = true;
  const initialProfileTask = state.user
    ? loadProfile()
        .then(() => {
          renderAuth();
        })
        .catch((err) => {
          addDebugLog("initAuth.profile.error", { message: String(err?.message || "") }, "warn");
        })
    : Promise.resolve();
  if (state.user) {
    try {
      await refresh({ showLoading: true, loadingText: "資料載入中..." });
      await processPendingQueue();
    } catch (err) {
      setHint(el.sessionStatus, `資料讀取失敗：${err.message}`);
      addDebugLog("initAuth.firstRefresh.error", { message: String(err?.message || "") }, "error");
      window.setTimeout(async () => {
        addDebugLog("initAuth.backgroundRetry.start");
        try {
          await refresh({ showLoading: false, loadingText: "資料載入中..." });
          await processPendingQueue();
          addDebugLog("initAuth.backgroundRetry.success");
        } catch (retryErr) {
          addDebugLog("initAuth.backgroundRetry.error", { message: String(retryErr?.message || "") }, "warn");
        }
      }, 2500);
    }
  }
  await initialProfileTask;
};

const init = async () => {
  addDebugLog("init.start", { href: window.location.href });
  applyFooterVersion();
  await openLocalDb();
  window.addEventListener("online", async () => {
    addDebugLog("network.online");
    await processPendingQueue();
    refreshLiveTimelineClock({ force: true });
  });
  window.addEventListener("offline", () => addDebugLog("network.offline", {}, "warn"));
  window.addEventListener("visibilitychange", () => {
    if (!document.hidden) {
      refreshLiveTimelineClock({ force: true });
    }
  });
  window.addEventListener("pageshow", () => {
    refreshLiveTimelineClock({ force: true });
  });
  window.addEventListener("focus", () => {
    refreshLiveTimelineClock({ force: true });
  });
  bind();
  if (el.historyGranularity) {
    el.historyGranularity.value = "day";
  }
  state.historyGranularity = "day";
  if (el.historyPanel) {
    el.historyPanel.classList.add("hidden");
  }
  if (el.historyToggleBtn) {
    el.historyToggleBtn.classList.remove("expanded");
    el.historyToggleBtn.setAttribute("aria-expanded", "false");
  }
  if (el.summaryHistory) {
    el.summaryHistory.classList.remove("expanded");
  }
  updatePendingStatusUI();
  applyActionMode("none");
  setEventSheetMode("final");
  updateSummaryTabsUI();
  customToggle(el.taskType, el.taskTypeCustomWrap, el.taskTypeCustom, "其他");
  syncPatientCountByHospital();
  state.pendingQueueTimer = window.setInterval(() => {
    processPendingQueue().catch(() => {});
  }, 15000);
  state.liveUiTimer = window.setInterval(() => {
    refreshLiveTimelineClock();
  }, 10000);
  await initAuth();
  await processPendingQueue();
  refreshLiveTimelineClock({ force: true });
  addDebugLog("init.done");
};

init();
