import { z } from "zod";

/**
 * Shared by the lead form (client) and POST /api/blog-leads (server).
 */

const emailField = z
  .string()
  .trim()
  .min(1, "Email is required")
  .max(254, "Email is too long")
  .email("Enter a valid email address");

const phoneField = z
  .string()
  .trim()
  .max(20)
  .regex(/^[+\d\s()-]*$/, "Enter a valid phone number")
  .optional();

export const blogLeadSchema = z.object({
  email: emailField,
  name: z.string().trim().max(120).optional(),
  phone: phoneField,
  message: z.string().trim().max(2000).optional(),
});

/**
 * What the client posts: the form fields plus where the lead came from. The
 * `website` honeypot is always blank for a real person.
 */
export const blogLeadPayloadSchema = blogLeadSchema.extend({
  sourceSlug: z.string().max(200).optional(),
  sourceUrl: z.string().url().max(500).optional(),
  utmSource: z.string().max(100).optional(),
  utmMedium: z.string().max(100).optional(),
  utmCampaign: z.string().max(100).optional(),
  website: z.string().max(200).optional(),
});

export type BlogLeadInput = z.infer<typeof blogLeadSchema>;
export type BlogLeadPayload = z.infer<typeof blogLeadPayloadSchema>;
