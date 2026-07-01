"use client";

import { useState } from "react";
import { Loader2, Check, X, MessageSquare, Users, Hash } from "lucide-react";

interface ConnectSlackProps {
  isConnected?: boolean;
  onConnect?: () => void;
  onDisconnect?: () => void;
}

export default function ConnectSlack({ isConnected = false, onConnect, onDisconnect }: ConnectSlackProps) {
  const [loading, setLoading] = useState(false);
  const [selectedChannel, setSelectedChannel] = useState("");

  const handleConnect = async () => {
    setLoading(true);
    try {
      // In production, you'd use OAuth flow
      // For demo, we'll just simulate connection
      await new Promise(resolve => setTimeout(resolve, 1500));
      if (onConnect) onConnect();
    } catch (error) {
      console.error("Failed to connect Slack:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDisconnect = async () => {
    try {
      if (onDisconnect) onDisconnect();
    } catch (error) {
      console.error("Failed to disconnect Slack:", error);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg ${isConnected ? 'bg-green-100' : 'bg-gray-100'}`}>
            <MessageSquare className={`w-5 h-5 ${isConnected ? 'text-green-600' : 'text-gray-600'}`} />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">Slack</h3>
            <p className="text-sm text-gray-500">
              {isConnected ? "Connected" : "Connect Slack workspace"}
            </p>
          </div>
        </div>
        {isConnected ? (
          <button
            onClick={handleDisconnect}
            className="p-1 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        ) : (
          <button
            onClick={handleConnect}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-70"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Users className="w-4 h-4" />
            )}
            {loading ? "Connecting..." : "Connect"}
          </button>
        )}
      </div>

      {isConnected && (
        <div className="mt-4 p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center gap-2 mb-3">
            <Hash className="w-4 h-4 text-gray-500" />
            <span className="text-sm font-medium text-gray-700">Default Channel</span>
            <select
              value={selectedChannel}
              onChange={(e) => setSelectedChannel(e.target.value)}
              className="ml-auto px-3 py-1 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select channel</option>
              <option value="#general">#general</option>
              <option value="#random">#random</option>
              <option value="#announcements">#announcements</option>
            </select>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Users className="w-4 h-4" />
            <span>Workspace: AI Agent Team</span>
          </div>
        </div>
      )}
    </div>
  );
}