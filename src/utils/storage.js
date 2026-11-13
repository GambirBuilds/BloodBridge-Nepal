const STORAGE_PREFIX = 'bloodbridge_np_v1_';

export function readStorage(key, fallbackValue) {
  try {
    if (typeof window === 'undefined' || !window.localStorage) {
      return fallbackValue;
    }
    const raw = window.localStorage.getItem(`${STORAGE_PREFIX}${key}`);
    if (!raw) return fallbackValue;
    const parsed = JSON.parse(raw);
    if (parsed === null || parsed === undefined) return fallbackValue;
    if (Array.isArray(fallbackValue) && !Array.isArray(parsed)) {
      return fallbackValue;
    }
    return parsed;
  } catch {
    return fallbackValue;
  }
}

export function writeStorage(key, value) {
  try {
    if (typeof window === 'undefined' || !window.localStorage) {
      return false;
    }
    window.localStorage.setItem(`${STORAGE_PREFIX}${key}`, JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
}

export function removeStorage(key) {
  try {
    if (typeof window === 'undefined' || !window.localStorage) {
      return;
    }
    window.localStorage.removeItem(`${STORAGE_PREFIX}${key}`);
  } catch {
    // Ignore storage quota or private mode errors
  }
}

export function clearAllPlatformStorage() {
  try {
    if (typeof window === 'undefined' || !window.localStorage) return;
    Object.keys(window.localStorage).forEach((k) => {
      if (k.startsWith(STORAGE_PREFIX)) {
        window.localStorage.removeItem(k);
      }
    });
  } catch {
    // Ignore storage clear errors
  }
}
