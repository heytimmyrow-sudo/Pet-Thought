export const SAVE_KEY = "magnetMayhemDelivery.save";
export const BACKUP_KEY = "magnetMayhemDelivery.save.backup";
export const SAVE_VERSION = 2;
const MAX_REASONABLE_TIME = 60 * 60;

const baseSave = () => ({
  version: SAVE_VERSION,
  unlockedExpansions: ["base_game"],
  completedLevels: {},
  bestTimes: {},
  stamps: {},
  settings: { sound: true, music: true, shake: true },
  tutorial: { skipped: false, completed: {} }
});

export function loadSave() {
  const fallback = baseSave();
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return fallback;
    return migrateSave(JSON.parse(raw));
  } catch (error) {
    console.warn("Save load failed, using a fresh save.", error);
    return fallback;
  }
}

export function migrateSave(input) {
  const save = { ...baseSave(), ...(input || {}) };
  save.version = Number(save.version) || 0;
  save.unlockedExpansions = Array.isArray(save.unlockedExpansions) ? save.unlockedExpansions : ["base_game"];
  if (!save.unlockedExpansions.includes("base_game")) save.unlockedExpansions.push("base_game");
  save.completedLevels = objectOrEmpty(save.completedLevels);
  save.bestTimes = objectOrEmpty(save.bestTimes);
  save.stamps = objectOrEmpty(save.stamps);
  save.settings = { ...baseSave().settings, ...objectOrEmpty(save.settings) };
  save.tutorial = normalizeTutorial(save.tutorial);
  save.bestTimes = sanitizeBestTimes(save.bestTimes);
  save.stamps = sanitizeStamps(save.stamps);
  save.version = SAVE_VERSION;
  return save;
}

export function saveProgress(save) {
  try {
    const current = localStorage.getItem(SAVE_KEY);
    if (current) localStorage.setItem(BACKUP_KEY, current);
    localStorage.setItem(SAVE_KEY, JSON.stringify(migrateSave(save)));
    return true;
  } catch (error) {
    console.warn("Save write failed.", error);
    return false;
  }
}

export function recordLevelResult(save, expansionId, levelId, time, packageHealth, targetTime) {
  const key = `${expansionId}:${levelId}`;
  const oldBest = validTime(save.bestTimes[key]) ? Number(save.bestTimes[key]) : 0;
  const previousBest = oldBest || null;
  const stamps = 1 + (time <= targetTime ? 1 : 0) + (packageHealth === 3 ? 1 : 0);
  save.completedLevels[key] = true;
  save.bestTimes[key] = oldBest ? Math.min(oldBest, time) : time;
  save.stamps[key] = Math.max(Number(save.stamps[key]) || 0, stamps);
  saveProgress(save);
  return {
    runStamps: stamps,
    bestStamps: save.stamps[key],
    previousBest,
    bestTime: save.bestTimes[key],
    isNewBest: !previousBest || time < previousBest
  };
}

export function exportSave(save) {
  const blob = new Blob([JSON.stringify(migrateSave(save), null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "magnet-mayhem-delivery-save.json";
  link.click();
  URL.revokeObjectURL(url);
}

export function importSaveFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const save = migrateSave(JSON.parse(String(reader.result)));
        saveProgress(save);
        resolve(save);
      } catch (error) {
        reject(error);
      }
    };
    reader.onerror = () => reject(reader.error);
    reader.readAsText(file);
  });
}

export function hasBackupSave() {
  try {
    const raw = localStorage.getItem(BACKUP_KEY);
    if (!raw) return false;
    migrateSave(JSON.parse(raw));
    return true;
  } catch {
    return false;
  }
}

export function restoreBackupSave() {
  const raw = localStorage.getItem(BACKUP_KEY);
  if (!raw) throw new Error("No backup save exists.");
  const restored = migrateSave(JSON.parse(raw));
  localStorage.setItem(SAVE_KEY, JSON.stringify(restored));
  return restored;
}

export function resetSave() {
  const current = localStorage.getItem(SAVE_KEY);
  if (current) localStorage.setItem(BACKUP_KEY, current);
  const fresh = baseSave();
  localStorage.setItem(SAVE_KEY, JSON.stringify(fresh));
  return fresh;
}

function objectOrEmpty(value) {
  return value && typeof value === "object" && !Array.isArray(value) ? value : {};
}

function normalizeTutorial(value) {
  const input = objectOrEmpty(value);
  return {
    ...input,
    skipped: Boolean(input.skipped),
    completed: objectOrEmpty(input.completed)
  };
}

function sanitizeBestTimes(times) {
  return Object.fromEntries(Object.entries(times).filter(([, value]) => validTime(value)).map(([key, value]) => [key, Number(value)]));
}

function sanitizeStamps(stamps) {
  return Object.fromEntries(Object.entries(stamps).map(([key, value]) => [key, clampInt(value, 0, 3)]));
}

function validTime(value) {
  const time = Number(value);
  return Number.isFinite(time) && time > 0 && time <= MAX_REASONABLE_TIME;
}

function clampInt(value, min, max) {
  const number = Math.floor(Number(value));
  if (!Number.isFinite(number)) return min;
  return Math.max(min, Math.min(max, number));
}
