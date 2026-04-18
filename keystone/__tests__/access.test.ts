/**
 * Access control and multi-tenant rule tests.
 * Run: npm run test
 *
 * context.session is now a flat SessionData object (no { data: … } wrapper).
 */

import { describe, it } from "node:test";
import assert from "node:assert";
import {
  isAuthenticated,
  isSuperAdmin,
  isConsultant,
  isFulfilment,
  filterByTenant,
  canUpdateLoanStatus,
} from "../access/rules";

describe("Access rules", () => {
  describe("isAuthenticated", () => {
    it("returns false when session is undefined", () => {
      assert.strictEqual(isAuthenticated(undefined), false);
    });
    it("returns true when session has id", () => {
      assert.strictEqual(
        isAuthenticated({
          id: "user-1",
          email: "",
          name: "",
          role: "consultantAgent",
          isActive: true,
        }),
        true,
      );
    });
    it("returns false when session id is empty", () => {
      assert.strictEqual(
        isAuthenticated({
          id: "",
          email: "",
          name: "",
          role: "consultantAgent",
          isActive: true,
        }),
        false,
      );
    });
  });

  describe("isSuperAdmin", () => {
    it("returns true when role is superAdmin", () => {
      assert.strictEqual(
        isSuperAdmin({
          id: "u1",
          email: "",
          name: "",
          role: "superAdmin",
          isActive: true,
        }),
        true,
      );
    });
    it("returns true when passed as { session } args", () => {
      assert.strictEqual(
        isSuperAdmin({
          session: {
            id: "u1",
            email: "",
            name: "",
            role: "superAdmin",
            isActive: true,
          },
        }),
        true,
      );
    });
    it("returns false for other roles", () => {
      assert.strictEqual(
        isSuperAdmin({
          id: "u2",
          email: "",
          name: "",
          role: "consultantAgent",
          isActive: true,
        }),
        false,
      );
      assert.strictEqual(
        isSuperAdmin({
          id: "u3",
          email: "",
          name: "",
          role: "fulfilment",
          isActive: true,
        }),
        false,
      );
    });
  });

  describe("isConsultant", () => {
    it("returns true for consultantAdmin and consultantAgent", () => {
      assert.strictEqual(
        isConsultant({
          session: {
            id: "u1",
            email: "",
            name: "",
            role: "consultantAdmin",
            isActive: true,
          },
        }),
        true,
      );
      assert.strictEqual(
        isConsultant({
          session: {
            id: "u2",
            email: "",
            name: "",
            role: "consultantAgent",
            isActive: true,
          },
        }),
        true,
      );
    });
    it("returns false for fulfilment, superAdmin, and pending", () => {
      assert.strictEqual(
        isConsultant({
          session: {
            id: "u3",
            email: "",
            name: "",
            role: "fulfilment",
            isActive: true,
          },
        }),
        false,
      );
      assert.strictEqual(
        isConsultant({
          session: {
            id: "u4",
            email: "",
            name: "",
            role: "superAdmin",
            isActive: true,
          },
        }),
        false,
      );
      assert.strictEqual(
        isConsultant({
          session: {
            id: "u5",
            email: "",
            name: "",
            role: "pending",
            isActive: true,
          },
        }),
        false,
      );
    });
  });

  describe("isFulfilment", () => {
    it("returns true for fulfilment and superAdmin", () => {
      assert.strictEqual(
        isFulfilment({
          session: {
            id: "u1",
            email: "",
            name: "",
            role: "fulfilment",
            isActive: true,
          },
        }),
        true,
      );
      assert.strictEqual(
        isFulfilment({
          session: {
            id: "u2",
            email: "",
            name: "",
            role: "superAdmin",
            isActive: true,
          },
        }),
        true,
      );
    });
    it("returns false for consultant roles and pending", () => {
      assert.strictEqual(
        isFulfilment({
          session: {
            id: "u3",
            email: "",
            name: "",
            role: "consultantAgent",
            isActive: true,
          },
        }),
        false,
      );
      assert.strictEqual(
        isFulfilment({
          session: {
            id: "u4",
            email: "",
            name: "",
            role: "pending",
            isActive: true,
          },
        }),
        false,
      );
    });
  });

  describe("filterByTenant", () => {
    it("returns true for fulfilment (no filter)", () => {
      const result = filterByTenant({
        session: {
          id: "u1",
          email: "",
          name: "",
          role: "fulfilment",
          isActive: true,
        },
      });
      assert.strictEqual(result, true);
    });
    it("returns true for superAdmin (no filter)", () => {
      const result = filterByTenant({
        session: {
          id: "u2",
          email: "",
          name: "",
          role: "superAdmin",
          isActive: true,
        },
      });
      assert.strictEqual(result, true);
    });
    it("returns tenant filter for consultant with tenantId", () => {
      const result = filterByTenant({
        session: {
          id: "u3",
          email: "",
          name: "",
          role: "consultantAgent",
          tenantId: "tenant-a",
          isActive: true,
        },
      });
      assert.deepStrictEqual(result, {
        tenant: { id: { equals: "tenant-a" } },
      });
    });
    it("returns false when consultant has no tenantId", () => {
      const result = filterByTenant({
        session: {
          id: "u4",
          email: "",
          name: "",
          role: "consultantAgent",
          isActive: true,
        },
      });
      assert.strictEqual(result, false);
    });
    it("returns false for pending (no tenant)", () => {
      const result = filterByTenant({
        session: {
          id: "u5",
          email: "",
          name: "",
          role: "pending",
          isActive: true,
        },
      });
      assert.strictEqual(result, false);
    });
  });

  describe("canUpdateLoanStatus", () => {
    it("returns true for fulfilment", () => {
      assert.strictEqual(
        canUpdateLoanStatus({
          session: {
            id: "u1",
            email: "",
            name: "",
            role: "fulfilment",
            isActive: true,
          },
        }),
        true,
      );
    });
    it("returns false for consultant", () => {
      assert.strictEqual(
        canUpdateLoanStatus({
          session: {
            id: "u2",
            email: "",
            name: "",
            role: "consultantAgent",
            isActive: true,
          },
        }),
        false,
      );
    });
  });
});
