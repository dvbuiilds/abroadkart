import { describe, it, expect } from "vitest";
import { cn } from "@app/lib/utils";

describe("cn", () => {
  it("merges class names and drops falsy values", () => {
    expect(cn("px-2", false, undefined, "text-sm")).toBe("px-2 text-sm");
  });

  it("resolves conflicting Tailwind utilities, keeping the last one", () => {
    expect(cn("px-2", "px-4")).toBe("px-4");
  });
});
