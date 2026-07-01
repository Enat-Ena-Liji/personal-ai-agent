"use client";

import { useUser as useClerkUser } from "@clerk/nextjs";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useEffect } from "react";

export function useUser() {
  const { user, isLoaded: clerkLoaded, isSignedIn } = useClerkUser();
  
  // These should now work after regenerating types
  const storeUser = useMutation(api.auth.storeUser);
  const currentUser = useQuery(api.auth.getCurrentUser);
  const credits = useQuery(api.users.getCredits);

  useEffect(() => {
    if (isSignedIn && user && clerkLoaded) {
      storeUser().catch((error) => {
        console.error("Failed to store user:", error);
      });
    }
  }, [isSignedIn, user, clerkLoaded, storeUser]);

  return {
    user: currentUser,
    credits: credits ?? 0,
    isLoaded: clerkLoaded,
    isSignedIn,
    clerkUser: user,
  };
}