/**
 * Clerk webhook handler to sync users and organizations to Keystone
 */

import { Webhook } from 'svix';
import { headers } from 'next/headers';
import { NextResponse } from 'next/server';
import { createGraphQLClient } from '@app/lib/graphql';

const KEYSTONE_URL = process.env.NEXT_PUBLIC_KEYSTONE_URL || 'http://localhost:3001';

export async function POST(req: Request) {
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;

  if (!WEBHOOK_SECRET) {
    console.error('CLERK_WEBHOOK_SECRET is not set');
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
    console.error('Error verifying webhook:', err);
    return NextResponse.json(
      { error: 'Error verifying webhook' },
      { status: 400 }
    );
  }

  // Handle the webhook
  const eventType = evt.type;

  try {
    const graphqlClient = createGraphQLClient();

    // Handle user.created event
    if (eventType === 'user.created') {
      const { id, email_addresses, first_name, last_name } = evt.data;
      const primaryEmail = email_addresses.find(
        (e: any) => e.id === evt.data.primary_email_address_id
      )?.email_address;

      if (!primaryEmail) {
        console.error('No primary email found for user:', id);
        return NextResponse.json({ error: 'No primary email' }, { status: 400 });
      }

      // Create User in Keystone via GraphQL mutation
      // Note: This requires Keystone to be running and accessible
      // For now, we'll use a direct mutation - in production, you might want to use Keystone's context API
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
        await graphqlClient.request(mutation, {
          data: {
            clerkUserId: id,
            email: primaryEmail,
            name: `${first_name || ''} ${last_name || ''}`.trim() || null,
            role: 'consultantAgent', // Default role, can be updated later
            isActive: true,
          },
        });
      } catch (error: any) {
        // If user already exists, that's okay
        if (!error.message?.includes('Unique constraint')) {
          console.error('Error creating user in Keystone:', error);
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
        return NextResponse.json({ error: 'No primary email' }, { status: 400 });
      }

      const mutation = `
        mutation UpdateUser($clerkUserId: String!, $data: UserUpdateInput!) {
          updateUser(where: { clerkUserId: $clerkUserId }, data: $data) {
            id
            email
          }
        }
      `;

      try {
        await graphqlClient.request(mutation, {
          clerkUserId: id,
          data: {
            email: primaryEmail,
            name: `${first_name || ''} ${last_name || ''}`.trim() || null,
          },
        });
      } catch (error) {
        console.error('Error updating user in Keystone:', error);
      }
    }

    // Handle organizationMembership.created (tenant assignment)
    if (eventType === 'organizationMembership.created') {
      const { organization, public_user_data } = evt.data;
      
      // Map Clerk organization to Keystone Consultant (tenant)
      // This will be implemented in Phase 2
      console.log('Organization membership created:', {
        userId: public_user_data.user_id,
        organizationId: organization.id,
      });
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Error processing webhook:', error);
    return NextResponse.json(
      { error: 'Error processing webhook' },
      { status: 500 }
    );
  }
}