import { describe, it, expect } from "vitest";
import { formatPostDate, isSameIstDay } from "../format";

describe("formatPostDate", () => {
  it("formats as day, short month, year", () => {
    expect(formatPostDate(new Date("2024-07-12T10:00:00Z"))).toBe("12 Jul 2024");
  });

  it("uses the Indian calendar day, not the UTC day", () => {
    // 20:00 UTC on 11 July is 01:30 on 12 July in India.
    expect(formatPostDate(new Date("2024-07-11T20:00:00Z"))).toBe("12 Jul 2024");
  });
});

describe("isSameIstDay", () => {
  it("is true for two instants on the same Indian calendar day", () => {
    // 23:30 UTC on 11 July is 05:00 IST on 12 July.
    // 00:10 UTC on 12 July is 05:40 IST on 12 July.
    expect(
      isSameIstDay(
        new Date("2024-07-11T23:30:00Z"),
        new Date("2024-07-12T00:10:00Z")
      )
    ).toBe(true);
  });

  it("is false when the Indian calendar day differs", () => {
    // 18:00 UTC on 11 July is 23:30 IST on 11 July.
    // 19:00 UTC on 11 July is 00:30 IST on 12 July.
    expect(
      isSameIstDay(
        new Date("2024-07-11T18:00:00Z"),
        new Date("2024-07-11T19:00:00Z")
      )
    ).toBe(false);
  });
});
