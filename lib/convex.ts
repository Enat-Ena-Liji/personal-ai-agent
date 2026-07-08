

// This file is for server-side use only
import { ConvexReactClient } from "convex/react";

let convexClient: ConvexReactClient | null = null;

export function getConvexClient() {
  if (!convexClient) {
    const url = process.env.NEXT_PUBLIC_CONVEX_URL;
    if (!url) {
      throw new Error("NEXT_PUBLIC_CONVEX_URL is not defined");
    }
    convexClient = new ConvexReactClient(url);
  }
  return convexClient;
}