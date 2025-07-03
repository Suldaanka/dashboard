import { Webhook } from 'svix';
import { clerkClient } from '@clerk/clerk-sdk-node'; // ✅ Server-side Clerk SDK
import { headers } from 'next/headers';
import { prisma } from '@/lib/prisma';

export async function POST(req) {
  const SIGNING_SECRET = process.env.CLERK_WEBHOOK_SECRET;

  if (!SIGNING_SECRET) {
    console.error("Missing Clerk Webhook Secret in environment variables.");
    return new Response("Missing webhook secret", { status: 500 });
  }

  const wh = new Webhook(SIGNING_SECRET);

  // ✅ Await the headers to avoid runtime error
  const headerPayload = await headers();
  const svix_id = headerPayload.get('svix-id');
  const svix_timestamp = headerPayload.get('svix-timestamp');
  const svix_signature = headerPayload.get('svix-signature');

  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response('Missing Svix headers', { status: 400 });
  }

  // Read and verify body
  const payload = await req.json();
  const body = JSON.stringify(payload);

  let evt;
  try {
    evt = wh.verify(body, {
      'svix-id': svix_id,
      'svix-timestamp': svix_timestamp,
      'svix-signature': svix_signature,
    });
  } catch (err) {
    console.error('Webhook verification failed:', err);
    return new Response('Invalid webhook signature', { status: 400 });
  }

  const eventType = evt.type;
  const userId = evt.data.id;
  const fullName = `${evt.data.first_name ?? ''} ${evt.data.last_name ?? ''}`.trim();
  const email = evt.data.email_addresses?.[0]?.email_address || '';
  const imageUrl = evt.data.image_url || '';

  if (eventType === 'user.created') {
    try {
      // ✅ Set publicMetadata.role to "USER"
      await clerkClient.users.updateUser(userId, {
        publicMetadata: {
          role: 'USER',
        },
      });

      // ✅ Save user to your Prisma DB
      await prisma.user.create({
        data: {
          clerkId: userId,
          email,
          name: fullName || 'No Name',
          imageUrl,
        },
      });

      return new Response('User created and metadata set', { status: 200 });
    } catch (err) {
      console.error('Failed to process user.created event:', err);
      return new Response('Internal server error', { status: 500 });
    }
  }

  return new Response('Event ignored', { status: 200 });
}
