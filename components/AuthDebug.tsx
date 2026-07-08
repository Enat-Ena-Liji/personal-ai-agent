"use client";

import { useUser } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useEffect, useState } from "react";

export function AuthDebug() {
  const { user, isLoaded, isSignedIn } = useUser();
  const currentUser = useQuery(api.auth.getCurrentUser);
  const platforms = useQuery(api.platforms.getPlatforms);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted || !isLoaded) {
    return <div className="p-4 bg-gray-100 rounded">Loading auth...</div>;
  }

  return (
    <div className="p-4 bg-gray-100 rounded-lg text-xs font-mono">
      <h3 className="font-bold text-sm mb-2">🔧 Auth Debug</h3>
      <div>
        <span className="font-medium">Clerk:</span> 
        {isSignedIn ? " ✅ Signed In" : " ❌ Not Signed In"}
      </div>
      {isSignedIn && user && (
        <>
          <div><span className="font-medium">User:</span> {user.primaryEmailAddress?.emailAddress}</div>
          <div><span className="font-medium">User ID:</span> {user.id}</div>
        </>
      )}
      <div>
        <span className="font-medium">Convex User:</span> 
        {currentUser ? " ✅ Found" : " ❌ Not Found"}
      </div>
      {currentUser && (
        <>
          <div><span className="font-medium">Convex ID:</span> {currentUser._id}</div>
          <div><span className="font-medium">Credits:</span> {currentUser.credits}</div>
        </>
      )}
      <div>
        <span className="font-medium">Platforms:</span> 
        {platforms ? ` ${platforms.length} connected` : " Loading..."}
      </div>
      {!currentUser && isSignedIn && (
        <div className="mt-2 text-yellow-600">
          ⚠️ User not found in Convex. Checking storage...
        </div>
      )}
    </div>
  );
}