const SUPABASE_URL = "https://iysshfoqqzdwkfeqnsda.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_9Tts206qgN5G3toPwcYv2g_V1Ct-W44";
const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);
const APP_VERSION = "1.4";

const state = {
  user: null,
  session: null,
  rows: [],
  busy: false,
  modeOverride: null,
  editRowId: null,
  editRowIsOpen: false,
  editRowIsStandby: false,
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
  timelineOrder: "desc",
  healingStandbyRows: false,
  timelineEditMode: false,
  profileLoadPromise: null,
  refreshPromise: null,
  liveUiTimer: null,
  liveUiLastMinute: null
};

const el = {
  profileBtn: document.getElementById("profileBtn"),
  profileAvatar: document.getElementById("profileAvatar"),
  brandMeta: document.getElementById("brandMeta"),
  pendingStatus: document.getElementById("pendingStatus"),
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
  historyDate: document.getElementById("historyDate"),
  historyDateList: document.getElementById("historyDateList"),
  loadHistoryBtn: document.getElementById("loadHistoryBtn"),
  historyList: document.getElementById("historyList"),
  historyStatus: document.getElementById("historyStatus"),

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
  chiefComplaint: document.getElementById("chiefComplaint"),
  bp: document.getElementById("bp"),
  spo2: document.getElementById("spo2"),
  pulse: document.getElementById("pulse"),
  equipmentItems: Array.from(document.querySelectorAll("input[name='equipmentItem']")),
  memo: document.getElementById("memo"),
  eventStatus: document.getElementById("eventStatus"),

  profileSheet: document.getElementById("profileSheet"),
  profileForm: document.getElementById("profileForm"),
  saveProfileBtn: document.getElementById("saveProfileBtn"),
  profileEmail: document.getElementById("profileEmail"),
  profileDisplayName: document.getElementById("profileDisplayName"),
  profileUnit: document.getElementById("profileUnit"),
  profileTitle: document.getElementById("profileTitle"),
  profilePhone: document.getElementById("profilePhone"),
  profileAvatarFile: document.getElementById("profileAvatarFile"),
  profileAvatarPreview: document.getElementById("profileAvatarPreview"),
  cancelProfileBtn: document.getElementById("cancelProfileBtn"),
  copyDebugLogBtn: document.getElementById("copyDebugLogBtn"),
  clearDebugLogBtn: document.getElementById("clearDebugLogBtn"),
  profileStatus: document.getElementById("profileStatus"),
  syncIndicator: document.getElementById("syncIndicator"),
  syncText: document.getElementById("syncText"),
  appVersionText: document.getElementById("appVersionText"),
  appBuildTimeText: document.getElementById("appBuildTimeText")
};

const DEFAULT_AVATAR = "assets/star-of-life.png";
const SUMMARY_RANGE_ORDER = ["today", "month", "year", "all"];
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
const DEBUG_LOG_KEY = "emt_debug_logs_v1";
const DEBUG_LOG_MAX = 300;
const PENDING_SYNC_KEY = "emt_pending_sync_v1";
const PENDING_SYNC_MAX = 200;
const PROFILE_TABLE = "profiles";

const pad2 = (n) => String(n).padStart(2, "0");

const toBuildStamp = (date = new Date()) => {
  const yy = String(date.getFullYear()).slice(-2);
  const mm = pad2(date.getMonth() + 1);
  const dd = pad2(date.getDate());
  const hh = pad2(date.getHours());
  const min = pad2(date.getMinutes());
  return `${yy}${mm}${dd}${hh}${min}`;
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

const dayBounds = () => {
  const n = new Date();
  const s = new Date(n.getFullYear(), n.getMonth(), n.getDate());
  const e = new Date(n.getFullYear(), n.getMonth(), n.getDate() + 1);
  return { startIso: s.toISOString(), endIso: e.toISOString() };
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

const getEffectiveDisplayName = () =>
  state.profile.displayName || state.user?.user_metadata?.full_name || state.user?.email || "使用者";

const getEffectiveAvatar = () => state.profile.avatarDataUrl || DEFAULT_AVATAR;

const setHint = (target, msg) => {
  if (!target) return;
  target.textContent = msg || "";
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
    el.appBuildTimeText.textContent = toBuildStamp(new Date());
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
  try {
    const raw = localStorage.getItem(PENDING_SYNC_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const writePendingQueue = (items) => {
  try {
    localStorage.setItem(PENDING_SYNC_KEY, JSON.stringify(items.slice(-PENDING_SYNC_MAX)));
  } catch {
    // ignore
  }
};

const updatePendingStatusUI = () => {
  const count = readPendingQueue().length;
  if (!el.pendingStatus) return;
  if (!count) {
    el.pendingStatus.classList.add("hidden");
    el.pendingStatus.textContent = "";
    return;
  }
  el.pendingStatus.classList.remove("hidden");
  el.pendingStatus.textContent = `待同步 ${count} 筆`;
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
    const filtered = current.filter((x) => !(x.type === "dispatch_update" && x.rowId === row.rowId));
    writePendingQueue([...filtered, row]);
  } else if (row.type === "dispatch_insert") {
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
      return;
    }
    writePendingQueue([...current, row]);
  } else {
    writePendingQueue([...current, row]);
  }
  updatePendingStatusUI();
  addDebugLog("pending.enqueue", { type: row.type, rowId: row.rowId || null });
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
    el.saveProfileBtn,
    el.cancelProfileBtn,
    el.deleteTodayBtn
  ].forEach((btn) => {
    if (!btn) return;
    btn.disabled = on;
  });
  renderAuth();
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
  const items = readPendingQueue();
  if (!items.length) return;
  state.processingPendingQueue = true;
  addDebugLog("pending.process.start", { count: items.length });
  try {
    for (const item of items) {
      try {
        if (item.type === "dispatch_update") {
          const { error } = await dbQuery(
            (signal) =>
              supabaseClient
                .from("duty_dispatches")
                .update(item.payload)
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
          await insertDispatch(item.payload, "待同步補送");
        } else {
          removePendingItem(item.id);
          continue;
        }
        removePendingItem(item.id);
        addDebugLog("pending.process.success", { id: item.id, type: item.type });
      } catch (err) {
        updatePendingItem(item.id, {
          tries: Number(item.tries || 0) + 1,
          lastError: String(err?.message || "unknown error"),
          lastTriedAt: new Date().toISOString()
        });
        addDebugLog(
          "pending.process.error",
          { id: item.id, type: item.type, message: String(err?.message || "") },
          "warn"
        );
        break;
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
      writeLocalProfile(state.profile);
      return;
    }
  } catch (err) {
    addDebugLog(
      "profile.load.remote.error",
      { code: err?.code || null, message: String(err?.message || "") },
      "warn"
    );
  }

  const local = readLocalProfile();
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
  const payload = {
    user_id: state.user.id,
    display_name: state.profile.displayName || null,
    unit: state.profile.unit || null,
    title: state.profile.title || null,
    phone: state.profile.phone || null,
    avatar_data_url: state.profile.avatarDataUrl || null
  };
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
    writeLocalProfile(state.profile);
    return { remote: true };
  } catch (err) {
    addDebugLog(
      "profile.save.remote.error",
      { code: err?.code || null, message: String(err?.message || "") },
      "warn"
    );
    writeLocalProfile(state.profile);
    return { remote: false, error: err };
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
  if (!note) return { segment: "event", transported: false, memo: "", open: false, pulse: "" };
  try {
    const parsed = JSON.parse(note);
    return {
      segment: parsed.segment || "event",
      transported: Boolean(parsed.transported),
      memo: parsed.memo || "",
      open: Boolean(parsed.open),
      pulse: String(parsed.pulse || "")
    };
  } catch {
    return { segment: "event", transported: false, memo: note, open: false, pulse: "" };
  }
};

const encodeNote = (obj) => JSON.stringify(obj);

const isStandby = (row) => parseNote(row.note).segment === "standby";
const isOpenEvent = (row) => !isStandby(row) && parseNote(row.note).open === true;

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
  const existsBefore = await findExistingDispatchByPayload(payload);
  if (existsBefore) {
    addDebugLog("dispatch.insert.idempotent.hit", { rowId: existsBefore.id || null });
    return existsBefore;
  }

  let seq = await nextSeq();
  let attempts = 0;
  while (attempts < 5) {
    const { error } = await dbQuery(
      (signal) => supabaseClient.from("duty_dispatches").insert([{ ...payload, seq_no: seq }]).abortSignal(signal),
      {
        label: "新增勤務明細",
        attempts: DB_WRITE_ATTEMPTS,
        timeoutMs: DB_WRITE_TIMEOUT_MS,
        onRetryText: (n, total) => `${retryTextPrefix}（重試 ${n}/${total}）...`
      }
    );
    if (!error) return;
    if (!String(error.message || "").includes("uq_duty_dispatches_session_seq")) throw error;

    const existsAfterConflict = await findExistingDispatchByPayload(payload);
    if (existsAfterConflict) {
      addDebugLog("dispatch.insert.idempotent.hit_after_conflict", { rowId: existsAfterConflict.id || null });
      return existsAfterConflict;
    }

    seq += 1;
    attempts += 1;
  }
  throw new Error("序號衝突過多，請重試。");
};

const loadSessionAndRows = async () => {
  if (!state.user) return;
  const { startIso, endIso } = dayBounds();
  const { data: sessions, error: sesErr } = await dbQuery(
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
    state.rows = [];
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
  await autoHealConsecutiveStandbyRows();
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
    if (!isStandby(cur) && !isOpenEvent(cur) && segmentClosed) {
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

const renderSummary = async () => {
  if (!state.user) {
    setSummaryValues({});
    return;
  }

  // 今日優先用本地資料即時計算，避免畫面短暫顯示 00:00 或遠端延遲造成不一致。
  if (state.summaryRange === "today" && state.session) {
    const localSummary = summarizeSessionRows(state.session, state.rows || []);
    setSummaryValues(localSummary);
    return;
  }

  const bounds = rangeBoundsByType(state.summaryRange);
  let query = supabaseClient
    .from("duty_sessions")
    .select("id, end_time, status, start_time")
    .eq("user_id", state.user.id)
    .order("start_time", { ascending: false });

  if (bounds) {
    query = query.gte("start_time", bounds.startIso).lt("start_time", bounds.endIso);
  }

  const { data: sessions, error: sesErr } = await dbQuery((signal) => query.abortSignal(signal), {
    label: "讀取摘要主單",
    attempts: 2
  });
  if (sesErr) {
    setHint(el.sessionStatus, `摘要讀取失敗：${sesErr.message}`);
    return;
  }
  if (!sessions || !sessions.length) {
    setSummaryValues({});
    return;
  }

  const ids = sessions.map((s) => s.id);
  const { data: rows, error: rowErr } = await dbQuery(
    (signal) =>
      supabaseClient
        .from("duty_dispatches")
        .select("session_id, dispatch_time, patient_count, patient_count_custom, note")
        .in("session_id", ids)
        .abortSignal(signal),
    { label: "讀取摘要明細", attempts: 2 }
  );
  if (rowErr) {
    setHint(el.sessionStatus, `摘要讀取失敗：${rowErr.message}`);
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

  setSummaryValues({ dutyMs, eventCount, transported });
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
  const hospital = row.hospital === "其他" ? row.hospital_custom : row.hospital;
  const count = row.patient_count === "其他" ? row.patient_count_custom : row.patient_count;
  const note = parseNote(row.note);
  const memo = note.memo ? `，${note.memo}` : "";
  const complaint = (row.chief_complaint || "").trim();
  const complaintText = complaint ? `，${complaint}` : "";
  return `${hospital || "未填"} ${count || "?"}人${complaintText}${memo}`;
};

const rowTimelineLine2 = (row) => {
  if (isStandby(row)) {
    return "待勤";
  }
  const hospital = row.hospital === "其他" ? row.hospital_custom : row.hospital;
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
  const selected = el.historyDate?.value || "";
  const availableSet = new Set(state.availableHistoryDates || []);
  const isAvailable = availableSet.has(selected);
  if (el.loadHistoryBtn) {
    el.loadHistoryBtn.disabled = !selected || !isAvailable;
  }
  if (!selected) {
    setHint(el.historyStatus, "請先選日期。");
    return;
  }
  if (!isAvailable) {
    setHint(el.historyStatus, "該日期無紀錄（不可查詢）。");
  }
};

const renderHistoryDateList = () => {
  if (!el.historyDateList) return;
  const dates = state.availableHistoryDates || [];
  if (!dates.length) {
    el.historyDateList.innerHTML = `<option value="">無紀錄日期</option>`;
    return;
  }
  const options = dates
    .map((d) => `<option value="${d}">${d}</option>`)
    .join("");
  el.historyDateList.innerHTML = options;
};

const loadAvailableHistoryDates = async () => {
  if (!state.user) return;
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
  state.availableHistoryDates = uniq;
  renderHistoryDateList();
  if (!el.historyDate?.value || !uniq.includes(el.historyDate.value)) {
    el.historyDate.value = uniq[0] || "";
  }
  if (el.historyDateList) {
    el.historyDateList.value = el.historyDate.value || "";
  }
  updateHistoryDateAvailabilityUI();
};

const renderHistoryList = (sessions, rowsBySession) => {
  if (!el.historyList) return;
  el.historyList.innerHTML = "";
  sessions.forEach((session) => {
    const card = document.createElement("article");
    card.className = "history-session";

    const head = document.createElement("div");
    head.className = "history-session-head";
    const endText = session.end_time ? formatHm(session.end_time) : "進行中";
    head.innerHTML = `
      <span>${formatHm(session.start_time)} - ${endText}</span>
      <button
        type="button"
        class="history-delete-btn"
        data-session-id="${session.id}"
        data-session-status="${session.status || ""}"
        aria-label="刪除此筆歷史紀錄"
      >
        刪除
      </button>
    `;
    card.appendChild(head);

    const rows = rowsBySession.get(session.id) || [];
    rows.forEach((row, idx) => {
      const line = document.createElement("div");
      line.className = "history-row";
      const next = rows[idx + 1];
      const rowEnd = next ? next.dispatch_time : session.end_time || session.start_time;
      line.textContent = `${formatHm(row.dispatch_time)} - ${formatHm(rowEnd)}　${rowSummary(row)}`;
      card.appendChild(line);
    });

    if (!rows.length) {
      const empty = document.createElement("div");
      empty.className = "history-row";
      empty.textContent = "無明細";
      card.appendChild(empty);
    }

    el.historyList.appendChild(card);
  });
};

const deleteHistorySession = async (sessionId, sessionStatus = "") => {
  if (!state.user || !sessionId) return;
  const isActiveSession = sessionStatus === "active";
  const ok = window.confirm(
    isActiveSession
      ? "此筆紀錄目前顯示進行中，是否強制刪除？此動作無法復原。"
      : "確認刪除這筆歷史紀錄？此動作無法復原。"
  );
  if (!ok) return;
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

    await refresh({ showLoading: false, deferSummary: true });
    await loadAvailableHistoryDates();
    await loadHistoryRecords();
    setHint(el.historyStatus, isActiveSession ? "已強制刪除進行中歷史紀錄。" : "已刪除歷史紀錄。");
  } catch (err) {
    setHint(el.historyStatus, `刪除失敗：${err.message}`);
  } finally {
    setSyncing(false);
  }
};

const loadHistoryRecords = async () => {
  if (!state.user || !el.historyDate?.value) return;
  if (!state.availableHistoryDates.length) {
    await loadAvailableHistoryDates();
  }
  const dateText = el.historyDate.value;
  if (!state.availableHistoryDates.includes(dateText)) {
    el.historyList.innerHTML = "";
    setHint(el.historyStatus, "該日期無紀錄（不可查詢）。");
    updateHistoryDateAvailabilityUI();
    return;
  }
  const start = new Date(`${dateText}T00:00:00`);
  if (Number.isNaN(start.getTime())) {
    setHint(el.historyStatus, "日期格式錯誤。");
    return;
  }
  const end = new Date(start);
  end.setDate(end.getDate() + 1);

  try {
    if (el.loadHistoryBtn) el.loadHistoryBtn.disabled = true;
    setHint(el.historyStatus, "讀取中...");
    const { data: sessions, error: sesErr } = await dbQuery(
      (signal) =>
        supabaseClient
          .from("duty_sessions")
          .select("id,start_time,end_time,status")
          .eq("user_id", state.user.id)
          .gte("start_time", start.toISOString())
          .lt("start_time", end.toISOString())
          .order("start_time", { ascending: false })
          .abortSignal(signal),
      { label: "讀取歷史主單", attempts: DB_READ_ATTEMPTS, timeoutMs: DB_READ_TIMEOUT_MS }
    );
    if (sesErr) throw sesErr;
    if (!sessions?.length) {
      el.historyList.innerHTML = "";
      setHint(el.historyStatus, "該日無紀錄。");
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
    setHint(el.historyStatus, `已載入 ${sessions.length} 筆勤務。`);
  } catch (err) {
    setHint(el.historyStatus, `讀取失敗：${err.message}`);
  } finally {
    if (el.loadHistoryBtn) el.loadHistoryBtn.disabled = false;
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

const parseHospitalForForm = (row) => {
  if (row.hospital === "其他" && row.hospital_custom === "未送") {
    return "未送";
  }
  if (row.hospital === "其他" && (!row.hospital_custom || row.hospital_custom === "未填")) {
    return "未選";
  }
  const allowed = ["未選", "雙和", "永和耕莘", "慈濟", "新店耕莘", "板醫", "西園", "台大", "未送"];
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
  setEquipmentSelections(row.equipment_used || []);
  el.memo.value = note.memo || "";
  syncPatientCountByHospital();
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
    return;
  }

  el.eventSheetTitle.textContent = "編輯紀錄";
  el.saveDraftBtn.classList.remove("hidden");
  el.confirmFinishBtn.classList.add("hidden");
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
  const hospital = hospitalValue === "未送" || hospitalValue === "未選" ? "其他" : hospitalValue;
  const hospitalCustom = hospitalValue === "未送" ? "未送" : hospitalValue === "未選" ? "未選" : null;
  const patientCountValue = hospitalValue === "未送" ? "0" : el.patientCount.value;

  return {
    vehicle: "其他",
    vehicle_custom: "未填",
    case_type: el.caseType.value,
    case_type_custom: null,
    patient_count: patientCountValue,
    patient_count_custom: null,
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
      pulse: el.pulse ? el.pulse.value.trim() : ""
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

const DETAIL_FIELD_KEYS = ["hospital", "patientCount", "caseType", "chiefComplaint", "bp", "spo2", "pulse", "memo"];

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
                  <button type="button" class="action-icon delete row-action-btn" data-action="delete" data-row-id="${row.id}" aria-label="刪除">🗑</button>
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
  if (!state.user || !Number.isFinite(rowId) || state.busy) return;
  const row = (state.rows || []).find((x) => x.id === rowId);
  if (!row) return;
  const ok = window.confirm("確認刪除這筆紀錄？");
  if (!ok) return;
  try {
    setSyncing(true, "刪除紀錄中...");
    const { error } = await dbQuery(
      (signal) => supabaseClient.from("duty_dispatches").delete().eq("id", rowId).abortSignal(signal),
      { label: "刪除勤務明細", attempts: DB_WRITE_ATTEMPTS, timeoutMs: DB_WRITE_TIMEOUT_MS }
    );
    if (error) throw error;
    await refresh();
    setHint(el.sessionStatus, "已刪除 1 筆紀錄。");
  } catch (err) {
    setHint(el.sessionStatus, `刪除失敗：${err.message}`);
  } finally {
    setSyncing(false);
  }
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

  try {
    setSyncing(true, "開始出勤同步中...");
    setModeOverride("event");
    await insertDispatch(eventPayload, "開始出勤同步中");
    await refresh();
  } catch (err) {
    if (isRetryableDbError(err)) {
      enqueuePendingItem({ type: "dispatch_insert", payload: eventPayload });
      setHint(el.sessionStatus, "開始出勤暫時失敗，已加入待同步。");
      processPendingQueue().catch(() => {});
      return;
    }
    setHint(el.sessionStatus, `開始出勤失敗：${err.message}`);
  } finally {
    setModeOverride(null);
    setSyncing(false);
  }
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
  const row = state.rows.find((r) => r.id === rowId);
  if (!row) return;
  state.editRowId = row.id;
  state.editRowIsOpen = isOpenEvent(row);
  state.editRowIsStandby = isStandby(row);
  fillEventForm(row);
  el.eventStartTime.value = toInput24h(new Date(row.dispatch_time));
  el.eventFinishTime.value = toInput24h(new Date(rowEndIso(row)));
  setHint(el.eventStatus, "");
  setEventSheetMode("edit");
  const isActiveLast =
    state.session?.status === "active" && latestRow() && Number(latestRow().id) === Number(row.id);
  if (isActiveLast) {
    el.eventFinishTime.disabled = true;
    if (el.fillEventNowBtn) el.fillEventNowBtn.disabled = true;
  }
  el.eventSheet.classList.remove("hidden");
  const sheetBody = el.eventSheet.querySelector(".sheet-body");
  if (sheetBody) sheetBody.scrollTop = 0;
};

const closeEventSheet = (force = false) => {
  if (state.busy && !force) return;
  state.editRowId = null;
  state.editRowIsOpen = false;
  state.editRowIsStandby = false;
  state.eventSheetMode = "final";
  el.eventForm.reset();
  setEquipmentSelections([]);
  if (el.hospital) el.hospital.value = "未選";
  if (el.patientCount) {
    el.patientCount.value = "1";
    el.patientCount.disabled = false;
  }
  if (el.caseType) el.caseType.value = "外科";
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
  el.eventSheet.classList.add("hidden");
};

const finishEvent = async (e) => {
  e.preventDefault();
  if (state.eventSheetMode !== "final") return;
  if (state.busy) return;
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

  try {
    setSyncing(true, "結束出勤同步中...");
    setModeOverride("standby");

    const payload = buildEventUpdatePayload(false);
    const { error: upErr } = await dbQuery(
      (signal) => supabaseClient.from("duty_dispatches").update(payload).eq("id", row.id).abortSignal(signal),
      {
        label: "更新出勤紀錄",
        attempts: DB_WRITE_ATTEMPTS,
        timeoutMs: DB_WRITE_TIMEOUT_MS,
        onRetryText: (n, total) => `結束出勤同步中（重試 ${n}/${total}）...`
      }
    );
    if (upErr) throw upErr;

    const standbyIso = resolveStandbyInsertIso(row, finish);
    if (state.editRowIsOpen) {
      await insertDispatch(standbyPayload(state.session.id, standbyIso), "結束出勤同步中");
    }
    closeEventSheet(true);
    await refresh();
  } catch (err) {
    if (isRetryableDbError(err)) {
      const payload = buildEventUpdatePayload(false);
      const noteOpen = parseNote(row.note).open === true;
      if (noteOpen) {
        enqueuePendingItem({ type: "dispatch_update", rowId: row.id, payload });
      }
      const standbyIso = resolveStandbyInsertIso(row, finish);
      if (state.editRowIsOpen) {
        enqueuePendingItem({
          type: "dispatch_insert",
          payload: standbyPayload(state.session.id, standbyIso)
        });
      }
      updatePendingStatusUI();
      setHint(el.eventStatus, "網路不穩，已改為待同步，恢復後會自動補送。");
      return;
    }
    setHint(el.eventStatus, `結束出勤失敗：${err.message}`);
  } finally {
    setModeOverride(null);
    setSyncing(false);
  }
};

const saveEventDraft = async () => {
  if (state.eventSheetMode !== "edit") return;
  if (state.busy) return;
  const rowId = state.editRowId || latestRow()?.id;
  const row = state.rows.find((r) => r.id === rowId);
  if (!row || !state.session) return;

  const rowIdx = state.rows.findIndex((r) => r.id === row.id);
  if (rowIdx < 0) return;
  const prevRow = rowIdx > 0 ? state.rows[rowIdx - 1] : null;
  const nextRow = rowIdx < state.rows.length - 1 ? state.rows[rowIdx + 1] : null;
  const nextNextRow = rowIdx < state.rows.length - 2 ? state.rows[rowIdx + 2] : null;

  const startDate = parseInput24h(el.eventStartTime.value);
  const endDate = parseInput24h(el.eventFinishTime.value);
  if (!startDate || !endDate) {
    setHint(el.eventStatus, "開始/結束時間格式錯誤，請用 YYYY-MM-DD HH:mm。");
    return;
  }

  const MIN_GAP_MS = 60 * 1000;
  const startMs = startDate.getTime();
  const endMs = endDate.getTime();
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
  } else if (state.session.start_time) {
    const sessionStartMs = new Date(state.session.start_time).getTime();
    if (Number.isFinite(sessionStartMs) && startMs < sessionStartMs) {
      setHint(el.eventStatus, "開始時間不可早於勤務開始時間。");
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

  try {
    setSyncing(true, "暫存同步中...");
    setHint(el.eventStatus, "儲存中...");
    const basePayload = state.editRowIsStandby ? {} : buildEventUpdatePayload(state.editRowIsOpen);
    const payload = {
      ...basePayload,
      dispatch_time: new Date(startMs).toISOString()
    };
    const { error: upErr } = await dbQuery(
      (signal) => supabaseClient.from("duty_dispatches").update(payload).eq("id", row.id).abortSignal(signal),
      {
        label: "暫存出勤紀錄",
        attempts: DRAFT_WRITE_ATTEMPTS,
        timeoutMs: DRAFT_WRITE_TIMEOUT_MS,
        onRetryText: (n, total) => `暫存同步中（重試 ${n}/${total}）...`
      }
    );
    if (upErr) throw upErr;

    if (nextRow) {
      const { error: nextErr } = await dbQuery(
        (signal) =>
          supabaseClient
            .from("duty_dispatches")
            .update({ dispatch_time: new Date(endMs).toISOString() })
            .eq("id", nextRow.id)
            .abortSignal(signal),
        {
          label: "調整相鄰起始時間",
          attempts: DRAFT_WRITE_ATTEMPTS,
          timeoutMs: DRAFT_WRITE_TIMEOUT_MS
        }
      );
      if (nextErr) throw nextErr;
    } else if (state.session.status === "completed") {
      const { error: sesErr } = await dbQuery(
        (signal) =>
          supabaseClient
            .from("duty_sessions")
            .update({ end_time: new Date(endMs).toISOString() })
            .eq("id", state.session.id)
            .abortSignal(signal),
        {
          label: "調整勤務結束時間",
          attempts: DRAFT_WRITE_ATTEMPTS,
          timeoutMs: DRAFT_WRITE_TIMEOUT_MS
        }
      );
      if (sesErr) throw sesErr;
    }

    await refresh();
    closeEventSheet(true);
    setHint(el.sessionStatus, "草稿已儲存。");
  } catch (err) {
    if (isRetryableDbError(err)) {
      setHint(el.eventStatus, "網路不穩，這次包含時間重排，請稍後再試。");
      return;
    }
    setHint(el.eventStatus, `草稿儲存失敗：${err.message}`);
  } finally {
    setSyncing(false);
  }
};

const checkout = async () => {
  if (actionMode() !== "standby") return;
  if (state.busy) return;
  if (!state.session || state.session.status !== "active") return;
  const last = latestRow();
  if (last && !isStandby(last)) {
    setHint(el.sessionStatus, "請先按「結束出勤」，再退勤。");
    return;
  }
  const ok = window.confirm("確認退勤？");
  if (!ok) return;

  try {
    setSyncing(true, "退勤同步中...");
    setModeOverride("none");
    const now = new Date().toISOString();
    if (last && isStandby(last)) {
      const standbyNote = parseNote(last.note);
      const memo = String(standbyNote.memo || "").trim();
      const nextMemo = memo.includes("退勤") ? memo : memo ? `${memo} / 退勤` : "退勤";
      const notePayload = encodeNote({ ...standbyNote, memo: nextMemo });
      const { error: noteErr } = await dbQuery(
        (signal) =>
          supabaseClient.from("duty_dispatches").update({ note: notePayload }).eq("id", last.id).abortSignal(signal),
        {
          label: "更新待勤註記",
          attempts: DB_WRITE_ATTEMPTS,
          timeoutMs: DB_WRITE_TIMEOUT_MS,
          onRetryText: (n, total) => `退勤同步中（待勤註記重試 ${n}/${total}）...`
        }
      );
      if (noteErr) throw noteErr;
    }
    const { error } = await dbQuery(
      (signal) =>
        supabaseClient
          .from("duty_sessions")
          .update({ end_time: now, status: "completed" })
          .eq("id", state.session.id)
          .abortSignal(signal),
      {
        label: "退勤更新",
        attempts: DB_WRITE_ATTEMPTS,
        timeoutMs: DB_WRITE_TIMEOUT_MS,
        onRetryText: (n, total) => `退勤同步中（重試 ${n}/${total}）...`
      }
    );
    if (error) throw error;
    await refresh();
    setHint(el.sessionStatus, "退勤完成。");
  } catch (err) {
    setHint(el.sessionStatus, `退勤失敗：${err.message}`);
  } finally {
    setModeOverride(null);
    setSyncing(false);
  }
};

const deleteTodayRecords = async () => {
  if (!state.user || state.busy) return;
  const ok = window.confirm("確認刪除今日全部紀錄？此動作暫時無法復原。");
  if (!ok) return;

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

const closeProfileSheet = () => {
  if (state.busy) return;
  el.profileForm.reset();
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
    setHint(el.profileStatus, "新頭像已載入，按「儲存」套用。");
  };
  reader.readAsDataURL(file);
};

const submitProfile = async (e) => {
  e.preventDefault();
  state.profile = {
    displayName: el.profileDisplayName.value.trim(),
    unit: el.profileUnit.value.trim(),
    title: el.profileTitle.value.trim(),
    phone: el.profilePhone.value.trim(),
    avatarDataUrl: state.profileDraftAvatarDataUrl || state.profile.avatarDataUrl || ""
  };
  const result = await saveProfile();
  applyProfileToUI();
  setHint(el.profileStatus, result.remote ? "已儲存（雲端同步）。" : "已儲存（本機，雲端稍後再試）。");
  closeProfileSheet();
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
    });
    el.bp.addEventListener("blur", () => {
      const normalized = normalizeBpInput(el.bp.value);
      if (normalized !== el.bp.value) {
        el.bp.value = normalized;
      }
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
    });
    el.spo2.addEventListener("blur", () => {
      const normalized = normalizeDigitsOnly(el.spo2.value, 3);
      if (normalized !== el.spo2.value) {
        el.spo2.value = normalized;
      }
    });
  }
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
    });
    el.pulse.addEventListener("blur", () => {
      const normalized = normalizeDigitsOnly(el.pulse.value, 3);
      if (normalized !== el.pulse.value) {
        el.pulse.value = normalized;
      }
    });
  }

  el.googleLoginBtn.addEventListener("click", login);
  el.profileBtn.addEventListener("click", openProfileSheet);
  el.logoutBtn.addEventListener("click", logout);
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
  el.profileForm.addEventListener("submit", submitProfile);
  el.profileAvatarFile.addEventListener("change", onProfileAvatarFileChange);
  el.cancelProfileBtn.addEventListener("click", closeProfileSheet);
  if (el.copyDebugLogBtn) el.copyDebugLogBtn.addEventListener("click", copyDebugLogs);
  if (el.clearDebugLogBtn) el.clearDebugLogBtn.addEventListener("click", clearDebugLogs);
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
      const rowId = Number(actionBtn.dataset.rowId);
      if (!Number.isFinite(rowId)) return;
      if (actionBtn.dataset.action === "delete") {
        deleteDispatchRow(rowId);
        return;
      }
      const row = (state.rows || []).find((x) => x.id === rowId);
      if (!row) return;
      openEventSheetByRowId(rowId);
      return;
    }
    const target = event.target.closest(".item.editable");
    if (!target) return;
    const rowId = Number(target.dataset.rowId);
    if (!Number.isFinite(rowId)) return;
    openEventSheetByRowId(rowId);
  });
  if (el.loadHistoryBtn) {
    el.loadHistoryBtn.addEventListener("click", loadHistoryRecords);
  }
  if (el.historyToggleBtn) {
    el.historyToggleBtn.addEventListener("click", () => {
      toggleHistoryPanel().catch((err) => {
        setHint(el.historyStatus, `讀取失敗：${err.message}`);
      });
    });
  }
  if (el.historyList) {
    el.historyList.addEventListener("click", (event) => {
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
      if (!el.historyDateList.value) return;
      el.historyDate.value = el.historyDateList.value;
      updateHistoryDateAvailabilityUI();
      loadHistoryRecords();
    });
  }
  if (el.historyDate) {
    el.historyDate.addEventListener("change", () => {
      if (el.historyDateList) {
        el.historyDateList.value = el.historyDate.value;
      }
      updateHistoryDateAvailabilityUI();
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
  renderAuth();
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
  if (el.historyDate) {
    el.historyDate.value = toDateInput();
  }
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
