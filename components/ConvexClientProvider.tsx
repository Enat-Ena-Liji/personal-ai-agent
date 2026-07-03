"use client";

import { ConvexProvider, ConvexReactClient } from "convex/react";
import { ReactNode, useEffect, useState } from "react";
import { useAuth } from "@clerk/nextjs";

let convex: ConvexReactClient | null = null;

function getConvexClient() {
  if (!convex) {
    const url = process.env.NEXT_PUBLIC_CONVEX_URL;
    if (!url) {
      throw new Error("NEXT_PUBLIC_CONVEX_URL is not defined");
    }
    convex = new ConvexReactClient(url);
    console.log("Convex client created with URL:", url);
  }
  return convex;
}

export default function ConvexClientProvider({
  children,
}: {
  children: ReactNode;
}) {
  const { getToken, isLoaded, isSignedIn } = useAuth();
  const [mounted, setMounted] = useState(false);
  const client = getConvexClient();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted || !isLoaded) return;

    console.log("Setting up Convex auth. Signed in:", isSignedIn);

    // Set the auth function for Convex
    const authFunction = async () => {
      if (!isSignedIn) {
        console.log("Not signed in, returning null");
        return null;
      }
      
      try {
        const token = await getToken();
        console.log("Token obtained:", token ? `Yes (${token.length} chars)` : "No");
        return token;
      } catch (error) {
        console.error("Error getting token:", error);
        return null;
      }
    };

    client.setAuth(authFunction);
    console.log("Auth function set for Convex client");

    // Force re-authentication to ensure token is fresh
    client.clearAuth();
    client.setAuth(authFunction);
    
  }, [client, getToken, isLoaded, isSignedIn, mounted]);

  // Only render children wrapped in ConvexProvider
  return <ConvexProvider client={client}>{children}</ConvexProvider>;
}