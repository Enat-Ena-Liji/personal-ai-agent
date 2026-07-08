"use client";

import { useState, useEffect } from "react";
import { Loader2, RefreshCw, MessageSquare, Users, Hash, Globe, Bell, TrendingUp } from "lucide-react";

interface PlatformSyncProps {
  userId: string;
}

export function PlatformSync({ userId }: PlatformSyncProps) {
  const [syncing, setSyncing] = useState(false);
  const [messages, setMessages] = useState<any[]>([]);
  const [insights, setInsights] = useState<any>(null);
  const [activePlatform, setActivePlatform] = useState('all');

  const platforms = [
    { id: 'all', label: 'All', icon: Globe },
    { id: 'slack', label: 'Slack', icon: MessageSquare },
    { id: 'teams', label: 'Teams', icon: Users },
    { id: 'discord', label: 'Discord', icon: Hash },
    { id: 'telegram', label: 'Telegram', icon: Bell },
  ];

  const syncMessages = async () => {
    setSyncing(true);
    try {
      // Simulate sync from all platforms
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const mockMessages = [
        {
          id: '1',
          platform: 'slack',
          channel: '#general',
          sender: 'John Doe',
          content: 'Meeting at 2 PM today',
          timestamp: new Date().toISOString(),
        },
        {
          id: '2',
          platform: 'teams',
          channel: 'General',
          sender: 'Sarah Smith',
          content: 'Can you review the document?',
          timestamp: new Date().toISOString(),
        },
        {
          id: '3',
          platform: 'discord',
          channel: '#announcements',
          sender: 'Bot',
          content: 'New update available',
          timestamp: new Date().toISOString(),
        },
        {
          id: '4',
          platform: 'slack',
          channel: '#random',
          sender: 'Mike Johnson',
          content: 'Good morning everyone!',
          timestamp: new Date().toISOString(),
        },
      ];
      
      setMessages(mockMessages);
      
      // Generate insights
      const mockInsights = {
        total: mockMessages.length,
        platforms: {
          slack: 2,
          teams: 1,
          discord: 1,
        },
        sentiment: 'positive',
        topTopics: ['meetings', 'updates', 'reviews'],
        recommendations: [
          'You have 2 unread Slack messages',
          'Review the document in Teams',
          'Check the new Discord announcement',
        ],
      };
      setInsights(mockInsights);
    } catch (error) {
      console.error('Failed to sync messages:', error);
    } finally {
      setSyncing(false);
    }
  };

  useEffect(() => {
    syncMessages();
  }, []);

  const filteredMessages = activePlatform === 'all'
    ? messages
    : messages.filter(m => m.platform === activePlatform);

  return (
    <div className="space-y-6">
      {/* Platform Selector */}
      <div className="flex flex-wrap gap-2">
        {platforms.map((platform) => (
          <button
            key={platform.id}
            onClick={() => setActivePlatform(platform.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
              activePlatform === platform.id
                ? 'bg-blue-600 text-white'
                : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
            }`}
          >
            <platform.icon className="w-4 h-4" />
            <span className="text-sm font-medium">{platform.label}</span>
          </button>
        ))}
        <button
          onClick={syncMessages}
          disabled={syncing}
          className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors ml-auto disabled:opacity-70"
        >
          {syncing ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <RefreshCw className="w-4 h-4" />
          )}
          {syncing ? "Syncing..." : "Sync Now"}
        </button>
      </div>

      {/* Insights Cards */}
      {insights && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <InsightCard
            icon={<MessageSquare className="w-5 h-5 text-blue-500" />}
            title="Total Messages"
            value={insights.total}
            subtitle={`Across ${Object.keys(insights.platforms).length} platforms`}
          />
          <InsightCard
            icon={<TrendingUp className="w-5 h-5 text-green-500" />}
            title="Sentiment"
            value={insights.sentiment}
            subtitle="Overall tone"
          />
          <InsightCard
            icon={<Globe className="w-5 h-5 text-purple-500" />}
            title="Active Platforms"
            value={Object.keys(insights.platforms).length}
            subtitle="Connected"
          />
        </div>
      )}

      {/* Messages List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-4 border-b border-gray-100">
          <h3 className="font-semibold text-gray-900">
            Messages {activePlatform !== 'all' && `from ${activePlatform}`}
          </h3>
        </div>
        <div className="divide-y divide-gray-100">
          {filteredMessages.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p>No messages from this platform</p>
            </div>
          ) : (
            filteredMessages.map((message) => (
              <div key={message.id} className="p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0">
                    <div className={`p-1.5 rounded-lg ${
                      message.platform === 'slack' ? 'bg-purple-100 text-purple-600' :
                      message.platform === 'teams' ? 'bg-blue-100 text-blue-600' :
                      message.platform === 'discord' ? 'bg-indigo-100 text-indigo-600' :
                      'bg-green-100 text-green-600'
                    }`}>
                      {message.platform === 'slack' && <MessageSquare className="w-4 h-4" />}
                      {message.platform === 'teams' && <Users className="w-4 h-4" />}
                      {message.platform === 'discord' && <Hash className="w-4 h-4" />}
                      {message.platform === 'telegram' && <Bell className="w-4 h-4" />}
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-gray-900">{message.sender}</span>
                      <span className="text-xs text-gray-400">• {message.channel}</span>
                      <span className="ml-auto text-xs text-gray-400">
                        {new Date(message.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">{message.content}</p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Recommendations */}
      {insights?.recommendations && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
          <h4 className="font-semibold text-yellow-800 mb-2 flex items-center gap-2">
            <Bell className="w-4 h-4" />
            Action Items
          </h4>
          <ul className="list-disc list-inside space-y-1 text-sm text-yellow-700">
            {insights.recommendations.map((rec: string, i: number) => (
              <li key={i}>{rec}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

function InsightCard({ icon, title, value, subtitle }: any) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
      <div className="flex items-center gap-2 mb-1">
        {icon}
        <p className="text-sm text-gray-500">{title}</p>
      </div>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
      <p className="text-xs text-gray-400 mt-1">{subtitle}</p>
    </div>
  );
}