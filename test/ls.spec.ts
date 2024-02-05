/**
 * @vitest-environment happy-dom
 */

import { describe, expect, it, vi, vitest } from "vitest";
import { LStorage } from "../src/index";
import { canUseStorage } from "../src/util";
const sleep = (time:number)=>{
  return new Promise(resolve=>{
    setTimeout(() => {
      resolve(void 0);
    }, time);
  })
}

describe("LStorage", () => {
  describe("LStorage getItem", () => {
    it('show return null if can not use localStorage', () => {
      vi.stubGlobal("localStorage", { length: 0 });
      expect(LStorage.getItem("testKey")).toBeNull();
      vi.unstubAllGlobals();
    });
    it("should return null if key does not exist", () => {
      expect(LStorage.getItem("testKey")).toBeNull();
    });
    it("should return null if key is expired", async () => {
      LStorage.setItem("testKey", "testValue", { expire: Date.now() + 500 });
      await vi.waitFor(async ()=> await sleep(800), { timeout: 1000 });
      expect(LStorage.getItem("testKey")).toBeNull();
    });
    it("should return value if key exists", () => {
      LStorage.setItem("testKey", "testValue");
      expect(LStorage.getItem("testKey")).toBe("testValue");
    });
    it("should return value if key is not expired", () => {
      LStorage.setItem("testKey", "testValue", { expire: "1h" });
      expect(LStorage.getItem("testKey")).toBe("testValue");
      LStorage.setItem("testKey1", "testValue1", { expire: "1d" });
      expect(LStorage.getItem("testKey1")).toBe("testValue1");
      LStorage.setItem("testKey2", "testValue2", { expire: Date.now() + 2000 });
      expect(LStorage.getItem("testKey2")).toBe("testValue2");
    });
    it("should return original value if value is not a JSON string", () => {
      const key = 'testKey';
      const value = 'invalidJSON';
      localStorage.setItem(key, value);
      const result = LStorage.getItem(key);
      expect(result).toBe(value);
    })
  });
  describe("LStorage setItem", () => {
    it('should throw error if expire is not a string like "1h" or "1d" in development env', () => {
      vi.stubEnv("NODE_ENV", "development");
      expect(() => {
        LStorage.setItem("testKey", "testValue", { expire: "1m" });
      }).toThrow();
    });
    it('should return undefined if expire is not a string like "1h" or "1d" in production env', () => {
      vi.stubEnv("NODE_ENV", "production");
      expect(
        LStorage.setItem("testKey", "testValue", { expire: "1m" })
      ).toBeUndefined();
    });
    it("should throw an error when options.expire is a number smaller than current time in development env", () => {
      vi.stubEnv("NODE_ENV", "development");
      const key = "testKey";
      const value = "testValue";
      const options = { expire: Date.now() - 1000 };
      expect(() => LStorage.setItem(key, value, options)).toThrow();
    });

    it("should return undefined when options.expire is a number smaller than current time in production env", () => {
      vi.stubEnv("NODE_ENV", "production");
      const key = "testKey";
      const value = "testValue";
      const options = { expire: Date.now() - 1000 };
      expect(LStorage.setItem(key, value, options)).toBeUndefined();
    })
  });

  describe("LStorage removeItem", () => {
    it("should remove an item from localStorage", () => {
      LStorage.setItem("testKey", "testValue");
      LStorage.removeItem("testKey");
      expect(LStorage.getItem("testKey")).toBeNull();
    });
  });

  describe("LStorage clear", () => {
    it("should clear all items from localStorage", () => {
      LStorage.setItem("testKey", "testValue");
      LStorage.clear();
      expect(LStorage.length.value).toBe(0);
    });
  });

  describe("LStorage length", () => {
    it("should get the length of localStorage", () => {
      expect(LStorage.length.value).toBe(0);
    });
    it("should return 0 if can not use localStorage", () => {
      vi.stubGlobal("localStorage", { length: 0 });
      expect(LStorage.length.value).toBe(0);
      vi.unstubAllGlobals();
    });
  });

  describe("LStorage key", () => {
    it("should get the key of localStorage", () => {
      LStorage.setItem("testKey", "testValue");
      expect(LStorage.key(0)).toBe("testKey");
    });
    it("should return null if can not use localStorage", () => {
      vi.stubGlobal("localStorage", { length: 0 });
      expect(LStorage.key(0)).toBeNull();
      vi.unstubAllGlobals();
    })
  });

  describe("LStorage keys", () => {
    it("should get the keys of localStorage", () => {
      LStorage.setItem("testKey", "testValue");
      expect(LStorage.keys().length).toBe(1);
      LStorage.removeItem('testKey');
    });
    it("should return empty array if can not use localStorage", () => {
      vi.stubGlobal("localStorage", { length: 0 });
      expect(LStorage.keys().length).toBe(0);
      vi.unstubAllGlobals();
    });
    it("should return filtered keys if filter is provided", () => {
      LStorage.setItem("testKey", "testValue");
      LStorage.setItem("testKey2", "testValue2");
      expect(LStorage.keys({ filter: ["testKey"] })).toEqual(["testKey"]);
    });
    it("should return keys except excluded keys if exclude is provided", () => {
      LStorage.setItem("testKey", "testValue");
      LStorage.setItem("testKey1", "testValue1");
      expect(LStorage.keys({ exclude: ["testKey",] })).toEqual(["testKey1"]);
    });
  });

  describe("Not support localStorage", () => {
    it("should return null if can not use localStorage", () => {
      const localStorageMock = {
        setItem: vitest.fn(() => { throw new Error(); }),
        removeItem: vitest.fn(),
        length: 0,
      };
      vi.stubGlobal("localStorage", localStorageMock);
      expect(LStorage.getItem("testKey")).toBeNull();
    });

    it('should return false if localStorage is not supported', () => {
      const localStorageMock = {
        setItem: vitest.fn(() => { throw new Error(); }),
        removeItem: vitest.fn(),
        length: 0,
      };
      vi.stubGlobal("localStorage", localStorageMock);
      const result =canUseStorage('local');
      expect(result).toBe(false);
    });
  
    it('should return false if navigator.cookieEnabled is false', () => {
      vi.stubGlobal("navigator.cookieEnabled", false);
      const result = canUseStorage('local');
      expect(result).toBe(false);
    });

    it("should return true if localStorage key length is greater than 0", () => {
      const localStorageMock = {
        setItem: vitest.fn(() => { throw new Error(); }),
        removeItem: vitest.fn(),
        length: 50,
      };
      vi.stubGlobal("localStorage", localStorageMock);
      const result = canUseStorage('local');
      expect(result).toBe(true);
    })
  });
});
