"use client";

import { useUser } from "@/hooks/useUser";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Loader2 } from "lucide-react";
import ConnectGmail from "@/components/ConnectGmail";
import ConnectWhatsApp from "@/components/ConnectWhatsApp";

export default function DashboardPage() {
  const { user, credits, isLoaded, isSignedIn } = useUser();
  const platforms = useQuery(api.platforms.getPlatforms);
  const alerts = useQuery(api.alerts.getAlerts, { unreadOnly: true });
  const todayBriefing = useQuery(api.briefings.getTodayBriefing);

  // Show loading state while Clerk is initializing
  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  // If not signed in, redirect to sign in
  if (!isSignedIn) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <p className="text-gray-600">Please sign in to view your dashboard.</p>
        </div>
      </div>
    );
  }

  // Check if data is still loading
  if (platforms === undefined || alerts === undefined || todayBriefing === undefined) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  const isGmailConnected = platforms?.some(p => p.platform === "gmail" && p.isConnected) || false;
  const isWhatsAppConnected = platforms?.some(p => p.platform === "whatsapp" && p.isConnected) || false;
  const connectedPlatforms = platforms?.filter(p => p.isConnected).length || 0;
  const unreadAlerts = alerts?.length || 0;

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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Platforms Connected" 
          value={connectedPlatforms} 
          icon="🔗"
          subtitle="Active integrations"
        />
        <StatCard 
          title="Unread Alerts" 
          value={unreadAlerts} 
          icon="🔔"
          subtitle="Require attention"
        />
        <StatCard 
          title="Today's Briefing" 
          value={todayBriefing ? "Ready" : "Pending"} 
          icon="📋"
          subtitle={todayBriefing ? "Click to view" : "Generating..."}
        />
        <StatCard 
          title="AI Credits" 
          value={credits} 
          icon="⚡"
          subtitle="Available for use"
        />
      </div>

      {todayBriefing && (
        <div className="mt-8 bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            📊 Today's Briefing
          </h2>
          <p className="text-gray-600">{todayBriefing.summary}</p>
          <div className="mt-4 flex items-center justify-between">
            <span className="text-sm text-gray-500">
              Generated: {new Date(todayBriefing.createdAt).toLocaleTimeString()}
            </span>
            <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
              View Full Briefing →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({ title, value, icon, subtitle }: { 
  title: string; 
  value: string | number; 
  icon: string;
  subtitle: string;
}) {
  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
          <p className="text-xs text-gray-400 mt-1">{subtitle}</p>
        </div>
        <span className="text-3xl">{icon}</span>
      </div>
    </div>
  );
}