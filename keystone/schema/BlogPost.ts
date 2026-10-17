/**
 * BlogPost - articles migrated from WordPress.
 *
 * Content is copied unchanged. publishedAt and modifiedAt are the original WordPress
 * dates, so they are never auto-set and db.updatedAt is not used (the import
 * would overwrite it).
 * Not tenant-scoped. Public reads see published posts only; superAdmin writes.
 */

import { list } from "@keystone-6/core";
import {
  integer,
  json,
  relationship,
  select,
  text,
  timestamp,
} from "@keystone-6/core/fields";
import { isSuperAdmin, isPublishedOrSuperAdmin } from "../access/rules";
import { revalidateBlogHook } from "../hooks/revalidateBlog";

export const BlogPost = list({
  access: {
    operation: {
      query: () => true,
      create: ({ session }) => isSuperAdmin(session),
      update: ({ session }) => isSuperAdmin(session),
      delete: ({ session }) => isSuperAdmin(session),
    },
    filter: {
      query: isPublishedOrSuperAdmin,
    },
  },
  fields: {
    postId: integer({
      isIndexed: "unique",
      validation: { isRequired: true },
      ui: { description: "Original WordPress post ID. The import upserts on this." },
    }),
    slug: text({
      isIndexed: "unique",
      validation: { isRequired: true },
    }),
    title: text({ validation: { isRequired: true } }),
    status: select({
      options: [
        { label: "Draft", value: "draft" },
        { label: "Published", value: "published" },
      ],
      defaultValue: "draft",
      validation: { isRequired: true },
    }),
    publishedAt: timestamp({
      validation: { isRequired: true },
      ui: { description: "Original WordPress publish date. Not auto-set." },
    }),
    modifiedAt: timestamp({
      validation: { isRequired: true },
      ui: { description: "Original WordPress updated date. Not auto-set." },
    }),
    authorName: text({
      ui: { description: "Rendered as plain text. The author email is not stored." },
    }),
    excerpt: text({ ui: { displayMode: "textarea" } }),
    contentHtml: text({
      db: { nativeType: "Text" },
      ui: { displayMode: "textarea" },
    }),
    headings: json({ ui: { description: "[{level, text, id}]" } }),
    faqs: json({ ui: { description: "[{order, question, answer}]" } }),
    primaryCategory: relationship({
      ref: "BlogCategory.primaryPosts",
      many: false,
    }),
    categories: relationship({
      ref: "BlogCategory.posts",
      many: true,
    }),
    tags: json({ ui: { description: "string[]" } }),
    featuredImageUrl: text(),
    featuredImageAlt: text(),
    featuredImageWidth: integer(),
    featuredImageHeight: integer(),
    metaTitle: text(),
    metaDescription: text({
      ui: { description: "Falls back to excerpt when empty (set at import)." },
    }),
    focusKeywords: json({ ui: { description: "string[]" } }),
    wordCount: integer(),
    readingTimeMinutes: integer(),
  },
  hooks: {
    afterOperation: {
      create: async (args) => revalidateBlogHook.afterOperation(args),
      update: async (args) => revalidateBlogHook.afterOperation(args),
      delete: async (args) => revalidateBlogHook.afterOperation(args),
    },
  },
  ui: {
    labelField: "title",
    listView: {
      initialColumns: ["title", "status", "publishedAt"],
    },
  },
  graphql: {
    plural: "BlogPosts",
  },
});
