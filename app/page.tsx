"use client";

import { useUser } from "@/hooks/useUser";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Loader2 } from "lucide-react";
import { BriefingCard } from "@/components/BriefingCard";
import ConnectGmail from "@/components/ConnectGmail";
import ConnectWhatsApp from "@/components/ConnectWhatsApp";

export default function DashboardPage() {
  const { user, credits, isLoaded, isSignedIn } = useUser();
  const platforms = useQuery(api.platforms.getPlatforms);

  if (!isLoaded || platforms === undefined) {
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
          <p className="text-gray-600">Please sign in to view your dashboard.</p>
        </div>
      </div>
    );
  }

  const isGmailConnected = platforms?.some(p => p.platform === "gmail" && p.isConnected) || false;
  const isWhatsAppConnected = platforms?.some(p => p.platform === "whatsapp" && p.isConnected) || false;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-gray-900">
          Welcome back, {user?.name || "User"}! 👋
        </h1>
        <div className="flex items-center gap-2 bg-blue-50 px-4 py-2 rounded-lg">
          <span className="text-sm text-blue-600">Credits:</span>
          <span className="font-bold text-blue-700">{credits}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <ConnectGmail isConnected={isGmailConnected} />
        <ConnectWhatsApp isConnected={isWhatsAppConnected} />
      </div>

      <div className="grid grid-cols-1 gap-6">
        <BriefingCard />
      </div>
    </div>
  );
}