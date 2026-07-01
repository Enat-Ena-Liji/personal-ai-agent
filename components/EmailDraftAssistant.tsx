"use client";

import { useState } from "react";
import { Sparkles, Loader2, Copy, Send } from "lucide-react";

interface EmailDraftAssistantProps {
  originalEmail: string;
  onUseDraft: (subject: string, body: string) => void;
}

export default function EmailDraftAssistant({ originalEmail, onUseDraft }: EmailDraftAssistantProps) {
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [tone, setTone] = useState<"professional" | "friendly" | "formal">("professional");
  const [loading, setLoading] = useState(false);
  const [generated, setGenerated] = useState(false);

  const generateDraft = async () => {
    if (!originalEmail.trim()) return;
    
    setLoading(true);
    setGenerated(false);
    
    try {
      const response = await fetch("/api/ai/draft-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          originalEmail, 
          tone,
          context: "You are drafting a professional email reply.",
        }),
      });
      
      const data = await response.json();
      
      if (data.success && data.draft) {
        setSubject(data.draft.subject);
        setBody(data.draft.body);
        setGenerated(true);
      }
    } catch (error) {
      console.error("Failed to generate draft:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4 bg-white rounded-xl p-6 border border-gray-200">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-gray-900">AI Email Assistant</h3>
        <div className="flex items-center gap-2">
          <select
            value={tone}
            onChange={(e) => setTone(e.target.value as any)}
            className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="professional">Professional</option>
            <option value="friendly">Friendly</option>
            <option value="formal">Formal</option>
          </select>
          <button
            onClick={generateDraft}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-70"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Sparkles className="w-4 h-4" />
            )}
            {loading ? "Generating..." : "Generate Draft"}
          </button>
        </div>
      </div>

      {generated && (
        <div className="space-y-3 border-t border-gray-100 pt-4">
          <div>
            <label className="text-sm font-medium text-gray-700">Subject</label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">Body</label>
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              rows={6}
              className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => onUseDraft(subject, body)}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
            >
              <Send className="w-4 h-4" />
              Use Draft
            </button>
            <button
              onClick={() => {
                navigator.clipboard.writeText(body);
              }}
              className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
            >
              <Copy className="w-4 h-4" />
              Copy
            </button>
          </div>
        </div>
      )}
    </div>
  );
}