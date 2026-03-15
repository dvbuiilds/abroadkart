/**
 * Clerk webhook handler to sync users and organizations to Keystone
 */

import { Webhook } from 'svix';
import { headers } from 'next/headers';
import { NextResponse } from 'next/server';
import { createGraphQLClient } from '@app/lib/graphql';

const KEYSTONE_URL = process.env.NEXT_PUBLIC_KEYSTONE_URL || 'http://localhost:3001';

export async function POST(req: Request) {
  console.log('[clerk webhook] POST /api/webhooks/clerk received');
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;

  if (!WEBHOOK_SECRET) {
    console.error('[clerk webhook] CLERK_WEBHOOK_SECRET is not set');
    return NextResponse.json(
      { error: 'Webhook secret not configured' },
      { status: 500 }
    );
  }

  // Get the Svix headers for verification
  const headerPayload = await headers();
  const svix_id = headerPayload.get('svix-id');
  const svix_timestamp = headerPayload.get('svix-timestamp');
  const svix_signature = headerPayload.get('svix-signature');

  // If there are no headers, error out
  if (!svix_id || !svix_timestamp || !svix_signature) {
    console.warn('[clerk webhook] Missing Svix headers');
    return NextResponse.json(
      { error: 'Error occured -- no svix headers' },
      { status: 400 }
    );
  }

  // Get the body
  const payload = await req.text();
  const body = JSON.parse(payload);

  // Create a new Svix instance with your secret.
  const wh = new Webhook(WEBHOOK_SECRET);

  let evt: any;

  // Verify the payload with the headers
  try {
    evt = wh.verify(payload, {
      'svix-id': svix_id,
      'svix-timestamp': svix_timestamp,
      'svix-signature': svix_signature,
    });
  } catch (err) {
    console.error('[clerk webhook] Svix verification failed', err);
    return NextResponse.json(
      { error: 'Error verifying webhook' },
      { status: 400 }
    );
  }

  // Handle the webhook
  const eventType = evt.type;
  console.log('[clerk webhook] Event type:', eventType);

  try {
    const graphqlClient = createGraphQLClient();
    console.log('[clerk webhook] GraphQL client created, KEYSTONE_URL:', KEYSTONE_URL);

    // Handle user.created event
    if (eventType === 'user.created') {
      const { id, email_addresses, first_name, last_name } = evt.data;
      const primaryEmail = email_addresses.find(
        (e: any) => e.id === evt.data.primary_email_address_id
      )?.email_address;

      if (!primaryEmail) {
        console.error('[clerk webhook] user.created: No primary email for clerk user', { clerkUserId: id });
        return NextResponse.json({ error: 'No primary email' }, { status: 400 });
      }

      const userName = `${first_name || ''} ${last_name || ''}`.trim() || null;
      console.log('[clerk webhook] user.created: Creating user in Keystone', {
        clerkUserId: id,
        email: primaryEmail,
        name: userName,
      });

      // Create User in Keystone via GraphQL mutation
      const mutation = `
        mutation CreateUser($data: UserCreateInput!) {
          createUser(data: $data) {
            id
            email
            clerkUserId
          }
        }
      `;

      try {
        const result = await graphqlClient.request(mutation, {
          data: {
            clerkUserId: id,
            email: primaryEmail,
            name: userName,
            role: 'consultantAgent', // Default role, can be updated later
            isActive: true,
          },
        }) as { createUser?: { id: string; email: string; clerkUserId: string } };
        console.log('[clerk webhook] user.created: Keystone createUser success', {
          keystoneUserId: result?.createUser?.id,
          email: result?.createUser?.email,
        });
      } catch (error: any) {
        // If user already exists, that's okay
        if (error.message?.includes('Unique constraint')) {
          console.log('[clerk webhook] user.created: User already exists (unique constraint)', {
            clerkUserId: id,
            email: primaryEmail,
          });
        } else {
          console.error('[clerk webhook] user.created: Keystone createUser failed', {
            clerkUserId: id,
            email: primaryEmail,
            error: error?.message ?? error,
            response: error?.response,
          });
        }
      }
    }

    // Handle user.updated event
    if (eventType === 'user.updated') {
      const { id, email_addresses, first_name, last_name } = evt.data;
      const primaryEmail = email_addresses.find(
        (e: any) => e.id === evt.data.primary_email_address_id
      )?.email_address;

      if (!primaryEmail) {
        console.warn('[clerk webhook] user.updated: No primary email', { clerkUserId: id });
        return NextResponse.json({ error: 'No primary email' }, { status: 400 });
      }

      const userName = `${first_name || ''} ${last_name || ''}`.trim() || null;
      console.log('[clerk webhook] user.updated: Updating user in Keystone', {
        clerkUserId: id,
        email: primaryEmail,
        name: userName,
      });

      const mutation = `
        mutation UpdateUser($clerkUserId: String!, $data: UserUpdateInput!) {
          updateUser(where: { clerkUserId: $clerkUserId }, data: $data) {
            id
            email
          }
        }
      `;

      try {
        const result = await graphqlClient.request(mutation, {
          clerkUserId: id,
          data: {
            email: primaryEmail,
            name: userName,
          },
        }) as { updateUser?: { id: string; email: string } };
        console.log('[clerk webhook] user.updated: Keystone updateUser success', {
          keystoneUserId: result?.updateUser?.id,
        });
      } catch (error: any) {
        console.error('[clerk webhook] user.updated: Keystone updateUser failed', {
          clerkUserId: id,
          error: error?.message ?? error,
          response: error?.response,
        });
      }
    }

    // Handle organizationMembership.created (tenant assignment)
    if (eventType === 'organizationMembership.created') {
      const { organization, public_user_data } = evt.data;
      console.log('[clerk webhook] organizationMembership.created', {
        userId: public_user_data.user_id,
        organizationId: organization.id,
      });
    }

    console.log('[clerk webhook] Handled successfully', { eventType });
    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error('[clerk webhook] Error processing webhook', {
      eventType,
      error: error?.message ?? error,
      stack: error?.stack,
    });
    return NextResponse.json(
      { error: 'Error processing webhook' },
      { status: 500 }
    );
  }
}