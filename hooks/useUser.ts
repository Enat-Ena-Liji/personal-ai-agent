"use client";

import { useUser as useClerkUser } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useEffect, useRef } from "react";

export function useUser() {
  const { user, isLoaded: clerkLoaded, isSignedIn } = useClerkUser();
  const currentUser = useQuery(api.auth.getCurrentUser);
  const credits = useQuery(api.users.getCredits);
  
  // Use ref to prevent multiple calls
  const hasStoredUser = useRef(false);

  useEffect(() => {
    // Only store once and when conditions are met
    if (isSignedIn && user && clerkLoaded && !hasStoredUser.current) {
      // Mark as stored immediately to prevent re-runs
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
          // Reset the flag if storing failed, so we can retry
          hasStoredUser.current = false;
        });
    }
  }, [isSignedIn, user, clerkLoaded]);

  return {
    user: currentUser,
    credits: credits ?? 0,
    isLoaded: clerkLoaded,
    isSignedIn,
    clerkUser: user,
  };
}