/**
 * BlogCategory - WordPress categories, imported from the legacy blog.
 * Not tenant-scoped. Public read, superAdmin write.
 */

import { list } from "@keystone-6/core";
import { relationship, text } from "@keystone-6/core/fields";
import { isSuperAdmin } from "../access/rules";
import { revalidateBlogHook } from "../hooks/revalidateBlog";

export const BlogCategory = list({
  access: {
    operation: {
      query: () => true,
      create: ({ session }) => isSuperAdmin(session),
      update: ({ session }) => isSuperAdmin(session),
      delete: ({ session }) => isSuperAdmin(session),
    },
  },
  fields: {
    name: text({ validation: { isRequired: true } }),
    slug: text({
      isIndexed: "unique",
      validation: { isRequired: true },
    }),
    description: text({ ui: { displayMode: "textarea" } }),
    posts: relationship({
      ref: "BlogPost.categories",
      many: true,
    }),
    primaryPosts: relationship({
      ref: "BlogPost.primaryCategory",
      many: true,
    }),
  },
  hooks: {
    afterOperation: {
      create: async (args) => revalidateBlogHook.afterOperation(args),
      update: async (args) => revalidateBlogHook.afterOperation(args),
      delete: async (args) => revalidateBlogHook.afterOperation(args),
    },
  },
  ui: {
    labelField: "name",
  },
  graphql: {
    plural: "BlogCategories",
  },
});
