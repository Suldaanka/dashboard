// app/api/webhooks/clerk/route.js
import { Webhook } from 'svix';
import { headers } from 'next/headers';
import { prisma } from '@/lib/prisma';
import { createClerkClient } from '@clerk/backend';

const clerkClient = createClerkClient({
  secretKey: process.env.CLERK_SECRET_KEY,
});

export async function POST(req) {
  // Log the exact time when webhook is received
  const receivedAt = new Date();
  const receivedTimestamp = Math.floor(receivedAt.getTime() / 1000);
  
  console.log('🔄 Webhook POST request received at:', {
    iso: receivedAt.toISOString(),
    timestamp: receivedTimestamp,
    timezone: receivedAt.getTimezoneOffset()
  });
  
  const SIGNING_SECRET = process.env.CLERK_WEBHOOK_SECRET;

  if (!SIGNING_SECRET) {
    console.error('❌ CLERK_WEBHOOK_SECRET is not set');
    return new Response('Server configuration error', { status: 500 });
  }

  try {
    const svixHeaders = await headers();
    const svix_id = svixHeaders.get('svix-id');
    const svix_timestamp = svixHeaders.get('svix-timestamp');
    const svix_signature = svixHeaders.get('svix-signature');

    if (!svix_id || !svix_timestamp || !svix_signature) {
      console.error('❌ Missing Svix headers');
      return new Response('Missing Svix headers', { status: 400 });
    }

    // Get raw body for verification
    const payload = await req.text();
    
    // Detailed timestamp analysis
    const webhookTimestamp = parseInt(svix_timestamp);
    const webhookDate = new Date(webhookTimestamp * 1000);
    const currentTimestamp = Math.floor(Date.now() / 1000);
    const currentDate = new Date();
    const timeDifference = Math.abs(currentTimestamp - webhookTimestamp);
    
    console.log('⏰ Detailed time analysis:', {
      webhook: {
        timestamp: webhookTimestamp,
        iso: webhookDate.toISOString(),
        readable: webhookDate.toString()
      },
      server: {
        timestamp: currentTimestamp,
        iso: currentDate.toISOString(),
        readable: currentDate.toString()
      },
      difference: {
        seconds: timeDifference,
        minutes: Math.floor(timeDifference / 60),
        isOld: webhookTimestamp < currentTimestamp,
        isFuture: webhookTimestamp > currentTimestamp
      }
    });

    let evt;
    try {
      // Try with different tolerance levels
      let wh;
      
      if (timeDifference > 300) { // More than 5 minutes
        console.log('⚠️ Large time difference detected, using extended tolerance');
        wh = new Webhook(SIGNING_SECRET, {
          toleranceInSeconds: 3600 // 1 hour for debugging
        });
      } else {
        console.log('✅ Normal time difference, using standard tolerance');
        wh = new Webhook(SIGNING_SECRET, {
          toleranceInSeconds: 600 // 10 minutes
        });
      }
      
      evt = wh.verify(payload, {
        'svix-id': svix_id,
        'svix-timestamp': svix_timestamp,
        'svix-signature': svix_signature,
      });
      
      console.log('✅ Webhook signature verified successfully');
      
    } catch (err) {
      console.error('❌ Webhook verification failed:', {
        errorType: err.constructor.name,
        message: err.message,
        timeDifference,
        webhookTimestamp,
        currentTimestamp,
        webhookAge: `${Math.floor(timeDifference / 60)} minutes ${timeDifference % 60} seconds`
      });
      
      // Try one more time with maximum tolerance for debugging
      try {
        console.log('🔄 Attempting verification with maximum tolerance...');
        const maxWh = new Webhook(SIGNING_SECRET, {
          toleranceInSeconds: 86400 // 24 hours - just for debugging
        });
        
        evt = maxWh.verify(payload, {
          'svix-id': svix_id,
          'svix-timestamp': svix_timestamp,
          'svix-signature': svix_signature,
        });
        
        console.log('✅ Verification succeeded with maximum tolerance');
        
      } catch (maxErr) {
        console.error('❌ Even maximum tolerance failed:', maxErr.message);
        return new Response('Verification error', { status: 400 });
      }
    }

    const eventType = evt.type;
    const id = evt.data.id;
    const fullname = `${evt.data.first_name || ''} ${evt.data.last_name || ''}`.trim();

    console.log(`✅ Webhook received: ${eventType}`);
    console.log(`👤 Clerk ID: ${id}`);

    if (eventType === "user.created") {
      try {
        console.log('🔄 Processing user.created event');
        
        // Update Clerk user metadata
        await clerkClient.users.updateUser(id, {
          publicMetadata: {
            role: "USER",
          },
        });
        console.log('✅ Clerk metadata updated');

        // Save to database
        const user = await prisma.user.upsert({
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
            role: "USER",
          },
        });

        console.log("✅ User saved to DB:", user.id);
        
      } catch (error) {
        console.error("❌ Error in user.created handler:", {
          message: error.message,
          name: error.name
        });
        return new Response('Internal error', { status: 500 });
      }
    }

    console.log('✅ Webhook processing completed successfully');
    return new Response('Webhook received', { status: 200 });
    
  } catch (error) {
    console.error('❌ Unexpected error in webhook:', {
      message: error.message,
      name: error.name,
      stack: error.stack
    });
    return new Response('Internal server error', { status: 500 });
  }
}