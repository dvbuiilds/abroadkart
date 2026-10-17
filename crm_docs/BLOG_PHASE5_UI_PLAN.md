# Phase 5: Blog Template UI — Implementation Plan

> Parent plan: `in-output-folder-we-eager-whistle.md` (§2 D5–D8, §3 Phase 5).
> On approval, save a copy as `crm_docs/BLOG_PHASE5_UI_PLAN.md` before starting work.

## 1. Context

Phases 0–4 are on `fb_wp_blog_migration`. They delivered the Keystone lists, the import script, the repository, SEO helpers, redirects, robots/sitemap and revalidation. No blog UI exists yet:
- there is no `src/app/(public)/blogs/` route;
- there is no `src/components/blog/`;
- there is no `/api/blog-leads`.

Phase 5 builds the public reading experience at `/blogs`, `/blogs/<slug>` and `/blogs/category/<slug>`, plus the lead form pipeline. It has four hard constraints:
1. **Content fidelity.** The article's visible text must equal the source `contentHtml` text. Every UI addition lives outside `#article-body` or produces no text node.
2. **Crawlability.** All content, including FAQ answers, is in the first HTML response. There are only 4 small client islands: the TOC highlighter, the copy-link button, the lead form, and the CTA dialog.
3. **Elegant and modern, all-sans.** The user chose **Inter for everything**, with display-size tracking on headlines, like Linear and Vercel. There is no serif. This replaces "Fraunces" in D7.
4. **TDD.** Every component and helper gets its failing test first.

---

## 2. Design research: what we borrow and why

| Reference | Pattern we adopt |
|---|---|
| **Linear "Now"** | A quiet hero (title and one-line intro) with a **category tab row** directly under it, then cards showing a thumbnail, title, summary and meta. Restrained, mostly monochrome, with one accent. |
| **Stripe blog** | A **category label above the card title**, the newest post leading as the top card, and a CTA after the feed rather than mid-content. |
| **Josh W. Comeau** | **Published and "Last updated" dates** right under the title, a TOC near the top, and generous whitespace. |
| **Vercel blog** | Centered hero with a tight-tracked sans H1, plus a small meta line (date and category). |
| **Stripe Docs / MDN / Smashing** | A **sticky left TOC with an active-section rail**, and a sticky right rail for the conversion element. |
| **Medium / Substack** | A **share row under the byline**, a body column of about 700px, 18px+ body copy, and a "Keep reading" block at the end. |

**Principles taken from these:**
- **One accent colour** (blue-600) on a near-monochrome page.
- **Typography carries the design:** large tight headings and a calm 18px body.
- **Chrome stays out of the reading column.**
- **Cards get a single click target.**
- **Motion is minimal:** a 150–200ms lift and fade, and nothing animates by itself.

---

## 3. Gaps in Phase 4 to fix first (step 5.0)

Code review of `src/lib/blog/repository.ts` found these gaps, which would break Phase 5:

| # | Problem | Fix | Test (add to `src/lib/blog/__tests__/repository.test.ts`) |
|---|---|---|---|
| 1 | GraphQL returns `publishedAt` and `modifiedAt` as **ISO strings**, but `types.ts` says `Date`. `seo.ts` calls `.toISOString()` on them, which crashes at runtime. | Add `mapSummary(raw)` and `mapPost(raw)` to convert the dates with `new Date()`, default `headings`, `faqs` and `categories` to `[]`, and sort `faqs` by `order`. Use them in every query. | Returned dates are `instanceof Date` and equal the source ISO; FAQs are sorted. |
| 2 | `getPostSummaries` **interpolates `categorySlug` into the query string**, which allows GraphQL injection. The `$categorySlug` variable is declared but never used. | Build the `where` clause as a GraphQL variable (`$where: BlogPostWhereInput!`). | Passing a slug containing `"` doesn't alter the query text, and the variables carry the slug. |
| 3 | `getPostSummaries` only supports `page`/`pageSize`. The index needs a "featured + 12" offset. | Change the signature to `{ skip, take, categorySlug }`. Pagination math moves to `pagination.ts` (§7). | `skip` and `take` are passed through. |
| 4 | `getRelatedPosts` **includes the current post** and returns `[]` when there's no category. | Add `slug: { not: { equals: current } }`. If fewer than `limit` come back, top up from the latest posts, excluding duplicates and the current post. | Excludes the current post, falls back to the latest, never returns duplicates, and returns at most 3. |
| 5 | `getCategories` returns every category, including empty ones. | Query `postsCount(where:{status:{equals:"published"}})`, drop categories with a count of 0, and sort by count descending. Add `postCount?: number` to `BlogCategory`. | Empty categories are filtered out and the order is by count. |
| 6 | `getPostBySlug` and `generateMetadata` both fetch the post. **Next does not memoize POST `fetch`.** | Export `getPostBySlugCached = cache(getPostBySlug)` using `react`'s `cache`, and use it in the route. | (Covered by the route test.) |

Other fixes outside the repository:
- `src/components/Navbar.tsx:79` and `:157`, and `src/components/Footer.tsx:70`: the "Blogs" links point to `https://abroadkart.com`. Change them to `/blogs`, and drop `target="_blank"` in the footer.
- `src/styles/globals.css` has global rules that leak into the blog:
  - `ul { list-style: disc; padding-left: 1.5rem }` reaches every blog list. Every non-prose `ul`/`ol` in blog components must carry `list-none pl-0`.
  - `body { font-family: Inter }` relies on a locally installed Inter. Phase 5 loads the font properly (§4.2).

---

## 4. Design system (blog-scoped)

### 4.1 Colour tokens
These are Tailwind palette classes already used on the site. Contrast ratios are measured against white.

| Role | Class | Hex | Contrast |
|---|---|---|---|
| Headline ink | `text-gray-900` | #111827 | 17.7:1 |
| Body text | `text-gray-700` | #374151 | 10.3:1 |
| Secondary/meta | `text-gray-600` | #4b5563 | 7.6:1 |
| Faint meta (≥12px only) | `text-gray-500` | #6b7280 | 4.8:1 (AA). **Never use `gray-400` for text.** |
| Accent / buttons | `bg-blue-600` hover `bg-blue-700` | #2563eb | 5.2:1 |
| Links in prose | `text-blue-700`, underline `decoration-blue-300` → hover `decoration-blue-700` | #1d4ed8 | 6.7:1 |
| Tints | `bg-blue-50` (hero wash, chips), `bg-gray-50` (related band, table header) | | |
| Lines | `border-gray-200` (cards, inputs), `border-gray-100` (H2 dividers, zebra) | | |
| CTA gradient | `bg-gradient-to-br from-blue-600 to-indigo-700`, white text | | ≥5:1 |

### 4.2 Type
- **Font loading:** load Inter through `next/font/google` in `src/app/layout.tsx`:
  - `Inter({ subsets:["latin"], axes:["opsz"], display:"swap", variable:"--font-inter" })`;
  - put `inter.variable` on `<html>`;
  - in `tailwind.config.ts`, set `fontFamily.sans = ["var(--font-inter)", ...defaultTheme.fontFamily.sans]`;
  - change the `body` rule in `globals.css` to `font-family: var(--font-inter), sans-serif`.
- **Why the `opsz` axis matters:** it gives large headings the "Display" optical cut automatically. The CRM keeps the same family, now self-hosted.
- **Type scale:**

| Element | Mobile | ≥768px | Weight / tracking / leading |
|---|---|---|---|
| Post H1 | 32px (`text-[2rem]`) | 48px (`md:text-5xl`), 52px at `lg` | 700, `tracking-[-0.025em]`, `leading-[1.1]`, `text-balance` |
| Index H1 | 36px | 60px (`md:text-6xl`) | 700, `-0.03em`, `leading-[1.05]` |
| Body (prose) | 18px | 18px | 400, `leading-[1.75]` |
| Prose H2 | 26px | 30px | 700, `-0.02em`, `leading-tight` |
| Prose H3 | 21px | 22px | 600, `-0.01em` |
| Prose H4 / H5 | 18px / 16px | same | 600; the H5 is `text-gray-700` |
| Card title | 18px | 18px | 600, `-0.01em`, `line-clamp-2` |
| Featured card title | 24px | 32px | 700, `-0.02em` |
| Meta / eyebrow | 14px / 12px | same | eyebrow is 600, `uppercase tracking-wider` |

- **Measure:** the article column is at most **720px** (about 70–75 characters at 18px Inter). We use px rather than `ch` because Inter's `0` glyph makes `68ch` about 760px.

### 4.3 Shape, depth, motion, focus
- **Radius:**
  - cards and images: `rounded-2xl`;
  - CTA banner: `rounded-3xl`;
  - inputs and buttons: `rounded-lg`;
  - chips and pagination: `rounded-full`.
- **Shadow:** cards have `shadow-sm` at rest and `shadow-xl shadow-gray-900/5` on hover. Featured images have `ring-1 ring-gray-900/5 shadow-lg shadow-gray-900/5`.
- **Motion:**
  - `transition duration-200 ease-out`;
  - card hover is `motion-safe:hover:-translate-y-1`;
  - the FAQ `+` rotates 45°;
  - all of it sits under `motion-safe:` or `motion-reduce:transition-none`;
  - nothing auto-plays.
- **Focus (all interactive elements):** `focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2`.
- **Offsets:** the Navbar is `fixed h-16` (64px).
  - Every heading gets `scroll-margin-top: 6rem`.
  - Sticky rails use `top-24`.
  - The page hero starts at `pt-28` so it isn't hidden under the navbar.

### 4.4 Breakpoints and post-page grid
| Width | Layout |
|---|---|
| < 1024 | Single column. Hero, image and article are centered with `max-w-[720px]`. The TOC is a collapsible `<details>`. The lead form card follows the FAQ. Gutters are `px-4` (16px), and `sm:px-6`. |
| 1024–1279 (`lg`) | `grid-cols-[200px_minmax(0,720px)] gap-x-12 justify-center`: sticky TOC on the left and the article. The lead form card still follows the FAQ. |
| ≥ 1280 (`xl`) | `grid-cols-[220px_minmax(0,720px)_300px] gap-x-12 justify-center` inside `max-w-[1400px]`: TOC, article, and a sticky lead-form rail. |

> **Deviation from D7:** D7 asked for 3 columns from 1024px. At 1024px, the two rails plus gaps leave only about 376px for the article, so we go to 3 columns at 1280px instead. The share options move from the right rail to a row under the hero and again at the end of the article (the Medium pattern). That keeps the sticky rail short enough to fit on a 768px-tall laptop screen.

---

## 5. Page specifications

### 5.1 Post page: `/blogs/[slug]`

```
┌──────────────────────── Navbar (fixed, h-16, white/80 blur) ─────────────────────────┐
▔▔▔▔▔▔▔▔▔ reading progress 3px, blue-600→sky-400, fixed top-16 (CSS scroll-timeline) ▔▔
┌─ HERO  bg-gradient-to-b from-blue-50/70 via-white to-white · pt-28 pb-10 · centered ──┐
│        Home › Blogs › How to fill the DS-160…          (text-sm gray-600, truncated)   │
│                     [ VISA ]  ← chip link to /blogs/category/visa                      │
│            How to Fill the DS-160 Form,                                                │
│                 Step by Step                ← H1, max-w-4xl, text-balance              │
│   Rahul Sharma · Published 12 Jul 2024 · Updated 3 Mar 2025 · ◷ 6 min read             │
│                   [🔗] [WhatsApp] [in] [X]   ← ShareBar, 40px icon buttons             │
└────────────────────────────────────────────────────────────────────────────────────────┘
          ┌────────── featured image, max-w-[840px] (native width), rounded-2xl ─────────┐
          └───────────────────────────────────────────────────────────────────────────────┘
xl:  ┌ TOC 220 ─────┐ ┌──── ARTICLE ≤720 ───────────────────────┐ ┌ RAIL 300 ──────────┐
     │ ON THIS PAGE │ │ <article id="article-body"> prose…       │ │ 🎓 Get free        │
     │┃ Decoding…   │ │ ── H2 (divider, hover #) ──              │ │    counselling     │
     ││  Beyond…    │ │ ┌ table (scroll, tinted header, zebra) ┐ │ │ [Email*]           │
     ││ Funding…    │ │ └──────────────────────────────────────┘ │ │ [Name] [Phone]     │
     ││ FAQs        │ │                                           │ │ [Message]          │
     ││ ↑ Back top  │ │ FREQUENTLY ASKED QUESTIONS                │ │ [Request callback] │
     └ sticky top-24┘ │ ┌ details: question            + ┐       │ │ We never share…    │
                      │ └ answer (always in DOM)         ┘       │ └ sticky top-24 ─────┘
                      │ Share this article  [🔗][WA][in][X]       │
                      │ (<xl) inline LeadForm card                │
                      └──────────────────────────────────────────┘
     ┌──────── LeadCtaBanner: gradient card, max-w-5xl, rounded-3xl ─────────────────────┐
     │  Planning to study abroad?                         [ Talk to a counsellor ] → dialog │
     └────────────────────────────────────────────────────────────────────────────────────┘
┌─ RELATED  bg-gray-50 border-t py-16 ── "Keep reading"                  View all → ─────┐
│  [card] [card] [card]                                                                  │
└────────────────────────────────────────────────────────────────────────────────────────┘
```
Mobile: hero → image → `[On this page ▾]` details card → article → FAQ → share row → lead form card → CTA banner → related (1 column).

**Section specifications:**
- **Breadcrumbs** (`Breadcrumbs`, server):
  - It's a `nav[aria-label="Breadcrumb"] > ol.list-none.pl-0.flex`, with separators drawn by a lucide `ChevronRight` (size-3.5, `aria-hidden`).
  - The trail is Home › Blogs › post title. The last crumb is the post title, truncated with `max-w-[28ch] truncate`, carries `aria-current="page"`, and is hidden below `sm`.
  - **This exactly matches the 3-item `BreadcrumbList` JSON-LD.** The category is shown separately, as the chip.
- **Category chip:**
  - Classes: `inline-flex rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-blue-700 ring-1 ring-inset ring-blue-100 hover:bg-blue-100`.
  - It links to `/blogs/category/<slug>`, and it's left out when there's no category.
- **PostMeta:**
  - Layout: `flex flex-wrap justify-center gap-x-3 gap-y-1 text-sm text-gray-600`, with `·` separators (`aria-hidden`, `text-gray-300`).
  - The author is plain text, `<span>By {authorName}</span>`. There's **no link and no avatar**.
  - Dates are `<time dateTime={iso}>`, formatted `12 Jul 2024` (`en-IN`, `timeZone: "Asia/Kolkata"`).
  - "Updated" is shown only when the IST calendar dates differ (this is true for 32 posts).
  - Reading time is a lucide `Clock` plus `6 min read`.
- **ShareBar** (server, with the `CopyLinkButton` client island):
  - Four 40×40 `rounded-full border border-gray-200 bg-white text-gray-600 hover:text-gray-900 hover:border-gray-300` buttons, in this order:
    1. **Copy link:** lucide `Link2`. It calls `navigator.clipboard.writeText`, the icon swaps to `Check` for 2s, and a sonner toast says "Link copied".
    2. **WhatsApp:** `react-icons/fa6` `FaWhatsapp`, linking to `https://wa.me/?text=<title>%20<url>`.
    3. **LinkedIn:** `FaLinkedinIn`, linking to `https://www.linkedin.com/sharing/share-offsite/?url=<url>`.
    4. **X:** `FaXTwitter`, linking to `https://x.com/intent/post?url=<url>&text=<title>`.
  - Each has an `aria-label` (for example "Share on WhatsApp"), opens in a new tab, and carries `rel="noopener noreferrer"`.
  - The URL is the canonical absolute URL from `getPublicAppUrl()`.
  - It has two placements: under the hero (centered) and after the FAQ (left-aligned, with the label "Share this article").
- **FeaturedImage:**
  - It's a `next/image` using the stored width and height, with `priority`, `sizes="(min-width: 880px) 840px, 100vw"`, `className="h-auto w-full rounded-2xl"`, a wrapper `mx-auto max-w-[840px] px-4`, and `alt = featuredImageAlt || title`.
  - The images are only 840px wide, so it **never stretches wider**.
  - Nothing is rendered when there's no image.
- **ReadingProgress** (server markup with CSS only, no JS):
  - Markup: `<div aria-hidden className="reading-progress fixed left-0 right-0 top-16 z-40 h-[3px] origin-left bg-gradient-to-r from-blue-600 via-blue-500 to-sky-400" />`.
  - In `blog.css`: `@supports (animation-timeline: scroll()) { .reading-progress { animation: grow-x linear both; animation-timeline: scroll(root); } }`, and `display:none` otherwise.
  - The Navbar already uses scroll-driven CSS, so this follows an existing pattern. On browsers without support it degrades to hidden.
  - **Deviation from D7:** it was planned as a client island, and this removes one.
- **TableOfContents** (server, with the `TocHighlighter` client island):
  - Input: `buildToc(post.headings)`, plus `{id:"faq", text:"FAQs"}` appended when the FAQ section renders.
  - **Desktop:**
    - wrapper `aside.sticky.top-24.max-h-[calc(100dvh-7rem)].overflow-y-auto.overscroll-contain`;
    - heading `p` "On this page" (`text-xs font-semibold uppercase tracking-wider text-gray-500`);
    - `nav[aria-label="Table of contents"] > ol.list-none.pl-0.border-l.border-gray-200`;
    - each `a[href="#id"]` is `-ml-px block border-l-2 border-transparent py-1.5 pl-3 text-sm text-gray-600 hover:text-gray-900 line-clamp-2`, with H3 children at `pl-6 text-[13px]`;
    - **active:** `aria-[current=location]:border-blue-600 aria-[current=location]:text-gray-900 aria-[current=location]:font-medium`;
    - a footer link "↑ Back to top" goes to `#top`.
  - **Mobile:** `<details className="group rounded-xl border border-gray-200 bg-gray-50/60">`, with a summary reading "On this page · N sections" and a `ChevronDown` that rotates on `group-open`. The list is the same, without the rail highlight.
  - **TocHighlighter:**
    - **Inputs:** a client component that receives `ids: string[]`.
    - **Observer:** one `IntersectionObserver` with `rootMargin:"-96px 0px -66% 0px"`.
    - **Behaviour:** it sets `aria-current="location"` on the matching TOC anchor and removes it from the previous one. It renders `null`.
    - **No re-render, no hydration risk:** it mutates only that one attribute.
- **ArticleBody** (server). It uses `html-react-parser` with `replace()`. **It must add no text nodes.**
  - **Internal links** (`href` starts with `/`, or the host is `abroadkart.com`/`app.abroadkart.com`): rendered as `next/link` with the path only.
  - **External links** (`http(s)` to another host): `<a target="_blank" rel="noopener noreferrer">` plus the children plus `<ArrowUpRight aria-hidden className="ml-0.5 inline size-3.5 align-[-0.1em]"/>`. An SVG has no text, so fidelity holds.
  - **`<a name="_Toc…">` with no `href`:** left untouched.
  - **`<table>`:** wrapped in `<div className="table-wrap" role="region" aria-label="Table" tabIndex={0}>`.
  - **`h2` and `h3` with an `id`:** keep the `id` and append an **empty** `<a href="#id" className="heading-anchor" aria-label="Link to this section">`. The `#` is drawn with CSS `::after`, so it's not in `textContent` or `innerText`.
  - **Root:** `<article id="article-body" className="blog-prose prose prose-lg prose-gray max-w-none">`.
- **Prose styling:**
  - These live in `tailwind.config.ts` → `theme.extend.typography.DEFAULT.css`, plus `src/styles/blog.css` for the selectors Tailwind can't express.
  - **Base:** body `gray-700`, 18px / 1.75. Paragraph spacing is `1.25em`.
  - **H2:** `mt-14 pt-10 border-t border-gray-100`. The first H2 has no border.
  - **Lists:** markers `blue-500`; `li` spacing `0.5em`.
  - **Text:** `strong` is `gray-900`, weight 600.
  - **Links:** as in §4.1, with `underline-offset-4 decoration-[1.5px]`.
  - **Tables:**
    - The `.table-wrap` is `my-8 overflow-x-auto rounded-xl border border-gray-200`, and the `table` inside has `my-0 text-[15px]`.
    - **Header row:** `thead th` gets `bg-gray-50 font-semibold text-gray-900`. **Only 11 of the 35 tables have a `<thead>`**; 25 use a bold first row instead. So `table:not(:has(thead)) tr:first-child td` gets the same tint.
    - Body rows are zebra-striped with `bg-gray-50/50`, and cells use `px-4 py-3` with a `border-b border-gray-100`.
  - **Heading anchors:** `.heading-anchor` is `opacity-0` and becomes `opacity-100` on `:is(h2,h3):hover` and on focus-visible. Its `::after` content is `"#"` in `text-gray-300`.
  - **Scroll offset:** `:is(h2,h3,h4,h5)[id] { scroll-margin-top: 6rem }`.
- **FaqSection** (server):
  - **Container:** `section[aria-labelledby="faq"]`, starting with `<h2 id="faq">Frequently Asked Questions</h2>` styled like a prose H2.
  - **Each item:** `<details className="group rounded-xl border border-gray-200 bg-white open:shadow-sm">`.
  - **Summary:** `flex cursor-pointer list-none items-start justify-between gap-4 px-5 py-4 text-base font-semibold text-gray-900 [&::-webkit-details-marker]:hidden`, with a lucide `Plus` icon that rotates on `group-open:rotate-45`.
  - **Answer:** `px-5 pb-5 text-gray-700 leading-relaxed`.
  - **Spacing:** `space-y-3` between items.
  - **Smooth opening** is a progressive enhancement: `blog.css` sets `details::details-content { transition: block-size .2s, content-visibility .2s allow-discrete; block-size:0 } details[open]::details-content { block-size:auto }` under `interpolate-size: allow-keywords`, wrapped in `@media (prefers-reduced-motion: no-preference)`. Answers stay in the DOM in every browser.
  - **Render rule:** `shouldRenderFaqSection(post)` returns false when there are no FAQs, **or** when `contentHtml` already contains the first question. That's true for exactly one post, `everything-about-duolingo-english-test`, and it avoids showing the FAQ twice. The JSON-LD stays valid because the text is visible in the body.
- **LeadForm card** (client):
  - **Header:** a `GraduationCap` icon in a `size-10 rounded-full bg-blue-50 text-blue-600` badge; the title "Get free counselling" (`text-lg font-semibold`); the subtitle "Talk to an expert about universities, costs and visas." (`text-sm text-gray-600`).
  - **Fields:** these are shadcn `Label`, `Input` and `Textarea` (h-10, `rounded-lg`), with ids from `useId()` because up to 3 instances can exist on one page.
    - Email (required, marked with `*`);
    - Name;
    - Phone (`type="tel"`, `inputMode="tel"`);
    - Message (3 rows).
  - **Submit:** a full-width `bg-blue-600 hover:bg-blue-700` button, "Request a callback". While submitting it shows a `Loader2` spinner and is disabled.
  - **Microcopy:** "We'll never share your details." (`text-xs text-gray-500`).
  - **States:**
    - field errors under each input (`text-sm text-red-600`, `aria-invalid`, `aria-describedby`);
    - on success, the form is replaced with a `CheckCircle2` and "Thanks! A counsellor will be in touch soon." in an `aria-live="polite"` region;
    - on a server error, an inline alert "Something went wrong. Please try again." keeps the entered values;
    - on a 429, "Too many attempts — please try again in a few minutes."
  - **Placements:**
    - the `xl` rail (`hidden xl:block sticky top-24`, card `rounded-2xl border bg-white p-6 shadow-sm`);
    - inline after the FAQ (`xl:hidden`);
    - inside the CTA dialog.
- **LeadCtaBanner** (client, because of the Dialog):
  - **Container:** `relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-600 to-indigo-700 px-6 py-10 text-white md:px-12 md:py-14`, plus two `aria-hidden` blurred `bg-white/10` circles.
  - **Text:** an H2 "Planning to study abroad?" (`text-2xl md:text-3xl font-bold tracking-tight`) and a `p` "Talk to a counsellor — free, no obligation." (`text-blue-100`).
  - **Button:** `bg-white text-blue-700 hover:bg-blue-50`, "Talk to a counsellor". It opens the shadcn `Dialog` containing `LeadForm`.
  - **Layout:** at `md` and up, the text is on the left and the button on the right.
- **RelatedPosts** (server):
  - **Heading row:** H2 "Keep reading", with "View all in {category} →" on the right.
  - **Grid:** `grid gap-6 sm:grid-cols-2 lg:grid-cols-3` of `BlogCard`s, inside a full-bleed `bg-gray-50 border-t border-gray-100 py-16` band.
  - It isn't rendered when there are 0 related posts.

### 5.2 Blog index: `/blogs` and `/blogs?page=N`
```
┌─ HERO bg-gradient-to-b from-blue-50/60 to-white · pt-28 pb-12 · centered ─────────────┐
│                       THE ABROADKART BLOG   (eyebrow, blue-700)                       │
│            Guides for your study abroad journey      (H1)                              │
│   Practical advice on universities, applications, tests, visas and costs. (lg gray-600)│
└────────────────────────────────────────────────────────────────────────────────────────┘
┌ CategoryChips — sticky top-16, bg-white/85 backdrop-blur, border-b, horizontal scroll ┐
│ (All) (Course & University Selection 37) (Counselling 20) (Visa 7) …                  │
└────────────────────────────────────────────────────────────────────────────────────────┘
page 1 only:
┌ FEATURED (BlogCard variant="featured") md:grid-cols-[1.15fr_1fr] ─────────────────────┐
│ [ image 1.91:1, rounded-2xl ]   VISA chip · 12 Jul 2024 · 6 min                        │
│                                 Big title (2xl→3xl, 700)                               │
│                                 excerpt (line-clamp-3)        Read article →           │
└────────────────────────────────────────────────────────────────────────────────────────┘
"Latest articles" (H2, sr-only on page>1) — grid 1 / sm:2 / lg:3, gap-x-6 gap-y-10
[card][card][card] …  (12 per page)
              ‹ Prev   1  2  [3]  4  …  10   Next ›
```
- **Copy:** the hero copy above is a **placeholder. Confirm the wording** before going live.
- **CategoryChips:**
  - `nav[aria-label="Blog categories"] > ul.list-none.pl-0.flex.gap-2.overflow-x-auto.snap-x.[scrollbar-width:none]`.
  - Chip: `shrink-0 snap-start rounded-full px-4 py-2 text-sm font-medium`.
  - **Active** (`aria-current="page"`): `bg-gray-900 text-white`.
  - **Inactive:** `border border-gray-200 bg-white text-gray-700 hover:border-gray-400`.
  - The count is shown as `text-gray-400` on inactive chips and `text-white/60` on the active one. It's decorative; `aria-hidden` is not needed.
  - "All" links to `/blogs`.
- **BlogCard (default variant):**
  - **Container:** `article.group.relative.flex.flex-col.overflow-hidden.rounded-2xl.border.border-gray-200.bg-white.shadow-sm transition motion-safe:hover:-translate-y-1 hover:shadow-xl hover:shadow-gray-900/5 focus-within:ring-2 focus-within:ring-blue-600`.
  - **Image:** `aspect-[1.91/1] object-cover`. The source images are 840×427, about 1.97:1, so the crop is minimal. It uses `sizes="(min-width:1024px) 400px, (min-width:640px) 50vw, 100vw"`.
  - **Placeholder** when there's no image yet (before the R2 upload): `bg-gradient-to-br from-blue-50 to-gray-100` with a centered lucide `BookOpen` in `text-blue-300`.
  - **Body (`p-5 flex flex-col gap-3`):**
    - a category label (a `span`, not a link, styled like the chip but smaller);
    - an H3 title (`line-clamp-2 group-hover:text-blue-700`);
    - the excerpt (`text-sm text-gray-600 line-clamp-2`);
    - meta pinned to the bottom (`mt-auto text-xs text-gray-500`): `<time>` · N min read.
  - **Single link:** the title `<Link>` has `after:absolute after:inset-0`, a stretched link. This avoids the nested button-in-link bug of the old card.
- **Pagination:**
  - `nav[aria-label="Pagination"]`, with buttons `size-10 rounded-full text-sm`.
  - The current page is `bg-gray-900 text-white aria-current="page"`.
  - Prev and Next are text links with chevrons. When disabled they render as a `span` with `aria-disabled="true"` and `text-gray-300`.
  - Page 1's href is the bare path (`/blogs`), never `?page=1`.
  - Gaps use an ellipsis `…`, following `buildPageList` (§7).
- **Metadata:**
  - page 1: title "Blog", canonical `/blogs`;
  - page N: "Blog — Page N", canonical `/blogs?page=N`;
  - a page number greater than `totalPages`, or a non-integer, gives `notFound()`;
  - `?page=1` gets a canonical of `/blogs`.
- **Rendering:** `searchParams` makes this route dynamic. Data still comes from the `fetch` data cache (`revalidate: 3600`, tag `blog:list`), so Keystone isn't hit on every request.

### 5.3 Category page: `/blogs/category/[slug]`
- It uses the same layout as the index:
  - the eyebrow is "Category";
  - the H1 is `category.name`;
  - the intro is `category.description`, or "Articles about {name}." if that's empty;
  - the chips have the current category active;
  - there's a featured card on page 1, then the grid and pagination.
- An unknown slug gives `notFound()`. The canonical is `/blogs/category/<slug>` (plus `?page=N` when N > 1).
- **Breadcrumb:** Home › Blogs › {name}.

### 5.4 Not-found: `src/app/(public)/blogs/[slug]/not-found.tsx`
The page is centered with `pt-32 pb-24`:
- an eyebrow "404";
- an H1 "This article has moved or no longer exists";
- a `p` in `gray-600`;
- a `bg-blue-600` button "Browse all articles" linking to `/blogs`.

Next adds `noindex` automatically. Drafts and unknown slugs both land here.

---

## 6. Component inventory (`src/components/blog/`)

**Rule:** components are **synchronous and receive data through props**. Only `page.tsx` files fetch. That makes every component testable with Testing Library.

| Component | Kind | Props |
|---|---|---|
| `Breadcrumbs` | server | `items: {label, href?}[]` |
| `CategoryChip` | server | `category`, `as?: "link" \| "span"` |
| `PostMeta` | server | `authorName?`, `publishedAt`, `modifiedAt`, `readingTimeMinutes?` |
| `PostHero` | server | `post` (composes Breadcrumbs, CategoryChip, H1, PostMeta, ShareBar) |
| `ShareBar` | server | `url`, `title`, `label?`, `align?` |
| `CopyLinkButton` | **client** | `url` |
| `FeaturedImage` | server | `src, alt, width, height` |
| `ReadingProgress` | server (CSS) | none |
| `TableOfContents` | server | `items: TocItem[]`, `variant: "sidebar" \| "inline"` |
| `TocHighlighter` | **client** | `ids: string[]` |
| `ArticleBody` | server | `html: string` |
| `FaqSection` | server | `faqs: Faq[]` |
| `LeadForm` | **client** | `sourceSlug`, `variant: "card" \| "plain"` |
| `LeadCtaBanner` | **client** | `sourceSlug` |
| `BlogCard` | server | `post: BlogPostSummary`, `variant?: "default" \| "featured"`, `headingLevel?: 2 \| 3` |
| `BlogGrid` | server | `posts` |
| `CategoryChips` | server | `categories`, `activeSlug?` |
| `Pagination` | server | `page`, `totalPages`, `basePath` |
| `RelatedPosts` | server | `posts`, `category?` |
| `BlogListingPage` | server | Shared shell for the index and category routes: hero, chips, featured, grid, pagination |

There's also a new `src/app/(public)/blogs/layout.tsx`. It only imports `@app/styles/blog.css`, which holds the reading progress, table, heading-anchor and `details` rules.

---

## 7. Pure helpers (`src/lib/blog/`)

| File | Exports | Behaviour |
|---|---|---|
| `format.ts` | `formatPostDate(d)`, `isSameIstDay(a,b)` | `Intl.DateTimeFormat("en-IN",{day:"numeric",month:"short",year:"numeric",timeZone:"Asia/Kolkata"})`. Output doesn't depend on the server's timezone. |
| `pagination.ts` | `PAGE_SIZE = 12`, `pageWindow(page)`, `totalPages(total)`, `parsePageParam(raw)`, `buildPageList(page,total)` | **Window:** page 1 is `{skip:0,take:13}` (1 featured + 12). Page N is `{skip:1+(N-1)*12, take:12}`. **Total pages:** `ceil((total-1)/12)`, so 110 posts give 10 pages. **Parsing:** `parsePageParam` returns `null` for invalid input. **Page list:** `buildPageList(5,10)` gives `[1,"…",4,5,6,"…",10]`. |
| `faq.ts` | `shouldRenderFaqSection(post)` | Implements the render rule in §5.1. |
| `share.ts` | `buildShareLinks(url,title)` | Returns the WhatsApp, LinkedIn and X URLs, with correct encoding. |
| `links.ts` | `classifyHref(href)` | Returns `"internal"`, `"external"`, `"anchor"` or `"none"`, and the normalised path. ArticleBody uses it. |
| `leads.ts` | `createBlogLead(input)` | Server-only. It POSTs a `createBlogLead` mutation to `${getKeystoneInternalUrl()}/api/graphql` with the header `x-internal-key: process.env.LEADS_INTERNAL_KEY`, using `cache: "no-store"`. |
| `src/lib/rate-limit.ts` | `createRateLimiter({limit:5, windowMs:600_000})`, `.check(key)` | An in-memory sliding window. It returns `{ok, retryAfterSec}` and prunes old keys. |
| `src/lib/validations/blog-lead.ts` | `blogLeadSchema`, `blogLeadPayloadSchema` | See §8. |

---

## 8. Lead pipeline

**`blogLeadSchema`** (shared with the client and used by react-hook-form):
- `email`: `z.string().trim().min(1,"Email is required").email("Enter a valid email address").max(254)`
- `name`: `z.string().trim().max(120).optional()`
- `phone`: `z.string().trim().max(20).regex(/^[+\d\s()-]*$/,"Enter a valid phone number").optional()`
- `message`: `z.string().trim().max(2000).optional()`

**`blogLeadPayloadSchema`** is `blogLeadSchema.extend` with:
- `sourceSlug` (max 200);
- `sourceUrl` (url, max 500);
- `utmSource`, `utmMedium` and `utmCampaign` (each max 100);
- `website` (the honeypot).

**Client:**
- `LeadForm` reads the UTM parameters from `window.location.search` **at submit time**. `useSearchParams` would force a Suspense or client-render bailout on a static page, so we don't use it.
- It sends `sourceUrl = location.origin + location.pathname`.
- **Honeypot markup:** `<div aria-hidden="true" className="absolute -left-[9999px] h-px w-px overflow-hidden"><label>Website<input name="website" tabIndex={-1} autoComplete="off"/></label></div>`. It's moved off-screen rather than set to `display:none`, because some bots skip hidden fields.
- On success it fires `window.gtag?.("event","generate_lead",{source_slug})`.

**`POST /api/blog-leads`** (`src/app/api/blog-leads/route.ts`). The middleware already allows this path. The handler runs these checks in order:
1. **Rate limit:** look up the IP (`cf-connecting-ip`, then the first entry of `x-forwarded-for`, then `"unknown"`). If it's over the limit, return **429** `{ok:false}` with a `Retry-After` header.
2. **Parse JSON:** if it fails, return **400**.
3. **Honeypot:** if `website` is non-empty, return **200** `{ok:true}` and store nothing.
4. **Validate:** run `blogLeadPayloadSchema.safeParse`. If it fails, return **400** `{ok:false, errors: flatten().fieldErrors}`.
5. **Store:** call `createBlogLead`. If it throws, return **502** `{ok:false}` and log the error (without PII).
6. **Done:** return **201** `{ok:true, email}`.

---

## 9. Routes

**`src/app/(public)/blogs/[slug]/page.tsx`:**
- `export const revalidate = 3600; export const dynamicParams = true;`
- `generateStaticParams`: `(await getAllSlugs()).map(slug => ({ slug }))`. This already returns `[]` if Keystone is down.
- `generateMetadata({ params })`: `const { slug } = await params` (Next 15 async params), then `getPostBySlugCached`. If there's no post, return `{}`. Otherwise return `buildPostMetadata(post)`.
- `Page`:
  1. Fetch the post. If it's missing or `status !== "published"`, call `notFound()`.
  2. Fetch `getRelatedPosts(post, 3)` and handle errors so it degrades to `[]`.
  3. Compute `toc = buildToc(post.headings)` and `showFaq = shouldRenderFaqSection(post)`.
  4. Render the §5.1 tree, plus `<script type="application/ld+json" dangerouslySetInnerHTML={{__html: serializeJsonLd(buildPostJsonLd(post))}}/>`.

**`src/app/(public)/blogs/page.tsx`** and **`src/app/(public)/blogs/category/[slug]/page.tsx`:**
- They parse the page number, call `getPostSummaries(pageWindow(page))` and `getCategories()`, and render `BlogListingPage`.
- Each has a `generateMetadata` following §5.2 and §5.3.

**`not-found.tsx`:** as in §5.4.

**Optional (only if the GA ID is ready):** `src/components/analytics/GoogleAnalytics.tsx` loads `next/script` with `afterInteractive`, rendered in the `(public)/layout.tsx` only when `NEXT_PUBLIC_GA_ID` is set.

---

## 10. Execution order (each step: red, then green, then refactor, then commit)

| Step | Work | Tests written first |
|---|---|---|
| **5.0** | Repository fixes (§3) and the nav/footer links | `repository.test.ts` additions |
| **5.1** | Foundation: `yarn add -D @tailwindcss/typography@^0.5.16`; Inter through `next/font`; Tailwind `fontFamily` and the typography plugin with prose theme; `blog.css`; `blogs/layout.tsx` | none (config); verified by build |
| **5.2** | Pure helpers (§7) | `format.test.ts`, `pagination.test.ts`, `faq.test.ts`, `share.test.ts`, `links.test.ts`, `rate-limit.test.ts`, `blog-lead.test.ts` (validations) |
| **5.3** | Leaf components: `Breadcrumbs`, `CategoryChip`, `PostMeta`, `BlogCard`, `CategoryChips`, `Pagination` | component tests (§11) |
| **5.4** | Article: `ArticleBody`, `TableOfContents`, `TocHighlighter`, `FaqSection`, `FeaturedImage`, `ReadingProgress` | component tests |
| **5.5** | Engagement: `ShareBar` and `CopyLinkButton`, `LeadForm`, `leads.ts`, `/api/blog-leads`, `LeadCtaBanner`, `RelatedPosts` | component tests and the route test |
| **5.6** | Routes: post, index, category, not-found | route tests (§11) |
| **5.7** | (Optional) GA4 loader and the `generate_lead` event | the LeadForm test asserts `gtag` is called when present |
| **5.8** | Cleanup: delete `src/components/BlogTemplates/` and `src/components/BlogCard.tsx` (only Template1 imports it, which has been verified). Add `e2e/blog-ui.spec.ts` | the e2e spec (§12) |

**Test conventions:**
- **Location:** `src/components/blog/__tests__/*.test.tsx`.
- **Fixtures:** `src/components/blog/__tests__/fixtures.ts`. These are hand-copied excerpts of real posts, because `output/` is not in git. They must include:
  - an `<h5>`;
  - a `<table>` without a `thead`;
  - an `<a name="_Toc…">`;
  - an internal `/blogs/...` link;
  - an external link;
  - the `johns-hopkins` wrapper residue.
- **Mocks:** `next/image` is mocked per file as a plain `<img>`. Route-handler and helper tests use `// @vitest-environment node`. `fetch` is mocked with `vi.spyOn(globalThis, "fetch")`.

---

## 11. Unit and component test specification

| File | Cases |
|---|---|
| `ArticleBody.test.tsx` | (1) `textContent` of the render equals `textContent` of the source HTML (whitespace normalised), for every fixture. (2) An internal `/blogs/x` link renders as an `<a href="/blogs/x">` without `target`. (3) An absolute `https://abroadkart.com/blogs/x` becomes `/blogs/x`. (4) An external link has `target="_blank"`, `rel="noopener noreferrer"` and contains an `svg[aria-hidden]`. (5) Each `table` has a parent `.table-wrap[role=region][tabindex="0"]`. (6) Every source heading id exists in the output. (7) `.heading-anchor` has an empty `textContent` and `href="#<id>"`. (8) `a[name]` without an `href` is unchanged. (9) There's exactly one `article#article-body`, and there's no `h1`. |
| `TableOfContents.test.tsx` | It's inside `nav[aria-label="Table of contents"]`. The anchors are `href="#<id>"`. H3s are nested in the parent H2's `<ol>`. H4 and H5 are absent. The FAQ entry appears only when it's passed in. The inline variant renders a `<details>` whose summary includes the section count. An empty list renders nothing. |
| `TocHighlighter.test.tsx` | With a mocked `IntersectionObserver`, an intersecting entry for `#b` sets `aria-current="location"` on `a[href="#b"]` and removes it from `#a`. It disconnects on unmount. |
| `FaqSection.test.tsx` | It renders N `<details>`, none of them `open`. Every answer's text is in the DOM while collapsed. It renders `h2#faq`. It returns `null` for `[]`. Questions keep the order of `order`. |
| `faq.test.ts` | Returns false for no FAQs, false when the body contains the first question, and true otherwise. |
| `PostMeta.test.tsx` | The author element contains no `a` or `img`. `time[dateTime]` equals the ISO value. "Updated" is absent when the IST day is the same (including `23:30Z` versus `00:10Z` the next UTC day, which is the same IST day) and present when the days differ. The reading time renders. |
| `format.test.ts` | `formatPostDate` gives `"12 Jul 2024"` regardless of `TZ`. `isSameIstDay` handles the UTC-boundary edge cases. |
| `BlogCard.test.tsx` | Exactly one `<a>` per card, pointing to `/blogs/<slug>`. There's no `button`, and no nested interactive element. The image alt falls back to the title. The placeholder renders when there's no image. `headingLevel` controls h2 or h3. The featured variant renders the excerpt and "Read article". |
| `CategoryChips.test.tsx` | "All" links to `/blogs`. The active chip has `aria-current="page"`. It's inside `nav[aria-label="Blog categories"]`. |
| `Pagination.test.tsx` and `pagination.test.ts` | `buildPageList` covers the edge cases (total ≤ 7, start, middle, end). Page 1's href is the bare path. The current page has `aria-current`. Prev is disabled on page 1 and Next on the last page. `pageWindow` and `totalPages(110) === 10`. `parsePageParam` rejects `"0"`, `"-1"`, `"abc"` and `"1.5"`. |
| `ShareBar.test.tsx` and `share.test.ts` | It has 4 controls with aria-labels. The links have `target="_blank"` and `rel`. The URLs are encoded (the title includes `&` and `?`). `CopyLinkButton` calls `navigator.clipboard.writeText(url)` and shows the copied state. |
| `LeadForm.test.tsx` | Submitting empty shows "Email is required" and doesn't call `fetch`. An invalid email shows "Enter a valid email address". A valid submit POSTs to `/api/blog-leads` with `email`, `sourceSlug`, `sourceUrl` and UTMs (taken from a stubbed `location.search`), then shows the success text. A 500 shows the error alert and keeps the values. A 429 shows the rate-limit message. The honeypot input isn't reachable by role or label for users (it sits inside `[aria-hidden="true"]` with `tabIndex=-1`). Two instances on one page have unique input ids. `gtag` is called on success when defined. |
| `blog-lead.test.ts` | Covers the schema: email required, email format, the phone regex and the maximum lengths. |
| `rate-limit.test.ts` | Using fake timers: 5 requests are allowed, the 6th is blocked with `retryAfterSec > 0`, it resets after the window, and keys are independent. |
| `src/app/api/blog-leads/__tests__/route.test.ts` | 400 on a missing email and on invalid JSON. 201 `{ok:true,email}` on success, where the mocked `fetch` was called with the `x-internal-key` header and a `createBlogLead` mutation whose variables match. 200 with no `fetch` call when the honeypot is filled. 429 on the 6th request from the same IP, with `Retry-After`. 502 when Keystone fails. |
| `src/app/(public)/blogs/__tests__/post-page.test.tsx` | The repository is mocked and `notFound` is mocked to throw. `notFound` is called for `null` and for a draft. `generateMetadata` equals `buildPostMetadata(post)`. The JSON-LD script parses and has the `BlogPosting` type. The H1 equals the title, and there's exactly one H1. The FAQ section is hidden for the duolingo-style fixture. The related section is absent when the list is empty. |
| `src/app/(public)/blogs/__tests__/index-page.test.tsx` | Page 1 renders the featured card plus 12 cards. `?page=2` has no featured card and calls `getPostSummaries` with `skip:13`. `?page=99` and `?page=abc` call `notFound`. The canonical rules follow §5.2. A category page with an unknown slug calls `notFound`. |

---

## 12. Verification (how to prove Phase 5 is done)

**A. Automated gate (must be green):**
```bash
yarn test            # typecheck + lint + vitest (all new and old tests)
yarn build           # with Keystone STOPPED → must still succeed (generateStaticParams → [])
```

**B. Local stack with real data:**
```bash
docker compose up -d postgres keystone
cd keystone && yarn import:blogs && cd ..       # 110 published + 1 draft
yarn build && yarn start                        # Keystone running → posts prerendered
yarn test:e2e e2e/blog-ui.spec.ts
```

**C. `e2e/blog-ui.spec.ts`** (new in 5.8; runs on desktop at 1440 and on mobile as a Pixel 7):
- **Desktop:**
  - Clicking a TOC link scrolls to its heading; the heading isn't hidden under the navbar (its `boundingBox().y` is ≥ 64); and that TOC link gets `aria-current`.
  - "Copy link" puts the canonical URL on the clipboard. Grant permissions first.
  - The CTA button opens a dialog containing an email field. `Esc` closes it.
  - Submitting the rail form with a valid email shows the success text.
- **Mobile:**
  - The `<details>` "On this page" opens.
  - The rail is hidden and the inline form is visible after the FAQ.
  - There's no horizontal page scroll (`scrollWidth === clientWidth`).
- **Index:** the chip row scrolls; pagination to page 2 works; `?page=99` returns 404.

**D. Manual URL checklist** (`localhost:3000`):

| URL | Expect |
|---|---|
| `/blogs` | Hero, chips with counts, featured card, 12 cards, pagination 1–10 |
| `/blogs?page=10` and `/blogs?page=11` | Last page renders; page 11 returns 404 |
| `/blogs/category/visa` | Visa is the active chip; there are 7 posts |
| `/blogs/mba-vs-pgdm-guide` | Tables with a tinted first row and horizontal scroll on mobile; 5 FAQs |
| `/blogs/johns-hopkins-university` | No stray Tailwind wrappers affect the layout |
| `/blogs/everything-about-duolingo-english-test` | FAQ is **not** shown twice |
| A post where modified ≠ published | "Updated" date is visible |
| The draft slug (post 21126) | 404 page |
| `/mba-vs-pgdm-guide/` | One 308 to `/blogs/mba-vs-pgdm-guide` |

**E. Crawlability without JS:**
```bash
curl -s localhost:3000/blogs/mba-vs-pgdm-guide > /tmp/p.html
grep -c '<h1' /tmp/p.html                              # → 1
grep -c '<details' /tmp/p.html                         # → 5
grep -o 'application/ld+json' /tmp/p.html | wc -l      # → 1
grep -c 'rel="canonical"' /tmp/p.html                  # → 1
```
Then check it in Chrome DevTools with JavaScript disabled. Everything except copy-link, TOC highlight, the dialog and the form submit must work. The FAQs still expand, because `<details>` is native.

**F. Lead pipeline:**
- Submit the form, then check that a row appears in **Keystone admin → Blog Leads** with `sourceSlug` and the UTMs. Use `?utm_source=test` in the URL.
- Check the rate limit:
  ```bash
  for i in $(seq 1 6); do curl -s -o /dev/null -w "%{http_code}\n" -X POST localhost:3000/api/blog-leads \
    -H 'content-type: application/json' -d '{"email":"qa@example.com"}'; done   # → 201 ×5, then 429
  ```
- Check the honeypot: send `{"email":"x@y.com","website":"spam"}`. It should return 200, and no new row should appear.
- Check the public endpoint is blocked: a direct `createBlogLead` mutation to Keystone `/api/graphql` without the key should be rejected.

**G. Visual and quality pass:**
- **Viewports:** 375, 768, 1024, 1280 and 1440. Check that the grid switches at 1024 (2 columns) and 1280 (3 columns), the sticky rails don't overlap the footer, and the related band is full-bleed.
- **Lighthouse (mobile)** on 3 posts: SEO 100, Accessibility ≥ 95, CLS < 0.05 (the image has its dimensions and the fonts are self-hosted), and LCP < 2.5s locally.
- **axe DevTools:** 0 serious or critical issues on `/blogs` and on one post.
- **Keyboard only:**
  - Tab moves in this order: the breadcrumb, the chip, the share buttons, the TOC, the body links, the FAQ summaries (Enter/Space toggles them), the form and the CTA.
  - Focus rings are visible throughout.
- **Cache:** reload a post twice. Keystone logs show no second `GetPostBySlug`. This proves the POST `fetch` is in the data cache. If it isn't, add `cache: "force-cache"` in `graphqlRequest`.

**Exit criteria:** A–G all pass, there are 0 TS or lint errors, the legacy `BlogTemplates/` is deleted, and there's one commit per step 5.0–5.8.

---

## 13. Files

| Action | Path |
|---|---|
| Modify | `src/lib/blog/repository.ts`, `src/lib/blog/types.ts`, `src/lib/blog/__tests__/repository.test.ts`, `src/components/Navbar.tsx`, `src/components/Footer.tsx`, `src/app/layout.tsx` (font), `src/styles/globals.css` (body font), `tailwind.config.ts`, `package.json`, `src/app/(public)/layout.tsx` (GA, optional) |
| Create (lib) | `src/lib/blog/{format,pagination,faq,share,links,leads}.ts` and their tests, `src/lib/rate-limit.ts`, `src/lib/validations/blog-lead.ts` |
| Create (UI) | `src/components/blog/*` (§6) and `__tests__/`, `src/styles/blog.css` |
| Create (routes) | `src/app/(public)/blogs/{layout,page}.tsx`, `src/app/(public)/blogs/[slug]/{page,not-found}.tsx`, `src/app/(public)/blogs/category/[slug]/page.tsx`, `src/app/api/blog-leads/route.ts` and tests, `e2e/blog-ui.spec.ts` |
| Delete | `src/components/BlogTemplates/`, `src/components/BlogCard.tsx` |

---

## Implementation status (Phase 5)

Commits on `fb_wp_blog_migration`, one per step, all test-first:

| Step | Commit | Scope |
|---|---|---|
| 5.0 | `a24c24b` | Repository hardening (Keystone list queries, variables not query text, date mapping, related and category fixes) |
| 5.1 | `3bd7fb7` | Inter via `next/font`, typography plugin, blog stylesheet |
| 5.2 | `282d5cc` | Pure helpers: format, pagination, FAQ rule, share links, href classification, rate limit, lead schema |
| 5.3 | `38e0218` | Leaf components: Breadcrumbs, CategoryChip, PostMeta, BlogCard, CategoryChips, Pagination |
| 5.4 | `a361a3b` | Article components: ArticleBody, TableOfContents, TocHighlighter, FaqSection, FeaturedImage, ReadingProgress |
| 5.5 | `bd544ac` | Lead pipeline: `/api/blog-leads`, `createBlogLead`, LeadForm, share bar, CTA dialog, related posts |
| 5.6 | `39448ea` | Routes: post, index, category, not-found |
| 5.6a | `bcdb065` | FAQ answers render as sanitised HTML; schema text derived from them |
| 5.6b | `cfebb5d` | Legacy redirects take one hop, including trailing slashes |
| 5.6c | `d6be3f3` | Revalidation hook: category scope, rejected-request handling, test runner |
| 5.8a | `3c21658` | Remove legacy Template1 components |
| 5.8b | `541f80e` | Browser tests for the blog UI (11 tests) |
| 5.9 | `9f7dce5` | Accessibility fixes from Lighthouse; byline separators |

**Step 5.7 (GA4)** is not done: it needs the Measurement ID, which is still outstanding.

### Verification (run against the local stack, Keystone + Postgres + Next)

- Unit and component tests: 292 passing across 37 files. Keystone suite: 112 passing. `tsc` and `eslint` clean in both apps.
- Build passes with Keystone running, and also with Keystone stopped (`generateStaticParams` returns `[]`).
- Redirects: 252 checks (110 slugs and 11 categories in both forms, the 9 legacy redirects, and the draft's 404). Every legacy URL is one 308 to a page that returns 200.
- Content fidelity, all 110 published posts: visible text matches the stored HTML exactly for 84 posts. For the other 26 (table posts), the only difference is whitespace between table cells, and the text is identical once that whitespace is removed. H1, publish date, and "Updated" visibility and value match on every post.
- Crawlability without JS: one H1, canonical, `og:title`, `og:image`, `article:published_time`, and a parseable `BlogPosting` / `BreadcrumbList` / `FAQPage` graph. FAQ answers are in the first response.
- Lead pipeline: valid request 201 and stored; honeypot 200 and nothing stored; invalid email 400; sixth request 429; direct Keystone write without the key denied.
- Browser spec (`e2e/blog-ui.spec.ts`): 11 of 11 passing.
- Lighthouse, mobile, 3 posts: SEO 100; accessibility 99–100; CLS 0; best practices 96; **LCP 3.2–3.4 s (target < 2.5 s, not met)**.

### Deviations from the plan

1. **Typeface:** Inter throughout, as chosen. No serif.
2. **Column breakpoint:** three columns (TOC, article, lead rail) from 1280px, not 1024px. At 1024px the article is too narrow. Between 1024 and 1279px the lead form sits after the FAQ.
3. **Share bar:** moved from the rail into the hero, and again after the FAQ.
4. **Reading progress:** CSS scroll-driven, not a client component.
5. **Prose class:** `prose` (not `prose-lg`), because the typography theme already sets the sizes.
6. **Not-found pages:** one `blogs/not-found.tsx` for listing pages, plus `blogs/[slug]/not-found.tsx` for posts.
7. **FAQ answers:** stored as HTML fragments (120 of 262 answers contain leftover editor markup). They are rendered through an allow-list, and the FAQPage text is derived from the same markup. This was not in the plan.
8. **Table headers:** the first row of a header-less table becomes `th scope="col"`. Text is unchanged. Found by Lighthouse.
9. **Phase 3 and 4 corrections:** the legacy redirects were two hops for trailing-slash URLs. The revalidation hook never sent the category scope and let rejected requests escape; its test never ran, because it imported Vitest inside the `node:test` suite.

### Open items

- **Featured images return 404 until the R2 public bucket is set up and the image import is run.** The import ran with `--skip-images`, so the cards and the post hero show broken images. The alt text is visible in the meantime.
- **One unresolved internal link:** `accommodation-for-students-in-the-usa` links to `/course-country-university-selection/`, which is not in the export. Decide what it maps to, then the import's zero-unknown-links exit criterion is met.
- **Import is not a no-op on re-run:** a second run reports `updated: 111` rather than `unchanged: 111`. The row count stays at 111, but change detection needs looking at.
- **LCP:** 3.0–3.4 s locally under Lighthouse's mobile throttling. The shared public layout is the main cost: `/about` on the same layout measures 3.7 s. Worth re-measuring on the real host before tuning shared code.
- **Keystone outage:** `/blogs` and post pages return 500 when Keystone is unreachable. ISR-cached pages keep serving. A stale-data fallback would be a follow-up.
- **Footer LinkedIn link** is still `href="#"`, carried over from the original site.
- **Not run:** Google Rich Results Test, the Schema.org validator, and OG previews on a public URL. These need the production host.
- **Hero copy on `/blogs`** is placeholder text. Confirm the wording before launch.
