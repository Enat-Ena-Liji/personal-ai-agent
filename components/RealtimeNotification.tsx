"use client";

import { useEffect, useState } from "react";
import { useUser } from "@/hooks/useUser";
import { Bell, X, CheckCircle, AlertCircle } from "lucide-react";

export function RealtimeNotification() {
  const { user } = useUser();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (!user) return;

    // Setup WebSocket connection
    const ws = new WebSocket(process.env.NEXT_PUBLIC_WS_URL || "ws://localhost:3001");

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      setNotifications(prev => [data, ...prev]);
      
      // Show notification
      if (data.priority === 'high') {
        new Notification(data.title, {
          body: data.message,
          icon: '🔔',
          requireInteraction: true,
        });
      }
    };

    return () => ws.close();
  }, [user]);

  return (
    <div className="relative">
      <button
        onClick={() => setShow(!show)}
        className="relative p-2 hover:bg-gray-100 rounded-full transition-colors"
      >
        <Bell className="w-5 h-5 text-gray-600" />
        {notifications.filter(n => !n.read).length > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
            {notifications.filter(n => !n.read).length}
          </span>
        )}
      </button>

      {show && (
        <div className="absolute right-0 mt-2 w-96 bg-white rounded-xl shadow-lg border border-gray-200 z-50 max-h-96 overflow-y-auto">
          <div className="p-4 border-b border-gray-100 flex items-center justify-between">
            <h3 className="font-semibold text-gray-900">Notifications</h3>
            <button className="text-sm text-blue-600 hover:text-blue-700">Mark all read</button>
          </div>
          {notifications.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <Bell className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p>No notifications</p>
            </div>
          ) : (
            notifications.slice(0, 10).map((notification, index) => (
              <div key={index} className="p-4 border-b border-gray-50 hover:bg-gray-50 transition-colors">
                <div className="flex items-start gap-3">
                  {notification.priority === 'high' ? (
                    <AlertCircle className="w-5 h-5 text-red-500" />
                  ) : (
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  )}
                  <div className="flex-1">
                    <p className="font-medium text-gray-900 text-sm">{notification.title}</p>
                    <p className="text-sm text-gray-500">{notification.message}</p>
                    <p className="text-xs text-gray-400 mt-1">
                      {new Date(notification.createdAt).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}