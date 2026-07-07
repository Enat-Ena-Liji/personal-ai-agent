// lib/convex-server.ts
import { ConvexHttpClient } from "convex/browser";

let convexServerClient: ConvexHttpClient | null = null;

export function getConvexServerClient() {
  if (!convexServerClient) {
    const url = process.env.NEXT_PUBLIC_CONVEX_URL;
    if (!url) {
      throw new Error("NEXT_PUBLIC_CONVEX_URL is not defined");
    }
    convexServerClient = new ConvexHttpClient(url);
    console.log("Convex server client created for:", url);
  }
  return convexServerClient;
}