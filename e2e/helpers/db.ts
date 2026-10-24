import { Client } from "pg";

// Lead assertions read the database directly. Set E2E_DATABASE_URL to the
// Keystone Postgres. When it is unset, callers skip the DB assertions and keep
// the UI and API assertions.

export const hasDatabase = Boolean(process.env.E2E_DATABASE_URL);

export interface StoredLead {
  email: string;
  name: string | null;
  phone: string | null;
  message: string | null;
  sourceSlug: string | null;
  sourceUrl: string | null;
  utmSource: string | null;
  utmMedium: string | null;
  utmCampaign: string | null;
  status: string;
  createdAt: Date;
}

async function withClient<T>(run: (client: Client) => Promise<T>): Promise<T> {
  const client = new Client({ connectionString: process.env.E2E_DATABASE_URL });
  await client.connect();
  try {
    return await run(client);
  } finally {
    await client.end();
  }
}

/**
 * Keystone stores list fields as columns on the "BlogLead" table. Column names
 * come from the field names in keystone/schema/BlogLead.ts (camelCase).
 */
export function queryLeads(email: string): Promise<StoredLead[]> {
  return withClient(async (client) => {
    const result = await client.query<StoredLead>(
      `SELECT email, name, phone, message,
              "sourceSlug", "sourceUrl",
              "utmSource", "utmMedium", "utmCampaign",
              status, "createdAt"
         FROM "BlogLead"
        WHERE email = $1
        ORDER BY "createdAt" ASC`,
      [email],
    );
    return result.rows;
  });
}

/** Removes every lead created by the e2e suite. Only the e2e-*@example.com pattern matches. */
export function deleteTestLeads(): Promise<number> {
  return withClient(async (client) => {
    const result = await client.query(
      `DELETE FROM "BlogLead" WHERE email LIKE 'e2e-%@example.com'`,
    );
    return result.rowCount ?? 0;
  });
}
