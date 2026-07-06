"use client";

import { useSocket } from "@/context/SocketContext";

interface TypingIndicatorProps {
  userId: string;
  channel: string;
}

export function TypingIndicator({ userId, channel }: TypingIndicatorProps) {
  const { typingIndicators } = useSocket();
  const isTyping = typingIndicators[`${userId}:${channel}`];

  if (!isTyping) return null;

  return (
    <div className="flex items-center gap-1 text-sm text-gray-500 animate-pulse">
      <span>●</span>
      <span>●</span>
      <span>●</span>
      <span className="ml-1 text-xs">typing...</span>
    </div>
  );
}