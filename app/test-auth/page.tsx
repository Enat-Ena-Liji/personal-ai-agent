"use client";

import { useUser } from "@/hooks/useUser";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useAuth } from "@clerk/nextjs";

export default function TestAuthPage() {
  const { getToken, isLoaded, isSignedIn } = useAuth();
  const { user, credits, isLoaded: userLoaded } = useUser();
  const platforms = useQuery(api.platforms.getPlatforms);

  const checkToken = async () => {
    try {
      const token = await getToken();
      console.log("Token:", token);
      alert(token ? "Token obtained! Check console." : "No token");
    } catch (error) {
      console.error("Error getting token:", error);
    }
  };

  if (!isLoaded || !userLoaded) {
    return <div>Loading...</div>;
  }

  return (
    <div className="p-8 space-y-4">
      <h1 className="text-2xl font-bold">Auth Test</h1>
      
      <div className="space-y-2">
        <p><strong>Signed In:</strong> {isSignedIn ? "✅ Yes" : "❌ No"}</p>
        <p><strong>Convex User:</strong> {user ? "✅ Found" : "❌ Not Found"}</p>
        <p><strong>User ID:</strong> {user?._id || "N/A"}</p>
        <p><strong>Credits:</strong> {credits}</p>
        <p><strong>Platforms:</strong> {platforms?.length || 0}</p>
      </div>

      <button
        onClick={checkToken}
        className="px-4 py-2 bg-blue-600 text-white rounded-lg"
      >
        Get Token
      </button>

      <button
        onClick={async () => {
          const response = await fetch("/api/user/check");
          const data = await response.json();
          console.log("API Check:", data);
          alert(JSON.stringify(data, null, 2));
        }}
        className="px-4 py-2 bg-green-600 text-white rounded-lg"
      >
        Check API
      </button>
    </div>
  );
}