export async function GET() {
    return new Response(JSON.stringify({
      hasClerkWebhookSecret: !!process.env.CLERK_WEBHOOK_SECRET,
      hasClerkSecretKey: !!process.env.CLERK_SECRET_KEY,
      webhookSecretLength: process.env.CLERK_WEBHOOK_SECRET?.length || 0,
      secretKeyLength: process.env.CLERK_SECRET_KEY?.length || 0,
      // Don't expose actual values, just check if they exist
    }, null, 2), {
      headers: { 'Content-Type': 'application/json' },
    });
  }