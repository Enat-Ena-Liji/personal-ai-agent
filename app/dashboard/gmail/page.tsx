"use client";

import { useState } from "react";
import { useUser } from "@/hooks/useUser";
import { Loader2, Mail, RefreshCw, Inbox, Send, MessageSquare } from "lucide-react";
import { EmailDraftAssistant } from "@/components/EmailDraftAssistant";

export default function GmailPage() {
  const { isLoaded, isSignedIn } = useUser();
  const [selectedEmail, setSelectedEmail] = useState<string | null>(null);
  const [showAssistant, setShowAssistant] = useState(false);

  // Mock emails for demonstration
  const [emails] = useState([
    {
      id: '1',
      from: 'john.doe@example.com',
      subject: 'Project Update - Q3 Planning',
      snippet: 'Hi, I wanted to follow up on the Q3 planning meeting...',
      body: 'Hi, I wanted to follow up on the Q3 planning meeting. We need to discuss the budget allocation and timeline for the new initiative. Could you please review the attached document and share your feedback?',
      date: '2024-01-15T10:30:00',
    },
    {
      id: '2',
      from: 'sarah.smith@company.com',
      subject: 'Client Meeting Tomorrow',
      snippet: 'Just confirming the client meeting tomorrow at 2 PM...',
      body: 'Just confirming the client meeting tomorrow at 2 PM. Please prepare the presentation and bring the contract documents. Let me know if you have any questions.',
      date: '2024-01-15T09:00:00',
    },
  ]);

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!isSignedIn) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <p className="text-gray-600">Please sign in to view your Gmail.</p>
        </div>
      </div>
    );
  }

  const handleUseDraft = (subject: string, body: string) => {
    console.log('Using draft:', { subject, body });
    setShowAssistant(false);
    alert('Draft ready to send!');
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Gmail</h1>
        <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors">
          <RefreshCw className="w-4 h-4" />
          Refresh
        </button>
      </div>

      {emails.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
          <Inbox className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-700 mb-2">No Emails</h3>
          <p className="text-gray-500">Connect your Gmail account to view emails.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Email List */}
          <div className="lg:col-span-1 space-y-3">
            {emails.map((email) => (
              <div
                key={email.id}
                onClick={() => {
                  setSelectedEmail(email.id);
                  setShowAssistant(false);
                }}
                className={`p-4 bg-white rounded-xl shadow-sm border cursor-pointer transition-all hover:shadow-md ${
                  selectedEmail === email.id ? 'border-blue-500 shadow-md' : 'border-gray-100'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900 truncate">{email.from}</p>
                    <p className="text-sm font-medium text-gray-700 truncate">{email.subject}</p>
                    <p className="text-sm text-gray-500 truncate">{email.snippet}</p>
                  </div>
                </div>
                <div className="mt-2 flex items-center gap-2">
                  <span className="text-xs text-gray-400">
                    {new Date(email.date).toLocaleDateString()}
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedEmail(email.id);
                      setShowAssistant(true);
                    }}
                    className="text-xs text-blue-600 hover:text-blue-700 font-medium"
                  >
                    Reply with AI
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Email Preview & Assistant */}
          <div className="lg:col-span-2">
            {selectedEmail ? (
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                {showAssistant ? (
                  <>
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-semibold text-gray-900">AI Draft Assistant</h3>
                      <button
                        onClick={() => setShowAssistant(false)}
                        className="text-sm text-gray-500 hover:text-gray-700"
                      >
                        Cancel
                      </button>
                    </div>
                    <EmailDraftAssistant
                      originalEmail={emails.find(e => e.id === selectedEmail)?.body || ''}
                      onUseDraft={handleUseDraft}
                    />
                  </>
                ) : (
                  <>
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="font-semibold text-gray-900">
                          {emails.find(e => e.id === selectedEmail)?.subject}
                        </h3>
                        <p className="text-sm text-gray-500">
                          From: {emails.find(e => e.id === selectedEmail)?.from}
                        </p>
                      </div>
                      <button
                        onClick={() => setShowAssistant(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                      >
                        <MessageSquare className="w-4 h-4" />
                        AI Reply
                      </button>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <p className="text-gray-700 whitespace-pre-wrap">
                        {emails.find(e => e.id === selectedEmail)?.body}
                      </p>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
                <Mail className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-700 mb-2">Select an Email</h3>
                <p className="text-gray-500">Choose an email from the list to view and reply.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}