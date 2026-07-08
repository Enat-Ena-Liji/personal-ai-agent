"use client";

import { useState } from "react";
import { useUser } from "@/hooks/useUser";
import { Loader2, Globe, Users, MessageSquare, Hash, Bell, RefreshCw } from "lucide-react";
import ConnectSlack from "@/components/ConnectSlack";
import ConnectTeams from "@/components/ConnectTeams";
import { PlatformSync } from "@/components/PlatformSync";

export default function PlatformsPage() {
  const { user, isLoaded, isSignedIn } = useUser();
  const [connectedPlatforms, setConnectedPlatforms] = useState({
    slack: false,
    teams: false,
    discord: false,
    telegram: false,
  });

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
          <p className="text-gray-600">Please sign in to manage platforms.</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
          <Globe className="w-8 h-8 text-blue-600" />
          Platform Sync
        </h1>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500">
            {Object.values(connectedPlatforms).filter(Boolean).length} connected
          </span>
        </div>
      </div>

      {/* Platform Connections */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <ConnectSlack
          isConnected={connectedPlatforms.slack}
          onConnect={() => setConnectedPlatforms({ ...connectedPlatforms, slack: true })}
          onDisconnect={() => setConnectedPlatforms({ ...connectedPlatforms, slack: false })}
        />
        <ConnectTeams
          isConnected={connectedPlatforms.teams}
          onConnect={() => setConnectedPlatforms({ ...connectedPlatforms, teams: true })}
          onDisconnect={() => setConnectedPlatforms({ ...connectedPlatforms, teams: false })}
        />
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-gray-100">
                <Hash className="w-5 h-5 text-gray-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Discord</h3>
                <p className="text-sm text-gray-500">Coming soon</p>
              </div>
            </div>
            <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
              Webhook
            </span>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-gray-100">
                <Bell className="w-5 h-5 text-gray-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Telegram</h3>
                <p className="text-sm text-gray-500">Coming soon</p>
              </div>
            </div>
            <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
              Bot
            </span>
          </div>
        </div>
      </div>

      {/* Platform Sync */}
      {user && <PlatformSync userId={user._id} />}
    </div>
  );
}