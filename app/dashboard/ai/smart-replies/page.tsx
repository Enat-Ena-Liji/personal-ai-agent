"use client";

import { useUser } from "@/hooks/useUser";
import { Loader2, MessageSquare, Sparkles } from "lucide-react";

export default function SmartRepliesPage() {
  const { isLoaded, isSignedIn } = useUser();

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
          <MessageSquare className="w-8 h-8 text-blue-600" />
          Smart Replies
        </h1>
      </div>
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center">
        <Sparkles className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-700 mb-2">AI-Powered Smart Replies</h3>
        <p className="text-gray-500">
          Connect your email and messaging platforms to generate context-aware replies.
        </p>
      </div>
    </div>
  );
}