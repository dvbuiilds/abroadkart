/**
 * Category descriptions for the blog import. The WordPress export has no
 * descriptions, so the approved overlay fills them in. An export description,
 * when present, always wins.
 * Run: npm run test
 */

import { describe, it } from "node:test";
import assert from "node:assert";
import {
  CATEGORY_DESCRIPTIONS,
  resolveCategoryDescription,
} from "../seeds/blog-import/categoryDescriptions";

const SLUGS = [
  "application-assistance",
  "counselling",
  "course-university-selection",
  "education-loan",
  "others",
  "scholarships",
  "standardised-test-preparation",
  "study-cost",
  "top-universities",
  "visa",
  "work-experience",
];

describe("CATEGORY_DESCRIPTIONS overlay", () => {
  it("covers exactly the 11 exported category slugs", () => {
    assert.deepStrictEqual(Object.keys(CATEGORY_DESCRIPTIONS).sort(), [...SLUGS].sort());
  });

  it("has a non-empty description of at most 160 characters for every slug", () => {
    for (const slug of SLUGS) {
      const text = CATEGORY_DESCRIPTIONS[slug];
      assert.ok(text && text.trim().length > 0, `${slug} is empty`);
      assert.ok(text.length <= 160, `${slug} is ${text.length} characters`);
    }
  });
});

describe("resolveCategoryDescription", () => {
  it("uses the export description when it is present", () => {
    assert.strictEqual(resolveCategoryDescription("visa", "From the export."), "From the export.");
  });

  it("falls back to the overlay when the export description is empty", () => {
    assert.strictEqual(resolveCategoryDescription("visa", ""), CATEGORY_DESCRIPTIONS.visa);
  });

  it("falls back to the overlay when the export description is only whitespace", () => {
    assert.strictEqual(resolveCategoryDescription("visa", "   "), CATEGORY_DESCRIPTIONS.visa);
  });

  it("returns an empty string for an unknown slug with no export description", () => {
    assert.strictEqual(resolveCategoryDescription("unknown-slug", ""), "");
  });
});
