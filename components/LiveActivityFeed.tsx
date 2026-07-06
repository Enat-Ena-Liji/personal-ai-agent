"use client";

import { useState, useEffect } from "react";
import { useSocket } from "@/context/SocketContext";
import { Activity, Mail, MessageSquare, Users, Clock, Sparkles } from "lucide-react";

interface Activity {
  id: string;
  type: 'email' | 'message' | 'meeting' | 'user' | 'system';
  user: string;
  action: string;
  target?: string;
  timestamp: number;
  metadata?: any;
}

export function LiveActivityFeed() {
  const { socket, isConnected } = useSocket();
  const [activities, setActivities] = useState<Activity[]>([]);
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    if (!socket) return;

    // Listen for activity events
    const handleActivity = (activity: Activity) => {
      setActivities(prev => [activity, ...prev].slice(0, 50));
    };

    socket.on('activity:new', handleActivity);

    // Simulate activities for demo
    const demoActivities = [
      {
        id: '1',
        type: 'email' as const,
        user: 'John Doe',
        action: 'sent an email',
        target: 'Project Update',
        timestamp: Date.now() - 10000,
      },
      {
        id: '2',
        type: 'message' as const,
        user: 'Sarah Smith',
        action: 'sent a message',
        target: 'Meeting at 2 PM',
        timestamp: Date.now() - 30000,
      },
      {
        id: '3',
        type: 'user' as const,
        user: 'Mike Johnson',
        action: 'joined the chat',
        timestamp: Date.now() - 60000,
      },
    ];

    demoActivities.forEach(activity => {
      socket.emit('activity:new', activity);
    });

    return () => {
      socket.off('activity:new', handleActivity);
    };
  }, [socket]);

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'email': return <Mail className="w-4 h-4 text-blue-500" />;
      case 'message': return <MessageSquare className="w-4 h-4 text-green-500" />;
      case 'meeting': return <Clock className="w-4 h-4 text-purple-500" />;
      case 'user': return <Users className="w-4 h-4 text-orange-500" />;
      default: return <Activity className="w-4 h-4 text-gray-500" />;
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'email': return 'bg-blue-50 border-blue-200';
      case 'message': return 'bg-green-50 border-green-200';
      case 'meeting': return 'bg-purple-50 border-purple-200';
      case 'user': return 'bg-orange-50 border-orange-200';
      default: return 'bg-gray-50 border-gray-200';
    }
  };

  const formatTime = (timestamp: number) => {
    const diff = Date.now() - timestamp;
    const minutes = Math.floor(diff / 60000);
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    return new Date(timestamp).toLocaleDateString();
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200">
      <div 
        className="p-4 border-b border-gray-100 flex items-center justify-between cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-blue-500" />
          <h3 className="font-semibold text-gray-900">Live Activity</h3>
          {isConnected && (
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
            </span>
          )}
        </div>
        <span className="text-xs text-gray-400">{activities.length} activities</span>
      </div>

      {isExpanded && (
        <div className="p-4 max-h-96 overflow-y-auto divide-y divide-gray-100">
          {activities.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Activity className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p>No recent activity</p>
            </div>
          ) : (
            activities.map((activity) => (
              <div 
                key={activity.id} 
                className={`py-3 px-2 rounded-lg border ${getActivityColor(activity.type)}`}
              >
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 mt-1">
                    {getActivityIcon(activity.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-800">
                      <span className="font-medium">{activity.user}</span>
                      <span className="text-gray-600"> {activity.action}</span>
                      {activity.target && (
                        <span className="font-medium text-gray-800"> {activity.target}</span>
                      )}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      {formatTime(activity.timestamp)}
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