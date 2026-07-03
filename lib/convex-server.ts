// Server-side Convex client (for API routes)
import { ConvexClient } from "convex/browser";

let convexServerClient: ConvexClient | null = null;

export function getConvexServerClient() {
  if (!convexServerClient) {
    const url = process.env.NEXT_PUBLIC_CONVEX_URL;
    if (!url) {
      throw new Error("NEXT_PUBLIC_CONVEX_URL is not defined");
    }
    convexServerClient = new ConvexClient(url);
  }
  return convexServerClient;
}