"use client";

import { useSocket } from "@/context/SocketContext";
import { Wifi, WifiOff, Users, Circle } from "lucide-react";

export function RealtimeStatus() {
  const { isConnected, onlineUsers } = useSocket();

  return (
    <div className="flex items-center gap-4 px-3 py-1.5 bg-gray-50 rounded-lg text-sm">
      <div className="flex items-center gap-2">
        {isConnected ? (
          <>
            <Wifi className="w-4 h-4 text-green-500" />
            <span className="text-green-600 text-xs font-medium">Live</span>
          </>
        ) : (
          <>
            <WifiOff className="w-4 h-4 text-red-500" />
            <span className="text-red-600 text-xs font-medium">Offline</span>
          </>
        )}
      </div>
      <div className="flex items-center gap-2">
        <Users className="w-4 h-4 text-gray-400" />
        <span className="text-xs text-gray-500">{onlineUsers.length} online</span>
      </div>
    </div>
  );
}