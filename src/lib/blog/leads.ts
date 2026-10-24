import { getKeystoneInternalUrl } from "@app/lib/keystone-url";

/** Fields stored on a BlogLead. The email is required; everything else is optional. */
export interface BlogLeadRecord {
  email: string;
  name?: string;
  phone?: string;
  message?: string;
  sourceSlug?: string;
  sourceUrl?: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
}

const CREATE_BLOG_LEAD = `
  mutation CreateBlogLead($data: BlogLeadCreateInput!) {
    createBlogLead(data: $data) {
      id
    }
  }
`;

/**
 * Stores a lead in Keystone. Server-only: it sends LEADS_INTERNAL_KEY, which the
 * public GraphQL endpoint refuses to accept on BlogLead writes.
 * Throws when the write does not succeed.
 */
export async function createBlogLead(lead: BlogLeadRecord): Promise<void> {
  const key = process.env.LEADS_INTERNAL_KEY;
  if (!key) {
    throw new Error("LEADS_INTERNAL_KEY is not set");
  }

  const response = await fetch(`${getKeystoneInternalUrl()}/api/graphql`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-internal-key": key,
    },
    body: JSON.stringify({
      query: CREATE_BLOG_LEAD,
      variables: { data: lead },
    }),
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`Keystone responded ${response.status} to createBlogLead`);
  }

  const result = (await response.json()) as { errors?: Array<{ message: string }> };
  if (result.errors && result.errors.length > 0) {
    throw new Error(`createBlogLead failed: ${result.errors[0].message}`);
  }
}
