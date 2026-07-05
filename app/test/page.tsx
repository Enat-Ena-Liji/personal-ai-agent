"use client";

import { useState, useEffect } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useUser } from "@/hooks/useUser";
import { useAuth } from "@clerk/nextjs";
import type { CheckUserResponse } from "@/types";

export default function TestPage() {
  const { user, credits, isLoaded, isSignedIn } = useUser();
  const platforms = useQuery(api.platforms.getPlatforms);
  const { getToken, isSignedIn: clerkSignedIn } = useAuth();
  const [apiCheck, setApiCheck] = useState<CheckUserResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [tokenInfo, setTokenInfo] = useState<string>("");

  useEffect(() => {
    if (clerkSignedIn) {
      getToken().then((t: string | null) => {
        setTokenInfo(t ? `Token: ${t.substring(0, 20)}... (${t.length} chars)` : "No token");
      });
    }
  }, [clerkSignedIn, getToken]);

  const checkAPI = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/user/check");
      const data: CheckUserResponse = await response.json();
      setApiCheck(data);
      console.log("API Check Result:", data);
    } catch (error) {
      console.error("API Check Error:", error);
      setApiCheck({
        user: null,
        platforms: [],
        clerkId: "",
        tokenReceived: false,
        error: String(error),
      });
    } finally {
      setLoading(false);
    }
  };

  const checkToken = async () => {
    try {
      const token = await getToken();
      setTokenInfo(token ? `Token: ${token.substring(0, 20)}... (${token.length} chars)` : "No token");
      console.log("Token:", token);
      alert(token ? "Token obtained! Length: " + token.length : "No token");
    } catch (error) {
      console.error("Error getting token:", error);
    }
  };

  if (!isLoaded) {
    return <div className="p-8">Loading...</div>;
  }

  return (
    <div className="p-8 space-y-4 max-w-2xl">
      <h1 className="text-2xl font-bold">🔧 Auth Test Page</h1>
      
      <div className="space-y-2 p-4 bg-gray-100 rounded-lg">
        <h2 className="font-semibold">Clerk Status</h2>
        <p><strong>Signed In:</strong> {isSignedIn ? "✅ Yes" : "❌ No"}</p>
        <p><strong>Token Info:</strong> {tokenInfo || "No token"}</p>
      </div>

      <div className="space-y-2 p-4 bg-gray-100 rounded-lg">
        <h2 className="font-semibold">Convex Status</h2>
        <p><strong>Convex User:</strong> {user ? "✅ Found" : "❌ Not Found"}</p>
        {user && (
          <>
            <p><strong>User ID:</strong> {user._id}</p>
            <p><strong>Email:</strong> {user.email}</p>
            <p><strong>Credits:</strong> {credits}</p>
          </>
        )}
        <p><strong>Platforms:</strong> {platforms?.length || 0}</p>
      </div>

      <div className="flex flex-wrap gap-4">
        <button
          onClick={checkToken}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Get Token
        </button>
        <button
          onClick={checkAPI}
          disabled={loading}
          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
        >
          {loading ? "Checking..." : "Check API"}
        </button>
      </div>

      {apiCheck && (
        <div className="space-y-2 p-4 bg-gray-100 rounded-lg">
          <h2 className="font-semibold">API Check Result</h2>
          <pre className="text-xs whitespace-pre-wrap">
            {JSON.stringify(apiCheck, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}