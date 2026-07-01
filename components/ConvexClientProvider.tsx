"use client";

import { ConvexProvider, ConvexReactClient } from "convex/react";
import { ReactNode } from "react";

// Create a single Convex client instance
let convex: ConvexReactClient | null = null;

function getConvexClient() {
  if (!convex) {
    const url = process.env.NEXT_PUBLIC_CONVEX_URL;
    if (!url) {
      throw new Error(
        "NEXT_PUBLIC_CONVEX_URL is not defined in environment variables"
      );
    }
    convex = new ConvexReactClient(url);
  }
  return convex;
}

export default function ConvexClientProvider({
  children,
}: {
  children: ReactNode;
}) {
  const client = getConvexClient();
  return <ConvexProvider client={client}>{children}</ConvexProvider>;
}