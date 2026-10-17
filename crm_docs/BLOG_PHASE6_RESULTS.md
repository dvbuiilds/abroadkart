# Blog migration: Phase 6 results

Date: 2026-10-17. Branch: `fb_wp_blog_migration`. Plan: `in-output-folder-we-eager-whistle.md` §3, Phase 6.

Environment: production build (`yarn build && yarn start`) on :3000, Keystone dev on :3001, Postgres in Docker. Data: 111 posts imported (110 published, 1 draft).

## Commits

| Step | Commit | Scope |
|---|---|---|
| 6.0 | `fa6f1d2` | Middleware: only CRM prefixes need a session; unknown paths 404 |
| 6.1 | `3d84f67` | e2e helpers (`source`, `text`, `db`), `test:e2e:phase6` script, `@types/jsdom` |
| 6.4 | `40d2ebb` | Legacy URLs return a bare 404; static pages keep the slash redirect |
| 6.6 | `1ef0fc7` | robots.txt and sitemap.xml checks |
| 6.3 | `d923aaf` | Content fidelity, all 110 published posts |
| 6.2 | `4f68245` | Crawlability with JS disabled |
| 6.5 | `a23d9f5` | Lead form UI, API contract, rate limit, Keystone guard |

## Automated results

| Gate | Result |
|---|---|
| `yarn test` (tsc, eslint, 36 files) | 318 / 318 unit tests passing |
| `middleware.test.ts` | 40 / 40 |
| `legacy-urls.spec.ts` | 368 / 368 |
| `seo-files.spec.ts` | 11 / 11 |
| `content-fidelity.spec.ts` | 110 / 110 |
| `crawlability.spec.ts` (JS off) | 26 / 26 |
| `lead-form.spec.ts` | 10 / 10 (DB assertions included) |
| Full `test:e2e:phase6`, run twice | 551 / 551 both runs, exit 0; no leftover `e2e-*` leads |

Scope notes:
- Fidelity compares text with all whitespace removed. For the 26 table posts, the only difference from the source is whitespace between cells.
- "Updated" follows `PostMeta`: it is shown when the publish and update dates fall on different IST calendar days.

## Lighthouse (mobile, production build, local)

| Post | Performance | Accessibility | SEO | Best practices | LCP | CLS |
|---|---|---|---|---|---|---|
| `mba-vs-pgdm-guide` | 91 | 100 | 100 | 96 | 3.5 s | 0 |
| `johns-hopkins-university` | 91 | 100 | 100 | 96 | 3.5 s | 0 |
| `work-experience-for-ms-in-usa` (no FAQs) | 92 | 98 | 100 | 96 | 3.3 s | 0 |

Targets: SEO 100 (met), accessibility ≥ 95 (met), CLS < 0.05 (met), **LCP < 2.5 s (not met)**.

The LCP element on all three is the H1 text, not the hero image. The delay comes from first render of the shared public layout. The measured TTFB is 30 ms, and render-blocking resources cost about 200 ms. Re-measure on the real host before tuning shared code.

## Not run in this pass

| Check | Reason |
|---|---|
| Google Rich Results Test, Schema.org validator | Needs a public URL (open item 7) |
| opengraph.xyz and WhatsApp preview | Needs a public URL; the image also needs the R2 bucket (open item 1) |
| Keystone down: ISR pages still served | Verified in Phase 5, not re-run |
| Build with Keystone stopped | Verified in Phase 5, not re-run |
| Revalidation after a Keystone edit | Would change production-like data; not run |

## Open items and go-live gate

| # | Item | Blocks go-live? |
|---|---|---|
| 1 | Featured images return 404 (R2 bucket and `cdn.abroadkart.com` not set up; import ran with `--skip-images`) | **Yes** |
| 2 | Unresolved link `/course-country-university-selection/` in `accommodation-for-students-in-the-usa`. Allow-listed in `content-fidelity.spec.ts` until mapped. | **Yes**, decision needed |
| 3 | `/blogs` hero copy is placeholder text | **Yes**, copy needed |
| 4 | LCP 3.3–3.5 s (target < 2.5 s). Shared layout, LCP element is the H1. | No; re-measure on the real host |
| 5 | Footer LinkedIn link is `href="#"` | No |
| 6 | Import re-run reports `updated: 111` instead of `unchanged` (row count stays 111) | No; investigate change detection |
| 7 | Rich Results, Schema.org and OG preview not run | Needs public URL |
| 8 | GA4 (step 5.7) not done | No for launch; needed for conversion tracking |

## Decisions made during Phase 6

1. **Middleware inverted.** Only `/consultant`, `/fulfilment`, `/admin`, `/dashboard`, `/api/consultant`, `/api/graphql` require a session. Previously every path outside the public list redirected to sign-in, which made legacy URLs return a 307.
2. **Static pages keep the trailing-slash redirect.** `/about/`, `/contact/`, `/blogs/` and similar redirect once (308). Other trailing-slash URLs, including legacy post URLs, return a bare 404. This needed `skipTrailingSlashRedirect` in `next.config.ts`, because Next's default 308 sent legacy URLs to the no-slash form first.
3. **`@types/jsdom` added** as a dev dependency so the e2e text helper is typed.

## Behaviour change to review

Because the middleware now only guards the CRM prefixes, any route outside them passes through without a session. Before this change those routes redirected to sign-in. Checked in this pass:
- `/api/hello` returns a static JSON body. No change in exposure.
- `src/app/api/webhooks/` is an empty directory, so there is no handler to reach. Anything under it returns 404. When a webhook handler is added, it must verify its own signature, because middleware no longer guards it.
