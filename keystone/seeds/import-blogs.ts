/**
 * Imports the WordPress export in ../output into BlogCategory / BlogPost and writes
 * the legacy redirect rules for the Next.js app.
 *
 * Run (from keystone/):  yarn import:blogs [--dry-run] [--skip-images] [--verify] [--redirects-only]
 *   --dry-run         map and report only; writes nothing (no DB, no R2, no redirects file)
 *   --skip-images     do not upload featured images to the public R2 bucket
 *   --verify          compare the database with the export and exit non-zero on any difference
 *   --redirects-only  generate and write redirects only (no DB, no R2); useful before full import
 *
 * Safe to run repeatedly: categories upsert on slug, posts on postId.
 */

import { existsSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { S3Client, HeadObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";
import {
  toBlogPostInput,
  buildRedirectMap,
  buildLegacyRedirects,
} from "./blog-import";
import type {
  BlogPostInput,
  ImageManifestRow,
  WpCategory,
  WpPost,
  WpRedirect,
} from "./blog-import/types";

const ROOT = path.join(__dirname, "..", "..");
const OUTPUT = path.join(ROOT, "output");
const REDIRECTS_OUT = path.join(ROOT, "src", "lib", "blog", "legacy-redirects.json");

const args = new Set(process.argv.slice(2));
const DRY_RUN = args.has("--dry-run");
const SKIP_IMAGES = args.has("--skip-images");
const VERIFY = args.has("--verify");
const REDIRECTS_ONLY = args.has("--redirects-only");

const load = <T>(file: string): T =>
  JSON.parse(readFileSync(path.join(OUTPUT, file), "utf8")) as T;

const POST_FIELDS = [
  "postId slug title status publishedAt modifiedAt authorName excerpt contentHtml",
  "headings faqs tags featuredImageUrl featuredImageAlt featuredImageWidth featuredImageHeight",
  "metaTitle metaDescription focusKeywords wordCount readingTimeMinutes",
  "primaryCategory { slug } categories(orderBy: { slug: asc }) { slug }",
].join(" ");

/** Scalar part of a post, in a form that compares equal between the DB and the mapper. */
function comparable(p: Record<string, unknown>) {
  const { primaryCategorySlug, categorySlugs, ...rest } = p as Record<string, unknown> & {
    primaryCategorySlug?: string | null;
    categorySlugs?: string[];
  };
  void primaryCategorySlug;
  void categorySlugs;
  const out: Record<string, unknown> = { ...rest };
  delete out.primaryCategory;
  delete out.categories;
  for (const k of ["publishedAt", "modifiedAt"]) {
    out[k] = new Date(out[k] as string | Date).toISOString();
  }
  for (const k of ["featuredImageWidth", "featuredImageHeight"]) out[k] = out[k] ?? null;
  return JSON.stringify(out, Object.keys(out).sort());
}

function sameCategories(
  existing: { primaryCategory: { slug: string } | null; categories: { slug: string }[] },
  input: BlogPostInput,
) {
  return (
    (existing.primaryCategory?.slug ?? null) === input.primaryCategorySlug &&
    JSON.stringify(existing.categories.map((c) => c.slug).sort()) ===
      JSON.stringify([...input.categorySlugs].sort())
  );
}

async function uploadImages(posts: WpPost[], manifest: ImageManifestRow[]) {
  const { R2_ENDPOINT, R2_PUBLIC_BUCKET_NAME, R2_PUBLIC_ACCESS_KEY_ID, R2_PUBLIC_SECRET_ACCESS_KEY } =
    process.env;
  if (!R2_ENDPOINT || !R2_PUBLIC_BUCKET_NAME || !R2_PUBLIC_ACCESS_KEY_ID || !R2_PUBLIC_SECRET_ACCESS_KEY) {
    throw new Error(
      "Missing R2_ENDPOINT / R2_PUBLIC_BUCKET_NAME / R2_PUBLIC_ACCESS_KEY_ID / R2_PUBLIC_SECRET_ACCESS_KEY (or pass --skip-images)",
    );
  }
  const s3 = new S3Client({
    region: "auto",
    endpoint: R2_ENDPOINT,
    credentials: { accessKeyId: R2_PUBLIC_ACCESS_KEY_ID, secretAccessKey: R2_PUBLIC_SECRET_ACCESS_KEY },
  });
  const published = new Set(posts.filter((p) => p.status === "published").map((p) => p.slug));
  let uploaded = 0;
  let skipped = 0;

  for (const row of manifest.filter((r) => published.has(r.slug))) {
    const key = `blog/${row.slug}${path.extname(row.stagedPath)}`;
    try {
      await s3.send(new HeadObjectCommand({ Bucket: R2_PUBLIC_BUCKET_NAME, Key: key }));
      skipped++;
      continue;
    } catch (err) {
      const status = (err as { $metadata?: { httpStatusCode?: number } }).$metadata?.httpStatusCode;
      if (status !== 404) throw err;
    }
    await s3.send(
      new PutObjectCommand({
        Bucket: R2_PUBLIC_BUCKET_NAME,
        Key: key,
        Body: readFileSync(path.join(ROOT, row.stagedPath)),
        ContentType: row.mimeType,
        CacheControl: "public, max-age=31536000, immutable",
      }),
    );
    uploaded++;
  }
  return { uploaded, skipped };
}

async function main() {
  const posts = load<WpPost[]>("blogs.json");
  const categories = load<WpCategory[]>("categories.json");
  const redirects = load<WpRedirect[]>("redirects.json");
  const manifest = load<ImageManifestRow[]>("images-manifest.json");
  const expected = load<{ summary: Record<string, number> }>("validation-report.json").summary;

  const published = posts.filter((p) => p.status === "published");
  if (
    posts.length !== expected.blogs ||
    categories.length !== expected.categories ||
    redirects.length !== expected.redirects ||
    manifest.length !== expected.images
  ) {
    throw new Error(`Export counts do not match validation-report.json: ${JSON.stringify(expected)}`);
  }

  const cdnUrl = (process.env.BLOG_CDN_URL ?? "https://cdn.abroadkart.com").replace(/\/$/, "");
  const ctx = {
    cdnUrl,
    slugSet: new Set(published.map((p) => p.slug)),
    redirectMap: buildRedirectMap(redirects),
  };

  const mapped = posts.map((p) => toBlogPostInput(p, ctx));
  const unknownLinks = mapped.flatMap((m, i) =>
    m.unknownLinks.map((href) => `${posts[i].slug}: ${href}`),
  );
  const rules = buildLegacyRedirects(posts, redirects, manifest, cdnUrl);

  const report: Record<string, unknown> = {
    mode: DRY_RUN ? "dry-run" : REDIRECTS_ONLY ? "redirects-only" : VERIFY ? "verify" : "import",
    posts: posts.length,
    published: published.length,
    drafts: posts.length - published.length,
    categories: categories.length,
    redirectRules: rules.length,
    unknownInternalLinks: unknownLinks,
  };

  if (DRY_RUN) {
    console.log(JSON.stringify(report, null, 2));
    return;
  }

  // Write redirects and exit if --redirects-only
  if (REDIRECTS_ONLY) {
    const json = JSON.stringify(rules, null, 2) + "\n";
    if (!existsSync(REDIRECTS_OUT) || readFileSync(REDIRECTS_OUT, "utf8") !== json) {
      writeFileSync(REDIRECTS_OUT, json);
      report.redirectsFile = "written";
    } else report.redirectsFile = "unchanged";
    console.log(JSON.stringify({ ...report }, null, 2));
    return;
  }

  // Loaded late so --dry-run works without a database or generated Prisma client.
  const { keystoneContext } = await import("../context");
  const db = keystoneContext.sudo();

  if (VERIFY) {
    const rows = (await db.query.BlogPost.findMany({ query: POST_FIELDS })) as Record<string, unknown>[];
    const byId = new Map(rows.map((r) => [r.postId as number, r]));
    const problems: string[] = [];
    for (const { input } of mapped) {
      const row = byId.get(input.postId);
      if (!row) {
        problems.push(`${input.slug}: missing`);
        continue;
      }
      if (comparable(row) !== comparable(input as unknown as Record<string, unknown>)) {
        problems.push(`${input.slug}: fields differ`);
      }
      if (!sameCategories(row as never, input)) problems.push(`${input.slug}: categories differ`);
    }
    if (rows.length !== posts.length) problems.push(`row count ${rows.length} != ${posts.length}`);
    console.log(JSON.stringify({ ...report, problems }, null, 2));
    if (problems.length) process.exitCode = 1;
    return;
  }

  // 1. Categories
  const catIds = new Map<string, string>();
  const cat = { created: 0, updated: 0, unchanged: 0 };
  for (const c of categories) {
    const data = { name: c.name, slug: c.slug, description: c.description ?? "" };
    const [found] = (await db.query.BlogCategory.findMany({
      where: { slug: { equals: c.slug } },
      query: "id name description",
    })) as { id: string; name: string; description: string }[];
    if (!found) {
      const made = await db.query.BlogCategory.createOne({ data, query: "id" });
      catIds.set(c.slug, made.id as string);
      cat.created++;
    } else {
      catIds.set(c.slug, found.id);
      if (found.name !== data.name || found.description !== data.description) {
        await db.query.BlogCategory.updateOne({ where: { id: found.id }, data, query: "id" });
        cat.updated++;
      } else cat.unchanged++;
    }
  }

  // 2. Images (the DB import does not depend on them: URLs are deterministic)
  if (SKIP_IMAGES) report.images = "skipped (--skip-images)";
  else report.images = await uploadImages(posts, manifest);

  // 3. Posts
  const counts = { created: 0, updated: 0, unchanged: 0 };
  for (const { input } of mapped) {
    const { primaryCategorySlug, categorySlugs, ...scalars } = input;
    const relations = {
      primaryCategory: primaryCategorySlug
        ? { connect: { id: catIds.get(primaryCategorySlug)! } }
        : undefined,
      categories: { set: categorySlugs.map((s) => ({ id: catIds.get(s)! })) },
    };
    const [existing] = (await db.query.BlogPost.findMany({
      where: { postId: { equals: input.postId } },
      query: `id ${POST_FIELDS}`,
    })) as (Record<string, unknown> & { id: string })[];

    if (!existing) {
      await db.query.BlogPost.createOne({
        data: { ...scalars, ...relations, categories: { connect: relations.categories.set } },
        query: "id",
      });
      counts.created++;
    } else if (
      comparable(existing) === comparable(input as unknown as Record<string, unknown>) &&
      sameCategories(existing as never, input)
    ) {
      counts.unchanged++;
    } else {
      await db.query.BlogPost.updateOne({
        where: { id: existing.id },
        data: { ...scalars, ...relations },
        query: "id",
      });
      counts.updated++;
    }
  }

  // 4. Redirect rules for next.config.ts (stable output: no diff on re-run)
  const json = JSON.stringify(rules, null, 2) + "\n";
  if (!existsSync(REDIRECTS_OUT) || readFileSync(REDIRECTS_OUT, "utf8") !== json) {
    writeFileSync(REDIRECTS_OUT, json);
    report.redirectsFile = "written";
  } else report.redirectsFile = "unchanged";

  console.log(JSON.stringify({ ...report, categoriesResult: cat, postsResult: counts }, null, 2));
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(() => setTimeout(() => process.exit(), 50));
