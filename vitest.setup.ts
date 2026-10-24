// Shared test setup. Tests run in jsdom by default (see vitest.config.ts).
// For node-only tests (route handlers, pure SEO helpers), add this docblock
// at the top of the test file: // @vitest-environment node
import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach } from "vitest";

afterEach(() => {
  cleanup();
});
