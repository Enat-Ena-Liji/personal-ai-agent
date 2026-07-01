"use client";

import { useUser } from "@/hooks/useUser";
import { Loader2, MessageSquare, RefreshCw, Users } from "lucide-react";

export default function WhatsAppPage() {
  const { isLoaded, isSignedIn } = useUser();

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!isSignedIn) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <p className="text-gray-600">Please sign in to view your WhatsApp.</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-gray-900">WhatsApp</h1>
        <button className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors">
          <RefreshCw className="w-4 h-4" />
          Refresh
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center">
        <MessageSquare className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-700 mb-2">Connect WhatsApp</h3>
        <p className="text-gray-500 mb-4">
          Connect your WhatsApp to send and receive messages with AI assistance.
        </p>
        <button className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors">
          <span className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            Connect WhatsApp
          </span>
        </button>
      </div>
    </div>
  );
}