/**
 * Safe storage utilities with error handling and fallback
 * Handles cases where localStorage might be blocked by browser settings or extensions
 */

// In-memory fallback storage
const memoryStorage: Record<string, string> = {};

const isStorageAvailable = (): boolean => {
  try {
    const test = '__storage_test__';
    localStorage.setItem(test, test);
    localStorage.removeItem(test);
    return true;
  } catch (e) {
    // Check if it's a QuotaExceededError (storage full) vs blocked
    if (e instanceof DOMException) {
      if (e.code === 22 || e.code === 1014 || e.name === 'QuotaExceededError') {
        // Storage is available but full
        return true;
      }
    }
    return false;
  }
};

const isStorageBlocked = (): boolean => {
  try {
    const test = '__storage_blocked_test__';
    localStorage.setItem(test, test);
    localStorage.removeItem(test);
    return false;
  } catch (e) {
    // If we get a security error or access denied, storage is blocked
    if (e instanceof DOMException) {
      return e.code === 18 || e.name === 'SecurityError' || e.message?.includes('not allowed');
    }
    return e.message?.includes('not allowed') || e.message?.includes('blocked') || false;
  }
};

export const storage = {
  getItem: (key: string): string | null => {
    try {
      // Try localStorage first
      if (isStorageAvailable()) {
        return localStorage.getItem(key);
      }
    } catch (error: any) {
      console.warn('localStorage access failed, using memory fallback:', error.message);
    }
    
    // Fallback to memory storage
    return memoryStorage[key] || null;
  },

  setItem: (key: string, value: string): boolean => {
    try {
      // Try localStorage first
      if (isStorageAvailable() && !isStorageBlocked()) {
        localStorage.setItem(key, value);
        // Also store in memory as backup
        memoryStorage[key] = value;
        return true;
      }
    } catch (error: any) {
      console.warn('localStorage write failed, using memory fallback:', error.message);
    }
    
    // Fallback to memory storage
    try {
      memoryStorage[key] = value;
      return true;
    } catch (error) {
      console.error('Memory storage also failed:', error);
      return false;
    }
  },

  removeItem: (key: string): boolean => {
    try {
      if (isStorageAvailable() && !isStorageBlocked()) {
        localStorage.removeItem(key);
      }
    } catch (error) {
      // Ignore localStorage errors
    }
    
    // Always remove from memory
    delete memoryStorage[key];
    return true;
  },

  isAvailable: (): boolean => {
    try {
      return isStorageAvailable() && !isStorageBlocked();
    } catch {
      return false;
    }
  },

  isBlocked: isStorageBlocked,
};

