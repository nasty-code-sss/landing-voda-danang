function isStorageUnavailable(error: unknown): boolean {
  return error instanceof DOMException || error instanceof TypeError;
}

export function readStoredValue(key: string): string | null {
  try {
    return window.localStorage.getItem(key);
  } catch (error) {
    if (isStorageUnavailable(error)) {
      return null;
    }
    throw error;
  }
}

export function storeValue(key: string, value: string): boolean {
  try {
    window.localStorage.setItem(key, value);
    return true;
  } catch (error) {
    if (isStorageUnavailable(error)) {
      return false;
    }
    throw error;
  }
}

export function forgetStoredValue(key: string): boolean {
  try {
    window.localStorage.removeItem(key);
    return true;
  } catch (error) {
    if (isStorageUnavailable(error)) {
      return false;
    }
    throw error;
  }
}
