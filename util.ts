import { StorageType } from "./type";

const SUPPORT_KEY = "frankdiw@storage_support";
const EXPIRE_KEY = "frankdiw@storage_expire";

export const canUseStorage = (storageType: StorageType) => {
  const storage = storageType === "local" ? localStorage : sessionStorage;
  let support = false;
  try {
    storage.setItem(SUPPORT_KEY, "true");
    storage.removeItem(SUPPORT_KEY);
    support = true;
  } catch (e) {
    try {
      if (storage && storage.length > 0) {
        support = true;
      }
    } catch {}
  }
  return navigator.cookieEnabled && support;
};

export const getItem = (key: string, storageType: StorageType) => {
  if (canUseStorage(storageType)) {
    const storage = storageType === "local" ? localStorage : sessionStorage;
    const value = storage.getItem(key);
    if (!value) {
      return null;
    }
    try {
      const parsedValue = JSON.parse(value);
      const expire = parsedValue[EXPIRE_KEY];
      if (expire) {
        if (Date.now() < expire) {
          return parsedValue.value;
        } else {
          storage.removeItem(key);
          return null;
        }
      } else {
        return parsedValue;
      }
    } catch (err) {
      return value;
    }
  } else {
    return null;
  }
};

export const setItem = (
  key: string,
  value: any,
  storageType: StorageType,
  options?: { expire?: number | string }
) => {
  if (canUseStorage(storageType)) {
    const storage = storageType === "local" ? localStorage : sessionStorage;
    let expire = options?.expire;
    if (typeof expire === "string") {
      const unit = expire.toLowerCase().slice(-1);
      const num = Number(expire.toLowerCase().slice(0, -1));
      if (["h", "d"].includes(unit) && Number.isInteger(num)) {
        let expire = 0;
        switch (unit) {
          case "h": {
            expire = Date.now() + 1000 * 60 * 60 * num;
          }
          case "d": {
            expire = Date.now() + 1000 * 60 * 60 * 24 * num;
          }
        }
        return storage.setItem(
          key,
          JSON.stringify({ value, [EXPIRE_KEY]: expire })
        );
      } else {
        if (process.env.NODE_ENV === "development") {
          throw Error('expire must be a string like "1h" or "1d"');
        } else {
          return;
        }
      }
    } else if (typeof expire === "number") {
      if (Date.now() < expire) {
        return storage.setItem(
          key,
          JSON.stringify({ value, [EXPIRE_KEY]: expire })
        );
      } else {
        if (process.env.NODE_ENV === "development") {
          throw Error("expire must be gather than now");
        } else {
          return;
        }
      }
    }
    return storage.setItem(key, JSON.stringify(value));
  }
};

export const removeItem = (key: string, storageType: StorageType) => {
  if (canUseStorage(storageType)) {
    const storage = storageType === "local" ? localStorage : sessionStorage;
    return storage.removeItem(key);
  }
};

export const clear = (storageType: StorageType) => {
  if (canUseStorage(storageType)) {
    const storage = storageType === "local" ? localStorage : sessionStorage;
    return storage.clear();
  }
};

export const keys = (
  storageType: StorageType,
  options?: { filter?: string[]; exclude?: string[] }
) => {
  if (canUseStorage(storageType)) {
    const storage = storageType === "local" ? localStorage : sessionStorage;
    const keys = Object.keys(storage);
    const { filter = [], exclude = [] } = options || {};
    if (filter.length > 0) {
      return keys.filter((key) => filter.includes(key));
    } else if (exclude.length > 0) {
      return keys.filter((key) => !exclude.includes(key));
    } else {
      return keys;
    }
  } else {
    return [];
  }
};

export const key = (index: number, storageType: StorageType) => {
  if (canUseStorage(storageType)) {
    const storage = storageType === "local" ? localStorage : sessionStorage;
    return storage.key(index);
  } else {
    return null;
  }
};
