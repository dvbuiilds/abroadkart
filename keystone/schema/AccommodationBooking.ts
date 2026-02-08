/**
 * AccommodationBooking - tenant-scoped.
 */

import { list } from "@keystone-6/core";
import {
  text,
  relationship,
  checkbox,
  timestamp,
  select,
  integer,
} from "@keystone-6/core/fields";
import { isAuthenticated, isConsultant, filterByTenant } from "../access/rules";
import { autoSetTenantHook } from "../hooks/autoSetTenant";
import { afterOperationWithCache } from "../hooks/cacheInvalidation";

export const AccommodationBooking = list({
  access: {
    operation: {
      query: ({ session }) => isAuthenticated(session),
      create: ({ session }) => isConsultant({ session }),
      update: ({ session }) => isAuthenticated(session),
      delete: () => false,
    },
    filter: {
      query: filterByTenant,
      update: filterByTenant,
    },
  },
  fields: {
    tenant: relationship({
      ref: "Consultant.accommodations",
      many: false,
    }),
    student: relationship({
      ref: "Student.accommodations",
      many: false,
    }),
    city: text({ validation: { isRequired: true } }),
    accommodationType: select({
      options: [
        { label: "University Dorm", value: "universityDorm" },
        { label: "Shared Apartment", value: "sharedApartment" },
        { label: "Private Studio", value: "privateStudio" },
        { label: "Homestay", value: "homestay" },
      ],
      validation: { isRequired: true },
    }),
    address: text(),
    monthlyRent: integer(),
    currency: text({ defaultValue: "USD" }),
    checkInDate: timestamp(),
    checkOutDate: timestamp(),
    status: select({
      options: [
        { label: "Inquiry", value: "inquiry" },
        { label: "Booked", value: "booked" },
        { label: "Confirmed", value: "confirmed" },
        { label: "Occupied", value: "occupied" },
        { label: "Completed", value: "completed" },
        { label: "Cancelled", value: "cancelled" },
      ],
      defaultValue: "inquiry",
    }),
    landlordName: text(),
    landlordContact: text(),
    isDeleted: checkbox({ defaultValue: false }),
    createdAt: timestamp({ defaultValue: { kind: "now" } }),
    updatedAt: timestamp({ db: { updatedAt: true } }),
  },
  hooks: {
    resolveInput: autoSetTenantHook("create"),
    afterOperation: afterOperationWithCache("accommodationBookings"),
  },
});
