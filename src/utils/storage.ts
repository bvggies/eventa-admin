/**
 * Safe storage utilities with error handling and fallback
 * Handles cases where localStorage might be blocked by browser settings or extensions
 */

// In-memory fallback storage
const memoryStorage: Record<string, string> = {};

// Cache storage availability to avoid repeated checks
let storageAvailableCache: boolean | null = null;
let storageBlockedCache: boolean | null = null;

const isStorageAvailable = (): boolean => {
  // Return cached value if available
  if (storageAvailableCache !== null) {
    return storageAvailableCache;
  }

  try {
    // Check if localStorage exists
    if (typeof Storage === 'undefined' || typeof localStorage === 'undefined') {
      storageAvailableCache = false;
      return false;
    }

    const test = '__storage_test__';
    localStorage.setItem(test, test);
    localStorage.removeItem(test);
    storageAvailableCache = true;
    return true;
  } catch (e: any) {
    // Silently catch all errors - storage is not available
    storageAvailableCache = false;
    return false;
  }
};

const isStorageBlocked = (): boolean => {
  // Return cached value if available
  if (storageBlockedCache !== null) {
    return storageBlockedCache;
  }

  try {
    // Check if localStorage exists
    if (typeof Storage === 'undefined' || typeof localStorage === 'undefined') {
      storageBlockedCache = true;
      return true;
    }

    const test = '__storage_blocked_test__';
    localStorage.setItem(test, test);
    localStorage.removeItem(test);
    storageBlockedCache = false;
    return false;
  } catch (e: any) {
    // If we get a security error or access denied, storage is blocked
    const isBlocked = e instanceof DOMException && (
      e.code === 18 || 
      e.name === 'SecurityError' || 
      e.message?.includes('not allowed') ||
      e.message?.includes('blocked')
    ) || (
      e && typeof e === 'object' && 'message' in e && (
        String((e as { message?: string }).message || '').includes('not allowed') ||
        String((e as { message?: string }).message || '').includes('blocked')
      )
    );
    
    storageBlockedCache = isBlocked;
    return isBlocked;
  }
};

export const storage = {
  getItem: (key: string): string | null => {
    try {
      // Try localStorage first
      if (isStorageAvailable() && !isStorageBlocked()) {
        try {
          return localStorage.getItem(key);
        } catch (e) {
          // localStorage access failed, fall through to memory
        }
      }
    } catch (error) {
      // Silently fail and use memory fallback
    }
    
    // Fallback to memory storage
    return memoryStorage[key] || null;
  },

  setItem: (key: string, value: string): boolean => {
    try {
      // Try localStorage first
      if (isStorageAvailable() && !isStorageBlocked()) {
        try {
          localStorage.setItem(key, value);
          // Also store in memory as backup
          memoryStorage[key] = value;
          return true;
        } catch (e) {
          // localStorage write failed, fall through to memory
        }
      }
    } catch (error) {
      // Silently fail and use memory fallback
    }
    
    // Fallback to memory storage
    try {
      memoryStorage[key] = value;
      return true;
    } catch (error) {
      // Even memory storage failed (shouldn't happen, but handle gracefully)
      return false;
    }
  },

  removeItem: (key: string): boolean => {
    try {
      if (isStorageAvailable() && !isStorageBlocked()) {
        try {
          localStorage.removeItem(key);
        } catch (e) {
          // Ignore localStorage errors
        }
      }
    } catch (error) {
      // Ignore all errors
    }
    
    // Always remove from memory
    try {
      delete memoryStorage[key];
    } catch (error) {
      // Ignore memory deletion errors
    }
    return true;
  },

  isAvailable: (): boolean => {
    try {
      return isStorageAvailable() && !isStorageBlocked();
    } catch {
      return false;
    }
  },

  isBlocked: (): boolean => {
    try {
      return isStorageBlocked();
    } catch {
      return true; // Assume blocked if we can't check
    }
  },
};

