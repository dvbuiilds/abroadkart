# AbroadKart Blog Migration: Plan, Decisions, Phases & Tasks

> On approval, the first step is to save this document to `crm_docs/BLOG_MIGRATION_PLAN.md`.
> Status: **Final**. Decisions are locked using the stakeholder answers from 2026-10-11.
> Amended 2026-10-17: legacy URL redirects are removed. See D3.

## 1. Context

`abroadkart.com` runs on WordPress today. We exported its 111 posts to `output/`:

| File | Contents |
|---|---|
| `blogs.json` | 111 posts: 110 published and 1 draft |
| `categories.json` | 11 categories |
| `authors.json` | 2 authors |
| `redirects.json` | 9 legacy redirects, used only to rewrite internal links |
| `images-manifest.json` and `images/` | 110 featured images, 7.7 MB |

These posts carry the site's organic SEO. In about one month, WordPress will be switched off. From then on, the Next.js app (currently `app.abroadkart.com`) will serve everything on `abroadkart.com`, with blogs at **`abroadkart.com/blogs/<slug>`**.

**Goals:**
- Keep the content **byte-for-byte the same**: title, headings, body, FAQs, and the publish and modified dates. Only the template changes.
- The new template must look elegant and modern, be fully crawlable without JS, and generate meta, OG and JSON-LD from the content.
- No legacy URL redirects. Old WordPress URLs return 404 after cutover (decided 2026-10-17).
- Collect blog leads into Keystone.
- Use **test-driven development** throughout: write tests first, then code.
- **Prerequisite:** stop bypassing build errors (`ignoreBuildErrors`, `ignoreDuringBuilds`) and fix what they hide **before** any blog work starts.

### Facts verified from the export
- **Post fields:** `wpPostId, slug, title, status, publishedAt, updatedAt, canonicalUrl, author{name,email}, excerpt, contentHtml, headings[{level,text,id}], faqs[{order,question,answer}], featuredImage{width,height,alt,stagedPath,…}, primaryCategory, categories[], tags[], seo{metaTitle,metaDescription,focusKeywords,seoScore}, redirectFrom[], stats{wordCount,readingTimeMinutes}`.
- **Body HTML** uses `p, li, strong, h2–h5, ul, ol, table, a, em, br, div` and one `article`. It has no `<img>`, no `<script>`, no `<h1>` and no inline styles. All 2,482 heading ids are present and unique.
- **Internal links:** 89 relative links of the form `/<slug>/`, some pointing at slugs that have since been redirected. There are also 110 external links.
- **One post, `johns-hopkins-university`, contains leftover ChatGPT DOM wrappers.** These are `div`s carrying Tailwind classes. The text inside is real content.
- **Metadata gaps:**
  - 49 posts have no hand-written `metaDescription`. Their `excerpt` is derived from the intro, so it is still original content.
  - 82 posts have FAQs.
  - Featured images are about 840px wide. They stay as they are.
- **Current code state:**
  - `src/middleware.ts` already makes `/blogs*` public.
  - The `(public)` route group has a Navbar and Footer.
  - `html-react-parser` is installed.
  - `public/robots.txt` and `public/sitemap.xml` are static and point at `app.abroadkart.com`.
  - The root layout's title is "Study Abroad CRM".
  - `src/components/BlogTemplates/Template1/*` is legacy code from a Mongo-based blog. Its data shape is wrong, its TOC builds `href` without `#`, and `BlogCard` nests a `<button>` inside a `<Link>`.
- **Build health:** `tsc --noEmit` reports **18 errors in 3 files** (`StudentTestScoresSection.tsx`, `StudentEditSheet.tsx`, `lib/students/helpers.ts`). `eslint src` reports **48 errors in 13 files**: 42 `no-unused-vars`, 4 `no-explicit-any`, 1 `jsx-key` and 1 `no-unused-expressions`.

---

## 2. Final decisions

### D1. Database: same Postgres instance, as Keystone lists
- **No separate instance.** The data is 111 rows (about 3 MB). Pages are statically generated and revalidated (ISR), so public traffic doesn't query Postgres on each request. A second instance would only add cost, backups and credentials.
- **Keystone is the CMS.** It provides the GraphQL API, the admin UI at `/admin`, migrations through the existing `prisma db push` flow, and hooks. We are not adopting a separate headless CMS.
- **Blog lists are not tenant-scoped.** There is no `tenant` field, no `filterByTenant` filter and no `autoSetTenantHook`.
- **Next.js reads through one module,** `src/lib/blog/repository.ts`. It uses the existing `src/lib/graphql-client.ts` against `KEYSTONE_INTERNAL_URL`, with `fetch` cache tags.

### D2. Data model
The models are written in Keystone `list()` style, matching `keystone/schema/Interaction.ts`. `BlogAuthor` and `BlogTag` lists are not needed: the author is shown as plain text, and tags are only metadata.

**`BlogPost`**

| Field | Type | Notes |
|---|---|---|
| `postId` | integer, unique, required | Was `wpPostId`. The import upserts on this key. |
| `slug` | text, unique, required | Unchanged from WordPress. |
| `title` | text, required | |
| `status` | select `draft` \| `published` | Post 21126 stays `draft`. |
| `publishedAt` | timestamp, required | The original WordPress date. **Never auto-set.** |
| `modifiedAt` | timestamp, required | The original WordPress `updatedAt`. We do **not** use Keystone `db.updatedAt`, because the import would overwrite it. |
| `authorName` | text | Rendered as plain text only. The email is **not stored**. |
| `excerpt` | text (multiline) | |
| `contentHtml` | text (multiline, `db.nativeType: Text`) | Sanitized: attributes are cleaned but the text is unchanged (see §5). |
| `headings` | json | `[{level,text,id}]` |
| `faqs` | json | `[{order,question,answer}]` |
| `primaryCategory` | relationship → `BlogCategory` | |
| `categories` | relationship many → `BlogCategory` | |
| `tags` | json (string[]) | |
| `featuredImageUrl`, `featuredImageAlt`, `featuredImageWidth`, `featuredImageHeight` | text/int | The URL points to the public CDN. |
| `metaTitle`, `metaDescription` | text | `metaDescription` falls back to `excerpt` when it is empty, and is computed at import. |
| `focusKeywords` | json (string[]) | |
| `wordCount`, `readingTimeMinutes` | integer | |

**`BlogCategory`:** `name`, `slug` (unique) and `description`, plus a back-relationship to posts.

**`BlogLead`** is new and collects the blog form submissions:

| Field | Type | Notes |
|---|---|---|
| `email` | text, **required**, validated | Taken from the submitted form payload. |
| `name` | text, optional | |
| `phone` | text, optional | |
| `message` | text, optional | |
| `sourceSlug`, `sourceUrl` | text | The post where the lead converted. |
| `utmSource`, `utmMedium`, `utmCampaign` | text | Captured from the URL. |
| `status` | select `new` \| `contacted` \| `closed` | Default `new`. |
| `createdAt` | timestamp, `defaultValue: now` | |

**Access rules:**
- `BlogPost` and `BlogCategory`:
  - **Query:** anyone. The filter for non-superAdmins is `{ status: { equals: "published" } }`.
  - **Create, update and delete:** superAdmin only.
- `BlogLead`:
  - **Query, update and delete:** superAdmin only.
  - **Create:** allowed only when `context.req.headers['x-internal-key'] === process.env.LEADS_INTERNAL_KEY`. Only the Next.js server can therefore create leads, and the public GraphQL endpoint can't be used to spam the table.

### D3. URLs and redirects
**Routes:**
- `/blogs` is the index. Pagination uses `/blogs?page=N`, and each page's canonical points to itself.
- `/blogs/category/<slug>` is the category archive.
- `/blogs/<slug>` is the post. It has no trailing slash, which is the Next.js default.
- There are no tag or author archive pages.

**Legacy URLs are not redirected** (decided 2026-10-17).
- The WordPress URLs (`/<slug>`, `/<slug>/`, `/category/*`, `/author/*`, `/tag/*`, `/feed`, `/blog/*`, `/wp-content/uploads/*`) return 404 after cutover.
- `next.config.ts` has no `redirects()` function, and no `src/lib/blog/legacy-redirects.json` is generated.
- Links inside article bodies still point at `/blogs/<slug>`. The import rewrites them using the 9 entries in `redirects.json`, so they resolve in one step without an HTTP redirect.
- **Host redirect:** `app.abroadkart.com/*` → `abroadkart.com/*`, set up as a Cloudflare redirect rule (§8).

### D4. Images
- Featured images move to a **separate public R2 bucket** in the same Cloudflare account, served from `cdn.abroadkart.com/blog/<slug>.<ext>`. Setup steps are in §7.
- They are **not** stored in the private student-document bucket.
- Their current dimensions are kept.

### D5. Rendering and crawlability
- **Server Components only** for the article body, TOC and FAQ. The complete HTML is in the first response, there's no client-side data fetching, and React Query isn't used on these routes.
- **Static generation with revalidation:**
  - `generateStaticParams()` calls `getAllSlugs()`. If Keystone is unreachable at build time, it catches the error and returns `[]`.
  - `dynamicParams = true` and `revalidate = 3600`.
  - On-demand updates come from `revalidateTag('blog:<slug>' | 'blog:list')`, which Keystone's `afterOperation` hook triggers through `POST /api/revalidate` with `REVALIDATE_SECRET`.
- **FAQ markup:** native `<details>/<summary>` instead of Radix Accordion. Radix unmounts closed panels, which would hide the answers from crawlers.
- **Robots and sitemap:** `src/app/robots.ts` and `src/app/sitemap.ts` replace the static files.
  - The sitemap covers static public pages, `/blogs`, categories, and every published post with `lastModified = modifiedAt`.
  - The robots rules disallow `/api/`, `/admin`, `/consultant`, `/fulfilment`, `/dashboard`, `/ba`, `/sign-in`, `/sign-up` and `/forgot-password`, and point to `Sitemap: https://abroadkart.com/sitemap.xml`.
- **Metadata defaults:** `(public)/layout.tsx` sets `metadataBase = getPublicAppUrl()`, the title template `%s | AbroadKart`, and a default description. This stops public pages inheriting "Study Abroad CRM".

### D6. SEO metadata, derived from content
`src/lib/blog/seo.ts` exports `buildPostMetadata(post)` and `buildPostJsonLd(post)`. Both are pure functions, so they are easy to test.

**Metadata fields:**
- **title:** `metaTitle || title`.
- **description:** `metaDescription || excerpt`, cut to 160 characters or fewer at a word boundary, with an ellipsis.
- **alternates.canonical:** `/blogs/<slug>`.
- **openGraph:**
  - `type: "article"`, `url`, `siteName: "AbroadKart"`, `locale: "en_IN"`;
  - `publishedTime`, `modifiedTime`, `section` (the primary category), `tags`;
  - `images: [{url, width, height, alt}]`.
- **twitter:** `summary_large_image`.
- **robots:** `index, follow, max-image-preview:large` for published posts, and `noindex` for drafts.

**JSON-LD:** one `<script type="application/ld+json">` holds an `@graph` with:
- `BlogPosting`: `headline`, `description`, `image`, `datePublished`, `dateModified`, `author: {"@type":"Person","name"}` (name only, no URL), `publisher` (Organization with a logo), `mainEntityOfPage`, `wordCount`, `keywords` and `articleSection`.
- `BreadcrumbList`.
- `FAQPage`, when there are FAQs. Its text must match the visible FAQ text exactly.

### D7. Template UI: elegant, modern, readable
**Design language:** editorial and calm, with brand-color accents. It uses the existing shadcn/Tailwind tokens in `globals.css` and lucide icons.
- **Fonts** load through `next/font`: a variable serif display face for headlines (e.g. *Fraunces*) and *Inter* for body and UI.
- **Typography** comes from `@tailwindcss/typography`, customized: 18px body, line-height 1.75, 68ch measure, and brand-colored list markers and links with underline offset.

**Post page, top to bottom:**
1. **Reading progress bar:** a thin brand-gradient bar fixed under the Navbar. This is the only client island besides the TOC highlighter.
2. **Hero band:** a soft tinted gradient background containing:
   - breadcrumbs (Home › Blogs › Category);
   - a category chip as an eyebrow;
   - a large serif **H1** with balanced text wrapping;
   - a meta row: `authorName` (plain text) · `Published <date>` · `Updated <date>` (only if different) · `N min read`, using `<time dateTime>`.
3. **Featured image:** `rounded-2xl`, a soft shadow, `next/image` with `priority`, the stored width and height (so there's no layout shift), and the alt text.
4. **Body grid:** at 1024px and up there are 3 columns:
   - **Left: a sticky TOC card.** H2 entries with nested H3s, a vertical progress rail, and the active section highlighted by IntersectionObserver.
   - **Centre: the article.**
   - **Right: a sticky lead-form card and a share card.** Share options are Copy link, WhatsApp, LinkedIn and X.
5. **Mobile and tablet:**
   - a "On this page" collapsible TOC card above the body, using `<details>`;
   - the lead form appears after the FAQ;
   - a share row sits under the hero.
6. **Article body styling:**
   - Each H2 has a subtle top divider and a hover `#` anchor link so readers can copy deep links.
   - Every heading has `scroll-margin-top` so it clears the sticky Navbar.
   - Tables sit in rounded, bordered, horizontally scrollable containers with a tinted header and zebra rows.
   - External links get a small ↗ icon and `rel="noopener noreferrer"`.
7. **FAQ section:** a heading reading "Frequently Asked Questions". Each item is a `<details>` card with a rotating `+` icon and a smooth open state (`prefers-reduced-motion` is respected). It stays crawlable.
8. **Lead CTA banner:** a full-width gradient card, "Planning to study abroad? Talk to a counsellor", which opens the same form.
9. **Related posts:** 3 cards from the same primary category, falling back to the latest posts. Cards have an image, category chip, title (clamped to 2 lines), date and reading time, and lift on hover.

**`/blogs` index:**
- a hero with a title and short intro;
- a **featured post** shown as a large horizontal card (the latest post);
- a horizontally scrollable row of **category chips** (plain links);
- a responsive card grid (1, 2 or 3 columns);
- numbered pagination links.

**Category page:** the same grid, with the category name and description in the hero.

**Accessibility:**
- semantic `article`, `nav[aria-label="Table of contents"]`, `aside` and `time` elements;
- AA contrast;
- visible focus rings;
- every image has alt text;
- one H1 per page.

**Old components:**
- `BreadcrumbsSection` from Template1 is reused after being restyled.
- `TableOfContent`, `BlogCard`, `Page.tsx` and `types.ts` are replaced by new components in `src/components/blog/`.
- Template1 is deleted at the end.

### D8. Lead form
- **Fields:** email (required), name, phone and message. A hidden **honeypot** field catches bots.
- **Validation:** a Zod schema in `src/lib/validations/blog-lead.ts`, shared by the client and the server.
- **Submission path:**
  1. `react-hook-form` posts to `POST /api/blog-leads`, a Next.js route handler.
  2. The handler validates with Zod, rejects requests where the honeypot is filled, and applies a simple per-IP rate limit (in-memory, 5 per 10 minutes).
  3. It then calls Keystone `createBlogLead` with the `x-internal-key` header.
  4. It responds `201 { ok: true, email }`.
- Leads appear in Keystone admin under **Blog Leads**.
- No tenant and no login are involved.

---

## 3. Phases and tasks
Every task follows **red → green → refactor**: write the failing test first, then the code.

### Phase 0: Build hygiene (**blocks everything else**)
1. Remove `typescript.ignoreBuildErrors` and `eslint.ignoreDuringBuilds` from `next.config.ts`.
2. Fix the 18 TypeScript errors:
   - TS2322 type mismatches in `StudentTestScoresSection.tsx` and `StudentEditSheet.tsx`;
   - a missing export (TS2305) in `src/lib/students/helpers.ts`.
3. Fix the 48 ESLint errors:
   - remove unused vars and imports;
   - replace the 4 `any`s with real types;
   - add the missing `key`;
   - fix the stray expression.
4. Align `eslint-config-next` with the installed `next` version (15.1.2 → 15.2.8).
5. Run `tsc --noEmit` in `keystone/` and fix anything found.
6. **Exit criteria:** `yarn build` passes with zero TS and lint errors, `cd keystone && yarn test` passes, and the CRM is smoke-tested manually.

### Phase 1: Test infrastructure
1. Next.js app:
   - add `vitest`, `@vitejs/plugin-react`, `jsdom`, `@testing-library/react` and `@testing-library/jest-dom`;
   - add a `vitest.config.ts` with the `@app` alias;
   - add a `"test": "vitest run"` script.
2. Add `@playwright/test` with `playwright.config.ts`. It runs against `next start`, and has a **JS-disabled project** for the crawlability tests.
3. Keystone: keep the existing `node --test` runner and add the new test files to the `test` script.
4. Add a `test` step to CI/Docker build if one exists. Otherwise document `yarn test && yarn build` as the pre-deploy gate.

### Phase 2: Schema and access (Keystone, test-driven)
**Write these tests first** in `keystone/__tests__/blog-access.test.ts`, in the style of `access.test.ts`:
- An anonymous query filter returns `{status: {equals: "published"}}`, and superAdmin gets `true`.
- Mutations on `BlogPost` and `BlogCategory` are denied for anonymous users and every non-superAdmin role.
- `BlogLead` create is denied without the header or with the wrong key, and allowed with the correct key. Query is superAdmin only.
- `BlogLead.email` validation rejects missing or malformed addresses.

**Then implement:**
- `keystone/schema/BlogPost.ts`, `BlogCategory.ts` and `BlogLead.ts`;
- the access helpers in `keystone/access/rules.ts`, such as `isPublishedOrSuperAdmin` and `hasInternalKey`;
- registration in `keystone/keystone.ts`;
- running `prisma db push`;
- adding `LEADS_INTERNAL_KEY` and `REVALIDATE_SECRET` to `.env.example` and `keystone/.env.example`.

### Phase 3: Import pipeline (test-driven)
The script is `keystone/seeds/import-blogs.ts`, and its pure helpers live in `keystone/seeds/blog-import/`.

**Write these tests first** in `keystone/__tests__/blog-import.test.ts`:
- `sanitizeContent(html)`:
  - **Visible text is preserved exactly.** Test it by comparing `textContent` before and after, for **all 111 posts**.
  - Heading ids are preserved.
  - `class` and `style` attributes are stripped, and `div` and `article` are unwrapped. Fixture: `johns-hopkins-university`.
  - The tag set is otherwise unchanged; for example, the `h5` stays.
- `rewriteInternalLinks(html, slugSet, redirectMap)`:
  - `/<slug>/` becomes `/blogs/<slug>`.
  - A redirected slug resolves to its final slug, e.g. `/ms-in-computer-science-usa/` → `/blogs/ms-in-computer-science-in-usa`.
  - Absolute `abroadkart.com` links are rewritten too.
  - External links are left untouched.
  - Unknown links are reported back to the caller.
- `toBlogPostInput(wpPost)`:
  - It maps `wpPostId` to `postId`.
  - The dates equal the source values exactly.
  - The author email is absent from the output.
  - `metaDescription` falls back to `excerpt`.
  - The draft keeps `status: draft`.
**Then implement** the helpers and the script. The script:
1. upserts categories;
2. uploads images to the public bucket with the S3 SDK, skipping files that already exist;
3. upserts posts by `postId`;
4. prints a report.

**Exit criteria:** running the script twice gives an identical database (idempotent), 0 unknown internal links, and 110 published posts plus 1 draft.

### Phase 4: Data access, SEO helpers and routing infrastructure (Next.js, test-driven)
**Write these tests first:**
- `src/lib/blog/__tests__/seo.test.ts`:
  - **Title:** uses the fallback when needed.
  - **Description:** the fallback and the 160-character word-boundary truncation work.
  - **Canonical and OG:** the canonical is absolute; the OG article times equal the post dates; the OG image has its width and height.
  - **Drafts:** they get `noindex`.
  - **JSON-LD:** the author has a name only (no URL or image); FAQPage appears only when FAQs exist and its text equals the source; BreadcrumbList has 3 items.
- `src/lib/blog/__tests__/toc.test.ts`: `buildToc(headings)` nests H3s under H2s and leaves out H4 and H5.
- `src/app/__tests__/robots-sitemap.test.ts`:
  - `robots()` disallows the private areas and points to the sitemap.
  - `sitemap()` includes published posts with `lastModified` and excludes the draft. The repository is mocked.
- `src/app/api/revalidate/__tests__/route.test.ts`: a bad secret returns 401, and a valid one calls `revalidateTag` with the right tags.

**Then implement:**
- `src/lib/blog/repository.ts`, `seo.ts`, `toc.ts` and `types.ts`;
- the `images.remotePatterns` entry for `cdn.abroadkart.com` in `next.config.ts` (no `redirects()`);
- `src/app/robots.ts` and `src/app/sitemap.ts`, then delete `public/robots.txt`, `public/sitemap.xml` and `src/app/api/update-sitemap/`;
- `src/app/api/revalidate/route.ts` and the Keystone `afterOperation` hook (`keystone/hooks/revalidateBlog.ts`);
- the `(public)/layout.tsx` metadata defaults.

### Phase 5: Template UI (test-driven)
**Write these tests first**, as component tests with Testing Library:
- `ArticleBody`:
  - It renders `contentHtml` with the same text.
  - Internal links become `next/link` pointing to `/blogs/...`.
  - External links get `rel` and the ↗ icon.
  - Tables are wrapped.
  - Heading ids are kept.
- `TableOfContents`: its anchors are `href="#<id>"`, nested to match `buildToc`, inside `nav[aria-label]`.
- `FaqSection`:
  - It renders `<details>`.
  - **All answers are in the DOM while collapsed.**
  - It isn't rendered when there are no FAQs.
- `PostMeta`:
  - The author is plain text, with no `<a>` or `<img>` in that element.
  - "Updated" is shown only when the dates differ.
  - It uses `<time dateTime>`.
- `BlogCard`: there's one link, no nested interactive elements, and the image has alt text.
- `LeadForm`:
  - It blocks submission without an email and shows an error for an invalid one.
  - It posts the payload including the email and shows a success state.
  - The honeypot field is hidden from users.
- `POST /api/blog-leads` route:
  - 400 on a missing email;
  - 201 on success, with a mocked Keystone call that carries the internal key;
  - a silent 200 that stores nothing when the honeypot is filled;
  - 429 when the rate limit is exceeded.

**Then implement** in `src/components/blog/`: `PostHero`, `PostMeta`, `FeaturedImage`, `TableOfContents` (server-rendered, plus a `TocHighlighter` client island), `ReadingProgress` (client), `ArticleBody`, `FaqSection`, `ShareBar`, `LeadForm` (client), `LeadCtaBanner`, `RelatedPosts`, `BlogCard`, `CategoryChips` and `Pagination`.

**Routes:**
- `src/app/(public)/blogs/page.tsx`
- `src/app/(public)/blogs/[slug]/page.tsx` (with `generateMetadata`, `generateStaticParams` and JSON-LD)
- `src/app/(public)/blogs/category/[slug]/page.tsx`
- `not-found` handling for unknown and draft slugs.

**Dependencies:** `@tailwindcss/typography`, plus the fonts through `next/font`.

**Cleanup:** delete `src/components/BlogTemplates/` and the old `src/components/BlogCard.tsx`.

### Phase 6: End-to-end, SEO and performance verification (Playwright)
**Write the e2e specs:**
- **`crawlability.spec.ts`** (JS disabled):
  - For 3 representative posts (one with FAQs and tables, one without FAQs, and `johns-hopkins-university`), the response HTML contains: the single H1, the last paragraph of the body, every FAQ answer, the canonical, `og:title`, `og:image`, `article:published_time`, and parseable JSON-LD with `BlogPosting`.
- **`content-fidelity.spec.ts`:** for **all 110 published posts**:
  - the rendered article's text equals the text of the source `contentHtml`;
  - the H1 equals `title`;
  - the dates equal the source dates.
- **`legacy-urls.spec.ts`:**
  - Every legacy URL returns 404 with no redirect. Legacy URLs include the 110 root slugs (with and without a trailing slash), the 9 legacy slugs, `/category/*` and a sample of `/wp-content/uploads/*`.
  - The draft slug returns 404.
  - Each published post's `/blogs/<slug>` URL returns 200.
- **`lead-form.spec.ts`:** a submission creates a `BlogLead` in the test database and shows the success state.
- **`seo-files.spec.ts`:** `/robots.txt` and `/sitemap.xml` are valid, the sitemap has 110 posts and 11 categories, and it has no draft.

**Manual and tool checks:**
- Run Lighthouse (mobile) on 3 posts. Targets: SEO 100, Accessibility ≥ 95, LCP under 2.5s, CLS below 0.05.
- Run Google Rich Results Test and the Schema.org validator on the same 3 posts.
- Check the OG previews on opengraph.xyz, plus a WhatsApp link preview.

### Phase 7: Go-live (in about one month, when WordPress is switched off)
See §8 for the host migration checklist and §9 for analytics.

**Order:**
1. Before cutover: baseline in Google Search Console (§9).
2. Deploy to production on `app.abroadkart.com` and check everything there.
3. Cut over the host (§8).
4. Within the first hour, run `legacy-urls.spec.ts` against production and submit the sitemap in GSC.
5. Monitor for 2–6 weeks: watch the GSC **Pages** report (404s), track impressions against the baseline, and review 404s for pages that deserve new content. No redirects are added.
6. Keep the WordPress backup archived for at least 6 months.

---

## 4. Files to create or modify (summary)

| Area | Files |
|---|---|
| Phase 0 | `next.config.ts`, `src/components/consultant/students/form/StudentTestScoresSection.tsx`, `src/components/consultant/students/StudentEditSheet.tsx`, `src/lib/students/helpers.ts`, and the 13 files ESLint flags |
| Keystone | `keystone/schema/{BlogPost,BlogCategory,BlogLead}.ts`, `keystone/access/rules.ts`, `keystone/hooks/revalidateBlog.ts`, `keystone/keystone.ts`, `keystone/seeds/import-blogs.ts`, `keystone/seeds/blog-import/*`, `keystone/__tests__/{blog-access,blog-import}.test.ts`, `keystone/package.json` |
| Next lib | `src/lib/blog/{repository,seo,toc,types}.ts`, `src/lib/validations/blog-lead.ts` |
| Next routes | `src/app/(public)/blogs/**`, `src/app/api/{revalidate,blog-leads}/route.ts`, `src/app/{robots,sitemap}.ts`, `src/app/(public)/layout.tsx` |
| UI | `src/components/blog/*`, `tailwind.config.ts` (the typography plugin) |
| Tests and config | `vitest.config.ts`, `playwright.config.ts`, `e2e/*.spec.ts`, `package.json` |
| Delete | `public/robots.txt`, `public/sitemap.xml`, `src/app/api/update-sitemap/`, `src/components/BlogTemplates/`, `src/components/BlogCard.tsx` |

## 5. Content fidelity rules (non-negotiable)
- The title, slug, headings (text and ids), body text, FAQs, `publishedAt` and `modifiedAt` are copied unchanged.
- Allowed changes, which affect markup only and never visible text:
  - remove `class` and `style` attributes;
  - unwrap meaningless `div`/`article` wrappers;
  - rewrite internal link `href`s to `/blogs/...`;
  - add `rel` to external links at render time.
- Fidelity is enforced by the import unit tests (all 111 posts) and the `content-fidelity` e2e test (all 110 published posts).

## 6. Environment variables (new or changed)

| Var | Where | Purpose |
|---|---|---|
| `R2_PUBLIC_BUCKET_NAME` | keystone | Public blog bucket, used by the import script |
| `R2_PUBLIC_ACCESS_KEY_ID` / `R2_PUBLIC_SECRET_ACCESS_KEY` | keystone | A token scoped to the public bucket only |
| `R2_ENDPOINT` | keystone | Already exists. It's the same account endpoint. |
| `BLOG_CDN_URL` | both | `https://cdn.abroadkart.com` |
| `LEADS_INTERNAL_KEY` | both | Lets the Next.js server create leads in Keystone |
| `REVALIDATE_SECRET` | both | Lets Keystone trigger Next.js revalidation |
| `NEXT_PUBLIC_GA_ID` | next | GA4 measurement ID (§9) |

## 7. Create the public R2 bucket: steps for you
1. **Create the bucket.** In the Cloudflare dashboard, go to **R2 → Create bucket**. Name it `abroadkart-public` and use the same account and location hint as the existing bucket.
2. **Connect the custom domain.** Open the bucket's **Settings → Public access → Custom Domains → Connect Domain** and enter `cdn.abroadkart.com`. The `abroadkart.com` zone must be on Cloudflare; the DNS record is created automatically. Leave the `r2.dev` subdomain **disabled**.
3. **Set CORS.** Under Settings → CORS policy, allow `GET` and `HEAD` from `https://abroadkart.com`, `https://app.abroadkart.com` and `http://localhost:3000`.
4. **Add caching.** In the zone, add a Cache Rule for `cdn.abroadkart.com/*` with Edge TTL 1 month and Browser TTL 1 year. The image names are content-stable.
5. **Create an API token.** Go to **R2 → Manage R2 API Tokens → Create API token** with permission **Object Read & Write**, scoped to **only** `abroadkart-public`.
6. **Send me:**
   - the bucket name;
   - the token's Access Key ID and Secret Access Key, through your secrets manager or `.env` and **not in chat**;
   - confirmation that `cdn.abroadkart.com` resolves.
   - I'll then run the import. The endpoint is the same as the existing `R2_ENDPOINT`.

## 8. Host migration checklist: `app.abroadkart.com` → `abroadkart.com`
> Do this at the WordPress switch-off. **Keystone and Next.js must switch in the same deploy.** better-auth JWTs use `issuer` and `audience` = `PUBLIC_APP_URL` (`src/lib/auth.ts:53-54`), and Keystone checks them against the same value. If the two apps disagree, every logged-in API call fails. All users have to log in again after the switch, so tell them in advance.

**DNS and edge (Cloudflare):**
- Point `abroadkart.com` and `www.abroadkart.com` (A/CNAME, proxied) to the droplet, replacing the WordPress origin.
- Add a redirect rule: `www.abroadkart.com/*` → `https://abroadkart.com/$1` (301).
- Add a redirect rule: `app.abroadkart.com/*` → `https://abroadkart.com/$1` (301), keeping the path and query.
- Check TLS covers `abroadkart.com`, `www`, `app` and `cdn`.
- If you use a reverse proxy (nginx or Caddy), update `server_name` and the certificates.

**Environment variables:**
- Root `.env`: `PUBLIC_APP_URL=https://abroadkart.com`, and also update the legacy `BETTER_AUTH_URL` / `NEXT_PUBLIC_BETTER_AUTH_URL` if they are set.
- `PUBLIC_ADMIN_URL`: set it to `https://abroadkart.com` if admin goes through the `/admin` proxy, or keep its current value if it's a separate host. **Rebuild the Next.js image**, because `NEXT_PUBLIC_KEYSTONE_URL` is baked in at build time.
- `keystone/.env`: apply the same values. Also update `FRONTEND_URL` (legacy) if it is set. Keystone's CORS origins are derived from these values (`keystone/keystone.ts`).

**Third parties:**
- **Google OAuth client:** add `https://abroadkart.com` to Authorized JavaScript origins and `https://abroadkart.com/api/auth/callback/google` to redirect URIs. Keep the `app.` entries for one release, then remove them.
- **R2 CORS:** add `https://abroadkart.com` to the private bucket's CORS (it's used for student document uploads).
- **Docs:** update `DEPLOY.md` and `.env.example` with the new examples.

**Verify after the switch:**
- sign in with email and Google;
- the consultant dashboard loads its data (proves the JWT round trip);
- a document upload works;
- `/admin` works;
- the legacy URLs return 404 and the blog URLs return 200;
- `/robots.txt` and `/sitemap.xml` are served from the new host.

## 9. Analytics and Search Console: steps for you
1. **Google Search Console:**
   - Add a **Domain property** for `abroadkart.com` and verify it with a DNS TXT record in Cloudflare. A Domain property covers http, https, www, app and cdn.
   - If WordPress already has a URL-prefix property, keep it. Before cutover, export the **Performance** report (last 16 months: queries and pages) as the baseline.
   - After cutover, submit `https://abroadkart.com/sitemap.xml`. Use **URL Inspection → Request indexing** on the top 10 posts.
2. **GA4:** create a property and a web data stream for `https://abroadkart.com`, then send me the **Measurement ID** (`G-XXXX`). I'll load it with `next/script` (`afterInteractive`) **only in the `(public)` layout**, so CRM pages are not tracked.
3. **Conversion tracking:** I'll fire a `generate_lead` event when the blog form submits successfully. Mark it as a Key Event in GA4.
4. **Optional:** add Bing Webmaster Tools by importing from GSC.

## 10. Open items (no blockers for Phases 0–6)
- The R2 public bucket credentials (§7) are needed in Phase 3, for the image upload step.
- The GA4 Measurement ID (§9) is needed in Phase 5, but is optional for local development.
- The cutover date (Phase 7) is about one month out.
