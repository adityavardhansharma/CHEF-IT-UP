import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";

const http = httpRouter();

// Webhook handler for Clerk
http.route({
  path: "/clerk",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    const payloadString = await request.text();
    const headerPayload = request.headers;

    try {
      // Handle Clerk webhook events here
      const payload = JSON.parse(payloadString);
      
      // You can handle different event types
      switch (payload.type) {
        case "user.created":
          // Handle user creation
          break;
        case "user.updated":
          // Handle user update
          break;
        default:
          break;
      }

      return new Response(null, {
        status: 200,
      });
    } catch (err) {
      return new Response("Webhook Error", {
        status: 400,
      });
    }
  }),
});

export default http;
