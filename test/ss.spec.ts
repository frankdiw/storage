/**
 * @vitest-environment happy-dom
 */

import { describe, expect, it, vi, vitest } from "vitest";
import { SStorage } from "../src/index";
import { canUseStorage } from "../src/util";
const sleep = (time:number)=>{
  return new Promise(resolve=>{
    setTimeout(() => {
      resolve(void 0);
    }, time);
  })
}

describe("SStorage", () => {
  describe("SStorage getItem", () => {
    it('show return null if can not use sessionStorage', () => {
      vi.stubGlobal("sessionStorage", { length: 0 });
      expect(SStorage.getItem("testKey")).toBeNull();
      vi.unstubAllGlobals();
    });
    it("should return null if key does not exist", () => {
      expect(SStorage.getItem("testKey")).toBeNull();
    });
    it("should return null if key is expired", async () => {
      SStorage.setItem("testKey", "testValue", { expire: Date.now() + 500 });
      await vi.waitFor(async ()=> await sleep(800), { timeout: 1000 });
      expect(SStorage.getItem("testKey")).toBeNull();
    });
    it("should return value if key exists", () => {
      SStorage.setItem("testKey", "testValue");
      expect(SStorage.getItem("testKey")).toBe("testValue");
    });
    it("should return value if key is not expired", () => {
      SStorage.setItem("testKey", "testValue", { expire: "1h" });
      expect(SStorage.getItem("testKey")).toBe("testValue");
      SStorage.setItem("testKey1", "testValue1", { expire: "1d" });
      expect(SStorage.getItem("testKey1")).toBe("testValue1");
      SStorage.setItem("testKey2", "testValue2", { expire: Date.now() + 2000 });
      expect(SStorage.getItem("testKey2")).toBe("testValue2");
    });
    it("should return original value if value is not a JSON string", () => {
      const key = 'testKey';
      const value = 'invalidJSON';
      sessionStorage.setItem(key, value);
      const result = SStorage.getItem(key);
      expect(result).toBe(value);
    })
  });
  describe("SStorage setItem", () => {
    it('should throw error if expire is not a string like "1h" or "1d" in development env', () => {
      vi.stubEnv("NODE_ENV", "development");
      expect(() => {
        SStorage.setItem("testKey", "testValue", { expire: "1m" });
      }).toThrow();
    });
    it('should return undefined if expire is not a string like "1h" or "1d" in production env', () => {
      vi.stubEnv("NODE_ENV", "production");
      expect(
        SStorage.setItem("testKey", "testValue", { expire: "1m" })
      ).toBeUndefined();
    });
    it("should throw an error when options.expire is a number smaller than current time in development env", () => {
      vi.stubEnv("NODE_ENV", "development");
      const key = "testKey";
      const value = "testValue";
      const options = { expire: Date.now() - 1000 };
      expect(() => SStorage.setItem(key, value, options)).toThrow();
    });

    it("should return undefined when options.expire is a number smaller than current time in production env", () => {
      vi.stubEnv("NODE_ENV", "production");
      const key = "testKey";
      const value = "testValue";
      const options = { expire: Date.now() - 1000 };
      expect(SStorage.setItem(key, value, options)).toBeUndefined();
    })
  });

  describe("SStorage removeItem", () => {
    it("should remove an item from sessionStorage", () => {
      SStorage.setItem("testKey", "testValue");
      SStorage.removeItem("testKey");
      expect(SStorage.getItem("testKey")).toBeNull();
    });
  });

  describe("SStorage clear", () => {
    it("should clear all items from sessionStorage", () => {
      SStorage.setItem("testKey", "testValue");
      SStorage.clear();
      expect(SStorage.length.value).toBe(0);
    });
  });

  describe("SStorage length", () => {
    it("should get the length of sessionStorage", () => {
      expect(SStorage.length.value).toBe(0);
    });
    it("should return 0 if can not use sessionStorage", () => {
      vi.stubGlobal("sessionStorage", { length: 0 });
      expect(SStorage.length.value).toBe(0);
      vi.unstubAllGlobals();
    });
  });

  describe("SStorage key", () => {
    it("should get the key of sessionStorage", () => {
      SStorage.setItem("testKey", "testValue");
      expect(SStorage.key(0)).toBe("testKey");
    });
    it("should return null if can not use sessionStorage", () => {
      vi.stubGlobal("sessionStorage", { length: 0 });
      expect(SStorage.key(0)).toBeNull();
      vi.unstubAllGlobals();
    })
  });

  describe("SStorage keys", () => {
    it("should get the keys of sessionStorage", () => {
      SStorage.setItem("testKey", "testValue");
      expect(SStorage.keys().length).toBe(1);
      SStorage.removeItem('testKey');
    });
    it("should return empty array if can not use sessionStorage", () => {
      vi.stubGlobal("sessionStorage", { length: 0 });
      expect(SStorage.keys().length).toBe(0);
      vi.unstubAllGlobals();
    });
    // it("should return filtered keys if filter is provided", () => {
    //   SStorage.setItem("testKey", "testValue");
    //   SStorage.setItem("testKey2", "testValue2");
    //   expect(SStorage.keys({ filter: ["testKey"] })).toEqual(["testKey"]);
    // });
    // it("should return keys except excluded keys if exclude is provided", () => {
    //   SStorage.setItem("testKey", "testValue");
    //   SStorage.setItem("testKey1", "testValue1");
    //   expect(SStorage.keys({ exclude: ["testKey",] })).toEqual(["testKey1"]);
    // });
  });

  describe("Not support sessionStorage", () => {
    it("should return null if can not use sessionStorage", () => {
      const sessionStorageMock = {
        setItem: vitest.fn(() => { throw new Error(); }),
        removeItem: vitest.fn(),
        length: 0,
      };
      vi.stubGlobal("sessionStorage", sessionStorageMock);
      expect(SStorage.getItem("testKey")).toBeNull();
    });

    it('should return false if sessionStorage is not supported', () => {
      const sessionStorageMock = {
        setItem: vitest.fn(() => { throw new Error(); }),
        removeItem: vitest.fn(),
        length: 0,
      };
      vi.stubGlobal("sessionStorage", sessionStorageMock);
      const result =canUseStorage('session');
      expect(result).toBe(false);
    });
  
    it('should return false if navigator.cookieEnabled is false', () => {
      vi.stubGlobal("navigator.cookieEnabled", false);
      const result = canUseStorage('session');
      expect(result).toBe(false);
    });

    it("should return true if sessionStorage key length is greater than 0", () => {
      const sessionStorageMock = {
        setItem: vitest.fn(() => { throw new Error(); }),
        removeItem: vitest.fn(),
        length: 50,
      };
      vi.stubGlobal("sessionStorage", sessionStorageMock);
      const result = canUseStorage('session');
      expect(result).toBe(true);
    })
  });
});
