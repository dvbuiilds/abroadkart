import { describe, it, expect } from "vitest";
import { scrollLeftFor } from "../chip-scroll";

// A 300px-wide row holding 1000px of chips. The active chip is 100px wide.
const row = { viewport: 300, max: 700 };

describe("scrollLeftFor", () => {
  it("keeps the saved offset when the active chip is fully visible there", () => {
    expect(scrollLeftFor({ ...row, saved: 400, chipLeft: 450, chipWidth: 100 })).toBe(400);
  });

  it("centres the active chip when the saved offset hides it", () => {
    // chip spans 800-900; centred => 850 - 150 = 700
    expect(scrollLeftFor({ ...row, saved: 0, chipLeft: 800, chipWidth: 100 })).toBe(700);
    // chip spans 500-600; centred => 550 - 150 = 400
    expect(scrollLeftFor({ ...row, saved: 0, chipLeft: 500, chipWidth: 100 })).toBe(400);
  });

  it("centres the active chip when there is no saved offset", () => {
    expect(scrollLeftFor({ ...row, saved: null, chipLeft: 500, chipWidth: 100 })).toBe(400);
  });

  it("treats a partly visible chip as hidden", () => {
    // viewport 400-700, chip spans 650-750
    // centred => 700 - 150 = 550
    expect(scrollLeftFor({ ...row, saved: 400, chipLeft: 650, chipWidth: 100 })).toBe(550);
  });

  it("clamps to the start and the end of the row", () => {
    expect(scrollLeftFor({ ...row, saved: null, chipLeft: 0, chipWidth: 100 })).toBe(0);
    expect(scrollLeftFor({ ...row, saved: null, chipLeft: 900, chipWidth: 100 })).toBe(700);
  });

  it("stays at the start when there is no active chip", () => {
    expect(scrollLeftFor({ ...row, saved: null, chipLeft: null, chipWidth: 0 })).toBe(0);
  });

  it("keeps the saved offset, clamped, when there is no active chip", () => {
    expect(scrollLeftFor({ ...row, saved: 250, chipLeft: null, chipWidth: 0 })).toBe(250);
    expect(scrollLeftFor({ ...row, saved: 900, chipLeft: null, chipWidth: 0 })).toBe(700);
  });
});
