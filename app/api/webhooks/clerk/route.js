// /app/api/webhooks/clerk/route.js or route.ts

import { Webhook } from 'svix';
import { headers } from 'next/headers';
import { prisma } from '@/lib/prisma';
import { createClerkClient } from '@clerk/backend';

const clerkClient = createClerkClient({
  secretKey: process.env.CLERK_SECRET_KEY,
});

export async function POST(req) {
  const SIGNING_SECRET = process.env.CLERK_WEBHOOK_SECRET;

  if (!SIGNING_SECRET) {
    throw new Error('Please set CLERK_WEBHOOK_SECRET in .env');
  }

  const svixHeaders = await headers(); // ✅ await this!
  const svix_id = svixHeaders.get('svix-id');
  const svix_timestamp = svixHeaders.get('svix-timestamp');
  const svix_signature = svixHeaders.get('svix-signature');

  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response('Missing Svix headers', { status: 400 });
  }

  const payload = await req.json();
  const body = JSON.stringify(payload);

  let evt;
  try {
    const wh = new Webhook(SIGNING_SECRET);
    evt = wh.verify(body, {
      'svix-id': svix_id,
      'svix-timestamp': svix_timestamp,
      'svix-signature': svix_signature,
    });
  } catch (err) {
    console.error('Webhook verification failed:', err);
    return new Response('Verification error', { status: 400 });
  }

  const eventType = evt.type;
  const id = evt.data.id;
  const fullname = `${evt.data.first_name || ''} ${evt.data.last_name || ''}`.trim();

  console.log(`✅ Webhook received: ${eventType}`);
  console.log(`👤 Clerk ID: ${id}`);
  console.log(`📦 Payload:`, payload);

  if (eventType === "user.created") {
    try {
      // ✅ Set role in Clerk publicMetadata using updateUser
      await clerkClient.users.updateUser(id, {
        publicMetadata: {
          role: "USER",
        },
      });

      // ✅ Save to your DB
      await prisma.user.upsert({
        where: { clerkId: id },
        update: {
          email: evt.data.email_addresses?.[0]?.email_address,
          name: fullname,
          imageUrl: evt.data.image_url,
        },
        create: {
          clerkId: id,
          email: evt.data.email_addresses?.[0]?.email_address,
          name: fullname,
          imageUrl: evt.data.image_url,
          role: "USER", // Also save role to DB
        },
      });

      console.log("✅ User saved to DB and role set");
    } catch (error) {
      console.error("❌ Error updating Clerk or saving to DB:", error);
      return new Response('Internal error', { status: 500 });
    }
  }

  return new Response('Webhook received', { status: 200 });
}
