import { describe, it, expect } from "vitest";
import { blogLeadSchema, blogLeadPayloadSchema } from "../blog-lead";

describe("blogLeadSchema", () => {
  it("accepts an email alone", () => {
    expect(blogLeadSchema.safeParse({ email: "student@example.com" }).success).toBe(true);
  });

  it("requires an email", () => {
    const result = blogLeadSchema.safeParse({ email: "" });
    expect(result.success).toBe(false);
    expect(result.success || result.error.flatten().fieldErrors.email).toContain(
      "Email is required"
    );
  });

  it("rejects a malformed email with a friendly message", () => {
    const result = blogLeadSchema.safeParse({ email: "not-an-email" });
    expect(result.success).toBe(false);
    expect(result.success || result.error.flatten().fieldErrors.email).toContain(
      "Enter a valid email address"
    );
  });

  it("trims whitespace around the email", () => {
    const result = blogLeadSchema.parse({ email: "  student@example.com  " });
    expect(result.email).toBe("student@example.com");
  });

  it("rejects an email over 254 characters", () => {
    const email = `${"a".repeat(250)}@x.co`;
    expect(blogLeadSchema.safeParse({ email }).success).toBe(false);
  });

  it("accepts an Indian mobile number with a country code", () => {
    expect(
      blogLeadSchema.safeParse({ email: "a@b.co", phone: "+91 98765 43210" }).success
    ).toBe(true);
  });

  it("rejects letters in a phone number", () => {
    expect(
      blogLeadSchema.safeParse({ email: "a@b.co", phone: "call-me-maybe" }).success
    ).toBe(false);
  });

  it("caps name at 120 and message at 2000 characters", () => {
    expect(blogLeadSchema.safeParse({ email: "a@b.co", name: "x".repeat(121) }).success).toBe(false);
    expect(blogLeadSchema.safeParse({ email: "a@b.co", message: "x".repeat(2001) }).success).toBe(false);
    expect(blogLeadSchema.safeParse({ email: "a@b.co", message: "x".repeat(2000) }).success).toBe(true);
  });
});

describe("blogLeadPayloadSchema", () => {
  const base = { email: "a@b.co" };

  it("accepts the form fields plus source and UTM data", () => {
    const result = blogLeadPayloadSchema.safeParse({
      ...base,
      sourceSlug: "visa-tips",
      sourceUrl: "https://abroadkart.com/blogs/visa-tips",
      utmSource: "google",
      utmMedium: "cpc",
      utmCampaign: "spring",
    });
    expect(result.success).toBe(true);
  });

  it("rejects a sourceUrl that is not a URL", () => {
    expect(
      blogLeadPayloadSchema.safeParse({ ...base, sourceUrl: "not a url" }).success
    ).toBe(false);
  });

  it("allows the honeypot field to be empty or absent", () => {
    expect(blogLeadPayloadSchema.safeParse({ ...base, website: "" }).success).toBe(true);
    expect(blogLeadPayloadSchema.safeParse(base).success).toBe(true);
  });
});
