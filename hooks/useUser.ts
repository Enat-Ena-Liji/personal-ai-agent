"use client";

import { useUser as useClerkUser } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useEffect, useRef } from "react";
import type { User } from "@/types";

export function useUser() {
  const { user, isLoaded: clerkLoaded, isSignedIn } = useClerkUser();
  const currentUser = useQuery(api.auth.getCurrentUser) as User | null | undefined;
  const credits = useQuery(api.users.getCredits) as number | undefined;
  
  const hasStoredUser = useRef(false);

  useEffect(() => {
    if (isSignedIn && user && clerkLoaded && !hasStoredUser.current) {
      hasStoredUser.current = true;
      
      console.log("[useUser] Storing user via API...");
      
      fetch("/api/user/store", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: user.id,
          email: user.primaryEmailAddress?.emailAddress || "",
          name: user.fullName || user.firstName || "User",
          imageUrl: user.imageUrl || "",
        }),
      })
        .then(res => res.json())
        .then(data => {
          console.log("[useUser] User stored:", data);
        })
        .catch(error => {
          console.error("[useUser] Failed to store user:", error);
          hasStoredUser.current = false;
        });
    }
  }, [isSignedIn, user, clerkLoaded]);

  return {
    user: currentUser || null,
    credits: credits ?? 0,
    isLoaded: clerkLoaded,
    isSignedIn,
    clerkUser: user,
  };
}