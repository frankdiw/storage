/**
 * @vitest-environment happy-dom
 */

import { describe, expect, it, vi } from "vitest";
import { SStorage } from "../";
describe("SStorage", () => {
  it("should get the length of sessionStorage", () => {
    expect(SStorage.length.value).toBe(0);
  });

  it("should set and get an item in sessionStorage", () => {
    SStorage.setItem("testKey", "testValue");
    expect(SStorage.getItem("testKey")).toBe("testValue");
  });

  it("should remove an item from sessionStorage", () => {
    SStorage.setItem("testKey", "testValue");
    SStorage.removeItem("testKey");
    expect(SStorage.getItem("testKey")).toBeNull();
  });

  it("should clear all items from sessionStorage", () => {
    SStorage.setItem("testKey", "testValue");
    SStorage.clear();
    expect(SStorage.length.value).toBe(0);
  });
});
