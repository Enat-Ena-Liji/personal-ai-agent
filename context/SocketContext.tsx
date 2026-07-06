// context/SocketContext.tsx
"use client";

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useUser } from '@clerk/nextjs';
import { socketClient } from '@/lib/socket-client';

interface SocketContextType {
  isConnected: boolean;
  onlineUsers: string[];
  userStatus: Record<string, 'online' | 'offline' | 'away'>;
  typingIndicators: Record<string, boolean>;
  sendMessage: (message: any) => void;
  startTyping: (channel: string) => void;
  stopTyping: (channel: string) => void;
  markNotificationRead: (notificationId: string) => void;
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

export function SocketProvider({ children }: { children: ReactNode }) {
  const { user, isSignedIn } = useUser();
  const [isConnected, setIsConnected] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);
  const [userStatus, setUserStatus] = useState<Record<string, 'online' | 'offline' | 'away'>>({});
  const [typingIndicators, setTypingIndicators] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (isSignedIn && user) {
      // Connect to socket
      socketClient.connect(user.id);

      // Setup event listeners
      const onConnected = () => setIsConnected(true);
      const onDisconnected = () => setIsConnected(false);
      const onUsersOnline = (users: string[]) => setOnlineUsers(users);
      const onUserStatus = (data: { userId: string; status: 'online' | 'offline' | 'away' }) => {
        setUserStatus(prev => ({ ...prev, [data.userId]: data.status }));
      };
      const onTypingIndicator = (data: { userId: string; channel: string; isTyping: boolean }) => {
        setTypingIndicators(prev => ({
          ...prev,
          [`${data.userId}:${data.channel}`]: data.isTyping
        }));
      };

      socketClient.on('socket:connected', onConnected);
      socketClient.on('socket:disconnected', onDisconnected);
      socketClient.on('users:online', onUsersOnline);
      socketClient.on('user:status', onUserStatus);
      socketClient.on('typing:indicator', onTypingIndicator);

      return () => {
        socketClient.off('socket:connected', onConnected);
        socketClient.off('socket:disconnected', onDisconnected);
        socketClient.off('users:online', onUsersOnline);
        socketClient.off('user:status', onUserStatus);
        socketClient.off('typing:indicator', onTypingIndicator);
        socketClient.disconnect();
      };
    } else {
      socketClient.disconnect();
      setIsConnected(false);
    }
  }, [isSignedIn, user]);

  const value = {
    isConnected,
    onlineUsers,
    userStatus,
    typingIndicators,
    sendMessage: socketClient.sendMessage.bind(socketClient),
    startTyping: socketClient.startTyping.bind(socketClient),
    stopTyping: socketClient.stopTyping.bind(socketClient),
    markNotificationRead: socketClient.markNotificationRead.bind(socketClient),
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
}

export function useSocket() {
  const context = useContext(SocketContext);
  if (context === undefined) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
}