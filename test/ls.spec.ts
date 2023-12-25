/**
 * @vitest-environment happy-dom
 */

import { describe, expect, it, vi } from "vitest";
import { LStorage } from "../";

describe("LStorage", () => {
  describe("LStorage getItem", () => {
    it("should return null if key does not exist", () => {
      expect(LStorage.getItem("testKey")).toBeNull();
    });
    it("should return null if key is expired", () => {
      LStorage.setItem("testKey", "testValue", { expire: -1 });
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

    // it("should return null if can not use localStorage", () => {
    //   localStorage = {};
    //   expect(LStorage.getItem("testKey")).toBe(null);
    // });
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
  });

  describe("LStorage key", () => {
    it("should get the key of localStorage", () => {
      LStorage.setItem("testKey", "testValue");
      expect(LStorage.key(0)).toBe("testKey");
    });
  });

  describe("LStorage keys", () => {
    it("should get the keys of localStorage", () => {
      LStorage.setItem("testKey", "testValue");
      expect(LStorage.keys().length).toBe(1);
    });
  });

  describe("Not support localStorage", () => {
    it("should return null if can not use localStorage", () => {
      vi.stubGlobal("localStorage", { length: 0 });
      expect(LStorage.getItem("testKey")).toBeNull();
    });
  });
});
