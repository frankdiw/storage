import {
  canUseStorage,
  clear,
  getItem,
  key,
  keys,
  removeItem,
  setItem,
} from "./util";

export const LStorage = {
  length: {
    get value(): number {
      if (canUseStorage("local")) {
        return localStorage.length;
      }
      return 0;
    },
  },
  key: (index: number) => key(index, "local"),
  setItem: (key: string, value: any, options?: { expire?: string | number }) =>
    setItem(key, value, "local", options),
  getItem: (key: string) => getItem(key, "local"),
  keys: (options?: { filter?: string[]; exclude?: string[] }) =>
    keys("local", options),
  clear: () => clear("local"),
  removeItem: (key: string) => removeItem(key, "local"),
};

export const SStorage = {
  length: {
    get value(): number {
      if (canUseStorage("session")) {
        return localStorage.length;
      }
      return 0;
    },
  },
  key: (index: number) => key(index, "session"),
  setItem: (key: string, value: any, options?: { expire?: string | number }) =>
    setItem(key, value, "session", options),
  getItem: (key: string) => getItem(key, "session"),
  keys: (options?: { filter?: string[]; exclude?: string[] }) =>
    keys("session", options),
  clear: () => clear("session"),
  removeItem: (key: string) => removeItem(key, "session"),
};
