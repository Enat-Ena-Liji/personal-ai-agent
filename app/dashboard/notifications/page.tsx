"use client";

import { useRealtimeMonitor } from "@/hooks/useRealtimeMonitor";
import { Bell, Check, X } from "lucide-react";

export default function NotificationsSettings() {
  const { permission, requestPermission, sendTestNotification, isSupported } = useRealtimeMonitor();

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-6">🔔 Notifications</h1>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Browser Notifications</h2>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <p className="font-medium text-gray-900">Notification Permission</p>
              <p className="text-sm text-gray-500">
                Status: {permission === 'granted' ? '✅ Granted' : permission === 'denied' ? '❌ Denied' : '⏳ Not set'}
              </p>
            </div>
            {permission !== 'granted' && (
              <button
                onClick={requestPermission}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Enable Notifications
              </button>
            )}
          </div>

          {permission === 'granted' && (
            <button
              onClick={sendTestNotification}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              Send Test Notification
            </button>
          )}

          {!isSupported && (
            <p className="text-yellow-600 text-sm">
              ⚠️ Your browser doesn't support notifications.
            </p>
          )}
        </div>
      </div>

      <div className="mt-6 bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Notification Preferences</h2>
        
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 border border-gray-100 rounded-lg">
            <div>
              <p className="font-medium text-gray-900">High Priority Emails</p>
              <p className="text-sm text-gray-500">Get notified about important emails</p>
            </div>
            <button className="px-3 py-1 bg-blue-600 text-white rounded-lg text-sm">
              Enabled
            </button>
          </div>

          <div className="flex items-center justify-between p-3 border border-gray-100 rounded-lg">
            <div>
              <p className="font-medium text-gray-900">WhatsApp Messages</p>
              <p className="text-sm text-gray-500">Receive notifications for new messages</p>
            </div>
            <button className="px-3 py-1 bg-blue-600 text-white rounded-lg text-sm">
              Enabled
            </button>
          </div>

          <div className="flex items-center justify-between p-3 border border-gray-100 rounded-lg">
            <div>
              <p className="font-medium text-gray-900">Daily Briefings</p>
              <p className="text-sm text-gray-500">Get notified when briefing is ready</p>
            </div>
            <button className="px-3 py-1 bg-blue-600 text-white rounded-lg text-sm">
              Enabled
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}