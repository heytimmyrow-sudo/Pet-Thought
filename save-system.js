export const SAVE_KEY = "magnetMayhemDelivery.save";
export const BACKUP_KEY = "magnetMayhemDelivery.save.backup";
export const SAVE_VERSION = 1;

const baseSave = () => ({
  version: SAVE_VERSION,
  unlockedExpansions: ["base_game"],
  completedLevels: {},
  bestTimes: {},
  stamps: {},
  settings: { sound: true, music: true, shake: true },
  tutorial: {}
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
  save.tutorial = objectOrEmpty(save.tutorial);
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
  const oldBest = Number(save.bestTimes[key]);
  const stamps = 1 + (time <= targetTime ? 1 : 0) + (packageHealth === 3 ? 1 : 0);
  save.completedLevels[key] = true;
  save.bestTimes[key] = oldBest ? Math.min(oldBest, time) : time;
  save.stamps[key] = Math.max(Number(save.stamps[key]) || 0, stamps);
  saveProgress(save);
  return save.stamps[key];
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
