import { test, expect, type APIRequestContext } from "@playwright/test";
import { deleteTestLeads, hasDatabase, queryLeads } from "./helpers/db";

// Lead capture: the UI form, the POST /api/blog-leads contract, the rate limit
// and the Keystone write guard. DB assertions need E2E_DATABASE_URL and are
// skipped without it. Test emails match e2e-%@example.com so cleanup can find
// them.
//
// The rate limit is in memory and keyed by client IP (cf-connecting-ip, then
// x-forwarded-for). Each test uses its own random IP so tests don't share a
// quota.

const KEYSTONE_URL = process.env.E2E_KEYSTONE_URL ?? "http://localhost:3001";
const SUBMIT_URL = "/api/blog-leads";
const POST_SLUG = "mba-vs-pgdm-guide";

function randomIp(): string {
  const octet = () => 1 + Math.floor(Math.random() * 254);
  return `10.${octet()}.${octet()}.${octet()}`;
}

function uniqueEmail(label: string): string {
  const nonce = Math.random().toString(36).slice(2, 8);
  return `e2e-${label}-${Date.now()}-${nonce}@example.com`;
}

async function postLead(
  request: APIRequestContext,
  body: Record<string, unknown>,
  ip: string,
) {
  return request.post(SUBMIT_URL, {
    data: body,
    headers: { "x-forwarded-for": ip },
  });
}

test.afterAll(async () => {
  if (hasDatabase) await deleteTestLeads();
});

test.describe("UI form on a post", () => {
  test.beforeEach(async ({ context }) => {
    await context.setExtraHTTPHeaders({ "x-forwarded-for": randomIp() });
  });

  test("a valid submission shows the success message and stores the lead", async ({ page }) => {
    const email = uniqueEmail("ui");
    await page.goto(`/blogs/${POST_SLUG}`);

    const form = page.locator("form:visible").first();
    await form.locator('input[name="email"]').fill(email);
    await form.locator('input[name="name"]').fill("E2E Tester");
    await form.locator('input[name="phone"]').fill("+91 98765 43210");
    await form.locator('textarea[name="message"]').fill("Please call me back.");
    await form.getByRole("button", { name: "Request a callback" }).click();

    await expect(page.getByText("Thanks! A counsellor will be in touch soon.")).toBeVisible();

    test.skip(!hasDatabase, "E2E_DATABASE_URL is not set");
    const [lead] = await queryLeads(email);
    expect(lead).toBeDefined();
    expect(lead.sourceSlug).toBe(POST_SLUG);
    expect(lead.sourceUrl).toContain(`/blogs/${POST_SLUG}`);
    expect(lead.status).toBe("new");
    expect(lead.createdAt).toBeInstanceOf(Date);
    expect(lead.name).toBe("E2E Tester");
    expect(lead.phone).toBe("+91 98765 43210");
    expect(lead.message).toBe("Please call me back.");
  });

  test("UTM parameters from the URL are stored with the lead", async ({ page }) => {
    test.skip(!hasDatabase, "E2E_DATABASE_URL is not set");
    const email = uniqueEmail("utm");
    await page.goto(
      `/blogs/${POST_SLUG}?utm_source=e2e&utm_medium=test&utm_campaign=phase6`,
    );

    const form = page.locator("form:visible").first();
    await form.locator('input[name="email"]').fill(email);
    await form.getByRole("button", { name: "Request a callback" }).click();
    await expect(page.getByText("Thanks! A counsellor will be in touch soon.")).toBeVisible();

    const [lead] = await queryLeads(email);
    expect(lead.utmSource).toBe("e2e");
    expect(lead.utmMedium).toBe("test");
    expect(lead.utmCampaign).toBe("phase6");
  });

  test("an empty email is blocked in the browser and never sent", async ({ page }) => {
    await page.goto(`/blogs/${POST_SLUG}`);
    const requests: string[] = [];
    page.on("request", (req) => {
      if (req.url().includes(SUBMIT_URL)) requests.push(req.url());
    });

    const form = page.locator("form:visible").first();
    await form.getByRole("button", { name: "Request a callback" }).click();

    await expect(page.getByText("Email is required")).toBeVisible();
    expect(requests).toHaveLength(0);
  });

  test("a malformed email shows a validation error and is not sent", async ({ page }) => {
    await page.goto(`/blogs/${POST_SLUG}`);
    const requests: string[] = [];
    page.on("request", (req) => {
      if (req.url().includes(SUBMIT_URL)) requests.push(req.url());
    });

    const form = page.locator("form:visible").first();
    await form.locator('input[name="email"]').fill("not-an-email");
    await form.getByRole("button", { name: "Request a callback" }).click();

    await expect(page.getByText("Enter a valid email address")).toBeVisible();
    expect(requests).toHaveLength(0);
  });
});

test.describe("POST /api/blog-leads contract", () => {
  test("a missing email is rejected with 400", async ({ request }) => {
    const response = await postLead(request, { name: "No Email" }, randomIp());
    expect(response.status()).toBe(400);
  });

  test("a valid lead is stored and returns 201 with the email", async ({ request }) => {
    const email = uniqueEmail("api");
    const response = await postLead(
      request,
      { email, sourceSlug: POST_SLUG, sourceUrl: `http://localhost:3000/blogs/${POST_SLUG}` },
      randomIp(),
    );
    expect(response.status()).toBe(201);
    expect(await response.json()).toEqual({ ok: true, email });

    test.skip(!hasDatabase, "E2E_DATABASE_URL is not set");
    expect(await queryLeads(email)).toHaveLength(1);
  });

  test("a filled honeypot returns 200 and stores nothing", async ({ request }) => {
    const email = uniqueEmail("bot");
    const response = await postLead(request, { email, website: "http://spam.example" }, randomIp());
    expect(response.status()).toBe(200);

    test.skip(!hasDatabase, "E2E_DATABASE_URL is not set");
    expect(await queryLeads(email)).toHaveLength(0);
  });

  test("a malformed email returns 400", async ({ request }) => {
    const response = await postLead(request, { email: "nope" }, randomIp());
    expect(response.status()).toBe(400);
  });
});

test.describe("rate limit", () => {
  test("the sixth submission from one client returns 429", async ({ request }) => {
    const ip = randomIp();
    const statuses: number[] = [];
    for (let i = 0; i < 6; i++) {
      const response = await postLead(request, { email: uniqueEmail(`rl${i}`) }, ip);
      statuses.push(response.status());
    }
    expect(statuses.slice(0, 5)).toEqual([201, 201, 201, 201, 201]);
    expect(statuses[5]).toBe(429);
  });
});

test.describe("Keystone write guard", () => {
  const CREATE = `
    mutation CreateBlogLead($data: BlogLeadCreateInput!) {
      createBlogLead(data: $data) { id email }
    }`;

  test("a BlogLead write without the internal key is denied", async ({ request }) => {
    const email = uniqueEmail("direct");
    const response = await request.post(`${KEYSTONE_URL}/api/graphql`, {
      headers: { "Content-Type": "application/json" },
      data: { query: CREATE, variables: { data: { email } } },
    });
    const body = await response.json();
    expect(body.errors?.length ?? 0).toBeGreaterThan(0);
    expect(body.data?.createBlogLead ?? null).toBeNull();

    test.skip(!hasDatabase, "E2E_DATABASE_URL is not set");
    expect(await queryLeads(email)).toHaveLength(0);
  });
});
