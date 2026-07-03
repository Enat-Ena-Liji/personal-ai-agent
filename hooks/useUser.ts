"use client";

import { useUser as useClerkUser } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useEffect, useState } from "react";

export function useUser() {
  const { user, isLoaded: clerkLoaded, isSignedIn } = useClerkUser();
  const currentUser = useQuery(api.auth.getCurrentUser);
  const credits = useQuery(api.users.getCredits);
  const [isStoring, setIsStoring] = useState(false);

  useEffect(() => {
    if (isSignedIn && user && clerkLoaded && !isStoring) {
      setIsStoring(true);
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
          setIsStoring(false);
        })
        .catch(error => {
          console.error("[useUser] Failed to store user:", error);
          setIsStoring(false);
        });
    }
  }, [isSignedIn, user, clerkLoaded, isStoring]);

  return {
    user: currentUser,
    credits: credits ?? 0,
    isLoaded: clerkLoaded,
    isSignedIn,
    clerkUser: user,
  };
}