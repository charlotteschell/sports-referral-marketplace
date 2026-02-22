import { describe, it, expect } from "vitest";
import { normalizeWebsiteUrl, isPlausibleWebsiteUrl } from "../shared/normalizeUrl";

describe("normalizeWebsiteUrl", () => {
  it("adds https:// to bare domain", () => {
    expect(normalizeWebsiteUrl("example.com")).toBe("https://example.com");
  });

  it("adds https:// to www domain", () => {
    expect(normalizeWebsiteUrl("www.example.com")).toBe("https://www.example.com");
  });

  it("preserves existing https://", () => {
    expect(normalizeWebsiteUrl("https://example.com")).toBe("https://example.com");
  });

  it("preserves existing http://", () => {
    expect(normalizeWebsiteUrl("http://example.com")).toBe("http://example.com");
  });

  it("handles https://www prefix", () => {
    expect(normalizeWebsiteUrl("https://www.example.com")).toBe("https://www.example.com");
  });

  it("trims whitespace", () => {
    expect(normalizeWebsiteUrl("  example.com  ")).toBe("https://example.com");
  });

  it("returns empty string for empty input", () => {
    expect(normalizeWebsiteUrl("")).toBe("");
    expect(normalizeWebsiteUrl("   ")).toBe("");
  });

  it("handles domain with path", () => {
    expect(normalizeWebsiteUrl("example.com/about")).toBe("https://example.com/about");
  });

  it("handles domain with subdomain", () => {
    expect(normalizeWebsiteUrl("shop.example.com")).toBe("https://shop.example.com");
  });
});

describe("isPlausibleWebsiteUrl", () => {
  it("accepts bare domain", () => {
    expect(isPlausibleWebsiteUrl("example.com")).toBe(true);
  });

  it("accepts www domain", () => {
    expect(isPlausibleWebsiteUrl("www.example.com")).toBe(true);
  });

  it("accepts https:// domain", () => {
    expect(isPlausibleWebsiteUrl("https://example.com")).toBe(true);
  });

  it("accepts http:// domain", () => {
    expect(isPlausibleWebsiteUrl("http://example.com")).toBe(true);
  });

  it("rejects empty string", () => {
    expect(isPlausibleWebsiteUrl("")).toBe(false);
    expect(isPlausibleWebsiteUrl("   ")).toBe(false);
  });

  it("rejects string without dots", () => {
    expect(isPlausibleWebsiteUrl("example")).toBe(false);
  });

  it("rejects string with spaces", () => {
    expect(isPlausibleWebsiteUrl("example .com")).toBe(false);
  });

  it("accepts complex domains", () => {
    expect(isPlausibleWebsiteUrl("my-business.co.uk")).toBe(true);
    expect(isPlausibleWebsiteUrl("shop.my-business.com")).toBe(true);
  });
});
