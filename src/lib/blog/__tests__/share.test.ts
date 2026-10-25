import { describe, it, expect } from "vitest";
import { buildShareLinks } from "../share";

const url = "https://abroadkart.com/blogs/visa-tips";
const title = "Visa tips: DS-160 & B1/B2? Read now";

describe("buildShareLinks", () => {
  it("builds a WhatsApp link with the title and URL in the text", () => {
    const link = new URL(buildShareLinks(url, title).whatsapp);
    expect(link.origin + link.pathname).toBe("https://wa.me/");
    expect(link.searchParams.get("text")).toBe(`${title} ${url}`);
  });

  it("builds a LinkedIn share link for the URL", () => {
    const link = new URL(buildShareLinks(url, title).linkedin);
    expect(link.hostname).toBe("www.linkedin.com");
    expect(link.searchParams.get("url")).toBe(url);
  });

  it("builds an X post link with the URL and title", () => {
    const link = new URL(buildShareLinks(url, title).x);
    expect(link.hostname).toBe("x.com");
    expect(link.searchParams.get("url")).toBe(url);
    expect(link.searchParams.get("text")).toBe(title);
  });

  it("encodes special characters so they survive the round trip", () => {
    const links = buildShareLinks(url, title);
    expect(links.x).not.toContain("& B1");
    expect(new URL(links.x).searchParams.get("text")).toContain("&");
  });
});
