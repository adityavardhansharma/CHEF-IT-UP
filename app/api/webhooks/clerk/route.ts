import { Webhook } from "svix";
import { headers } from "next/headers";
import { WebhookEvent } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  // Get the webhook secret from environment variables
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;

  if (!WEBHOOK_SECRET) {
    throw new Error("Please add CLERK_WEBHOOK_SECRET to .env.local");
  }

  // Get the headers
  const headerPayload = headers();
  const svix_id = headerPayload.get("svix-id");
  const svix_timestamp = headerPayload.get("svix-timestamp");
  const svix_signature = headerPayload.get("svix-signature");

  // If there are no headers, error out
  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response("Error: Missing svix headers", {
      status: 400,
    });
  }

  // Get the body
  const payload = await req.json();
  const body = JSON.stringify(payload);

  // Create a new Svix instance with your webhook secret
  const wh = new Webhook(WEBHOOK_SECRET);

  let evt: WebhookEvent;

  // Verify the webhook signature
  try {
    evt = wh.verify(body, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    }) as WebhookEvent;
  } catch (err) {
    console.error("Error verifying webhook:", err);
    return new Response("Error: Verification failed", {
      status: 400,
    });
  }

  // Handle the webhook event
  const eventType = evt.type;

  if (eventType === "user.created") {
    const { id, email_addresses, first_name, last_name, username } = evt.data;

    console.log("User created in Clerk:", id);
    console.log("Email:", email_addresses[0]?.email_address);
    console.log("Name:", first_name, last_name);

    // For now, just log the user creation
    // The user will be created in Convex on first API call via ctx.auth.getUserIdentity()
    // This is handled automatically by the getCurrentUser query
  }

  if (eventType === "user.updated") {
    const { id, email_addresses, first_name, last_name, username } = evt.data;

    // Update user in Convex if needed
    console.log("User updated:", id);
  }

  if (eventType === "user.deleted") {
    const { id } = evt.data;
    console.log("User deleted:", id);
    // Optionally handle user deletion
  }

  return NextResponse.json({ message: "Webhook processed" }, { status: 200 });
}
