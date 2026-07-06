"use client";

import { useState, useEffect } from "react";
import { useUser } from "@/hooks/useUser";
import { 
  Loader2, 
  Inbox, 
  Star, 
  Mail, 
  Clock, 
  AlertCircle, 
  CheckCircle,
  ChevronDown,
  ChevronRight,
  Filter,
  Search
} from "lucide-react";

interface Email {
  id: string;
  from: string;
  subject: string;
  snippet: string;
  body: string;
  date: string;
  priority: 'high' | 'medium' | 'low';
  category: 'work' | 'personal' | 'social' | 'promotional' | 'spam';
  urgency: number;
  importance: number;
  score: number;
  suggestedAction: string;
  isStarred?: boolean;
  isRead?: boolean;
}

export function PriorityInbox() {
  const { user, isLoaded } = useUser();
  const [emails, setEmails] = useState<Email[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedEmail, setSelectedEmail] = useState<Email | null>(null);
  const [filter, setFilter] = useState<string>("all");
  const [categories, setCategories] = useState({
    high: 0,
    medium: 0,
    low: 0,
  });

  const fetchPriorityInbox = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/email/priority-inbox?limit=50&category=${filter}`);
      const data = await response.json();
      
      if (data.success) {
        setEmails(data.emails);
        setCategories(data.categories);
      }
    } catch (error) {
      console.error("Failed to fetch priority inbox:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isLoaded && user) {
      fetchPriorityInbox();
    }
  }, [isLoaded, user, filter]);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-600 bg-red-50';
      case 'medium': return 'text-yellow-600 bg-yellow-50';
      case 'low': return 'text-green-600 bg-green-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'high': return <AlertCircle className="w-4 h-4" />;
      case 'medium': return <Clock className="w-4 h-4" />;
      case 'low': return <CheckCircle className="w-4 h-4" />;
      default: return <Mail className="w-4 h-4" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'work': return 'bg-blue-100 text-blue-700';
      case 'personal': return 'bg-purple-100 text-purple-700';
      case 'social': return 'bg-pink-100 text-pink-700';
      case 'promotional': return 'bg-orange-100 text-orange-700';
      case 'spam': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const handlePriorityChange = async (emailId: string, newPriority: 'high' | 'medium' | 'low') => {
    try {
      const response = await fetch("/api/email/priority-update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ emailId, priority: newPriority }),
      });
      
      if (response.ok) {
        // Update local state
        setEmails(prev => 
          prev.map(email => 
            email.id === emailId 
              ? { ...email, priority: newPriority }
              : email
          )
        );
      }
    } catch (error) {
      console.error("Failed to update priority:", error);
    }
  };

  if (!isLoaded || loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-gray-100 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Inbox className="w-5 h-5 text-blue-600" />
            Priority Inbox
          </h2>
          <div className="flex gap-2">
            <span className={`px-2 py-1 text-xs rounded-full bg-red-100 text-red-700`}>
              High: {categories.high}
            </span>
            <span className={`px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-700`}>
              Medium: {categories.medium}
            </span>
            <span className={`px-2 py-1 text-xs rounded-full bg-green-100 text-green-700`}>
              Low: {categories.low}
            </span>
          </div>
        </div>

        {/* Filters */}
        <div className="flex gap-2">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Categories</option>
            <option value="work">Work</option>
            <option value="personal">Personal</option>
            <option value="social">Social</option>
            <option value="promotional">Promotional</option>
          </select>
          <button
            onClick={fetchPriorityInbox}
            className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm transition-colors"
          >
            Refresh
          </button>
        </div>
      </div>

      {/* Email List */}
      <div className="divide-y divide-gray-100 max-h-[600px] overflow-y-auto">
        {emails.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            <Inbox className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p>No emails in priority inbox</p>
          </div>
        ) : (
          emails.map((email) => (
            <div
              key={email.id}
              className={`p-4 hover:bg-gray-50 transition-colors cursor-pointer ${
                selectedEmail?.id === email.id ? 'bg-blue-50' : ''
              } ${!email.isRead ? 'border-l-4 border-blue-500' : ''}`}
              onClick={() => setSelectedEmail(email)}
            >
              <div className="flex items-start gap-4">
                {/* Priority Badge */}
                <div className={`p-1.5 rounded-lg ${getPriorityColor(email.priority)}`}>
                  {getPriorityIcon(email.priority)}
                </div>

                {/* Email Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-gray-900">{email.from}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${getCategoryColor(email.category)}`}>
                      {email.category}
                    </span>
                    <span className="text-xs text-gray-400 ml-auto">
                      {new Date(email.date).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-sm font-medium text-gray-800">{email.subject}</p>
                  <p className="text-sm text-gray-500 line-clamp-1">{email.snippet}</p>
                  
                  {/* Quick Actions */}
                  <div className="flex items-center gap-4 mt-2">
                    <div className="flex items-center gap-1">
                      <span className="text-xs text-gray-400">Priority:</span>
                      <select
                        value={email.priority}
                        onChange={(e) => handlePriorityChange(email.id, e.target.value as any)}
                        className="text-xs border border-gray-200 rounded px-1.5 py-0.5 focus:outline-none focus:ring-1 focus:ring-blue-500"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <option value="high">High</option>
                        <option value="medium">Medium</option>
                        <option value="low">Low</option>
                      </select>
                    </div>
                    <button
                      className="text-xs text-blue-600 hover:text-blue-700"
                      onClick={(e) => { e.stopPropagation(); /* Handle reply */ }}
                    >
                      Reply
                    </button>
                    <button
                      className="text-xs text-gray-500 hover:text-gray-700"
                      onClick={(e) => { e.stopPropagation(); /* Handle archive */ }}
                    >
                      Archive
                    </button>
                    <button
                      className="text-xs text-yellow-500 hover:text-yellow-600"
                      onClick={(e) => { e.stopPropagation(); /* Toggle star */ }}
                    >
                      {email.isStarred ? '⭐' : '☆'}
                    </button>
                  </div>
                </div>

                {/* Score */}
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center">
                    <span className="text-sm font-bold text-gray-600">
                      {Math.round(email.score)}%
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Email Preview */}
      {selectedEmail && (
        <div className="p-4 border-t border-gray-100 bg-gray-50">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h3 className="font-semibold text-gray-900">{selectedEmail.subject}</h3>
              <p className="text-sm text-gray-500">From: {selectedEmail.from}</p>
            </div>
            <div className="flex gap-2">
              <button className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-sm">
                Reply
              </button>
              <button className="px-3 py-1.5 bg-gray-200 text-gray-700 rounded-lg text-sm">
                Close
              </button>
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg">
            <p className="text-sm text-gray-700 whitespace-pre-wrap">{selectedEmail.body}</p>
            <div className="mt-4 flex items-center gap-4 text-xs text-gray-500">
              <span>Suggested action: {selectedEmail.suggestedAction}</span>
              <span>Priority: {selectedEmail.priority}</span>
              <span>Urgency: {selectedEmail.urgency}%</span>
              <span>Importance: {selectedEmail.importance}%</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}