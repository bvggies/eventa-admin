/**
 * Safe localStorage utilities with error handling
 * Handles cases where localStorage might be blocked by browser settings or extensions
 */

const isStorageAvailable = (): boolean => {
  try {
    const test = '__storage_test__';
    localStorage.setItem(test, test);
    localStorage.removeItem(test);
    return true;
  } catch (e) {
    return false;
  }
};

export const storage = {
  getItem: (key: string): string | null => {
    try {
      if (!isStorageAvailable()) {
        console.warn('localStorage is not available');
        return null;
      }
      return localStorage.getItem(key);
    } catch (error) {
      console.error('Error reading from localStorage:', error);
      return null;
    }
  },

  setItem: (key: string, value: string): boolean => {
    try {
      if (!isStorageAvailable()) {
        console.warn('localStorage is not available');
        return false;
      }
      localStorage.setItem(key, value);
      return true;
    } catch (error) {
      console.error('Error writing to localStorage:', error);
      return false;
    }
  },

  removeItem: (key: string): boolean => {
    try {
      if (!isStorageAvailable()) {
        return false;
      }
      localStorage.removeItem(key);
      return true;
    } catch (error) {
      console.error('Error removing from localStorage:', error);
      return false;
    }
  },

  isAvailable: isStorageAvailable,
};

