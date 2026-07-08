"use client";

import { useState, useEffect } from "react";
import { Loader2, Inbox, RefreshCw, Mail, Star, Clock, Search, Paperclip, User, CheckCircle, Archive, Trash2, Reply, Send } from "lucide-react";

interface Email {
  id: string;
  from: string;
  subject: string;
  snippet: string;
  body: string;
  date: string;
  isRead: boolean;
  isStarred: boolean;
  attachments: any[];
}

export function GmailInbox() {
  const [emails, setEmails] = useState<Email[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedEmail, setSelectedEmail] = useState<Email | null>(null);
  const [replyMode, setReplyMode] = useState(false);
  const [replyBody, setReplyBody] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [sending, setSending] = useState(false);

  const fetchEmails = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/gmail/emails?maxResults=30&query=${searchQuery || "in:inbox"}`);
      const data = await response.json();
      if (data.success) {
        setEmails(data.emails);
      }
    } catch (error) {
      console.error("Failed to fetch emails:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmails();
  }, [searchQuery]);

  const handleReply = async () => {
    if (!selectedEmail || !replyBody.trim()) return;
    
    setSending(true);
    try {
      const response = await fetch("/api/gmail/reply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          threadId: selectedEmail.id,
          originalEmail: selectedEmail,
          replyBody,
        }),
      });
      
      const data = await response.json();
      if (data.success) {
        setReplyMode(false);
        setReplyBody("");
        await fetchEmails();
      }
    } catch (error) {
      console.error("Failed to send reply:", error);
    } finally {
      setSending(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (days === 0) return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    if (days === 1) return "Yesterday";
    if (days < 7) return `${days} days ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      {/* Search Bar */}
      <div className="p-4 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div className="flex-1 relative">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search emails..."
              className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button
            onClick={fetchEmails}
            disabled={loading}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        </div>
      ) : emails.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 text-gray-500">
          <Inbox className="w-12 h-12 text-gray-300 mb-3" />
          <p>No emails found</p>
          <p className="text-sm">Try connecting Gmail or adjusting your search</p>
        </div>
      ) : (
        <div className="flex divide-x divide-gray-100">
          {/* Email List */}
          <div className={`${selectedEmail ? 'w-2/5' : 'w-full'} overflow-y-auto max-h-[600px]`}>
            {emails.map((email) => (
              <div
                key={email.id}
                onClick={() => {
                  setSelectedEmail(email);
                  setReplyMode(false);
                  setReplyBody("");
                }}
                className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors ${
                  selectedEmail?.id === email.id ? 'bg-blue-50' : ''
                } ${!email.isRead ? 'font-semibold' : ''}`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                        <User className="w-3 h-3 text-blue-600" />
                      </div>
                      <span className="truncate">{email.from}</span>
                      {email.attachments.length > 0 && (
                        <Paperclip className="w-3 h-3 text-gray-400 flex-shrink-0" />
                      )}
                    </div>
                    <p className="truncate text-sm text-gray-800 mt-1">{email.subject}</p>
                    <p className="truncate text-sm text-gray-500">{email.snippet}</p>
                  </div>
                  <div className="flex flex-col items-end gap-1 flex-shrink-0 ml-2">
                    <span className="text-xs text-gray-400">
                      {formatDate(email.date)}
                    </span>
                    {email.isStarred && (
                      <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Email Preview */}
          {selectedEmail && (
            <div className="w-3/5 p-4 overflow-y-auto max-h-[600px]">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {selectedEmail.subject}
                  </h3>
                  <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                    <span className="font-medium">From:</span>
                    <span>{selectedEmail.from}</span>
                  </div>
                  <div className="text-sm text-gray-500">
                    {new Date(selectedEmail.date).toLocaleString()}
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setReplyMode(!replyMode)}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    title="Reply"
                  >
                    <Reply className="w-4 h-4 text-blue-600" />
                  </button>
                  <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors" title="Archive">
                    <Archive className="w-4 h-4 text-gray-500" />
                  </button>
                  <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors" title="Delete">
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </button>
                </div>
              </div>

              <div className="p-4 bg-gray-50 rounded-lg whitespace-pre-wrap text-sm text-gray-700">
                {selectedEmail.body}
              </div>

              {replyMode && (
                <div className="mt-4 border-t border-gray-200 pt-4">
                  <textarea
                    value={replyBody}
                    onChange={(e) => setReplyBody(e.target.value)}
                    placeholder="Write your reply..."
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <div className="flex gap-2 mt-2">
                    <button
                      onClick={handleReply}
                      disabled={sending || !replyBody.trim()}
                      className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-70"
                    >
                      {sending ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Send className="w-4 h-4" />
                      )}
                      {sending ? "Sending..." : "Send Reply"}
                    </button>
                    <button
                      onClick={() => setReplyMode(false)}
                      className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}