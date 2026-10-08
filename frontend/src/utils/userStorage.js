/**
 * User-Scoped LocalStorage Utility
 * 
 * Provides isolated storage methods ensuring that personal execution state
 * (such as code drafts, notes, solve states, XP, timers, and UI state)
 * are strictly bound to the authenticated user ID and never leak across accounts.
 */

export const getActiveUserId = () => {
  try {
    const userStr = localStorage.getItem("currentUser");
    if (userStr) {
      const user = JSON.parse(userStr);
      return user?._id || user?.id || null;
    }
  } catch (e) {
    console.error("Error reading currentUser from localStorage", e);
  }
  return null;
};

export const getScopedKey = (key, userId = null) => {
  const uid = userId || getActiveUserId();
  return uid ? `${key}_${uid}` : key;
};

export const getScopedItem = (key, userId = null) => {
  const scopedKey = getScopedKey(key, userId);
  return localStorage.getItem(scopedKey);
};

export const setScopedItem = (key, value, userId = null) => {
  const scopedKey = getScopedKey(key, userId);
  const valStr = typeof value === "string" ? value : JSON.stringify(value);
  localStorage.setItem(scopedKey, valStr);
};

export const removeScopedItem = (key, userId = null) => {
  const scopedKey = getScopedKey(key, userId);
  localStorage.removeItem(scopedKey);
};

/**
 * Scrubs all user-specific and sensitive items from localStorage on logout.
 */
export const clearUserStorageOnLogout = () => {
  try {
    const keysToRemove = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (!key) continue;
      if (
        key.startsWith("dsa_code_") ||
        key.startsWith("dsa_notes_") ||
        key.startsWith("dsa_submissions_") ||
        key.startsWith("dsa_solved_") ||
        key.startsWith("sarthi_user_xp") ||
        key.startsWith("dsa_lang_") ||
        key.startsWith("lld_") ||
        key.startsWith("focus_") ||
        key.startsWith("recentSearches") ||
        key.includes("_user_") ||
        key === "accessToken" ||
        key === "refreshToken" ||
        key === "currentUser" ||
        key === "activeBranch"
      ) {
        keysToRemove.push(key);
      }
    }
    keysToRemove.forEach((k) => localStorage.removeItem(k));
  } catch (e) {
    console.error("Error clearing user storage on logout:", e);
  }
};
