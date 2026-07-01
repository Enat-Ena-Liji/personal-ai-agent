"use client";

import { useEffect, useState } from "react";
import { useUser } from "./useUser";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

export function useRealtimeMonitor() {
  const { isSignedIn } = useUser();
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const createNotification = useMutation(api.notifications.createNotification);

  // Request notification permission
  useEffect(() => {
    if (isSignedIn && 'Notification' in window) {
      setPermission(Notification.permission);
    }
  }, [isSignedIn]);

  // Request permission if not granted
  const requestPermission = async () => {
    if ('Notification' in window) {
      const result = await Notification.requestPermission();
      setPermission(result);
      return result === 'granted';
    }
    return false;
  };

  // Send a test notification
  const sendTestNotification = () => {
    if (permission === 'granted') {
      new Notification('🔔 AI Agent Test', {
        body: 'Your notifications are working!',
        icon: '🤖',
        tag: 'test',
      });
    }
  };

  // Create and send notification
  const sendNotification = async (data: {
    title: string;
    message: string;
    priority: 'high' | 'medium' | 'low';
    type: 'email' | 'whatsapp' | 'system';
    data?: any;
  }) => {
    try {
      // Store in Convex
      const notificationId = await createNotification(data);
      
      // Send browser notification if permission granted
      if (permission === 'granted') {
        new Notification(data.title, {
          body: data.message,
          icon: data.priority === 'high' ? '🔴' : '📬',
          tag: notificationId,
          requireInteraction: data.priority === 'high',
        });
      }

      return notificationId;
    } catch (error) {
      console.error('Failed to send notification:', error);
      return null;
    }
  };

  // Simulate real-time monitoring (replace with actual Gmail/WhatsApp monitoring)
  const startMonitoring = () => {
    if (!isSignedIn) return;

    // This would be replaced with actual WebSocket connections
    const interval = setInterval(() => {
      // In production, this would check Gmail/WhatsApp APIs
      console.log('Monitoring active...');
    }, 30000);

    return () => clearInterval(interval);
  };

  return {
    permission,
    requestPermission,
    sendNotification,
    sendTestNotification,
    startMonitoring,
    isSupported: 'Notification' in window,
  };
}