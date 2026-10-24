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

Status as of 2026-10-19. Local testing scope; production work is tracked separately.

| # | Item | Status | Blocks go-live? |
|---|---|---|---|
| 1 | Featured images | **Resolved.** 110 images uploaded to `abroadkart-public` as `blog/<slug>.<ext>`. `cdn.abroadkart.com` serves them (200, correct type). Covered by `e2e/images.spec.ts`. | No |
| 2 | Unresolved link `/course-country-university-selection/` | **Resolved.** Mapped to `/blogs/category/course-university-selection` via `LINK_OVERRIDES`. The fidelity allow-list is removed. | No |
| 3 | `/blogs` hero copy is placeholder text | Open, needs copy | Yes |
| 4 | LCP 3.3–3.5 s (target < 2.5 s). Shared layout; the LCP element is the H1. | Re-measure with the images live | No |
| 5 | Footer LinkedIn link is `href="#"` | Open, needs the company URL | No |
| 6 | Import re-run reports `updated: 111` | **Resolved.** The id was compared against the mapped input. Second run: `unchanged: 111`, images `skipped: 110`. | No |
| 7 | Rich Results, Schema.org and OG preview | Not run. Needs a public URL, except the Rich Results and Schema.org code-snippet check. | No |
| 8 | GA4 | Blocked on the Measurement ID. `LeadForm` already fires `generate_lead`. | No |
| – | Keystone outage | **Mitigated.** `blogs/error.tsx` shows a retry page instead of a bare 500. | No |
| – | Long meta titles (69 over 60 characters) | Accepted. Original Rank Math titles. | No |
| – | Metadata `&amp;` in 5 titles | **Resolved.** Entities decoded at import. `e2e/seo-files.spec.ts` checks every title. | No |
| – | Empty OG tags on 93 posts | **Resolved.** Focus keywords are used when a post has no tags. | No |

Verification run on 2026-10-19 (production build, Keystone dev, Postgres in Docker):
- `yarn test` (root): 324 / 324, 37 files.
- Keystone `yarn test`: 118 / 118.
- `test:e2e:phase6` plus the new `images` spec: 783 / 783 on a build with `PUBLIC_APP_URL` matching the test port.
- `import:blogs` run twice, then `--verify`: `unchanged: 111` on the second run, zero problems, zero unknown links.

Note: `robots.txt` and the sitemap are prerendered at build time, so `PUBLIC_APP_URL` must match the host the build is served from. A mismatch fails `seo-files.spec.ts`.

## Decisions made during Phase 6

1. **Middleware inverted.** Only `/consultant`, `/fulfilment`, `/admin`, `/dashboard`, `/api/consultant`, `/api/graphql` require a session. Previously every path outside the public list redirected to sign-in, which made legacy URLs return a 307.
2. **Static pages keep the trailing-slash redirect.** `/about/`, `/contact/`, `/blogs/` and similar redirect once (308). Other trailing-slash URLs, including legacy post URLs, return a bare 404. This needed `skipTrailingSlashRedirect` in `next.config.ts`, because Next's default 308 sent legacy URLs to the no-slash form first.
3. **`@types/jsdom` added** as a dev dependency so the e2e text helper is typed.

## Behaviour change to review

Because the middleware now only guards the CRM prefixes, any route outside them passes through without a session. Before this change those routes redirected to sign-in. Checked in this pass:
- `/api/hello` returns a static JSON body. No change in exposure.
- `src/app/api/webhooks/` is an empty directory, so there is no handler to reach. Anything under it returns 404. When a webhook handler is added, it must verify its own signature, because middleware no longer guards it.
